export type Presentation = {
  slides: Slide[];
};

export type Slide =
  | {
      type: "award";
      title: string;
      description: string;
      columns_to_present: string[];
      code: string;
    }
  | {
      type: "transition";
      title: string;
      description: string;
      image: string;
    };
