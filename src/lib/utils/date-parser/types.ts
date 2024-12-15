export type DateResult = {
  date: Date | null;
  time: string | null;
  error?: string;
};

export type DateMatch = {
  day: number;
  month: number;
  year: number;
  hours: number;
  minutes: number;
  period?: string;
  relative?: {
    type: "day" | "week" | "month";
    value: number;
  };
};
