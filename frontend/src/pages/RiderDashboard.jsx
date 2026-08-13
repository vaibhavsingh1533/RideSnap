import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import MapContainer from '../components/MapContainer';
import ChatBox from '../components/ChatBox';
import RideProgressCard from '../components/RideProgressCard';
import ReceiptModal from '../components/ReceiptModal';
import { LogOut, MapPin, Compass, Search, History, User, CreditCard, Sun, Moon, FileText } from 'lucide-react';
import { API_URL } from '../config';

const PRESET_ROUTES = [
  {
    name: 'Delhi ⇄ Jaipur',
    pickup: 'Delhi, National Capital Territory',
    pickupCoords: { lat: 28.6139, lng: 77.2090 },
    dropoff: 'Jaipur, Rajasthan',
    dropoffCoords: { lat: 26.9124, lng: 75.7873 },
    distance: 270, // km
    duration: 5.0 // hrs
  },
  {
    name: 'Mumbai ⇄ Pune',
    pickup: 'Mumbai, Maharashtra',
    pickupCoords: { lat: 19.0760, lng: 72.8777 },
    dropoff: 'Pune, Maharashtra',
    dropoffCoords: { lat: 18.5204, lng: 73.8567 },
    distance: 150, // km
    duration: 3.0 // hrs
  },
  {
    name: 'Bangalore ⇄ Mysore',
    pickup: 'Bangalore, Karnataka',
    pickupCoords: { lat: 12.9716, lng: 77.5946 },
    dropoff: 'Mysore, Karnataka',
    dropoffCoords: { lat: 12.2958, lng: 76.6394 },
    distance: 145, // km
    duration: 3.0 // hrs
  },
  {
    name: 'Chennai ⇄ Pondicherry',
    pickup: 'Chennai, Tamil Nadu',
    pickupCoords: { lat: 13.0827, lng: 80.2707 },
    dropoff: 'Pondicherry, Tamil Nadu',
    dropoffCoords: { lat: 11.9416, lng: 79.8083 },
    distance: 150, // km
    duration: 3.5 // hrs
  }
];

