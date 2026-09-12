load_streaming_history <- function(file_path = "Spotify Streaming History.xlsx") {
  sheet_name <- "Streaming_History_All"
  
  streaming_data <- read_excel(
    file_path,
    sheet = sheet_name
  ) %>%
    rename(
      track  = master_metadata_track_name,
      artist = master_metadata_album_artist_name,
      album  = master_metadata_album_album_name
    ) %>%
    filter(
      !is.na(track),
      !is.na(artist)
    ) %>%
    mutate(
      track_id = paste(track, artist, sep = " | "),
      qtr  = paste0("Q", quarter(ts)),
      half = ifelse(quarter(ts) %in% c(1, 2), "H1", "H2"),
      month = month(ts, label = TRUE),
      day  = weekdays(ts)
    ) %>%
    filter(!track_id %in% exclude_tracks) %>%
    relocate(track_id, .after = conn_country) %>%
    relocate(qtr, half, month, day, .after = ts)
  
  return(streaming_data)
}

calculate_award <- function(df, arrange_cols, filter_conditions = NULL, n = 3) {
  
  # Apply general filter conditions if provided
  if (!is.null(filter_conditions)) {
    df <- df %>% filter(!!!filter_conditions)
  }
  
  # Get unique years
  years <- df %>% pull(year) %>% unique() %>% sort()
  
  # Award list per year
  award_list <- setNames(
    lapply(years, function(yr) {
      df %>%
        filter(year == yr) %>%
        arrange(!!!arrange_cols) %>%
        slice_head(n = n)
    }),
    as.character(years)
  )
  
  return(award_list)
}


# Load streaming history from excel
create_track_data <- function(streaming_history) {
  
  track_data <- list()
  
  track_data$year <- streaming_history %>%
    mutate(year = lubridate::year(ts)) %>%
    group_by(year, track_id, track, artist) %>%
    summarise(
      album             = first(album),
      listens           = n(),
      `listens_>60s`    = sum(ms_played >= 60000),
      skips             = sum(skipped),
      skip_pct          = mean(skipped),
      duration = {d <- ms_played[!skipped & reason_end == "trackdone"]
      if (length(d) == 0) NA_real_ else max(d)},
      progress          = mean(ms_played),
      progress_pct      = mean(ms_played / duration, na.rm = TRUE),
      skip_progress_pct = mean(ms_played[skipped] / duration, na.rm = TRUE),
      max_played        = max(ms_played, na.rm = TRUE),
      .groups = "drop"
    ) %>%
    filter(is.na(duration) | max_played <= duration) %>%
    select(-max_played) %>%
    relocate(year, .before = track_id) %>%
    arrange(track_id, year)
  
  # Grouped by half
  track_data$half <- streaming_history %>%
    group_by(year = year(ts), half, track_id) %>%
    summarise(
      listens  = n(),
      skip_pct = mean(skipped),
      .groups = "drop"
    ) %>%
    pivot_wider(
      id_cols     = c(year, track_id),
      names_from  = half,
      values_from = c(skip_pct, listens),
      values_fill = list(listens = 0),
      names_glue  = "{half}_{.value}"
    ) %>%
    mutate(
      delta_skip_pct = H2_skip_pct - H1_skip_pct,
      delta_listens  = H2_listens - H1_listens,
      pct_change_listens = delta_listens / H1_listens
    ) %>%
    select(year, track_id, H1_listens, H2_listens, delta_listens,
           H1_skip_pct, H2_skip_pct, delta_skip_pct, pct_change_listens) %>%
    left_join(
      track_data$year %>% select(year, track_id, skip_pct, progress_pct, skip_progress_pct),
      by = c("year", "track_id")
    )
  
  # Grouped by quarter
  track_data$quarter <- streaming_history %>%
    group_by(year = year(ts), qtr, track_id) %>%
    summarise(
      listens  = n(),
      skip_pct = mean(skipped),
      .groups = "drop"
    ) %>%
    pivot_wider(
      id_cols     = c(year, track_id),
      names_from  = qtr,
      values_from = c(skip_pct, listens),
      names_glue  = "{qtr}_{.value}"
    ) %>%
    rowwise() %>%
    mutate(
      mean_skip_pct = mean(c_across(starts_with("Q1_skip_pct"):starts_with("Q4_skip_pct")), na.rm = TRUE),
      sd_skip_pct   = sd(c_across(starts_with("Q1_skip_pct"):starts_with("Q4_skip_pct")), na.rm = TRUE)
    ) %>%
    ungroup() %>%
    left_join(
      track_data$year %>% select(year, track_id, `listens_>60s`, skip_pct, progress_pct, skip_progress_pct),
      by = c("year", "track_id")
    )
  
  # Year-over-year track data
  track_data$yoy <- track_data$year %>%
    select(year, track_id, listens, skip_pct) %>%
    arrange(track_id, year) %>%
    group_by(track_id) %>%
    mutate(
      listens_prev = lag(listens),
      skip_pct_prev = lag(skip_pct),
      delta_listens = listens - listens_prev,
      delta_skip_pct = skip_pct - skip_pct_prev,
      pct_change_listens = delta_listens / listens_prev,
      year = paste(lag(year), year, sep = "/")
    ) %>%
    filter(!is.na(listens_prev)) %>%
    select(year, track_id, 
           listens_prev, listens, delta_listens, pct_change_listens,
           skip_pct_prev, skip_pct, delta_skip_pct) %>%
    ungroup()
  
  return(track_data)
}

