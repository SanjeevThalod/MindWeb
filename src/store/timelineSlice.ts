import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

type TimelineState = {
  mode: 'single' | 'range';
  selected: string | [string, string]; // ISO format
};

const initialState: TimelineState = {
  mode: 'single',
  selected: new Date().toISOString(),
};

const timelineSlice = createSlice({
  name: 'timeline',
  initialState,
  reducers: {
    setMode: (state, action: PayloadAction<'single' | 'range'>) => {
      state.mode = action.payload;

      // Reset selection when mode changes
      state.selected =
        action.payload === 'single'
          ? new Date().toISOString()
          : [new Date().toISOString(), new Date().toISOString()];
    },
    setSelectedTime: (
      state,
      action: PayloadAction<string | [string, string]>
    ) => {
      state.selected = action.payload;
    },
  },
});

export const { setMode, setSelectedTime } = timelineSlice.actions;
export default timelineSlice.reducer;
