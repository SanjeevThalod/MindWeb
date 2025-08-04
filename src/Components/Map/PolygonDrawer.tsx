import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L, { Polygon as LeafletPolygon } from 'leaflet';
import 'leaflet-draw';
import { useDispatch, useSelector } from 'react-redux';
import { addPolygon, deletePolygon } from '../../store/polygonsSlice';
import type { RootState } from '../../store/index';
import { v4 as uuidv4 } from 'uuid';

type LatLng = { lat: number; lng: number };

const getCentroid = (coords: LatLng[]): LatLng => {
  const total = coords.reduce(
    (acc, point) => {
      acc.lat += point.lat;
      acc.lng += point.lng;
      return acc;
    },
    { lat: 0, lng: 0 }
  );

  return {
    lat: total.lat / coords.length,
    lng: total.lng / coords.length,
  };
};

const PolygonDrawer: React.FC = () => {
  const map = useMap();
  const dispatch = useDispatch();

  const selectedDate = useSelector((state: RootState) => state.timeline.selectedDate);
  const polygons = useSelector((state: RootState) => state.polygons.list);

  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);

  useEffect(() => {
    if (!map) return;

    const drawnItems = new L.FeatureGroup();
    drawnItemsRef.current = drawnItems;
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      draw: {
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false,
        polygon: {
          allowIntersection: true,
          showArea: true,
          shapeOptions: {
            color: '#0077ff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.4,
          },
          guidelineDistance: 10,
          maxPoints: 12,
        },
      },
      edit: {
        featureGroup: drawnItems,
        edit: false,
        remove: true,
      },
    });

    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, (event: any) => {
      const layer = event.layer as LeafletPolygon;
      const latlngs = layer.getLatLngs();

      if (Array.isArray(latlngs) && Array.isArray(latlngs[0])) {
        const points = latlngs[0] as L.LatLng[];

        if (points.length < 3 || points.length > 12) {
          alert('Polygon must have between 3 and 12 points.');
          return;
        }

        drawnItems.addLayer(layer);

        const coords = points.map((point) => ({ lat: point.lat, lng: point.lng }));
        const centroid = getCentroid(coords);
        const polygonId = uuidv4();
        (layer as any).polygonId = polygonId;

        const payload: any = {
          id: polygonId,
          coordinates: coords,
          centroid,
          dataSource: 'open-meteo',
          variable: 'temperature',
          rules: [],
        };

       

        dispatch(addPolygon(payload));
      } else {
        alert('Invalid polygon shape.');
      }
    });

    map.on(L.Draw.Event.DELETED, (e: any) => {
      const layers = e.layers;

      layers.eachLayer((layer: any) => {
        const polygonId = layer.polygonId;

        if (polygonId) {
          dispatch(deletePolygon(polygonId));
        }

        drawnItems.removeLayer(layer);
      });
    });

    return () => {
      map.removeControl(drawControl);
    };
  }, [map, dispatch, selectedDate]);

  // 🔁 Sync polygons from Redux to map
  useEffect(() => {
    const drawnItems = drawnItemsRef.current;
    if (!drawnItems) return;

    drawnItems.clearLayers(); // remove previous polygons

    polygons.forEach((polygon) => {
      const latlngs = polygon.coordinates.map((pt) => [pt.lat, pt.lng]) as [number, number][];
      const layer = L.polygon(latlngs, {
        color: '#0077ff',
        weight: 2,
        fillOpacity: 0.4,
      });
      (layer as any).polygonId = polygon.id;
      drawnItems.addLayer(layer);
    });
  }, [polygons]);

  return null;
};

export default PolygonDrawer;
