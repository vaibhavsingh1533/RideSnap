import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

// Import Leaflet assets
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons issue in React builds
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons for premium feel
const riderIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const driverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const destinationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
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

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      // Default coordinates: center around a neutral location (e.g., Delhi, IN or NYC, US)
      // Let's check coordinates. If pickup exists, use it, else default.
      const startLat = pickupCoords ? pickupCoords.lat : 28.6139;
      const startLng = pickupCoords ? pickupCoords.lng : 77.2090;

      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([startLat, startLng], 12);

      // Add Premium Dark Matter Tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
      }).addTo(mapRef.current);

      // Add Zoom Control at bottom right
      L.control.zoom({
        position: 'bottomright'
      }).addTo(mapRef.current);
    }

    return () => {
      // Clean up map when component unmounts
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Markers and Routes
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // 1. Handle Pickup Marker
    if (pickupCoords) {
      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.setLatLng([pickupCoords.lat, pickupCoords.lng]);
      } else {
        pickupMarkerRef.current = L.marker([pickupCoords.lat, pickupCoords.lng], { icon: riderIcon })
          .addTo(map)
          .bindPopup('Pickup Location');
      }
    } else {
      if (pickupMarkerRef.current) {
        map.removeLayer(pickupMarkerRef.current);
        pickupMarkerRef.current = null;
      }
    }

    // 2. Handle Dropoff Marker
    if (dropoffCoords) {
      if (dropoffMarkerRef.current) {
        dropoffMarkerRef.current.setLatLng([dropoffCoords.lat, dropoffCoords.lng]);
      } else {
        dropoffMarkerRef.current = L.marker([dropoffCoords.lat, dropoffCoords.lng], { icon: destinationIcon })
          .addTo(map)
          .bindPopup('Drop-off (Outstation Destination)');
      }
    } else {
      if (dropoffMarkerRef.current) {
        map.removeLayer(dropoffMarkerRef.current);
        dropoffMarkerRef.current = null;
      }
    }

    // 3. Handle Route Polyline
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
          opacity: 0.8,
          dashArray: '8, 8',
          lineCap: 'round'
        }).addTo(map);
      }

      // Auto-fit bounds
      const bounds = L.latLngBounds(latlngs);
      if (driverCoords) {
        bounds.extend([driverCoords.lat, driverCoords.lng]);
      }
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      if (routePolylineRef.current) {
        map.removeLayer(routePolylineRef.current);
        routePolylineRef.current = null;
      }
      
      // Reset view to pickup or default
      if (pickupCoords) {
        map.setView([pickupCoords.lat, pickupCoords.lng], 12);
      }
    }
  }, [pickupCoords, dropoffCoords]);

  // 4. Handle Driver Marker
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (driverCoords) {
      if (driverMarkerRef.current) {
        driverMarkerRef.current.setLatLng([driverCoords.lat, driverCoords.lng]);
      } else {
        driverMarkerRef.current = L.marker([driverCoords.lat, driverCoords.lng], { icon: driverIcon })
          .addTo(map)
          .bindPopup('Driver Location');
      }

      // If active ride, keep map centered or bounded
      if (rideStatus && ['accepted', 'arrived', 'in_progress'].includes(rideStatus)) {
        // bounds adjust
        const points = [];
        if (pickupCoords) points.push([pickupCoords.lat, pickupCoords.lng]);
        if (dropoffCoords) points.push([dropoffCoords.lat, dropoffCoords.lng]);
        points.push([driverCoords.lat, driverCoords.lng]);
        
        map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
      }
    } else {
      if (driverMarkerRef.current) {
        map.removeLayer(driverMarkerRef.current);
        driverMarkerRef.current = null;
      }
    }
  }, [driverCoords, rideStatus]);

  // 5. Driver Simulation Path Engine
  // If rideStatus is 'in_progress' and we are simulating on the driver panel,
  // we update position periodically to complete the journey.
  useEffect(() => {
    if (!rideStatus || !pickupCoords || !dropoffCoords || !onDriverCoordsChange) return;

    let interval;
    if (rideStatus === 'accepted') {
      // Driver moving to pickup
      // Start driver slightly away from pickup and animate arrival
      let step = 0;
      const steps = 15;
      const startLat = pickupCoords.lat + 0.015;
      const startLng = pickupCoords.lng - 0.015;

      interval = setInterval(() => {
        step++;
        const currentLat = startLat + ((pickupCoords.lat - startLat) * (step / steps));
        const currentLng = startLng + ((pickupCoords.lng - startLng) * (step / steps));
        
        onDriverCoordsChange({ lat: currentLat, lng: currentLng });

        if (step >= steps) {
          clearInterval(interval);
        }
      }, 1000);

    } else if (rideStatus === 'in_progress') {
      // Driver moving to dropoff
      let step = 0;
      const steps = 30; // Longer path simulation
      const startLat = pickupCoords.lat;
      const startLng = pickupCoords.lng;

      interval = setInterval(() => {
        step++;
        const currentLat = startLat + ((dropoffCoords.lat - startLat) * (step / steps));
        const currentLng = startLng + ((dropoffCoords.lng - startLng) * (step / steps));

        onDriverCoordsChange({ lat: currentLat, lng: currentLng });

        if (step >= steps) {
          clearInterval(interval);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [rideStatus, pickupCoords, dropoffCoords]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '16px', overflow: 'hidden' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Premium overlay for maps */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        zIndex: 1000,
        pointerEvents: 'none'
      }}>
        <div className="glass-panel" style={{
          padding: '8px 16px',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: rideStatus ? 'var(--primary)' : 'var(--accent-success)',
            boxShadow: '0 0 8px currentColor'
          }} />
          {rideStatus ? `Ride State: ${rideStatus.toUpperCase()}` : 'Simulation Active'}
        </div>
      </div>
    </div>
  );
};

export default MapContainer;
