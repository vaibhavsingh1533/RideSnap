import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import MapContainer from '../components/MapContainer';
import ChatBox from '../components/ChatBox';
import RideProgressCard from '../components/RideProgressCard';
import DriverRequestModal from '../components/DriverRequestModal';
import ReceiptModal from '../components/ReceiptModal';
import { LogOut, User, DollarSign, Briefcase, Award, Wifi, WifiOff, Sun, Moon, FileText } from 'lucide-react';

const CITY_COORDS = {
  'Delhi': { lat: 28.6139, lng: 77.2090 },
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Bangalore': { lat: 12.9716, lng: 77.5946 },
  'Chennai': { lat: 13.0827, lng: 80.2707 }
};

const DriverDashboard = () => {
  const { user, logout } = useAuth();
  const { socket, connected } = useSocket();

  // Active status
  const [isOnline, setIsOnline] = useState(false);
  const [startCity, setStartCity] = useState('Delhi');
  const [currentCoords, setCurrentCoords] = useState(CITY_COORDS['Delhi']);

  // Ride events
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [activeRide, setActiveRide] = useState(null);

  // Stats (synced from driver detail)
  const [stats, setStats] = useState({
    rating: 5.0,
    totalTrips: 0,
    totalEarnings: 0
  });

  // Chat window
  const [chatOpen, setChatOpen] = useState(false);
  const [newChatAlert, setNewChatAlert] = useState(false);
  
  // Custom project enhancements states
  const [isLightTheme, setIsLightTheme] = useState(localStorage.getItem('theme') === 'light');
  const [viewingReceiptRide, setViewingReceiptRide] = useState(null);
  const [otpError, setOtpError] = useState('');

  // Sync theme
  useEffect(() => {
    if (isLightTheme) {
      document.body.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLightTheme]);

  // Sync driver statistics from user profile
  useEffect(() => {
    if (user && user.driverDetail) {
      setStats({
        rating: user.driverDetail.rating || 5.0,
        totalTrips: user.driverDetail.totalTrips || 0,
        totalEarnings: user.driverDetail.totalEarnings || 0
      });
      setIsOnline(user.driverDetail.isOnline || false);
    }
  }, [user]);

  // Handle City Change for starting demo position
  const handleCityChange = (e) => {
    const city = e.target.value;
    setStartCity(city);
    setCurrentCoords(CITY_COORDS[city]);
    
    // If online, update online status on server with new city coordinates
    if (isOnline && socket) {
      socket.emit('toggle_online', {
        userId: user.id,
        isOnline: true,
        lat: CITY_COORDS[city].lat,
        lng: CITY_COORDS[city].lng
      });
    }
  };

  // Toggle online availability
  const toggleOnlineStatus = () => {
    if (!socket) return;
    const nextOnline = !isOnline;

    socket.emit('toggle_online', {
      userId: user.id,
      isOnline: nextOnline,
      lat: currentCoords.lat,
      lng: currentCoords.lng
    });
  };

  // Socket triggers for Driver flow
  useEffect(() => {
    if (!socket) return;

    socket.on('online_toggled', ({ isOnline, lat, lng }) => {
      setIsOnline(isOnline);
      setCurrentCoords({ lat, lng });
    });

    // Received a ride request from searching Rider
    socket.on('ride_request_received', (ride) => {
      // Show modal if driver is online, active, and not on another ride
      if (isOnline && !activeRide) {
        setIncomingRequest(ride);
      }
    });

    // Ride request withdrawn (taken by another driver or cancelled)
    socket.on('ride_withdrawn', ({ rideId }) => {
      setIncomingRequest((prev) => (prev && prev.id === rideId ? null : prev));
    });

    // Accept confirmation
    socket.on('ride_accepted_confirmation', (ride) => {
      setActiveRide(ride);
      setIncomingRequest(null);
    });

    // Ride status updated dynamically from server
    socket.on('ride_status_updated', ({ rideId, status }) => {
      setActiveRide((prev) => {
        if (prev && prev.id === rideId) {
          if (status === 'completed' || status === 'cancelled') {
            setChatOpen(false);
            if (status === 'cancelled') {
              alert("This ride has been cancelled by the rider or system.");
              return null;
            }
            setTimeout(() => {
              setActiveRide(null);
            }, 6000);
          }
          return { ...prev, status };
        }
        return prev;
      });
    });

    // OTP Verification response
    socket.on('otp_verified', ({ success, message }) => {
      if (success) {
        setOtpError('');
      } else {
        setOtpError(message);
      }
    });

    // Alert if rider sends a chat message
    socket.on('message_received', (msg) => {
      if (msg.senderId !== user.id && !chatOpen) {
        setNewChatAlert(true);
      }
    });

    return () => {
      socket.off('online_toggled');
      socket.off('ride_request_received');
      socket.off('ride_withdrawn');
      socket.off('ride_accepted_confirmation');
      socket.off('ride_status_updated');
      socket.off('otp_verified');
      socket.off('message_received');
    };
  }, [socket, isOnline, activeRide, chatOpen]);

  // Reset alert on chat open
  useEffect(() => {
    if (chatOpen) setNewChatAlert(false);
  }, [chatOpen]);

  // Emit driver location changes to Rider via Socket
  const handleDriverCoordsChange = (coords) => {
    setCurrentCoords(coords);
    if (socket) {
      socket.emit('driver_location_update', {
        userId: user.id,
        lat: coords.lat,
        lng: coords.lng,
        activeRideId: activeRide?.id
      });
    }
  };

  // Accept incoming request
  const handleAcceptRequest = (rideId) => {
    if (socket) {
      socket.emit('accept_ride', {
        rideId,
        driverId: user.id
      });
    }
  };

  // Decline request
  const handleDeclineRequest = () => {
    setIncomingRequest(null);
  };

  // Update ride status (arrived -> in_progress -> completed, cancelled, view_receipt)
  const handleStatusUpdate = (rideId, newStatus) => {
    if (newStatus === 'view_receipt') {
      setViewingReceiptRide(activeRide);
      return;
    }
    
    if (socket) {
      socket.emit('update_ride_status', {
        rideId,
        status: newStatus
      });

      setActiveRide((prev) => {
        if (prev && prev.id === rideId) {
          if (newStatus === 'completed' || newStatus === 'cancelled') {
            if (newStatus === 'completed') {
              // Update local stats display
              setStats((old) => ({
                ...old,
                totalTrips: old.totalTrips + 1,
                totalEarnings: old.totalEarnings + prev.totalFare
              }));
            }
            setChatOpen(false);
            setTimeout(() => {
              setActiveRide(null);
            }, 6000);
          }
          return { ...prev, status: newStatus };
        }
        return prev;
      });
    }
  };

  const handleVerifyOtp = (rideId, otp) => {
    if (socket) {
      socket.emit('verify_otp', { rideId, otp });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      {/* Header */}
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
            background: 'rgba(14, 165, 233, 0.15)',
            color: 'var(--secondary)',
            padding: '3px 8px',
            borderRadius: '99px',
            fontSize: '0.65rem',
            fontWeight: 700,
            textTransform: 'uppercase'
          }}>
            Driver Portal
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
              color: 'var(--secondary)'
            }}>
              <User size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>{user?.name}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {user?.driverDetail?.carName} ({user?.driverDetail?.carNumber})
              </span>
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

      {/* Main content grid */}
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
          
          {/* Driver Availability Toggle */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '16px', fontWeight: 700 }}>
              Duty Console
            </h3>

            {/* Simulated Starting City Selector */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                SIMULATION BASE STATION (DEMO POSITION)
              </label>
              <select
                value={startCity}
                onChange={handleCityChange}
                disabled={activeRide}
                className="input-field"
                style={{ height: '48px' }}
              >
                <option value="Delhi">Delhi, NCT</option>
                <option value="Mumbai">Mumbai, MH</option>
                <option value="Bangalore">Bangalore, KA</option>
                <option value="Chennai">Chennai, TN</option>
              </select>
            </div>

            {/* Switch Toggle */}
            <button
              onClick={toggleOnlineStatus}
              disabled={activeRide}
              style={{
                width: '100%',
                padding: '16px 0',
                borderRadius: '12px',
                border: 'none',
                cursor: activeRide ? 'not-allowed' : 'pointer',
                fontWeight: 700,
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.25s',
                background: isOnline 
                  ? 'linear-gradient(135deg, #10b981, #059669)' // Glowing Green
                  : 'linear-gradient(135deg, #475569, #334155)', // Flat Slate
                color: 'var(--text-primary)',
                boxShadow: isOnline ? '0 4px 20px rgba(16,185,129,0.3)' : 'none'
              }}
            >
              {isOnline ? (
                <>
                  <Wifi size={20} />
                  ONLINE (ACCEPTING TRIPS)
                </>
              ) : (
                <>
                  <WifiOff size={20} />
                  OFFLINE (GO ONLINE)
                </>
              )}
            </button>
          </div>

          {/* Active Trip panel */}
          {activeRide && (
            <RideProgressCard
              ride={activeRide}
              role="driver"
              onStatusUpdate={handleStatusUpdate}
              onToggleChat={() => setChatOpen(!chatOpen)}
              hasNewMessage={newChatAlert}
              onVerifyOtp={handleVerifyOtp}
              otpError={otpError}
              setOtpError={setOtpError}
            />
          )}

          {/* Driver Earnings & Statistics Dashboard */}
          <div className="glass-panel" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              Performance Metrics
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              textAlign: 'center'
            }}>
              {/* Earnings */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <DollarSign size={20} style={{ color: 'var(--accent-success)', margin: '0 auto 8px auto' }} />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>TOTAL EARNINGS</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>₹{stats.totalEarnings}</span>
              </div>

              {/* Rides */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <Briefcase size={20} style={{ color: 'var(--secondary)', margin: '0 auto 8px auto' }} />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>COMPLETED RIDES</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.totalTrips}</span>
              </div>
            </div>

            {/* Rating */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Award size={20} style={{ color: 'var(--accent-warning)' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Satisfaction Rating</span>
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>★ {stats.rating}</span>
            </div>
            
            <div style={{
              marginTop: 'auto',
              background: 'rgba(99, 102, 241, 0.05)',
              border: '1px dashed rgba(99, 102, 241, 0.2)',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.4'
            }}>
              💡 <strong>Demo tip:</strong> To test booking, make sure you are <strong>ONLINE</strong>, open the Rider panel in a new tab, choose the route that starts from your Base City (e.g. {startCity}), and request a ride!
            </div>
          </div>
        </div>

        {/* Right Side: Map Container */}
        <div style={{ position: 'relative' }}>
          <MapContainer
            pickupCoords={activeRide?.status ? { lat: activeRide.pickupLat, lng: activeRide.pickupLng } : null}
            dropoffCoords={activeRide?.status ? { lat: activeRide.dropoffLat, lng: activeRide.dropoffLng } : null}
            driverCoords={currentCoords}
            rideStatus={activeRide?.status}
            onDriverCoordsChange={handleDriverCoordsChange}
          />

           {/* Chatbox slideover */}
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

      {/* Incoming Ride Request Overlay Pop-up Modal */}
      {incomingRequest && (
        <DriverRequestModal
          rideRequest={incomingRequest}
          onAccept={handleAcceptRequest}
          onDecline={handleDeclineRequest}
        />
      )}
    </div>
  );
};

export default DriverDashboard;
