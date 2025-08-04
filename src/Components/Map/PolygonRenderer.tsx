import { useSelector } from 'react-redux';
import { Polygon, useMap, Tooltip } from 'react-leaflet';
import type { RootState } from '../../store/index';
import { useEffect } from 'react';

const PolygonRenderer = () => {
  const map = useMap();
  const polygons = useSelector((state: RootState) => state.polygons.list);

  useEffect(() => {
    map.invalidateSize();
  }, [map]);

  return (
    <>
      {polygons.map(polygon => (

        <Polygon
          key={polygon.id}
          positions={polygon.coordinates}
          pathOptions={{
            color: '#333',
            fillColor: polygon.currentColor || '#ccc',
            fillOpacity: 0.6,
            weight: 2,
          }}
        >
          <Tooltip sticky direction='top' >
            <div style={{backgroundColor:`${polygon.currentColor}`}}>
              <strong>Polygon ID:</strong> {polygon.id}<br />
              <strong >Color:</strong> {polygon.currentColor}
            </div>
          </Tooltip>
          </Polygon >
      ))}
        </>
      );
};

      export default PolygonRenderer;