create_artist_data <- function(streaming_history) {
  artist_data <- list()
  
  # Grouped by year
  artist_data$year <- streaming_history %>%
    mutate(year = lubridate::year(ts)) %>%
    group_by(year, artist) %>%
    summarise(
      listens = n(),
      `listens_>60s` = sum(ms_played >= 60000),
      skips = sum(skipped),
      skip_pct = mean(skipped),
      unique_tracks = n_distinct(track_id),  # all tracks played at least once
      eligible_tracks = sum(table(track_id) >= 3), # # of tracks played at least 3 times
      .groups = "drop"
    ) %>%
    mutate(
      `avg_listens_>60s` = `listens_>60s` / pmax(eligible_tracks, 1)  # avoid divide by zero
    ) %>%
    relocate(year, .before = artist) %>%
    arrange(artist, year)
  
  # Grouped by half
  artist_data$half <- streaming_history %>%
    group_by(year = lubridate::year(ts), half, artist) %>%
    summarise(
      listens = n(),
      skip_pct = mean(skipped),
      .groups = "drop"
    ) %>%
    pivot_wider(
      id_cols = c(year, artist),
      names_from = half,
      values_from = c(skip_pct, listens),
      values_fill = list(listens = 0),
      names_glue = "{half}_{.value}"
    ) %>%
    mutate(
      delta_skip_pct = H2_skip_pct - H1_skip_pct,
      delta_listens = H2_listens - H1_listens,
      pct_change_listens = delta_listens / H1_listens
    ) %>%
    left_join(
      artist_data$year %>% select(year, artist, unique_tracks, eligible_tracks),
      by = c("year", "artist")
    )
  
  # Grouped by quarter
  artist_data$quarter <- streaming_history %>%
    group_by(year = lubridate::year(ts), qtr, artist) %>%
    summarise(
      listens = n(),
      skip_pct = mean(skipped),
      .groups = "drop"
    ) %>%
    pivot_wider(
      id_cols = c(year, artist),
      names_from = qtr,
      values_from = c(skip_pct, listens),
      names_glue = "{qtr}_{.value}"
    ) %>%
    rowwise() %>%
    mutate(
      mean_skip_pct = mean(c_across(starts_with("Q1_skip_pct"):starts_with("Q4_skip_pct")), na.rm = TRUE),
      sd_skip_pct = sd(c_across(starts_with("Q1_skip_pct"):starts_with("Q4_skip_pct")), na.rm = TRUE)
    ) %>%
    ungroup() %>%
    left_join(
      artist_data$year %>% select(year, artist, unique_tracks, eligible_tracks),
      by = c("year", "artist")
    )
  
  # Year-over-year artist data
  artist_data$yoy <- artist_data$year %>%
    arrange(artist, year) %>%
    group_by(artist) %>%
    mutate(
      listens_prev = lag(listens),
      skip_pct_prev = lag(skip_pct),
      delta_listens = listens - listens_prev,
      pct_change_listens = delta_listens / listens_prev,
      delta_skip_pct = skip_pct - skip_pct_prev,
      year = paste(lag(year), year, sep = "/")
    ) %>%
    filter(!is.na(listens_prev)) %>%
    ungroup()
  
  return(artist_data)
}

