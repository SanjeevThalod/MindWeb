import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const PolygonInfoPanel = () => {
  const polygons = useSelector((state: RootState) => state.polygons.list);
  const { selectedDateRange, selectedTimeRange } = useSelector((state: RootState) => state.timeline);

  const computeAverage = (
    series: { time: string; value: number }[],
    startDate: string,
    endDate: string,
    startTime: string,
    endTime: string
  ): { avg: number | null; rangeCount: number } => {
    // Ensure time is zero-padded to HH:MM format
    const padTime = (t: string) => {
      const [h, m = '00'] = t.split(':');
      return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
    };

    const start = new Date(`${startDate}T${padTime(startTime)}:00`).getTime();
    const end = new Date(`${endDate}T${padTime(endTime)}:00`).getTime();

    const inRange = series.filter(({ time }) => {
      const timestamp = new Date(time).getTime();
      return timestamp >= start && timestamp <= end;
    });

    if (inRange.length === 0) return { avg: null, rangeCount: 0 };

    const avg = inRange.reduce((sum, e) => sum + e.value, 0) / inRange.length;
    return { avg: Number(avg.toFixed(2)), rangeCount: inRange.length };
  };

  return (
    <div className="temperature-sidebar">
      {polygons.map((poly) => {
        const { avg, rangeCount } = computeAverage(
          poly.temperatureSeries || [],
          selectedDateRange[0],
          selectedDateRange[1],
          selectedTimeRange[0],
          selectedTimeRange[1]
        );

        return (
          <div key={poly.id} className="polygon-entry">
            <strong>ID:</strong> {poly.id.slice(0, 8)}<br />
            <strong>Avg Temp:</strong>{' '}
            {avg !== null ? `${avg}°C (${rangeCount} records)` : 'N/A'}<br />
            <strong>Color:</strong>{' '}
            <span style={{ color: poly.currentColor }}>{poly.currentColor}</span><br />
            {poly.timeRange && (
              <small>
                <strong>From:</strong> {poly.timeRange.start}<br />
                <strong>To:</strong> {poly.timeRange.end}
              </small>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PolygonInfoPanel;
