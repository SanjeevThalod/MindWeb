import { useSelector } from 'react-redux';
import { Polygon, Tooltip } from 'react-leaflet';
import type { RootState } from '../../store';
import type { LatLng } from '../../types/polygon';

const PolygonDisplay: React.FC = () => {
  const polygons = useSelector((state: RootState) => state.polygons.list);

  return (
    <>
      {polygons.map((polygon) => (
        <Polygon
          key={polygon.id}
          positions={polygon.coordinates.map((p: LatLng) => [p.lat, p.lng])}
          pathOptions={{
            color: '#000',
            weight: 1,
            fillColor: polygon.currentColor || 'gray',
            fillOpacity: 0.5,
          }}
        >
          <Tooltip sticky>
            <div>
              <strong>ID:</strong> {polygon.id}<br />
              <strong>Value:</strong> {polygon.currentValue ?? 'N/A'}
            </div>
          </Tooltip>
        </Polygon>
      ))}
    </>
  );
};

export default PolygonDisplay;
