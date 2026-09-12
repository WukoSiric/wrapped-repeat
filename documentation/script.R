
# ===========================================================================================
# DATA PREPARATION
# ===========================================================================================


# Install packages
install.packages(c("dplyr", "tidyr", "lubridate", "purrr", "readxl", "ggplot2", "gganimate", "ggthemes"))

# Load packages
invisible(lapply(c("dplyr", "tidyr", "lubridate", "purrr", "readxl", "ggplot2", "gganimate", "ggthemes"), library,character.only = TRUE))

# Define songs to exclude
exclude_tracks <- c(
  "Life is a Highway | Rascal Flatts",
  "Air Raid Siren | Prestigigator",
  "Karma | JoJo Siwa",
  "Thick Of It (feat. Trippie Redd) | KSI",
  "Advance Australia Fair | John Williamson",
  "Blue (Da Ba Dee) - Gabry Ponte Video Edit | Eiffel 65",
  "National Anthem of the USSR | The Red Army Choir",
  "Hollaback Girl | Gwen Stefani",
  "Real Gone | Sheryl Crow",
  "Wake Me up When September Ends | Green Day"
)

# Import streaming history
streaming_history <- load_streaming_history(file_path = "Spotify Streaming History.xlsx")

# Create track dataframe
track_data <- create_track_data(streaming_history)

# ===========================================================================================
# TRACK
# ===========================================================================================

# NOTE: change n to 10 to determine if award needs to be overridden due to other variables
# I.e. skip_pct, progress_pct, skip_progress_pct

# Track of the Year (highest # of listens >60s)
track_TOTY <- calculate_award(
  df = filter(track_data$year),
  arrange_cols = quos(desc(`listens_>60s`), skip_pct),
  n = 3,
)

# Worst of the Year (lowest avg duration % played)
track_WOTY <- calculate_award(
  df = filter(`track_data`$year),
  arrange_cols = quos(progress_pct),
  n = 3)
  
# Honourable Mentions (high # of listens, low skip %)
track_honourable_mentions <- calculate_honourable_mentions(type = "track", max_range = 500)

# Dishonourable Mentions (high # of listens, high skip %)
track_dishonourable_mentions <- calculate_dishonourable_mentions(type = "track", max_range = 500)

# Appeal to Common Practice (highest # of listens skipped at 0%)
track_appeal_to_common_practice <- calculate_award(
  df = track_data$year,
  arrange_cols = quos(desc(listens)),
  filter_conditions = quos(skip_pct == 0),
  n = 3)

# Negativity Bias (highest # of listens skipped at 100%)
track_negativity_bias <- calculate_award(
  df = track_data$year %>%
    filter(skip_pct == 1),
  arrange_cols = quos(desc(listens)),
  n = 3)

# 10/10 Club (>=10 listens and <=10% skipped)
`track_10/10_club` <- calculate_award(
  df = track_data$year,
  filter_conditions = quos(listens >= 10, skip_pct <= 0.1),
  arrange_cols = quos(desc(listens), skip_pct),
  n = Inf)

# minimum # of listens per quarter
qtr_threshold <- 5

# Cognitive Dissonance (highest SD of skip % among Q1-Q4)
track_cognitive_dissonance <- calculate_award(
  df = track_data$quarter,
  arrange_cols = quos(desc(sd_skip_pct)),
  filter_conditions = quos(
    !is.na(Q1_skip_pct), !is.na(Q2_skip_pct), !is.na(Q3_skip_pct), !is.na(Q4_skip_pct),
    Q1_listens >= qtr_threshold, Q2_listens >= qtr_threshold,
    Q3_listens >= qtr_threshold, Q4_listens >= qtr_threshold,
    !(
      (Q1_skip_pct <= Q2_skip_pct & Q2_skip_pct <= Q3_skip_pct & Q3_skip_pct <= Q4_skip_pct) |
        (Q1_skip_pct >= Q2_skip_pct & Q2_skip_pct >= Q3_skip_pct & Q3_skip_pct >= Q4_skip_pct)
    )
  ),
  n = 3
)

# Appeal to Tradition (lowest SD of skip % among Q1-Q4)
track_appeal_to_tradition <- calculate_award(
  df = track_data$quarter,
  arrange_cols = quos(sd_skip_pct),
  filter_conditions = quos(
    !is.na(Q1_skip_pct), !is.na(Q2_skip_pct), !is.na(Q3_skip_pct), !is.na(Q4_skip_pct),
    Q1_listens >= qtr_threshold, Q2_listens >= qtr_threshold,
    Q3_listens >= qtr_threshold, Q4_listens >= qtr_threshold
  ),
  n = 3
)