const RiderDashboard = () => {
  const { user, logout } = useAuth();
  const { socket, connected } = useSocket();

  // Booking Flow States
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [rideType, setRideType] = useState('single'); // 'single' (one-way) or 'both' (round-trip)
  const [estimation, setEstimation] = useState(null);
  const [calculating, setCalculating] = useState(false);

  // Active Ride States
  const [activeRide, setActiveRide] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Support Chat states
  const [chatOpen, setChatOpen] = useState(false);
  const [newChatAlert, setNewChatAlert] = useState(false);

  // History State
  const [history, setHistory] = useState([]);
  const [viewingReceiptRide, setViewingReceiptRide] = useState(null);
  const [isLightTheme, setIsLightTheme] = useState(localStorage.getItem('theme') === 'light');

  // Reactively apply light theme classes to document body
  useEffect(() => {
    if (isLightTheme) {
      document.body.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLightTheme]);

  // Load ride history on load
  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/rides/history`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('ridesnap_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data.rides || []);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [activeRide]);

  // Handle Preset Route Change
  const handleRouteSelect = (routeIndex) => {
    const route = PRESET_ROUTES[routeIndex];
    setSelectedRoute(route);
    setEstimation(null);
  };

  // Calculate outstation fare estimation
  const calculateFare = async () => {
    if (!selectedRoute) return;
    setCalculating(true);

    try {
      const response = await fetch(`${API_URL}/api/rides/estimate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ridesnap_token')}`
        },
        body: JSON.stringify({
          distance: selectedRoute.distance,
          duration: selectedRoute.duration,
          rideType
        })
      });

      if (response.ok) {
        const data = await response.json();
        setEstimation(data);
      }
    } catch (err) {
      console.error('Error calculating fare:', err);
    } finally {
      setCalculating(false);
    }
  };

  // Calculate fare automatically when route or rideType changes
  useEffect(() => {
    if (selectedRoute) {
      calculateFare();
    }
  }, [selectedRoute, rideType]);

  // Socket triggers for Rider booking loop
  useEffect(() => {
    if (!socket) return;

    // Ride booking created successfully
    socket.on('ride_created', (ride) => {
      setActiveRide(ride);
      setIsSearching(true);
    });

    // Driver accepted the request
    socket.on('ride_accepted', (ride) => {
      setActiveRide(ride);
      setIsSearching(false);
      if (ride.driver?.driverDetail) {
        const detail = ride.driver.driverDetail;
        setDriverLocation({
          lat: detail.currentLat || ride.pickupLat,
          lng: detail.currentLng || ride.pickupLng
        });
      }
    });

    // Live driver coordinates shared during ride
    socket.on('driver_location_shared', ({ lat, lng }) => {
      setDriverLocation({ lat, lng });
    });

    // Status changed (e.g. arrived, in_progress, completed, cancelled)
    socket.on('ride_status_updated', ({ rideId, status }) => {
      setActiveRide((prev) => {
        if (prev && prev.id === rideId) {
          if (status === 'completed' || status === 'cancelled') {
            setIsSearching(false);
            setChatOpen(false);
            setDriverLocation(null);
            
            if (status === 'cancelled') {
              alert("This ride has been cancelled by the driver or system.");
              return null;
            }

            if (status === 'completed') {
              setViewingReceiptRide({ ...prev, status: 'completed' });
            }

            // Auto close/reset after 6s or manually
            setTimeout(() => {
              setActiveRide(null);
            }, 6000);
          }
          return { ...prev, status };
        }
        return prev;
      });
    });

    // Alert if driver sends chat message
    socket.on('message_received', (msg) => {
      if (msg.senderId !== user.id && !chatOpen) {
        setNewChatAlert(true);
      }
    });

    return () => {
      socket.off('ride_created');
      socket.off('ride_accepted');
      socket.off('driver_location_shared');
      socket.off('ride_status_updated');
      socket.off('message_received');
    };
  }, [socket, chatOpen]);

  // Reset alert on chat open
  useEffect(() => {
    if (chatOpen) setNewChatAlert(false);
  }, [chatOpen]);

  // Send request ride socket event
  const handleBookRide = () => {
    if (!selectedRoute || !estimation || !socket) return;

    socket.emit('request_ride', {
      riderId: user.id,
      pickupAddress: selectedRoute.pickup,
      dropoffAddress: selectedRoute.dropoff,
      pickupLat: selectedRoute.pickupCoords.lat,
      pickupLng: selectedRoute.pickupCoords.lng,
      dropoffLat: selectedRoute.dropoffCoords.lat,
      dropoffLng: selectedRoute.dropoffCoords.lng,
      distance: selectedRoute.distance,
      duration: selectedRoute.duration,
      rideType,
      baseFare: estimation.baseFare,
      distanceFare: estimation.distanceFare,
      allowance: estimation.allowance,
      totalFare: estimation.totalFare
    });
  };

  const handleCancelBooking = () => {
    setActiveRide(null);
    setIsSearching(false);
    setDriverLocation(null);
  };

  const handleStatusUpdate = (rideId, nextStatus) => {
    if (nextStatus === 'view_receipt') {
      setViewingReceiptRide(activeRide);
      return;
    }
    if (socket) {
      socket.emit('update_ride_status', { rideId, status: nextStatus });
      if (nextStatus === 'cancelled') {
        setActiveRide(null);
        setIsSearching(false);
        setDriverLocation(null);
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      {/* Premium Header */}
      <header className="glass-panel" style={{
        margin: '16px 20px',
        padding: '16px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '16px',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.6rem', color: 'var(--text-primary)', fontWeight: 800 }}>
            Ride<span style={{ color: 'var(--primary)' }}>Snap</span>
          </span>
          <span style={{
            background: 'rgba(99, 102, 241, 0.15)',
            color: 'var(--primary)',
            padding: '3px 8px',
            borderRadius: '99px',
            fontSize: '0.65rem',
            fontWeight: 700,
            textTransform: 'uppercase'
          }}>
            Rider Panel
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <User size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>{user?.name}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user?.email}</span>
            </div>
          </div>

          {/* Theme Switcher Button */}
          <button
            onClick={() => setIsLightTheme(!isLightTheme)}
            className="btn-secondary"
            style={{
              padding: '10px 12px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-primary)'
            }}
            title="Toggle Light/Dark Theme"
          >
            {isLightTheme ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          <button 
            onClick={logout} 
            className="btn-secondary" 
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '0.85rem'
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <main style={{
        flex: 1,
        margin: '0 20px 20px 20px',
        display: 'grid',
        gridTemplateColumns: '400px 1fr',
        gap: '20px',
        height: 'calc(100vh - 120px)',
        zIndex: 5
      }}>
        
        {/* Left Side: SidePanel Controls */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          overflowY: 'auto',
          paddingRight: '4px'
        }}>
          
          {/* Booking card (Only show if no active ride or searching) */}
          {!activeRide && !isSearching && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '16px', fontWeight: 700 }}>
                Request Outstation Ride
              </h3>

              {/* Select Preset Route */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  CHOOSE A ROUTE
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {PRESET_ROUTES.map((route, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleRouteSelect(idx)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        background: selectedRoute?.name === route.name ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.02)',
                        border: selectedRoute?.name === route.name ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.06)',
                        color: selectedRoute?.name === route.name ? 'white' : 'var(--text-secondary)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        transition: 'all 0.2s',
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>{route.name}</span>
                      <span style={{ opacity: 0.6 }}>{route.distance} km</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Display fields when route is selected */}
              {selectedRoute && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}>
                    <MapPin size={16} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>Pickup:</strong> {selectedRoute.pickup}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}>
                    <Compass size={16} style={{ color: 'var(--secondary)', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>Destination:</strong> {selectedRoute.dropoff}
                    </div>
                  </div>

                  {/* Trip Type Selector */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      TRIP OPTION
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => setRideType('single')}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: '8px',
                          background: rideType === 'single' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255,255,255,0.02)',
                          border: rideType === 'single' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.06)',
                          color: rideType === 'single' ? 'white' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}
                      >
                        Single Side
                      </button>
                      <button
                        onClick={() => setRideType('both')}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: '8px',
                          background: rideType === 'both' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255,255,255,0.02)',
                          border: rideType === 'both' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.06)',
                          color: rideType === 'both' ? 'white' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}
                      >
                        Both Side (Round)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Pricing breakdown */}
              {estimation && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Base Fare:</span>
                    <span>₹{estimation.baseFare}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Distance Fare ({rideType === 'both' ? 'Round Trip 3.5x' : 'One Way 2.0x'}):</span>
                    <span>₹{estimation.distanceFare} (₹{estimation.ratePerUnit || '1.75'}/km)</span>
                  </div>
                  {estimation.allowance > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Driver Allowance:</span>
                      <span>₹{estimation.allowance}</span>
                    </div>
                  )}
                  <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '4px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem', color: 'var(--accent-success)' }}>
                    <span>Total Fare:</span>
                    <span>₹{estimation.totalFare}</span>
                  </div>
                </div>
              )}

              {/* Book Button */}
              {selectedRoute && estimation && (
                <button 
                  onClick={handleBookRide} 
                  className="btn-primary" 
                  style={{ width: '100%', padding: '14px 0' }}
                >
                  Book Outstation Ride
                </button>
              )}
            </div>
          )}

          {/* Searching / Looking for drivers */}
          {isSearching && !activeRide && (
            <div className="glass-panel ping-pulse" style={{ padding: '30px 24px', textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto'
              }}>
                <Search size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Searching Active Drivers</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Connecting to nearby drivers for your trip from {selectedRoute?.pickup} to {selectedRoute?.dropoff}...
              </p>
              <button 
                onClick={handleCancelBooking} 
                className="btn-secondary" 
                style={{ width: '100%', borderColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--accent-danger)' }}
              >
                Cancel Request
              </button>
            </div>
          )}

          {/* Active Ride details */}
          {activeRide && (
            <RideProgressCard
              ride={activeRide}
              role="rider"
              onToggleChat={() => setChatOpen(!chatOpen)}
              hasNewMessage={newChatAlert}
              onStatusUpdate={handleStatusUpdate}
            />
          )}

          {/* Ride History */}
          <div className="glass-panel" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <History size={18} className="text-secondary" style={{ color: 'var(--secondary)' }} />
              <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>Your Ride History</h3>
            </div>
            
            <div style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {history.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', margin: 'auto 0' }}>
                  No outstation trips completed yet.
                </div>
              ) : (
                history.map((rideItem) => (
                  <div 
                    key={rideItem.id} 
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '10px',
                      padding: '12px',
                      fontSize: '0.8rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontWeight: 600 }}>
                      <span style={{ color: 'var(--text-primary)' }}>
                        {rideItem.pickupAddress.split(',')[0]} ⇄ {rideItem.dropoffAddress.split(',')[0]}
                      </span>
                      <span style={{ color: 'var(--accent-success)' }}>₹{rideItem.totalFare}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Type: {rideItem.rideType === 'both' ? 'Round Trip' : 'One Way'}</span>
                      <span style={{ textTransform: 'capitalize' }}>Status: {rideItem.status}</span>
                    </div>
                    
                    {rideItem.status === 'completed' && (
                      <button 
                        onClick={() => setViewingReceiptRide(rideItem)}
                        className="btn-secondary"
                        style={{ 
                          marginTop: '8px', 
                          padding: '6px 0', 
                          width: '100%', 
                          fontSize: '0.75rem', 
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px' 
                        }}
                      >
                        <FileText size={14} />
                        View Receipt
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Map Container */}
        <div style={{ position: 'relative' }}>
          <MapContainer
            pickupCoords={selectedRoute?.pickupCoords}
            dropoffCoords={selectedRoute?.dropoffCoords}
            driverCoords={driverLocation}
            rideStatus={activeRide?.status}
          />

          {/* Floating Live chatbox */}
          {activeRide && (
            <ChatBox
              rideId={activeRide.id}
              isOpen={chatOpen}
              onClose={() => setChatOpen(false)}
            />
          )}

          {/* Receipt Modal Overlay */}
          {viewingReceiptRide && (
            <ReceiptModal 
              ride={viewingReceiptRide} 
              onClose={() => setViewingReceiptRide(null)} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default RiderDashboard;
