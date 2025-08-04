// store/colorRulesSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type TempRange = { min: number; max: number; color: string };

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));

  return `#${f(0).toString(16).padStart(2, '0')}${f(8).toString(16).padStart(2, '0')}${f(4).toString(16).padStart(2, '0')}`;
}

const initialState: TempRange[] = Array.from({ length: 9 }, (_, i) => ({
  min: i * 5,
  max: (i + 1) * 5,
  color: hslToHex(i * 40, 70, 50),
}));

const colorRulesSlice = createSlice({
  name: 'colorRules',
  initialState,
  reducers: {
    updateColor(state, action: PayloadAction<{ index: number; color: string }>) {
      state[action.payload.index].color = action.payload.color;
    },
  },
});

export const { updateColor } = colorRulesSlice.actions;
export default colorRulesSlice.reducer;
