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

  // Selectors
  const polygons = useSelector((state: RootState) => state.polygons.list);
  const rules = useSelector((state: RootState) => state.colorRules);
  const selectedDate = useSelector((state: RootState) => state.timeline.selectedDate);
  const selectedTime = useSelector((state: RootState) => state.timeline.selectedTime);

  // Cache
  const tempCache = useRef<Map<string, TempCacheEntry>>(new Map());

  const fetchFull30DaySeries = async (lat: number, lng: number): Promise<TempCacheEntry | null> => {
    const today = new Date();
    const startPast = new Date(today);
    startPast.setDate(today.getDate() - 14);

    const todayStr = today.toISOString().slice(0, 10);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    const endFuture = new Date(today);
    endFuture.setDate(today.getDate() + 15);

    const startPastStr = startPast.toISOString().slice(0, 10);
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

      console.log(pastData);
      console.log(futureData)

      const allTime = [...(pastData.hourly?.time ?? []), ...(futureData.hourly?.time ?? [])];
      const allValues = [...(pastData.hourly?.temperature_2m ?? []), ...(futureData.hourly?.temperature_2m ?? [])];

      if (allTime.length === 0 || allValues.length === 0) return null;

      const entry: TempCacheEntry = {
        time: allTime,
        values: allValues,
      };

      tempCache.current.set(cacheKey, entry);
      return entry;
    } catch (err) {
      console.error('Failed to fetch 30-day temp series:', err);
      return null;
    }
  };

  const evaluateRule = (value: number): string => {
    for (const rule of rules) {
      if (value >= rule.min && value < rule.max) {
        return rule.color;
      }
    }
    return '#888'; // fallback
  };

  useEffect(() => {
    if (!selectedDate || selectedTime === null) return;

    const isoTime = `${selectedDate}T${selectedTime}`;
    const hourStr = isoTime.slice(0, 13); // still fine for matching "YYYY-MM-DDTHH"


    const update = async () => {
      for (const polygon of polygons) {
        const { lat, lng } = polygon.centroid;

        const cached = await fetchFull30DaySeries(lat, lng);
        if (!cached) continue;

        const index = cached.time.findIndex((t) => t.startsWith(hourStr));
        if (index === -1) {
          console.warn(`Hour not found: ${hourStr} in cached data`);
          continue;
        }

        const value = cached.values[index];
        const color = evaluateRule(value);

        const temperatureSeries = cached.time.map((t, i) => ({
          time: t,
          value: cached.values[i],
        }));

        const needsUpdate =
          polygon.currentValue !== value ||
          polygon.currentColor !== color ||
          polygon.time !== isoTime ||
          !polygon.temperatureSeries ||
          polygon.temperatureSeries.length !== cached.time.length;

        if (needsUpdate) {
          dispatch(updatePolygon({
            id: polygon.id,
            updates: {
              currentValue: value,
              currentColor: color,
              time: isoTime,
              temperatureSeries,
            },
          }));
        }
      }
    };

    update();

  }, [selectedDate, selectedTime, polygons, rules, dispatch]);

  return null;
};

export default PolygonUpdater;