# minimum # of listens per half
half_threshold <- 7

# Survivorship Bias (biggest decrease in skip % from H1 to H2)
track_survivorship_bias <- calculate_award(
  df = track_data$half,
  arrange_cols = quos(delta_skip_pct),
  filter_conditions = quos(
    H1_listens >= half_threshold,
    H2_listens >= half_threshold,
    !track_id %in% track_cognitive_dissonance$track_id
  ),
  n = 3
)

# Decision Fatigue (biggest increase in skip % from H1 to H2)
track_decision_fatigue <- calculate_award(
  df = track_data$half,
  arrange_cols = quos(desc(delta_skip_pct)),
  filter_conditions = quos(
    H1_listens >= half_threshold,
    H2_listens >= half_threshold,
    !track_id %in% track_cognitive_dissonance$track_id
  ),
  n = 3
)

# When analysing swings in # of listens, 'pct_change_listens' can be used as an alternative
# to normalise the difference to the dataset (change the arrange_cols variable to pct_change_listens)

# Hasty Generalisation (highest # of H1 listens with zero H2 listens)
track_hasty_generalisation <- calculate_award(
  df = track_data$half,
  arrange_cols = quos(desc(H1_listens)),
  filter_conditions = quos(H2_listens == 0),
  n = 3
)

# Recency Bias (biggest increase in # of listens from H1 to H2) - min. of 1 listen in Q1
track_recency_bias <- calculate_award(
  df = track_data$half %>%
    inner_join(
      streaming_history %>%
        filter(month(ts) %in% 1:3) %>%  # Jan, Feb, March
        group_by(track_id) %>%
        summarise(q1_listens = n(), .groups = "drop"),
      by = "track_id"
    ) %>%
    filter(q1_listens >= 2) %>%
    select(-q1_listens),
  arrange_cols = quos(desc(delta_listens)),
  filter_conditions = quos(H1_listens >= 1),
  n = 3
)

# minimum # of listens per year
year_threshold <- 10

# Slippery Slope (biggest increase in # of listens from previous to current year) - min. of 1 listen in H1 of previous year)
track_slippery_slope <- calculate_award(
  df = track_data$yoy %>%
    mutate(year_numeric = as.numeric(sub(".*/", "", year))) %>%  # Extract second year (current year)
    inner_join(
      streaming_history %>%
        filter(month(ts) <= 6) %>%  # First half of year
        group_by(year = year(ts), track_id) %>%
        summarise(H1_listens_prev = n(), .groups = "drop") %>%
        mutate(year = year + 1),  # Shift to match current year
      by = c("year_numeric" = "year", "track_id")
    ) %>%
    filter(H1_listens_prev >= 1) %>%  # Qualifier
    select(-H1_listens_prev, -year_numeric),
  arrange_cols = quos(desc(delta_listens)),
  filter_conditions = quos(listens >= year_threshold | listens_prev >= year_threshold),
  n = 3
)

# Availability Heuristic (biggest decrease in listens from previous to current year)
track_availability_heuristic <- calculate_award(
  df = track_data$yoy,
  arrange_cols = quos(delta_listens),
  filter_conditions = quos(listens >= year_threshold | listens_prev >= year_threshold),
  n = 3
)

# Oksford Study (biggest increase in skip % from previous to current year)
track_oksford_study <- calculate_award(
  df = track_data$yoy,
  arrange_cols = quos(desc(delta_skip_pct)),
  filter_conditions = quos(listens >= year_threshold & listens_prev >= year_threshold),
  n = 3
)

# Mere Exposure (biggest decrease in skip % from previous to current year)
track_mere_exposure <- calculate_award(
  df = track_data$yoy,
  arrange_cols = quos(delta_skip_pct),
  filter_conditions = quos(listens >= year_threshold & listens_prev >= year_threshold),
  n = 3
)

# If TOTY is manually overridden add criteria: "manual_override = <Track | album> (case-sensitive)

# Track of the Year Scatterplot (ensure correct year is specified)
create_award_scatterplot(year = 2024, type = "track")

# Cognitive Dissonance vs Appeal to Tradition plot (ensure correct year is specified)
plot_seasonality(year = 2024, type = "track")

