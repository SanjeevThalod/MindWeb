import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface TimelineState {
  selectedDateRange: [string, string];
  selectedTimeRange: [string, string];
}

const today = new Date();
const defaultDate = today.toISOString().split('T')[0];
const defaultTime = `${today.getHours()}:00`;

const initialState: TimelineState = {
  selectedDateRange: [defaultDate, defaultDate],
  selectedTimeRange: [defaultTime, defaultTime],
};

const timelineSlice = createSlice({
  name: 'timeline',
  initialState,
  reducers: {
    setDateRange(state, action: PayloadAction<[string, string]>) {
      state.selectedDateRange = action.payload;
    },
    setTimeRange(state, action: PayloadAction<[string, string]>) {
      state.selectedTimeRange = action.payload;
    },
  },
});

export const { setDateRange, setTimeRange } = timelineSlice.actions;
export default timelineSlice.reducer;