create_album_data <- function(streaming_history) {
  album_data <- list()
  
  # Grouped by year
  album_data$year <- streaming_history %>%
    mutate(
      year = lubridate::year(ts),
      album_id = paste(artist, album, sep = " - ")
    ) %>%
    group_by(year, album_id, album, artist) %>%
    summarise(
      listens = n(),
      `listens_>60s` = sum(ms_played >= 60000),
      skips = sum(skipped),
      skip_pct = mean(skipped),
      tracks = n_distinct(track_id),
      unique_tracks = n_distinct(track_id),  # all tracks played at least once
      eligible_tracks = sum(table(track_id) >= 3), # # of tracks played at least 3 times
      .groups = "drop"
    ) %>%
    mutate(
      `avg_listens_>60s` = `listens_>60s` / pmax(eligible_tracks, 1)  # avoid divide by zero
    ) %>%
    relocate(year, .before = album_id) %>%
    arrange(album_id, year)
  
  # Grouped by half
  album_data$half <- streaming_history %>%
    mutate(album_id = paste(artist, album, sep = " - ")) %>%
    group_by(year = lubridate::year(ts), half, album_id) %>%
    summarise(
      listens = n(),
      skip_pct = mean(skipped),
      .groups = "drop"
    ) %>%
    pivot_wider(
      id_cols = c(year, album_id),
      names_from = half,
      values_from = c(skip_pct, listens),
      values_fill = list(listens = 0),
      names_glue = "{half}_{.value}"
    ) %>%
    mutate(
      delta_skip_pct = H2_skip_pct - H1_skip_pct,
      delta_listens = H2_listens - H1_listens,
      pct_change_listens = delta_listens / H1_listens
    ) %>%
    left_join(
      album_data$year %>% select(year, album_id, tracks, unique_tracks, eligible_tracks),
      by = c("year", "album_id")
    )
  
  # Grouped by quarter
  album_data$quarter <- streaming_history %>%
    mutate(album_id = paste(artist, album, sep = " - ")) %>%
    group_by(year = lubridate::year(ts), qtr, album_id) %>%
    summarise(
      listens = n(),
      skip_pct = mean(skipped),
      .groups = "drop"
    ) %>%
    pivot_wider(
      id_cols = c(year, album_id),
      names_from = qtr,
      values_from = c(skip_pct, listens),
      names_glue = "{qtr}_{.value}"
    ) %>%
    rowwise() %>%
    mutate(
      mean_skip_pct = mean(c_across(starts_with("Q1_skip_pct"):starts_with("Q4_skip_pct")), na.rm = TRUE),
      sd_skip_pct = sd(c_across(starts_with("Q1_skip_pct"):starts_with("Q4_skip_pct")), na.rm = TRUE)
    ) %>%
    ungroup() %>%
    left_join(
      album_data$year %>% select(year, album_id, tracks, unique_tracks, eligible_tracks),
      by = c("year", "album_id")
    )
  
  # Year-over-year album data
  album_data$yoy <- album_data$year %>%
    arrange(album_id, year) %>%
    group_by(album_id) %>%
    mutate(
      listens_prev = lag(listens),
      skip_pct_prev = lag(skip_pct),
      delta_listens = listens - listens_prev,
      pct_change_listens = delta_listens / listens_prev,
      delta_skip_pct = skip_pct - skip_pct_prev,
      year = paste(lag(year), year, sep = "/")
    ) %>%
    filter(!is.na(listens_prev)) %>%
    ungroup()
  
  return(album_data)
}
calculate_honourable_mentions <- function(type = c("track", "artist", "album"),
                                          max_range = NULL,
                                          min_eligible_tracks = NULL,
                                          min_wins = 5) {
  
  type <- match.arg(type)
  
  # Set up data source, ID column, and exclusion list based on type
  if (type == "track") {
    df_all <- track_data$year
    id_col <- "track_id"
    oty_list <- track_TOTY
  } else if (type == "artist") {
    df_all <- artist_data$year
    id_col <- "artist"
    oty_list <- artist_AOTY
  } else {
    df_all <- album_data$year
    id_col <- "album_id"
    oty_list <- album_AOTY
  }
  
  # Get all unique years
  all_years <- df_all %>%
    pull(year) %>%
    unique() %>%
    sort()
  
  # Process each year
  results <- map(all_years, function(yr) {
    
    df <- df_all %>% filter(year == yr)
    exclude_df <- oty_list[[as.character(yr)]]
    
    # Apply eligible_tracks filter for artists if specified
    if (type == "artist" && !is.null(min_eligible_tracks)) {
      df <- df %>% filter(eligible_tracks >= min_eligible_tracks)
    }
    
    # Pre-sort by listens descending (with ties broken by progress_pct descending for tracks only)
    if (type == "track") {
      df_sorted <- df %>% arrange(desc(listens), desc(progress_pct))
    } else {
      df_sorted <- df %>% arrange(desc(listens))
    }
    
    n_rows <- nrow(df_sorted)
    range_limit <- if (is.null(max_range)) n_rows else min(max_range, n_rows)
    range_results <- vector("list", range_limit)
    
    # Loop through each range - find LOWEST skip_pct
    for (i in seq_len(range_limit)) {
      if (type == "track") {
        winners_i <- df_sorted %>%
          slice(1:i) %>%
          arrange(skip_pct, desc(progress_pct)) %>%
          slice_head(n = 1) %>%
          mutate(win_range = i) %>%
          select(!!id_col, win_range)
      } else {
        winners_i <- df_sorted %>%
          slice(1:i) %>%
          arrange(skip_pct) %>%
          slice_head(n = 1) %>%
          mutate(win_range = i) %>%
          select(!!id_col, win_range)
      }
      
      range_results[[i]] <- winners_i
    }
    
    # Summarize and join with original data
    summary_cols <- if (type == "track") {
      c("track_id", "track", "artist", "listens", "skip_pct", "progress_pct", "skip_progress_pct")
    } else if (type == "artist") {
      c("artist", "listens", "skip_pct", "unique_tracks", "eligible_tracks")
    } else {
      c("album_id", "album", "artist", "listens", "skip_pct", "tracks")
    }
    
    bind_rows(range_results) %>%
      group_by(!!sym(id_col)) %>%
      summarise(
        wins  = n(),
        range = paste0(min(win_range), "-", max(win_range)),
        .groups = "drop"
      ) %>%
      filter(wins >= min_wins) %>%
      left_join(
        df %>% select(any_of(summary_cols)),
        by = id_col
      ) %>%
      filter(!.data[[id_col]] %in% exclude_df[[id_col]]) %>%
      arrange(desc(wins)) %>%
      mutate(year = yr)
  })
  
  # Name the list by year
  names(results) <- as.character(all_years)
  
  return(results)
}