# Create TOTY track race
track_race <- create_race_animation(
  streaming_history = streaming_history,
  year = 2024,
  type = "track",
  save_path = "2024_top_tracks_race.gif"
)

# Status Quo Bias
track_status_quo_bias <- calculate_weekly_standings(
  streaming_history = streaming_history,
  type = "track",
  cumulative = FALSE,
  n = 3
)

# Outcome Bias
track_outcome_bias <-calculate_weekly_standings(
  streaming_history = streaming_history,
  type = "track",
  cumulative = TRUE,
  n = 3
)

# ===========================================================================================
# album
# ===========================================================================================

album_data <- create_album_data(streaming_history)

# Minimum # of unique tracks
min_unique_tracks <-3

# Minimum # of tracks by a given album played >=3x
min_eligible_tracks <- 3

# Option to sort by `listens>60s` (total) or `avg_listens_>60s` (average per track)

# album of the Year (highest # of listens >60s)
album_AOTY <- calculate_award(
  df = filter(album_data$year, eligible_tracks >= min_eligible_tracks),
  arrange_cols = quos(desc(`avg_listens_>60s`), skip_pct),
  n = 3
)

# Worst of the Year (lowest avg duration % played)
album_WOTY <- calculate_award(
  df = filter(album_data$year, `listens_>60s` <= 2, unique_tracks >= 3),
  arrange_cols = quos(desc(listens)),
  n = 3
)
  
# Honourable Mentions (high # of listens, low skip %)
album_honourable_mentions <- calculate_honourable_mentions(type = "album", max_range = 500, min_eligible_tracks = 3)

# Dishonourable Mentions (high # of listens, high skip %)
album_dishonourable_mentions <- calculate_dishonourable_mentions(type = "album", max_range = 500, min_unique_tracks = 3)

# Appeal to Common Practice (highest # of listens skipped at 0%)
album_appeal_to_common_practice <- calculate_award(
  df = filter(album_data$year, eligible_tracks >= min_eligible_tracks),
  arrange_cols = quos(desc(listens)),
  filter_conditions = quos(skip_pct == 0),
  n = 3
)

# Negativity Bias (highest # of listens skipped at 100%)
album_negativity_bias <- calculate_award(
  df = album_data$year %>%
    filter(skip_pct == 1, eligible_tracks >= min_eligible_tracks),
  arrange_cols = quos(desc(listens)),
  n = 3
)

# 10/20 club (>=10 listens and <=20% skipped)
`album_10/20_club` <- calculate_award(
  df = album_data$year,
  filter_conditions = quos(listens >= 10, skip_pct <= 0.2, eligible_tracks >= min_eligible_tracks),
  arrange_cols = quos(desc(listens), skip_pct),
  n = Inf)

qtr_threshold <- 5

# Cognitive Dissonance (highest SD of skip % among Q1-Q4)
album_cognitive_dissonance <- calculate_award(
  df = album_data$quarter,
  arrange_cols = quos(desc(sd_skip_pct)),
  filter_conditions = quos(
    !is.na(Q1_skip_pct), !is.na(Q2_skip_pct), !is.na(Q3_skip_pct), !is.na(Q4_skip_pct),
    Q1_listens >= qtr_threshold, Q2_listens >= qtr_threshold,
    Q3_listens >= qtr_threshold, Q4_listens >= qtr_threshold,
    eligible_tracks >= min_eligible_tracks,
    !(
      (Q1_skip_pct <= Q2_skip_pct & Q2_skip_pct <= Q3_skip_pct & Q3_skip_pct <= Q4_skip_pct) |
        (Q1_skip_pct >= Q2_skip_pct & Q2_skip_pct >= Q3_skip_pct & Q3_skip_pct >= Q4_skip_pct)
    )
  ),
  n = 3
)

# Appeal to Tradition (lowest SD of skip % among Q1-Q4)
album_appeal_to_tradition <- calculate_award(
  df = album_data$quarter,
  arrange_cols = quos(sd_skip_pct),
  filter_conditions = quos(
    !is.na(Q1_skip_pct), !is.na(Q2_skip_pct), !is.na(Q3_skip_pct), !is.na(Q4_skip_pct),
    Q1_listens >= qtr_threshold, Q2_listens >= qtr_threshold,
    Q3_listens >= qtr_threshold, Q4_listens >= qtr_threshold,
    eligible_tracks >= min_eligible_tracks
  ),
  n = 3
)

