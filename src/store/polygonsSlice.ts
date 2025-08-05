import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { act } from 'react';

type LatLng = { lat: number; lng: number };

export type ColorRule = {
  operator: '<' | '>' | '<=' | '>=' | '=';
  value: number;
  color: string;
};

export type TimeRange = {
  start: string; // ISO format: 'YYYY-MM-DDTHH:mm'
  end: string;
};

export type PolygonData = {
  id: string;
  coordinates: LatLng[];
  centroid: LatLng;
  dataSource: string;
  variable: string; // e.g., 'temperature_2m'
  rules: ColorRule[];

  currentValue?: number;
  currentColor?: string;

  time?: string;
  timeRange?: TimeRange;

  temperatureSeries?: {
    time: string;
    value: number;
  }[];
};


interface PolygonState {
  list: PolygonData[];
}

const initialState: PolygonState = {
  list: [],
};

const polygonsSlice = createSlice({
  name: 'polygons',
  initialState,
  reducers: {
    addPolygon: (state, action: PayloadAction<PolygonData>) => {
      const exists = state.list.find(p => p.id === action.payload.id);
      if (!exists) {
        state.list.push(action.payload);
      }
    },
    updatePolygon: (state, action: PayloadAction<{ id: string, updates: Partial<PolygonData> }>) => {
      const index = state.list.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = {
          ...state.list[index],
          ...action.payload.updates,
        };
      }
    }
    ,
    updatePolygonTime: (
      state,
      action: PayloadAction<{ id: string; time: string }>
    ) => {
      const polygon = state.list.find(p => p.id === action.payload.id);
      if (polygon) {
        polygon.time = action.payload.time;
        polygon.timeRange = undefined; // clear range if switching to single
      }
    },
    updatePolygonTimeRange: (
      state,
      action: PayloadAction<{ id: string; timeRange: TimeRange }>
    ) => {
      const polygon = state.list.find(p => p.id === action.payload.id);
      if (polygon) {
        polygon.timeRange = action.payload.timeRange;
        polygon.time = undefined; // clear single time if switching to range
      }
    },
    updatePolygonValue: (
      state,
      action: PayloadAction<{ id: string; value: number; color: string }>
    ) => {
      const polygon = state.list.find(p => p.id === action.payload.id);
      if (polygon) {
        polygon.currentValue = action.payload.value;
        polygon.currentColor = action.payload.color;
      }
    },
    // Add this to reducers:
    deletePolygon: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter(polygon => polygon.id !== action.payload);
    },
    clearPolygons: (state) => {
      state.list = [];
    },
    setPolygonTemperatureSeries: (
      state,
      action: PayloadAction<{
        id: string;
        temperatures: { time: string; value: number }[];
      }>
    ) => {
      const polygon = state.list.find(p => p.id === action.payload.id);
      if (polygon) {
        polygon.temperatureSeries = action.payload.temperatures;
      }
    }
  },
});

export const {
  addPolygon,
  updatePolygon,
  updatePolygonTime,
  updatePolygonTimeRange,
  updatePolygonValue,
  deletePolygon,
  clearPolygons,
  setPolygonTemperatureSeries,
} = polygonsSlice.actions;

export default polygonsSlice.reducer;
