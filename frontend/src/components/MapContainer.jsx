
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons in React builds
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const riderIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const driverIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const destinationIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapContainer = ({
  pickupCoords,
  dropoffCoords,
  driverCoords,
  rideStatus,
  onDriverCoordsChange
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const pickupMarkerRef = useRef(null);
  const dropoffMarkerRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);

  // Track the route for which the map has already been fitted.
  const fittedRouteKeyRef = useRef(null);
  const userMovedMapRef = useRef(false);

  // Initialize map only once.
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const startLat = pickupCoords?.lat ?? 28.6139;
    const startLng = pickupCoords?.lng ?? 77.209;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true
    }).setView([startLat, startLng], 12);

    mapRef.current = map;

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    // Remember when the user manually changes the map view.
    const handleUserMove = () => {
      userMovedMapRef.current = true;
    };

    map.on('dragstart', handleUserMove);
    map.on('zoomstart', handleUserMove);

    // Save handlers so cleanup remains reliable.
    map._rideSnapUserMoveHandler = handleUserMove;

    // Leaflet sometimes needs a size refresh after the container renders.
    const resizeTimer = setTimeout(() => {
      if (mapRef.current) {
        map.invalidateSize();
      }
    }, 100);

    return () => {
      clearTimeout(resizeTimer);

      map.off('dragstart', handleUserMove);
      map.off('zoomstart', handleUserMove);

      map.remove();
      mapRef.current = null;

      pickupMarkerRef.current = null;
      dropoffMarkerRef.current = null;
      driverMarkerRef.current = null;
      routePolylineRef.current = null;
      fittedRouteKeyRef.current = null;
      userMovedMapRef.current = false;
    };
  }, []);

  // Update pickup, destination and route without resetting manual zoom.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Pickup marker
    if (pickupCoords) {
      const position = [pickupCoords.lat, pickupCoords.lng];

      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.setLatLng(position);
      } else {
        pickupMarkerRef.current = L.marker(position, {
          icon: riderIcon
        })
          .addTo(map)
          .bindPopup('Pickup Location');
      }
    } else if (pickupMarkerRef.current) {
      map.removeLayer(pickupMarkerRef.current);
      pickupMarkerRef.current = null;
    }

    // Drop-off marker
    if (dropoffCoords) {
      const position = [dropoffCoords.lat, dropoffCoords.lng];

      if (dropoffMarkerRef.current) {
        dropoffMarkerRef.current.setLatLng(position);
      } else {
        dropoffMarkerRef.current = L.marker(position, {
          icon: destinationIcon
        })
          .addTo(map)
          .bindPopup('Drop-off Location');
      }
    } else if (dropoffMarkerRef.current) {
      map.removeLayer(dropoffMarkerRef.current);
      dropoffMarkerRef.current = null;
    }

    // Draw a straight line between pickup and drop-off.
    if (pickupCoords && dropoffCoords) {
      const latlngs = [
        [pickupCoords.lat, pickupCoords.lng],
        [dropoffCoords.lat, dropoffCoords.lng]
      ];

      if (routePolylineRef.current) {
        routePolylineRef.current.setLatLngs(latlngs);
      } else {
        routePolylineRef.current = L.polyline(latlngs, {
          color: '#6366f1',
          weight: 4,
          opacity: 0.85,
          dashArray: '8, 8',
          lineCap: 'round'
        }).addTo(map);
      }

      // Fit the map only once for each new pickup/drop-off pair.
      const routeKey = [
        pickupCoords.lat,
        pickupCoords.lng,
        dropoffCoords.lat,
        dropoffCoords.lng
      ].join(',');

      if (fittedRouteKeyRef.current !== routeKey) {
        // A genuinely new route should be fitted automatically.
        userMovedMapRef.current = false;

        const bounds = L.latLngBounds(latlngs);

        if (driverCoords) {
          bounds.extend([driverCoords.lat, driverCoords.lng]);
        }

        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 14
        });

        fittedRouteKeyRef.current = routeKey;
      }
    } else {
      if (routePolylineRef.current) {
        map.removeLayer(routePolylineRef.current);
        routePolylineRef.current = null;
      }

      fittedRouteKeyRef.current = null;

      // Don't reset the view on every render.
      if (pickupCoords && !userMovedMapRef.current) {
        map.setView([pickupCoords.lat, pickupCoords.lng], 12);
      }
    }
  }, [pickupCoords, dropoffCoords]);

  // Update driver marker without changing the user's map zoom.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (driverCoords) {
      const position = [driverCoords.lat, driverCoords.lng];

      if (driverMarkerRef.current) {
        driverMarkerRef.current.setLatLng(position);
      } else {
        driverMarkerRef.current = L.marker(position, {
          icon: driverIcon
        })
          .addTo(map)
          .bindPopup('Driver Location');
      }

      // Intentionally do not call fitBounds here.
      // Driver updates must not reset the user's zoom.
    } else if (driverMarkerRef.current) {
      map.removeLayer(driverMarkerRef.current);
      driverMarkerRef.current = null;
    }
  }, [driverCoords]);

  // Simulate driver movement for demo rides.
  useEffect(() => {
    if (
      !rideStatus ||
      !pickupCoords ||
      !dropoffCoords ||
      !onDriverCoordsChange
    ) {
      return;
    }

    let interval;
    let step = 0;

    if (rideStatus === 'accepted') {
      const steps = 15;
      const startLat = pickupCoords.lat + 0.015;
      const startLng = pickupCoords.lng - 0.015;

      interval = setInterval(() => {
        step++;

        const progress = Math.min(step / steps, 1);

        onDriverCoordsChange({
          lat: startLat + (pickupCoords.lat - startLat) * progress,
          lng: startLng + (pickupCoords.lng - startLng) * progress
        });

        if (step >= steps) {
          clearInterval(interval);
        }
      }, 1000);
    } else if (rideStatus === 'in_progress') {
      const steps = 30;

      interval = setInterval(() => {
        step++;

        const progress = Math.min(step / steps, 1);

        onDriverCoordsChange({
          lat:
            pickupCoords.lat +
            (dropoffCoords.lat - pickupCoords.lat) * progress,
          lng:
            pickupCoords.lng +
            (dropoffCoords.lng - pickupCoords.lng) * progress
        });

        if (step >= steps) {
          clearInterval(interval);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    rideStatus,
    pickupCoords,
    dropoffCoords,
    onDriverCoordsChange
  ]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '300px',
        borderRadius: '16px',
        overflow: 'hidden'
      }}
    >
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '100%' }}
      />

      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 1000,
          pointerEvents: 'none'
        }}
      >
        <div
          className="glass-panel"
          style={{
            padding: '8px 16px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: rideStatus
                ? 'var(--primary)'
                : 'var(--accent-success)',
              boxShadow: '0 0 8px currentColor'
            }}
          />
          {rideStatus
            ? `Ride State: ${rideStatus.toUpperCase()}`
            : 'Simulation Active'}
        </div>
      </div>
    </div>
  );
};

export default MapContainer;