half_threshold <- 10

# Survivorship Bias
album_survivorship_bias <- calculate_award(
  df = album_data$half,
  arrange_cols = quos(delta_skip_pct),
  filter_conditions = quos(
    H1_listens >= half_threshold,
    H2_listens >= half_threshold,
    eligible_tracks >= min_eligible_tracks,
    !album %in% album_cognitive_dissonance$`2024`$album
  ),
  n = 3
)

# Decision Fatigue
album_decision_fatigue <- calculate_award(
  df = album_data$half,
  arrange_cols = quos(desc(delta_skip_pct)),
  filter_conditions = quos(
    H1_listens >= half_threshold,
    H2_listens >= half_threshold,
    eligible_tracks >= min_eligible_tracks,
    !album %in% album_cognitive_dissonance$`2024`$album
  ),
  n = 3
)

# Hasty Generalisation
album_hasty_generalisation <- calculate_award(
  df = album_data$half,
  arrange_cols = quos(desc(H1_listens)),
  filter_conditions = quos(H2_listens == 0, unique_tracks >= min_unique_tracks),
  n = 3
)

# Recency Bias (biggest increase in # of listens from H1 to H2) - min. of 1 listen in Q1
album_recency_bias <- calculate_award(
  df = album_data$half %>%
    inner_join(
      streaming_history %>%
        filter(month(ts) %in% 1:3) %>%  # Jan, Feb, March
        group_by(album) %>%
        summarise(q1_listens = n(), .groups = "drop"),
      by = "album"
    ) %>%
    filter(q1_listens >= 2) %>%
    select(-q1_listens),
  arrange_cols = quos(desc(delta_listens)),
  filter_conditions = quos(H1_listens >= 1),
  n = 3
)

year_threshold <- 20

# Slippery Slope (biggest increase in # of listens from previous to current year) - min. of 1 listen in H1 of previous year)
album_slippery_slope <- calculate_award(
  df = album_data$yoy %>%
    mutate(year_numeric = as.numeric(sub(".*/", "", year))) %>%  # Extract second year (current year)
    inner_join(
      streaming_history %>%
        filter(month(ts) <= 6) %>%  # First half of year
        group_by(year = year(ts), album) %>%
        summarise(H1_listens_prev = n(), .groups = "drop") %>%
        mutate(year = year + 1),  # Shift to match current year
      by = c("year_numeric" = "year", "album")
    ) %>%
    filter(H1_listens_prev >= 1) %>%  # Qualifier
    select(-H1_listens_prev, -year_numeric),
  arrange_cols = quos(desc(delta_listens)),
  filter_conditions = quos(listens >= year_threshold | listens_prev >= year_threshold),
  n = 3
)

# Availability Heuristic
album_availability_heuristic <- calculate_award(
  df = album_data$yoy,
  arrange_cols = quos(delta_listens),
  filter_conditions = quos(
    listens >= year_threshold | listens_prev >= year_threshold,
    eligible_tracks >= min_eligible_tracks
  ),
  n = 3
)

# Oksford Study
album_oksford_study <- calculate_award(
  df = album_data$yoy,
  arrange_cols = quos(desc(delta_skip_pct)),
  filter_conditions = quos(
    listens >= year_threshold & listens_prev >= year_threshold,
    eligible_tracks >= min_eligible_tracks
  ),
  n = 3
)

# Mere Exposure
album_mere_exposure <- calculate_award(
  df = album_data$yoy,
  arrange_cols = quos(delta_skip_pct),
  filter_conditions = quos(
    listens >= year_threshold & listens_prev >= year_threshold,
    eligible_tracks >= min_eligible_tracks
  ),
  n = 3
)

# Status Quo Bias
album_status_quo_bias <- calculate_weekly_standings(
  streaming_history = streaming_history,
  type = "album",
  cumulative = FALSE,
  n = 3
)

# Outcome Bias
album_outcome_bias <-calculate_weekly_standings(
  streaming_history = streaming_history,
  type = "album",
  cumulative = TRUE,
  n = 3
)

# If AOTY is manually overridden add criteria: "manual_override = <album> (case-sensitive)

# album of the Year Scatterplot (ensure correct year is specified)
create_award_scatterplot(year = 2024, type = "album")