calculate_dishonourable_mentions <- function(type = c("track", "artist", "album"),
                                             max_range = NULL,
                                             min_unique_tracks = NULL,
                                             min_wins = 5) {
  
  type <- match.arg(type)
  
  # Set up data source, ID column, and exclusion list based on type
  if (type == "track") {
    df_all <- track_data$year
    id_col <- "track_id"
    oty_list <- track_TOTY
  } else if (type == "artist") {
    df_all <- artist_data$year
    id_col <- "artist"
    oty_list <- artist_AOTY
  } else {
    df_all <- album_data$year
    id_col <- "album_id"
    oty_list <- album_AOTY
  }
  
  # Get all unique years
  all_years <- df_all %>%
    pull(year) %>%
    unique() %>%
    sort()
  
  # Process each year
  results <- map(all_years, function(yr) {
    
    df <- df_all %>% filter(year == yr)
    exclude_df <- oty_list[[as.character(yr)]]
    
    # Apply unique_tracks filter for artists if specified
    if (type == "artist" && !is.null(min_unique_tracks)) {
      df <- df %>% filter(unique_tracks >= min_unique_tracks)
    }
    
    # Pre-sort by listens descending (with ties broken by progress_pct descending for tracks only)
    if (type == "track") {
      df_sorted <- df %>% arrange(desc(listens), desc(progress_pct))
    } else {
      df_sorted <- df %>% arrange(desc(listens))
    }
    
    n_rows <- nrow(df_sorted)
    range_limit <- if (is.null(max_range)) n_rows else min(max_range, n_rows)
    range_results <- vector("list", range_limit)
    
    # Loop through each range - find HIGHEST skip_pct
    for (i in seq_len(range_limit)) {
      if (type == "track") {
        winners_i <- df_sorted %>%
          slice(1:i) %>%
          arrange(desc(skip_pct), desc(progress_pct)) %>%
          slice_head(n = 1) %>%
          mutate(win_range = i) %>%
          select(!!id_col, win_range)
      } else {
        winners_i <- df_sorted %>%
          slice(1:i) %>%
          arrange(desc(skip_pct)) %>%
          slice_head(n = 1) %>%
          mutate(win_range = i) %>%
          select(!!id_col, win_range)
      }
      
      range_results[[i]] <- winners_i
    }
    
    # Summarize and join with original data
    summary_cols <- if (type == "track") {
      c("track_id", "track", "artist", "listens", "skip_pct", "progress_pct", "skip_progress_pct")
    } else if (type == "artist") {
      c("artist", "listens", "skip_pct", "unique_tracks")
    } else {
      c("album_id", "album", "artist", "listens", "skip_pct", "tracks")
    }
    
    bind_rows(range_results) %>%
      group_by(!!sym(id_col)) %>%
      summarise(
        wins  = n(),
        range = paste0(min(win_range), "-", max(win_range)),
        .groups = "drop"
      ) %>%
      filter(wins >= min_wins) %>%
      left_join(
        df %>% select(any_of(summary_cols)),
        by = id_col
      ) %>%
      filter(!.data[[id_col]] %in% exclude_df[[id_col]]) %>%
      arrange(desc(wins)) %>%
      mutate(year = yr)
  })
  
  # Name the list by year
  names(results) <- as.character(all_years)
  
  return(results)
}
# ===========================================================================================
# PLOTTING FUNCTIONS
# ===========================================================================================

