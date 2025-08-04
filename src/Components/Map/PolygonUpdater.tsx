import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { updatePolygon, setPolygonTemperatureSeries } from '../../store/polygonsSlice';
import type { PolygonData, ColorRule } from '../../store/polygonsSlice';

type TempCacheEntry = {
  time: string[];
  values: number[];
};

const PolygonUpdater = () => {
  const dispatch = useDispatch();
  const polygons = useSelector((state: RootState) => state.polygons.list);
  const rules = useSelector((state: RootState) => state.colorRules);
  const { mode, selected } = useSelector((state: RootState) => state.timeline);

  const tempCache = useRef<Map<string, TempCacheEntry>>(new Map());

  const fetchTemperatureSeries = async (
    lat: number,
    lng: number,
    startDate: string,
    endDate: string
  ): Promise<TempCacheEntry | null> => {
    const cacheKey = `${lat}-${lng}-${startDate}-${endDate}`;

    if (tempCache.current.has(cacheKey)) {
      return tempCache.current.get(cacheKey)!;
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m&start_date=${startDate}&end_date=${endDate}&timezone=auto`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data.hourly?.time || !data.hourly?.temperature_2m) return null;

      const entry: TempCacheEntry = {
        time: data.hourly.time,
        values: data.hourly.temperature_2m,
      };

      tempCache.current.set(cacheKey, entry);
      return entry;
    } catch (err) {
      console.error('Failed to fetch temp series:', err);
      return null;
    }
  };


  const evaluateRule = (value: number): string => {
    for (const rule of rules) {
      if (value >= rule.min && value < rule.max) return rule.color;
    }
    return '#888'; // fallback
  };

  const updateAllPolygons = async () => {
    for (const polygon of polygons) {
      const { lat, lng } = polygon.centroid;

      if (mode === 'single') {
        const isoTime = selected as string;
        const dateStr = isoTime.slice(0, 10);
        const hourStr = isoTime.slice(0, 13); // YYYY-MM-DDTHH

        const cached = await fetchTemperatureSeries(lat, lng, dateStr, dateStr);
        if (!cached) continue;

        const index = cached.time.findIndex((t) => t.startsWith(hourStr));
        if (index === -1) continue;

        const value = cached.values[index];
        const color = evaluateRule(value);

        if (!cached) {
          console.warn("No cached data");
          continue;
        }

        if (index === -1) {
          console.warn("Time index not found");
          continue;
        }


        // Only dispatch if changed
        if (
          polygon.currentValue !== value ||
          polygon.currentColor !== color ||
          polygon.time !== isoTime ||
          !polygon.temperatureSeries ||
          polygon.temperatureSeries.length !== cached.time.length
        ) {
          const temperatureSeries = cached.time.map((t, i) => ({
            time: t,
            value: cached.values[i],
          }));

          dispatch(updatePolygon({
            id: polygon.id,
            updates: {
              currentValue: value,
              currentColor: color,
              time: isoTime,
              timeRange: undefined,
              temperatureSeries,
            }
          }));

        }
      }

      // range of time, will implement later

      // if (
      //   mode === 'range' &&
      //   typeof selected === 'object' &&
      //   selected !== null &&
      //   'start' in selected &&
      //   'end' in selected
      // ) {
      //   const { start, end } = selected;
      //   const startDate = start.slice(0, 10);
      //   const endDate = end.slice(0, 10);

      //   const cached = await fetchTemperatureSeries(lat, lng, startDate, endDate);
      //   if (!cached) continue;

      //   const filteredSeries = cached.time
      //     .map((t, i) => ({ time: t, value: cached.values[i] }))
      //     .filter(({ time }) => time >= start && time <= end);

      //   if (filteredSeries.length === 0) continue;

      //   const avg = filteredSeries.reduce((sum, d) => sum + d.value, 0) / filteredSeries.length;
      //   const color = evaluateRule(polygon.rules || [], avg);

      //   dispatch(updatePolygon({
      //     ...polygon,
      //     currentValue: avg,
      //     currentColor: color,
      //     time: undefined,
      //     timeRange: { start, end },
      //   }));

      //   dispatch(setPolygonTemperatureSeries({
      //     id: polygon.id,
      //     temperatures: filteredSeries,
      //   }));
      // }
    }
  };


  useEffect(() => {
    updateAllPolygons();
  }, [mode, selected, polygons, rules]);

  return null;
};

export default PolygonUpdater;
