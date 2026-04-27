import React, { useMemo, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '12px'
};

const defaultCenter = {
  lat: 28.6139,
  lng: 77.2090
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    { "elementType": "geometry", "stylers": [{ "color": "#1d2c4d" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#8ec3b9" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1a3646" }] },
    { "featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [{ "color": "#4b6878" }] },
    { "featureType": "landscape.man_made", "elementType": "geometry.stroke", "stylers": [{ "color": "#334e87" }] },
    { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#283d6a" }] },
    { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#6f9ba5" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#304a7d" }] },
    { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#98a5be" }] },
    { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#2c6675" }] },
    { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#255763" }] },
    { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#2f3948" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0e1626" }] }
  ]
};

export default function LiveTaskMap({ tasks }) {
  const [selectedTask, setSelectedTask] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const center = useMemo(() => {
    if (tasks && tasks.length > 0 && tasks[0].location) {
      return { lat: tasks[0].location.lat, lng: tasks[0].location.lng };
    }
    return defaultCenter;
  }, [tasks]);

  if (!isLoaded) return <div className="loading-screen">Loading Map...</div>;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={10}
        options={options}
      >
        {tasks.map(task => {
          if (!task.location?.lat || !task.location?.lng) return null;
          const isCritical = (task.managementOverride?.severity || task.aiAnalysis?.severity) === 'CRITICAL';
          
          return (
            <Marker
              key={task.id}
              position={{ lat: task.location.lat, lng: task.location.lng }}
              onClick={() => setSelectedTask(task)}
              icon={{
                path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
                fillColor: isCritical ? "#ff5252" : "#fb8c00",
                fillOpacity: 0.9,
                strokeWeight: 2,
                strokeColor: "#ffffff",
                scale: isCritical ? 1.8 : 1.4,
                anchor: new window.google.maps.Point(12, 22)
              }}
            >
              {selectedTask?.id === task.id && (
                <InfoWindow onCloseClick={() => setSelectedTask(null)}>
                  <div style={{ padding: '8px', color: '#333' }}>
                    <h4 style={{ margin: '0 0 4px', fontSize: '14px' }}>{task.title}</h4>
                    <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>{task.location?.address?.split(',')[0]}</p>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          );
        })}
      </GoogleMap>

      {/* Map Legend Overlay */}
      <div className="map-legend-overlay glass" style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        padding: '12px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5252', boxShadow: '0 0 10px #ff5252' }} />
          <span className="label-sm">Critical Emergency</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fb8c00' }} />
          <span className="label-sm">High Priority</span>
        </div>
      </div>
    </div>
  );
}