prep_qtr_data <- function(qtr_df, id_col, qtr_threshold) {
  
  # First, filter to only include entities that meet the threshold in ALL quarters
  unique_ids <- qtr_df %>%
    filter(
      Q1_listens >= qtr_threshold,
      Q2_listens >= qtr_threshold,
      Q3_listens >= qtr_threshold,
      Q4_listens >= qtr_threshold
    ) %>%
    pull(!!sym(id_col))
  
  qtr_df %>%
    filter(.data[[id_col]] %in% unique_ids) %>%
    select(year, !!sym(id_col), starts_with("Q")) %>%
    pivot_longer(
      cols = starts_with("Q") & ends_with("_skip_pct"),
      names_to = "Quarter",
      values_to = "SkipPct"
    ) %>%
    mutate(
      Quarter = gsub("_skip_pct", "", Quarter),
      row_id = paste(year, .data[[id_col]], sep = "_")
    ) %>%
    filter(!is.na(SkipPct))
}


plot_seasonality <- function(year, 
                             type = c("track", "artist", "album"),
                             qtr_threshold = 5) {
  
  type <- match.arg(type)
  
  # Set up data source, ID column, and award lists based on type
  if (type == "track") {
    qtr_df <- track_data$quarter %>% filter(year == !!year)
    id_col <- "track_id"
    cd_list <- track_cognitive_dissonance
    att_list <- track_appeal_to_tradition
    label1 <- "Cognitive Dissonance"
    label2 <- "Appeal to Tradition"
  } else if (type == "artist") {
    qtr_df <- artist_data$quarter %>% filter(year == !!year)
    id_col <- "artist"
    cd_list <- artist_cognitive_dissonance
    att_list <- artist_appeal_to_tradition
    label1 <- "Cognitive Dissonance"
    label2 <- "Appeal to Tradition"
  } else {
    qtr_df <- album_data$quarter %>% filter(year == !!year)
    id_col <- "album_id"
    cd_list <- album_cognitive_dissonance
    att_list <- album_appeal_to_tradition
    label1 <- "Cognitive Dissonance"
    label2 <- "Appeal to Tradition"
  }
  
  # Get the winner IDs for the specified year
  highlight_id1 <- cd_list[[as.character(year)]][[id_col]][1]
  highlight_id2 <- att_list[[as.character(year)]][[id_col]][1]
  
  # Validate IDs
  if (is.null(highlight_id1) || length(highlight_id1) == 0 || is.na(highlight_id1)) {
    stop("Cognitive Dissonance ID must be a valid non-NULL, non-NA value")
  }
  if (is.null(highlight_id2) || length(highlight_id2) == 0 || is.na(highlight_id2)) {
    stop("Appeal to Tradition ID must be a valid non-NULL, non-NA value")
  }
  
  # Prepare data and apply highlighting
  combined_data <- prep_qtr_data(qtr_df, id_col = id_col, qtr_threshold = qtr_threshold) %>%
    mutate(
      Label = case_when(
        .data[[id_col]] == highlight_id1 ~ label1,
        .data[[id_col]] == highlight_id2 ~ label2,
        TRUE ~ "Other"
      )
    )
  
  ggplot(combined_data, aes(Quarter, SkipPct, group = row_id, color = Label)) +
    geom_line(linewidth = 2) +
    geom_point(size = 3.5) +
    scale_color_manual(
      values = c("Cognitive Dissonance" = "darkorange2",
                 "Appeal to Tradition" = "skyblue2",
                 "Other" = "grey"),
      breaks = c(label1, label2, "Other")
    ) +
    labs(
      title = paste("Cognitive Dissonance vs Appeal to Tradition"),
      x = "Quarter",
      y = "Skip %",
      color = NULL
    ) +
    theme_fivethirtyeight() +
    theme(
      axis.title = element_text(),
      legend.position = "top",
      legend.key.size = unit(0.7, "lines"),
      legend.text = element_text(size = 10)
    )
}

