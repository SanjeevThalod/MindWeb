import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const openMeteoApi = createApi({
  reducerPath: 'openMeteoApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://archive-api.open-meteo.com/v1/' }),
  endpoints: (builder) => ({
    getTemperature: builder.query<
      { hourly: { temperature_2m: number[]; time: string[] } },
      { lat: number; lon: number; startDate: string; endDate: string }
    >({
      query: ({ lat, lon, startDate, endDate }) =>
        `archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&hourly=temperature_2m`,
    }),
  }),
});

export const { useGetTemperatureQuery } = openMeteoApi;
