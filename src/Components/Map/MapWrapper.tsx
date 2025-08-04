import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import './mapStyles.css';
import PolygonDrawer from './PolygonDrawer';
import PolygonDisplay from './PolygonDisplay';
import PolygonUpdater from './PolygonUpdater';
import PolygonRenderer from './PolygonRenderer';
import TimelineSlider from '../TimelineSlider/TimelineSlider';
import TemperatureSidebar from '../TempratureSidebar';
import ColorRuleEditor from '../colorRuleEditor';
import ZoomButtons from './ZoomButtons';

const DEFAULT_CENTER: [number, number] = [28.6139, 77.2090];
const DEFAULT_ZOOM = 13;

const MapWrapper: React.FC = () => {
  return (
    <div className="map-wrapper">
      <div className="timeline-slider">
        <TimelineSlider />
      </div>

      <div className="map-main">
        <div className="map-area">
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            scrollWheelZoom={false}
            dragging={true}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />
            <PolygonDrawer />
            <PolygonRenderer />
            <PolygonUpdater />
            <ZoomButtons/>
          </MapContainer>
        </div>

        <TemperatureSidebar />
      </div>
      <ColorRuleEditor />
    </div>
  );
};

export default MapWrapper;
