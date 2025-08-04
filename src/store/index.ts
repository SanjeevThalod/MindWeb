import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type {  TypedUseSelectorHook } from 'react-redux';
import timelineReducer from './timelineSlice';
import polygonsReducer from './polygonsSlice';
import colorRulesReducer from './colorRulesSlice';
import { openMeteoApi } from './openMeteoApi';

export const store = configureStore({
  reducer: {
    timeline: timelineReducer,
    polygons: polygonsReducer,
    colorRules: colorRulesReducer,
    [openMeteoApi.reducerPath]: openMeteoApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(openMeteoApi.middleware),
});

// Types for useSelector and useDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
