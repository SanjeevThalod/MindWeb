export type TimelineMode = 'single' | 'range';

export type TimelineState = {
  mode: TimelineMode;
  selected: Date | [Date, Date];
};