# Cognitive Dissonance vs Appeal to Tradition plot (ensure correct year is specified)
plot_seasonality(year = 2024, type = "track")


# Create AOTY album race
album_race <- create_race_animation(
  streaming_history = streaming_history,
  year = 2024,
  type = "album",
  save_path = "2024_top_albums_race.gif",
  method = "average"
)

# ===========================================================================================
# ALBUM
# ===========================================================================================

album_data <- create_album_data(streaming_history)

# Minimum # of unique tracks
min_unique_tracks <-3

# Minimum # of tracks by a given album played >=3x
min_eligible_tracks <- 3

# Option to sort by `listens>60s` (total) or `avg_listens_>60s` (average per track)

# album of the Year (highest # of listens >60s)
album_AOTY <- calculate_award(
  df = filter(album_data$year, eligible_tracks >= min_eligible_tracks),
  arrange_cols = quos(desc(`avg_listens_>60s`), skip_pct),
  n = 3
)

# Worst of the Year (lowest avg duration % played)
album_WOTY <- calculate_award(
  df = filter(album_data$year, `listens_>60s` <= 2, unique_tracks >= 3),
  arrange_cols = quos(desc(listens)),
  n = 3
)

# Honourable Mentions (high # of listens, low skip %)
album_honourable_mentions <- calculate_honourable_mentions(type = "album", max_range = 500, min_eligible_tracks = 3)

# Dishonourable Mentions (high # of listens, high skip %)
album_dishonourable_mentions <- calculate_dishonourable_mentions(type = "album", max_range = 500, min_unique_tracks = 3)

# Appeal to Common Practice (highest # of listens skipped at 0%)
album_appeal_to_common_practice <- calculate_award(
  df = filter(album_data$year, eligible_tracks >= min_eligible_tracks),
  arrange_cols = quos(desc(listens)),
  filter_conditions = quos(skip_pct == 0),
  n = 3
)

# Negativity Bias (highest # of listens skipped at 100%)
album_negativity_bias <- calculate_award(
  df = album_data$year %>%
    filter(skip_pct == 1, eligible_tracks >= min_eligible_tracks),
  arrange_cols = quos(desc(listens)),
  n = 3
)

# 10/20 club (>=10 listens and <=20% skipped)
`album_10/20_club` <- calculate_award(
  df = album_data$year,
  filter_conditions = quos(listens >= 10, skip_pct <= 0.2, eligible_tracks >= min_eligible_tracks),
  arrange_cols = quos(desc(listens), skip_pct),
  n = Inf)

qtr_threshold <- 5

# Cognitive Dissonance (highest SD of skip % among Q1-Q4)
album_cognitive_dissonance <- calculate_award(
  df = album_data$quarter,
  arrange_cols = quos(desc(sd_skip_pct)),
  filter_conditions = quos(
    !is.na(Q1_skip_pct), !is.na(Q2_skip_pct), !is.na(Q3_skip_pct), !is.na(Q4_skip_pct),
    Q1_listens >= qtr_threshold, Q2_listens >= qtr_threshold,
    Q3_listens >= qtr_threshold, Q4_listens >= qtr_threshold,
    eligible_tracks >= min_eligible_tracks,
    !(
      (Q1_skip_pct <= Q2_skip_pct & Q2_skip_pct <= Q3_skip_pct & Q3_skip_pct <= Q4_skip_pct) |
        (Q1_skip_pct >= Q2_skip_pct & Q2_skip_pct >= Q3_skip_pct & Q3_skip_pct >= Q4_skip_pct)
    )
  ),
  n = 3
)

# Appeal to Tradition (lowest SD of skip % among Q1-Q4)
album_appeal_to_tradition <- calculate_award(
  df = album_data$quarter,
  arrange_cols = quos(sd_skip_pct),
  filter_conditions = quos(
    !is.na(Q1_skip_pct), !is.na(Q2_skip_pct), !is.na(Q3_skip_pct), !is.na(Q4_skip_pct),
    Q1_listens >= qtr_threshold, Q2_listens >= qtr_threshold,
    Q3_listens >= qtr_threshold, Q4_listens >= qtr_threshold,
    eligible_tracks >= min_eligible_tracks
  ),
  n = 3
)

half_threshold <- 10

