import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const PolygonInfoPanel = () => {
  const polygons = useSelector((state: RootState) => state.polygons.list);
  const { selected } = useSelector((state: RootState) => state.timeline);

  return (
    <div className='temperature-sidebar'>
      {polygons.map((poly) => {
        const selectedTime = typeof selected === 'string' ? selected : null;

        // Find temperature at selected time (round to hour)
        const matchedEntry = selectedTime
          ? poly.temperatureSeries?.find((entry) =>
              entry.time.startsWith(selectedTime.slice(0, 13))
            )
          : null;

        return (
          <div key={poly.id} className="polygon-entry">
            <strong>ID:</strong> {poly.id.slice(0, 8)}<br />
            <strong>Temperature:</strong>{' '}
            {matchedEntry ? `${matchedEntry.value}°C` : 'N/A'}<br />
            <strong>Color:</strong>{' '}
            <span style={{ color: poly.currentColor }}>{poly.currentColor}</span><br />
            {matchedEntry && (
              <small>
                Time: {matchedEntry.time}
              </small>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PolygonInfoPanel;
