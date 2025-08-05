import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L, { Polygon as LeafletPolygon } from 'leaflet';
import 'leaflet-draw';
import { useDispatch, useSelector } from 'react-redux';
import { addPolygon, deletePolygon } from '../../store/polygonsSlice';
import type { RootState } from '../../store';
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
  const polygons = useSelector((state: RootState) => state.polygons.list);
  const { selectedDateRange, selectedTimeRange } = useSelector((state: RootState) => state.timeline);

  const drawnItemsRef = useRef<L.FeatureGroup>(new L.FeatureGroup());
  const polygonLayerMap = useRef<Map<string, L.Polygon>>(new Map());

  useEffect(() => {
    if (!map) return;

    const drawnItems = drawnItemsRef.current;
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      draw: {
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
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: drawnItems,
        edit: false,
        remove: true,
      },
    });

    map.addControl(drawControl);

    const onCreate = (event: any) => {
      const layer = event.layer as LeafletPolygon;
      const latlngs = layer.getLatLngs();

      if (Array.isArray(latlngs) && Array.isArray(latlngs[0])) {
        const points = latlngs[0] as L.LatLng[];

        if (points.length < 3 || points.length > 12) {
          alert('Polygon must have between 3 and 12 points.');
          return;
        }

        const coords = points.map((p) => ({ lat: p.lat, lng: p.lng }));
        const centroid = getCentroid(coords);
        const id = uuidv4();

        // ✅ Set ID on layer and add to drawnItems so it's deletable
        (layer as any).polygonId = id;
        drawnItemsRef.current.addLayer(layer); // ⬅️ Important!

        // ✅ Add tooltip directly so it's visible immediately
        layer.bindTooltip(
          `<div style="font-size: 12px; font-weight: bold;">ID: ${id.slice(0, 6)}</div>`,
          {
            sticky: true,
            direction: 'top',
            offset: L.point(0, -12),
            permanent: false, // make it always visible if you want
            opacity: 0.9,
          }
        );


        // 🧠 Now sync with Redux (don't add again in effect!)
        dispatch(
          addPolygon({
            id,
            coordinates: coords,
            centroid,
            dataSource: 'open-meteo',
            variable: 'temperature',
            rules: [],
            timeRange: {
              start: `${selectedDateRange[0]}T${selectedTimeRange[0]}:00`,
              end: `${selectedDateRange[1]}T${selectedTimeRange[1]}:00`,
            },
          })
        );
      }
    };



    const onDelete = (e: any) => {
      e.layers.eachLayer((layer: any) => {
        const id = layer.polygonId;
        if (id) {
          dispatch(deletePolygon(id));
          drawnItems.removeLayer(layer);
          polygonLayerMap.current.delete(id);
        }
      });
    };

    // ✅ Register
    map.on(L.Draw.Event.CREATED, onCreate);
    map.on(L.Draw.Event.DELETED, onDelete);

    return () => {
      // 🧹 Clean up listeners before re-adding
      map.off(L.Draw.Event.CREATED, onCreate);
      map.off(L.Draw.Event.DELETED, onDelete);
      map.removeControl(drawControl);
      map.removeLayer(drawnItems);
    };
  }, [map, dispatch, selectedDateRange, selectedTimeRange]);


  useEffect(() => {
    const drawnItems = drawnItemsRef.current;
    if (!drawnItems) return;

    const existingIds = new Set<string>();
    drawnItems.eachLayer((layer: any) => {
      if (layer.polygonId) {
        existingIds.add(layer.polygonId);
      }
    });

    // Add only missing ones
    polygons.forEach((polygon) => {
      if (existingIds.has(polygon.id)) return;

      const latlngs = polygon.coordinates.map(pt => [pt.lat, pt.lng]) as [number, number][];
      const layer = L.polygon(latlngs, {
        color: polygon.currentColor || '#0077ff',
        weight: 2,
        fillOpacity: 0.4,
      });

      (layer as any).polygonId = polygon.id;

      layer.bindTooltip(
        `<div style="font-size: 12px; font-weight: bold;">ID: ${polygon.id.slice(0, 6)}</div>`,
        {
          sticky: true,
          direction: 'top',
          offset: L.point(0, -12),
          permanent: false, // make it always visible if you want
          opacity: 0.9,
        }
      );


      drawnItems.addLayer(layer);
    });
  }, [polygons]);





  return null;
};

export default PolygonDrawer;
