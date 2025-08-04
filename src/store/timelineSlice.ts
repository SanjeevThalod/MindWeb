import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface TimelineState {
  selectedDate: string;
  selectedTime: string;
}

const today = new Date();
const defaultDate = today.toISOString().split('T')[0];
const defaultTime = `${today.getHours()}:00`;

const initialState: TimelineState = {
  selectedDate: defaultDate,
  selectedTime: defaultTime,
};

const timelineSlice = createSlice({
  name: 'timeline',
  initialState,
  reducers: {
    setDate(state, action: PayloadAction<string>) {
      state.selectedDate = action.payload;
    },
    setTime(state, action: PayloadAction<string>) {
      state.selectedTime = action.payload;
    },
  },
});

export const { setDate, setTime } = timelineSlice.actions;
export default timelineSlice.reducer;