create_race_animation <- function(streaming_history,
                                  year,
                                  type = c("track", "artist", "album"),
                                  top_n = 10,
                                  nframes = 200,
                                  fps = 10,
                                  method = c("total", "average"),
                                  min_eligible_tracks = 3,
                                  save_path = NULL) {
  
  type <- match.arg(type)
  method <- match.arg(method)
  
  # Set ID column and title prefix
  if (type == "track") {
    id_col <- "track_id"
    title_prefix <- "Top Tracks"
  } else if (type == "artist") {
    id_col <- "artist"
    title_prefix <- "Top Artists"
  } else {
    id_col <- "album_id"
    title_prefix <- "Top Albums"
  }
  
  # Prepare cumulative / metric data
  cumulative_data <- streaming_history %>%
    filter(year(ts) == !!year) %>%
    mutate(
      week = floor_date(ts, "week", week_start = 1),
      year = year(ts)
    ) %>%
    group_by(year, week, .data[[id_col]]) %>%
    summarise(
      `listens_>60s_week` = sum(ms_played >= 60000),
      .groups = "drop"
    ) %>%
    arrange(.data[[id_col]], week) %>%
    group_by(.data[[id_col]]) %>%
    mutate(
      `cum_listens_>60s` = cumsum(`listens_>60s_week`)
    ) %>%
    ungroup()
  
  # Complete grid to fill missing weeks
  all_weeks <- seq(min(cumulative_data$week), max(cumulative_data$week), by = "week")
  all_ids <- unique(cumulative_data[[id_col]])
  complete_grid <- expand.grid(
    week = all_weeks,
    id = all_ids,
    stringsAsFactors = FALSE
  )
  names(complete_grid)[2] <- id_col
  
  cumulative_data <- complete_grid %>%
    left_join(cumulative_data, by = c("week", id_col)) %>%
    arrange(.data[[id_col]], week) %>%
    group_by(.data[[id_col]]) %>%
    fill(`cum_listens_>60s`, .direction = "down") %>%
    mutate(`cum_listens_>60s` = replace_na(`cum_listens_>60s`, 0)) %>%
    ungroup()
  
  # Calculate metric based on method
  if (method == "average") {
    # Calculate eligible tracks count for filtering (only for artists)
    if (type == "artist") {
      eligible_counts <- streaming_history %>%
        filter(year(ts) == !!year) %>%
        group_by(.data[[id_col]]) %>%
        summarise(eligible_tracks = n_distinct(track_id), .groups = "drop")
      
      # Calculate running average
      cumulative_data <- cumulative_data %>%
        left_join(eligible_counts, by = id_col) %>%
        filter(eligible_tracks >= min_eligible_tracks) %>%
        group_by(.data[[id_col]], week) %>%
        mutate(
          cum_tracks = if_else(`cum_listens_>60s` > 0, eligible_tracks, 0),
          metric = if_else(cum_tracks > 0, `cum_listens_>60s` / cum_tracks, 0)
        ) %>%
        ungroup()
    } else {
      # For tracks and albums, just use cumulative listens as metric
      cumulative_data <- cumulative_data %>%
        mutate(metric = `cum_listens_>60s`)
    }
  } else {
    # For total method
    if (type == "artist") {
      eligible_counts <- streaming_history %>%
        filter(year(ts) == !!year) %>%
        group_by(.data[[id_col]]) %>%
        summarise(eligible_tracks = n_distinct(track_id), .groups = "drop")
      
      cumulative_data <- cumulative_data %>%
        left_join(eligible_counts, by = id_col) %>%
        filter(eligible_tracks >= min_eligible_tracks) %>%
        mutate(metric = `cum_listens_>60s`)
    } else {
      # For tracks and albums, no filtering needed
      cumulative_data <- cumulative_data %>%
        mutate(metric = `cum_listens_>60s`)
    }
  }
  
  # Filter top N per week
  cumulative_data <- cumulative_data %>%
    group_by(week) %>%
    slice_max(metric, n = top_n, with_ties = FALSE) %>%
    mutate(rank = rank(-metric, ties.method = "first")) %>%
    ungroup()
  
  # Create animated race plot
  p <- ggplot(cumulative_data, 
              aes(x = rank, y = metric, group = .data[[id_col]], fill = .data[[id_col]])) +
    geom_col(show.legend = FALSE, width = 0.8) +
    geom_text(aes(label = .data[[id_col]], y = 0),
              hjust = 0, nudge_y = max(cumulative_data$metric) * 0.01, size = 3) +
    coord_flip() +
    scale_x_reverse() +
    theme_minimal() +
    theme(
      axis.text.y = element_blank(),
      axis.ticks.y = element_blank()
    ) +
    labs(
      title = paste0(title_prefix, " ", year, ": {format(frame_time, '%Y-%m-%d')}"),
      x = NULL,
      y = ifelse(method == "average" & type == "artist", 
                 "Average Listens >60s per Track", 
                 "Cumulative Listens >60s")
    ) +
    transition_time(week) +
    ease_aes('linear')
  
  # Render animation
  anim <- animate(p, nframes = nframes, fps = fps, width = 800, height = 600)
  
  # Save if path provided
  if (!is.null(save_path)) {
    anim_save(save_path, animation = anim)
  }
  
  return(anim)
}

