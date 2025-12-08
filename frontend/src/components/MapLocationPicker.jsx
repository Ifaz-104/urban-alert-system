// frontend/src/components/MapLocationPicker.jsx

import { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMapEvents,
} from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapLocationPicker.css';

// Custom marker icon for selected location (blue)
const selectedLocationIcon = new Icon({
  iconUrl: `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 40">
      <circle cx="15" cy="15" r="12" fill="#234A90E2" />
      <path d="M15 25 L10 32 L20 32 Z" fill="#234A90E2" />
    </svg>
  `)}`,
  iconSize: [30, 40],
  iconAnchor: [15, 40],
});

// Custom marker icon for user location (green)
const userLocationIcon = new Icon({
  iconUrl: `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 40">
      <circle cx="15" cy="15" r="10" fill="#2300AA00" stroke="#23ffffff" stroke-width="2" />
      <circle cx="15" cy="15" r="5" fill="#23ffffff" />
    </svg>
  `)}`,
  iconSize: [30, 40],
  iconAnchor: [15, 40],
});

// Component that handles map clicks
function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onMapClick({
        latitude: lat,
        longitude: lng,
      });
    },
  });
  return null;
}

// Main MapLocationPicker Component
export default function MapLocationPicker({ onLocationSelect, defaultLocation }) {
  const [selectedLocation, setSelectedLocation] = useState(
    defaultLocation ? { ...defaultLocation } : null
  );
  const [userLocation, setUserLocation] = useState([23.6850, 90.3563]); // Default Bangladesh
  const [mapCenter, setMapCenter] = useState(
    defaultLocation
      ? [defaultLocation.latitude, defaultLocation.longitude]
      : [23.6850, 90.3563]
  );
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  // Get user's current location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);

          // Update user location state but DO NOT auto-center the map
          // This ensures the map defaults to Bangladesh as requested
          // if (!selectedLocation) {
          //   setMapCenter([latitude, longitude]);
          // }
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Still works with default location
        }
      );
    }
  }, []);

  // Handle map click - capture coordinates and reverse geocode
  const handleMapClick = async (location) => {
    setSelectedLocation(location);
    setMapCenter([location.latitude, location.longitude]);

    // Try to get address from coordinates using Nominatim
    try {
      setLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}`
      );
      const data = await response.json();

      const addr = data.display_name || 'Unknown Location';
      setAddress(addr);

      // Send location back to parent component
      onLocationSelect({
        latitude: location.latitude,
        longitude: location.longitude,
        address: addr,
      });
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      // Send location even if address lookup fails
      onLocationSelect(location);
    } finally {
      setLoading(false);
    }
  };

  // Clear selected location
  const handleClearLocation = () => {
    setSelectedLocation(null);
    setAddress('');
    onLocationSelect(null);
  };

  // Use user's current location as incident location
  const handleUseCurrentLocation = () => {
    if (userLocation) {
      handleMapClick({
        latitude: userLocation[0],
        longitude: userLocation[1],
      });
    }
  };



  return (
    <div className="map-location-picker">
      {/* LEFT PANEL - Location Info */}
      <div className="location-info">
        {selectedLocation ? (
          <>
            {/* Show selected location details */}
            <div className="location-selected">
              <div className="location-badge">Location Selected</div>

              <div className="coordinates">
                <div>
                  Latitude: <strong>{selectedLocation.latitude.toFixed(6)}</strong>
                </div>
                <div>
                  Longitude: <strong>{selectedLocation.longitude.toFixed(6)}</strong>
                </div>
              </div>

              {address && (
                <div className="address">
                  <div className="address">{address}</div>
                </div>
              )}

              <div className="location-actions">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="btn btn--sm btn--secondary"
                >
                  Use Current Location
                </button>
                <button
                  type="button"
                  onClick={handleClearLocation}
                  className="btn btn--sm btn--outline"
                >
                  Clear Location
                </button>
              </div>
            </div>
          </>
        ) : (
          <>


            {/* Show placeholder when no location selected */}
            <div className="location-placeholder">
              <div className="instruction">
                Click on the map to select incident location
              </div>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="btn btn--sm btn--primary"
              >
                Use My Current Location
              </button>
            </div>
          </>
        )}
      </div>

      {/* RIGHT PANEL - Map */}
      <div className="map-wrapper">
        {loading && <div className="map-loader">Fetching address...</div>}

        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '600px', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />

          {/* Click handler */}
          <ClickHandler onMapClick={handleMapClick} />

          {/* User's current location marker (green) */}
          <Marker position={userLocation} icon={userLocationIcon}>
            <Popup>Your Current Location</Popup>
          </Marker>

          {/* Selected location marker (blue) */}
          {selectedLocation && (
            <>
              {/* Radius circle around incident */}
              <Circle
                center={[selectedLocation.latitude, selectedLocation.longitude]}
                radius={50} // 50 meter radius
                color="blue"
                fillColor="blue"
                fillOpacity={0.1}
              />

              {/* Incident location marker */}
              <Marker
                position={[selectedLocation.latitude, selectedLocation.longitude]}
                icon={selectedLocationIcon}
              >
                <Popup>
                  <div className="popup-content">
                    <h4>Incident Location</h4>
                    <p>
                      <strong>Latitude:</strong> {selectedLocation.latitude.toFixed(6)}
                    </p>
                    <p>
                      <strong>Longitude:</strong> {selectedLocation.longitude.toFixed(6)}
                    </p>
                    {address && (
                      <p>
                        <strong>Address:</strong> {address}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
