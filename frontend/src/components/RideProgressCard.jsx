import React, { useState, useEffect, useRef } from 'react';
import { Phone, MessageSquare, Car, ShieldAlert, Award, Shield, AlertOctagon, X, PhoneCall } from 'lucide-react';

const RideProgressCard = ({ 
  ride, 
  role, 
  onStatusUpdate, 
  onToggleChat, 
  hasNewMessage,
  onVerifyOtp,
  otpError,
  setOtpError
}) => {
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [sosActive, setSosActive] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(5);
  
  const sirenIntervalRef = useRef(null);
  const audioCtxRef = useRef(null);

  if (!ride) return null;

  const {
    status,
    pickupAddress,
    dropoffAddress,
    distance,
    rideType,
    totalFare,
    rider,
    driver
  } = ride;

  // Handle SOS Audio Siren (Web Audio API)
  const startSiren = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      
      let toggle = false;
      sirenIntervalRef.current = setInterval(() => {
        // Alternating siren frequencies (e.g. 600Hz and 800Hz)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(toggle ? 650 : 850, ctx.currentTime);
        
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
        toggle = !toggle;
      }, 500);
    } catch (e) {
      console.warn('Audio Context blocked or failed:', e);
    }
  };

  const stopSiren = () => {
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  };

  // SOS Countdown Timer
  useEffect(() => {
    let timer;
    if (sosActive) {
      startSiren();
      setSosCountdown(5);
      timer = setInterval(() => {
        setSosCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      stopSiren();
    }

    return () => {
      clearInterval(timer);
      stopSiren();
    };
  }, [sosActive]);

  const renderStatusMessage = () => {
    switch (status) {
      case 'accepted':
        return role === 'rider' 
          ? "Driver is navigating to your pickup location."
          : "Navigate to rider's pickup location.";
      case 'arrived':
        return role === 'rider'
          ? "Driver has arrived at your pickup location!"
          : "You have arrived. Wait for the rider to board.";
      case 'in_progress':
        return role === 'rider'
          ? "Enjoy your outstation journey. Heading to destination..."
          : "Outstation trip active. Navigating to destination...";
      case 'completed':
        return "Trip completed successfully. Have a great day!";
      default:
        return "";
    }
  };

  const getActionButtonText = () => {
    switch (status) {
      case 'accepted':
        return "Mark Arrived";
      case 'arrived':
        return "Start Trip";
      case 'in_progress':
        return "Complete Trip";
      default:
        return null;
    }
  };

  const handleActionClick = () => {
    if (status === 'accepted') {
      onStatusUpdate(ride.id, 'arrived');
    } else if (status === 'arrived') {
      // Driver wants to start the trip -> show OTP input form
      setShowOtpInput(true);
      if (setOtpError) setOtpError('');
    } else if (status === 'in_progress') {
      onStatusUpdate(ride.id, 'completed');
    }
  };

  const handleOtpVerifySubmit = (e) => {
    e.preventDefault();
    if (!otpValue.trim()) return;
    if (onVerifyOtp) {
      onVerifyOtp(ride.id, otpValue.trim());
    }
  };

  const handleCancelRide = () => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this outstation ride request?");
    if (confirmCancel) {
      onStatusUpdate(ride.id, 'cancelled');
    }
  };

  return (
    <div className="glass-panel" style={{
      padding: '20px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      position: 'relative'
    }}>
      {/* Header and status marker */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Ride status
          </span>
          <h4 style={{ 
            fontSize: '1.1rem', 
            color: 'var(--text-primary)', 
            marginTop: '2px', 
            textTransform: 'capitalize' 
          }}>
            {status.replace('_', ' ')}
          </h4>
        </div>
        <div className="ping-pulse" style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: status === 'in_progress' ? 'var(--secondary)' : 'var(--primary)'
        }} />
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        {renderStatusMessage()}
      </p>

      {/* Rider OTP View */}
      {role === 'rider' && ['accepted', 'arrived'].includes(status) && (
        <div style={{
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px dashed var(--primary)',
          borderRadius: '12px',
          padding: '12px',
          textAlign: 'center',
          marginTop: '4px'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 600 }}>
            BOARDING SECURITY OTP (SHARE WITH DRIVER)
          </span>
          <strong style={{ fontSize: '1.5rem', color: 'var(--text-primary)', letterSpacing: '4px', display: 'block', marginTop: '4px' }}>
            {ride.otp || 'N/A'}
          </strong>
        </div>
      )}

      {/* Driver OTP input inline form */}
      {role === 'driver' && status === 'arrived' && showOtpInput && (
        <form onSubmit={handleOtpVerifySubmit} style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '12px',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 600, display: 'block' }}>
            Enter Rider's Boarding OTP
          </span>
          
          <input 
            type="text" 
            placeholder="e.g. 4-Digit OTP"
            maxLength={4}
            value={otpValue}
            onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
            className="input-field"
            style={{ 
              padding: '10px 12px', 
              fontSize: '1rem', 
              textAlign: 'center', 
              letterSpacing: '6px',
              borderRadius: '8px'
            }}
            required
          />

          {otpError && (
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-danger)', display: 'block', textAlign: 'center' }}>
              {otpError}
            </span>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button 
              type="button" 
              onClick={() => { setShowOtpInput(false); setOtpValue(''); }}
              className="btn-secondary" 
              style={{ flex: 1, padding: '10px 0', fontSize: '0.85rem', borderRadius: '8px' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ flex: 2, padding: '10px 0', fontSize: '0.85rem', borderRadius: '8px', boxShadow: 'none' }}
            >
              Verify & Start Trip
            </button>
          </div>
        </form>
      )}

      <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }} />

      {/* Driver/Rider card info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {role === 'rider' ? (
          <>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <Car size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {driver?.name || 'Your Driver'}
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  color: 'var(--accent-warning)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px'
                }}>
                  ★ {driver?.driverDetail?.rating || '5.0'}
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>
                {driver?.driverDetail?.carName || 'Sedan'} ({driver?.driverDetail?.carModel || 'White'})
              </span>
              <span style={{ 
                fontSize: '0.75rem', 
                color: 'var(--secondary)', 
                fontWeight: 700, 
                letterSpacing: '0.02em', 
                textTransform: 'uppercase',
                display: 'block',
                marginTop: '2px'
              }}>
                {driver?.driverDetail?.carNumber || 'N/A'}
              </span>
            </div>
          </>
        ) : (
          <>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(14, 165, 233, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--secondary)'
            }}>
              <Award size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>RIDER</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {rider?.name || 'Rider Customer'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>
                Distance: {distance} km ({rideType === 'both' ? 'Round Trip' : 'One Way'})
              </span>
            </div>
          </>
        )}
      </div>

      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '8px',
        padding: '10px 12px',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.85rem'
      }}>
        <span style={{ color: 'var(--text-secondary)' }}>Total Fare:</span>
        <span style={{ fontWeight: 700, color: 'var(--accent-success)' }}>₹{totalFare}</span>
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
        {/* Chat button */}
        <button 
          onClick={onToggleChat}
          className="btn-secondary"
          style={{ 
            flex: 1, 
            padding: '12px 0', 
            borderRadius: '10px',
            position: 'relative',
            minWidth: '90px'
          }}
        >
          <MessageSquare size={18} />
          {hasNewMessage && (
            <span style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-danger)'
            }} />
          )}
          Chat
        </button>

        {/* SOS Panic Button */}
        {['accepted', 'arrived', 'in_progress'].includes(status) && (
          <button 
            type="button"
            onClick={() => setSosActive(true)}
            className="btn-accent"
            style={{ 
              padding: '12px 14px', 
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
            }}
          >
            <ShieldAlert size={18} />
            SOS
          </button>
        )}

        {/* Main Action Button */}
        {role === 'driver' && getActionButtonText() && (!showOtpInput || status !== 'arrived') && (
          <button 
            onClick={handleActionClick}
            className="btn-primary"
            style={{ flex: 2, padding: '12px 0', borderRadius: '10px', minWidth: '130px' }}
          >
            {getActionButtonText()}
          </button>
        )}

        {/* Cancel button for both rider & driver when accepted or arrived */}
        {['accepted', 'arrived'].includes(status) && (
          <button 
            onClick={handleCancelRide}
            className="btn-secondary"
            style={{ 
              width: '100%', 
              padding: '12px 0', 
              borderRadius: '10px',
              borderColor: 'rgba(239, 68, 68, 0.15)',
              color: 'var(--accent-danger)',
              marginTop: '4px'
            }}
          >
            Cancel Outstation Ride
          </button>
        )}

        {/* View Receipt button on Completed status */}
        {status === 'completed' && (
          <button 
            onClick={() => onStatusUpdate(ride.id, 'view_receipt')}
            className="btn-primary"
            style={{ width: '100%', padding: '12.5px 0', borderRadius: '10px', marginTop: '4px' }}
          >
            View Ride Receipt
          </button>
        )}
      </div>

      {/* SOS EMERGENCY FULLSCREEN OVERLAY MODAL */}
      {sosActive && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(220, 38, 38, 0.95)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-primary)',
          padding: '20px',
          textAlign: 'center',
          animation: 'pulse 1.5s infinite'
        }}>
          <AlertOctagon size={80} style={{ marginBottom: '20px' }} />
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '10px' }}>
            EMERGENCY SOS ACTIVE
          </h2>
          
          {sosCountdown > 0 ? (
            <>
              <p style={{ fontSize: '1.25rem', marginBottom: '24px', maxWidth: '500px' }}>
                Simulating police dispatch and broadcasting vehicle coordinates in:
              </p>
              <div style={{
                fontSize: '4.5rem',
                fontWeight: 900,
                background: 'rgba(255, 255, 255, 0.15)',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '40px',
                border: '4px solid white'
              }}>
                {sosCountdown}
              </div>
            </>
          ) : (
            <>
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '20px',
                maxWidth: '500px',
                marginBottom: '40px',
                border: '1px solid white'
              }}>
                <p style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '10px' }}>
                  🚨 GPS Broadcast Transmitted!
                </p>
                <p style={{ fontSize: '0.9rem', opacity: 0.9, lineHeight: '1.4' }}>
                  Mock Emergency Dispatcher has received your trip telemetry.<br />
                  <strong>Trip ID:</strong> {ride.id}<br />
                  <strong>Vehicle:</strong> {driver?.driverDetail?.carName || 'N/A'} ({driver?.driverDetail?.carNumber || 'N/A'})<br />
                  <strong>Route:</strong> {pickupAddress.split(',')[0]} ⇄ {dropoffAddress.split(',')[0]}
                </p>
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: '16px' }}>
            <button 
              onClick={() => setSosActive(false)}
              className="btn-secondary"
              style={{ 
                background: 'white', 
                color: '#dc2626', 
                border: 'none', 
                padding: '14px 28px',
                fontSize: '1rem',
                fontWeight: 700
              }}
            >
              Cancel Alarm
            </button>
            <a 
              href="tel:112" 
              style={{ textDecoration: 'none' }}
            >
              <button 
                className="btn-primary"
                style={{ 
                  background: 'black', 
                  color: 'var(--text-primary)', 
                  border: '1px solid white', 
                  padding: '14px 28px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  boxShadow: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <PhoneCall size={18} />
                Call 112 (Police)
              </button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default RideProgressCard;