create_award_scatterplot <- function(year, 
                                     type = c("track", "artist", "album"),
                                     manual_override = NULL) {
  
  type <- match.arg(type)
  
  # Set up data source, ID column, and award list based on type
  if (type == "track") {
    df <- track_data$year %>% filter(year == !!year)
    id_col <- "track_id"
    award_list <- track_TOTY
    title <- "Track of the Year"
    x_label <- "Total Listens"
  } else if (type == "artist") {
    df <- artist_data$year %>% filter(year == !!year)
    id_col <- "artist"
    award_list <- artist_AOTY
    title <- "Artist of the Year"
    x_label <- "Total Listens"
  } else {
    df <- album_data$year %>% filter(year == !!year)
    id_col <- "album_id"
    award_list <- album_AOTY
    title <- "Album of the Year"
    x_label <- "Total Listens"
  }
  
  # Get the winner ID - use manual override if provided, otherwise use #1 from award list
  if (!is.null(manual_override)) {
    winner_id <- manual_override
  } else {
    winner_id <- award_list[[as.character(year)]][[id_col]][1]
  }
  
  # Create the plot
  ggplot(df, aes(x = listens, y = skip_pct)) +
    geom_point(aes(color = .data[[id_col]] == winner_id), size = 3.75) +
    scale_color_manual(values = c("FALSE" = "darkgrey", "TRUE" = "red"), guide = "none") +
    theme_minimal() +
    theme(legend.position = "none") +
    labs(title = paste(title), x = x_label, y = "Skip %") +
    theme_fivethirtyeight() +
    theme(axis.title = element_text())
}

