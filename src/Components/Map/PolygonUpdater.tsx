import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { updatePolygon } from '../../store/polygonsSlice';
import type { PolygonData, ColorRule } from '../../store/polygonsSlice';

type TempCacheEntry = {
  time: string[];
  values: number[];
};

const PolygonUpdater = () => {
  const dispatch = useDispatch();

  const polygons = useSelector((state: RootState) => state.polygons.list);
  const rules = useSelector((state: RootState) => state.colorRules);
  const { selectedDateRange, selectedTimeRange } = useSelector((state: RootState) => state.timeline);

  const tempCache = useRef<Map<string, TempCacheEntry>>(new Map());

  const fetchFull30DaySeries = async (lat: number, lng: number): Promise<TempCacheEntry | null> => {
    const today = new Date();
    const startPast = new Date(today);
    startPast.setDate(today.getDate() - 14);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const endFuture = new Date(today);
    endFuture.setDate(today.getDate() + 15);

    const startPastStr = startPast.toISOString().slice(0, 10);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    const todayStr = today.toISOString().slice(0, 10);
    const endFutureStr = endFuture.toISOString().slice(0, 10);

    const cacheKey = `${lat}-${lng}-${startPastStr}-${endFutureStr}`;
    if (tempCache.current.has(cacheKey)) {
      return tempCache.current.get(cacheKey)!;
    }

    try {
      const pastUrl = `https://archive-api.open-meteo.com/v1/era5?latitude=${lat}&longitude=${lng}&start_date=${startPastStr}&end_date=${yesterdayStr}&hourly=temperature_2m&models=best_match&timezone=auto`;
      const futureUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&start_date=${todayStr}&end_date=${endFutureStr}&hourly=temperature_2m&timezone=auto`;

      const [pastRes, futureRes] = await Promise.all([fetch(pastUrl), fetch(futureUrl)]);
      const pastData = await pastRes.json();
      const futureData = await futureRes.json();

      const allTime = [...(pastData.hourly?.time ?? []), ...(futureData.hourly?.time ?? [])];
      const allValues = [...(pastData.hourly?.temperature_2m ?? []), ...(futureData.hourly?.temperature_2m ?? [])];

      if (allTime.length === 0 || allValues.length === 0) return null;

      const entry: TempCacheEntry = { time: allTime, values: allValues };
      tempCache.current.set(cacheKey, entry);
      return entry;
    } catch (err) {
      console.error('Failed to fetch 30-day temp series:', err);
      return null;
    }
  };

  const evaluateRule = (value: number): string => {
    for (const rule of rules) {
      if (value >= rule.min && value < rule.max) return rule.color;
    }
    return '#888';
  };

  const computeAverageTemperature = (
    timestamps: string[],
    temps: number[],
    dateStart: string,
    dateEnd: string,
    timeStart: string,
    timeEnd: string
  ): number | null => {
    const pad = (s: string | number) => String(s).padStart(2, '0');
    const start = new Date(`${dateStart}T${pad(timeStart)}:00`).getTime();
    const end = new Date(`${dateEnd}T${pad(timeEnd)}:00`).getTime();

    const valuesInRange = timestamps
      .map((t, i) => ({ time: new Date(t).getTime(), value: temps[i] }))
      .filter(({ time }) => time >= start && time <= end)
      .map(({ value }) => value);

    if (valuesInRange.length === 0) return null;

    const avg = valuesInRange.reduce((a, b) => a + b, 0) / valuesInRange.length;
    return Number(avg.toFixed(2));
  };

  useEffect(() => {
    if (!selectedDateRange || !selectedTimeRange) return;

    const update = async () => {
      for (const polygon of polygons) {
        const { lat, lng } = polygon.centroid;

        const cached = await fetchFull30DaySeries(lat, lng);
        if (!cached) continue;

        const average = computeAverageTemperature(
          cached.time,
          cached.values,
          selectedDateRange[0],
          selectedDateRange[1],
          selectedTimeRange[0],
          selectedTimeRange[1]
        );

        if (average == null) continue;

        const color = evaluateRule(average);

        const temperatureSeries = cached.time.map((t, i) => ({
          time: t,
          value: cached.values[i],
        }));

        const seriesChanged =
          !polygon.temperatureSeries ||
          polygon.temperatureSeries.length !== temperatureSeries.length ||
          polygon.temperatureSeries.some((entry, i) =>
            entry.time !== temperatureSeries[i].time || entry.value !== temperatureSeries[i].value
          );

        const needsUpdate =
          polygon.currentValue !== average ||
          polygon.currentColor !== color ||
          seriesChanged;

        if (needsUpdate) {
          dispatch(updatePolygon({
            id: polygon.id,
            updates: {
              currentValue: average,
              currentColor: color,
              temperatureSeries,
              timeRange: {
                start: `${selectedDateRange[0]}T${selectedTimeRange[0]}:00`,
                end: `${selectedDateRange[1]}T${selectedTimeRange[1]}:00`,
              },
            },
          }));
        }
      }
    };

    update();
  }, [selectedDateRange, selectedTimeRange, polygons, rules, dispatch]);

  return null;
};

export default PolygonUpdater;