# Survivorship Bias
album_survivorship_bias <- calculate_award(
  df = album_data$half,
  arrange_cols = quos(delta_skip_pct),
  filter_conditions = quos(
    H1_listens >= half_threshold,
    H2_listens >= half_threshold,
    eligible_tracks >= min_eligible_tracks,
    !album_id %in% album_cognitive_dissonance$`2024`$album_id
  ),
  n = 3
)

# Decision Fatigue
album_decision_fatigue <- calculate_award(
  df = album_data$half,
  arrange_cols = quos(desc(delta_skip_pct)),
  filter_conditions = quos(
    H1_listens >= half_threshold,
    H2_listens >= half_threshold,
    eligible_tracks >= min_eligible_tracks,
    !album_id %in% album_cognitive_dissonance$`2024`$album_id
  ),
  n = 3
)

# Hasty Generalisation
album_hasty_generalisation <- calculate_award(
  df = album_data$half,
  arrange_cols = quos(desc(H1_listens)),
  filter_conditions = quos(H2_listens == 0, unique_tracks >= min_unique_tracks),
  n = 3
)

# Recency Bias (biggest increase in # of listens from H1 to H2) - min. of 1 listen in Q1
album_recency_bias <- calculate_award(
  df = album_data$half %>%
    inner_join(
      streaming_history %>%
        filter(month(ts) %in% 1:3) %>%  # Jan, Feb, March
        group_by(album_id) %>%
        summarise(q1_listens = n(), .groups = "drop"),
      by = "album_id"
    ) %>%
    filter(q1_listens >= 2) %>%
    select(-q1_listens),
  arrange_cols = quos(desc(delta_listens)),
  filter_conditions = quos(H1_listens >= 1),
  n = 3
)

year_threshold <- 20

# Slippery Slope (biggest increase in # of listens from previous to current year) - min. of 1 listen in H1 of previous year)
album_slippery_slope <- calculate_award(
  df = album_data$yoy %>%
    mutate(year_numeric = as.numeric(sub(".*/", "", year))) %>%  # Extract second year (current year)
    inner_join(
      streaming_history %>%
        filter(month(ts) <= 6) %>%  # First half of year
        group_by(year = year(ts), album) %>%
        summarise(H1_listens_prev = n(), .groups = "drop") %>%
        mutate(year = year + 1),  # Shift to match current year
      by = c("year_numeric" = "year", "album")
    ) %>%
    filter(H1_listens_prev >= 1) %>%  # Qualifier
    select(-H1_listens_prev, -year_numeric),
  arrange_cols = quos(desc(delta_listens)),
  filter_conditions = quos(listens >= year_threshold | listens_prev >= year_threshold),
  n = 3
)

# Availability Heuristic
album_availability_heuristic <- calculate_award(
  df = album_data$yoy,
  arrange_cols = quos(delta_listens),
  filter_conditions = quos(
    listens >= year_threshold | listens_prev >= year_threshold,
    eligible_tracks >= min_eligible_tracks
  ),
  n = 3
)

# Oksford Study
album_oksford_study <- calculate_award(
  df = album_data$yoy,
  arrange_cols = quos(desc(delta_skip_pct)),
  filter_conditions = quos(
    listens >= year_threshold & listens_prev >= year_threshold,
    eligible_tracks >= min_eligible_tracks
  ),
  n = 3
)

# Mere Exposure
album_mere_exposure <- calculate_award(
  df = album_data$yoy,
  arrange_cols = quos(delta_skip_pct),
  filter_conditions = quos(
    listens >= year_threshold & listens_prev >= year_threshold,
    eligible_tracks >= min_eligible_tracks
  ),
  n = 3
)

# Status Quo Bias
album_status_quo_bias <- calculate_weekly_standings(
  streaming_history = streaming_history,
  type = "album",
  cumulative = FALSE,
  n = 3
)

# Outcome Bias
album_outcome_bias <-calculate_weekly_standings(
  streaming_history = streaming_history,
  type = "album",
  cumulative = TRUE,
  n = 3
)

# If AOTY is manually overridden add criteria: "manual_override = <album> (case-sensitive)

# album of the Year Scatterplot (ensure correct year is specified)
create_award_scatterplot(year = 2024, type = "album")

# Cognitive Dissonance vs Appeal to Tradition plot (ensure correct year is specified)
plot_seasonality(year = 2024, type = "track")


# Create AOTY album race
album_race <- create_race_animation(
  streaming_history = streaming_history,
  year = 2024,
  type = "album",
  save_path = "2024_top_albums_race.gif",
  method = "average"
)