calculate_weekly_standings <- function(streaming_history,
                                       type = c("track", "artist", "album"),
                                       cumulative = TRUE,
                                       n = 3) {
  
  type <- match.arg(type)
  
  # Set ID column and exclusion sources based on type
  if (type == "track") {
    id_col <- "track_id"
    hm_list <- track_honourable_mentions
    data_source <- track_data$year
    sort_col <- "listens_>60s"
  } else if (type == "artist") {
    id_col <- "artist"
    hm_list <- artist_honourable_mentions
    data_source <- artist_data$year
    sort_col <- "listens"
  } else {
    id_col <- "album_id"
    hm_list <- album_honourable_mentions
    data_source <- album_data$year
    sort_col <- "listens"
  }
  
  # Get all unique years
  all_years <- streaming_history %>%
    mutate(yr = year(ts)) %>%
    pull(yr) %>%
    unique() %>%
    sort()
  
  # Process each year
  results <- map(all_years, function(yr) {
    
    # Calculate weekly listens
    weekly_data <- streaming_history %>%
      filter(year(ts) == yr) %>%
      mutate(
        week = floor_date(ts, "week", week_start = 1),
        yr_col = year(ts)
      ) %>%
      group_by(yr_col, week, .data[[id_col]]) %>%
      summarise(
        `listens_>60s_week` = sum(ms_played >= 60000),
        .groups = "drop"
      )
    
    # Apply cumulative calculation if needed
    if (cumulative) {
      weekly_data <- weekly_data %>%
        arrange(yr_col, .data[[id_col]], week) %>%
        group_by(yr_col, .data[[id_col]]) %>%
        mutate(
          `cum_listens_>60s` = cumsum(`listens_>60s_week`)
        ) %>%
        ungroup() %>%
        # Create complete grid per year
        group_by(yr_col) %>%
        group_modify(~ {
          all_weeks <- seq(min(.x$week), max(.x$week), by = "week")
          all_ids <- unique(.x[[id_col]])
          complete_grid <- expand.grid(
            week = all_weeks,
            id = all_ids,
            stringsAsFactors = FALSE
          )
          names(complete_grid)[2] <- id_col
          
          complete_grid %>%
            left_join(.x, by = c("week", id_col)) %>%
            arrange(.data[[id_col]], week) %>%
            group_by(.data[[id_col]]) %>%
            fill(`cum_listens_>60s`, .direction = "down") %>%
            mutate(`cum_listens_>60s` = replace_na(`cum_listens_>60s`, 0)) %>%
            ungroup()
        }) %>%
        ungroup()
      
      # Filter to top 10 per week based on cumulative
      weekly_data <- weekly_data %>%
        group_by(yr_col, week) %>%
        slice_max(`cum_listens_>60s`, n = 10, with_ties = FALSE) %>%
        ungroup()
      
      # Get rankings from data source
      rankings <- data_source %>%
        filter(year == yr) %>%
        arrange(desc(.data[[sort_col]])) %>%
        mutate(rank = row_number()) %>%
        select(!!sym(id_col), rank)
      
      # Summarize weeks in top 10
      summary_df <- weekly_data %>%
        group_by(yr_col, .data[[id_col]]) %>%
        summarise(
          weeks_in_top10 = n(),
          `listens_>60s` = last(`cum_listens_>60s`),
          .groups = "drop"
        ) %>%
        rename(year = yr_col) %>%
        left_join(rankings, by = id_col)
      
    } else {
      # Weekly method: filter to top 10 per week based on that week's listens
      weekly_data <- weekly_data %>%
        group_by(yr_col, week) %>%
        slice_max(`listens_>60s_week`, n = 10, with_ties = FALSE) %>%
        ungroup()
      
      # Get total listens for the year
      total_listens <- streaming_history %>%
        filter(year(ts) == yr) %>%
        group_by(.data[[id_col]]) %>%
        summarise(
          `listens_>60s` = sum(ms_played >= 60000),
          .groups = "drop"
        )
      
      # Summarize weeks in top 10
      summary_df <- weekly_data %>%
        group_by(yr_col, .data[[id_col]]) %>%
        summarise(
          weeks_in_top10 = n(),
          .groups = "drop"
        ) %>%
        rename(year = yr_col) %>%
        left_join(total_listens, by = id_col)
    }
    
    # Get top 10 from data source for this year
    top10_ids <- data_source %>%
      filter(year == yr) %>%
      arrange(desc(.data[[sort_col]])) %>%
      slice_head(n = 10) %>%
      pull(!!sym(id_col))
    
    # Exclude top 10 and honourable mentions
    exclude_ids <- top10_ids
    
    # Add honourable mentions exclusions for this year
    if (as.character(yr) %in% names(hm_list)) {
      hm_year <- hm_list[[as.character(yr)]]
      if (nrow(hm_year) > 0) {
        exclude_ids <- c(exclude_ids, hm_year[[id_col]])
      }
    }
    
    # Apply exclusions
    summary_df <- summary_df %>%
      filter(!.data[[id_col]] %in% exclude_ids)
    
    # Return top N for this year
    summary_df %>%
      arrange(desc(weeks_in_top10)) %>%
      slice_head(n = n)
  })
  
  # Name the list by year
  names(results) <- as.character(all_years)
  
  return(results)
}
