import { useMap } from 'react-leaflet';
import React from 'react';
import './ZoomControls.css';

const ZoomButtons: React.FC = () => {
  const map = useMap();

  const handleZoomIn = () => {
    map.setZoom(map.getZoom() + 1);
  };

  const handleZoomOut = () => {
    map.setZoom(map.getZoom() - 1);
  };

  return (
    <div className="custom-zoom-controls">
      <button onClick={handleZoomIn}>＋</button>
      <button onClick={handleZoomOut}>－</button>
    </div>
  );
};

export default ZoomButtons;
