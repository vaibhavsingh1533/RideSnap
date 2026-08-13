import React, { useEffect } from 'react';
import { MapPin, Navigation, DollarSign, X } from 'lucide-react';

const DriverRequestModal = ({ rideRequest, onAccept, onDecline }) => {
  
  // Trigger premium synthesizer notification sound on mount
  useEffect(() => {
    if (!rideRequest) return;
    
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        
        // Play double chime
        const playTone = (time, freq, duration) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, time);
          
          gain.gain.setValueAtTime(0.2, time);
          gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(time);
          osc.stop(time + duration);
        };
        
        const now = ctx.currentTime;
        playTone(now, 587.33, 0.4); // D5
        playTone(now + 0.15, 880, 0.6); // A5
      }
    } catch (e) {
      console.warn('Audio Context block:', e);
    }
  }, [rideRequest]);

  if (!rideRequest) return null;

  const {
    id,
    rider,
    pickupAddress,
    dropoffAddress,
    distance,
    duration,
    rideType,
    totalFare
  } = rideRequest;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 5, 8, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div 
        className="glass-panel ping-pulse" 
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '28px',
          border: '1px solid var(--border-glow-active)',
          position: 'relative',
          background: 'var(--bg-card)'
        }}
      >
        {/* Decline Close */}
        <button 
          onClick={onDecline}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.05)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{
            background: 'rgba(99, 102, 241, 0.15)',
            color: 'var(--primary)',
            padding: '6px 12px',
            borderRadius: '99px',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            New Outstation Request
          </span>
          <h3 style={{ fontSize: '1.5rem', marginTop: '12px', color: 'var(--text-primary)' }}>
            {rider?.name || 'Rider'}
          </h3>
        </div>

        {/* Route Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
          {/* Pickup */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <MapPin className="text-primary" style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>PICKUP LOCATION</span>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500 }}>{pickupAddress}</span>
            </div>
          </div>

          {/* Line separator */}
          <div style={{
            width: '2px',
            height: '20px',
            background: 'dashed rgba(255, 255, 255, 0.15)',
            marginLeft: '11px',
            marginTop: '-10px',
            marginBottom: '-10px'
          }} />

          {/* Dropoff */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <Navigation className="text-secondary" style={{ color: 'var(--secondary)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>DESTINATION (OUTSTATION)</span>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500 }}>{dropoffAddress}</span>
            </div>
          </div>
        </div>

        {/* Ride Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '28px',
          textAlign: 'center'
        }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>DISTANCE</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{distance} km</span>
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>TRIP TYPE</span>
            <span style={{ 
              fontSize: '0.95rem', 
              fontWeight: 700, 
              color: 'var(--secondary)',
              textTransform: 'uppercase'
            }}>
              {rideType === 'both' ? 'Round Trip' : 'One Way'}
            </span>
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>EST. FARE</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-success)' }}>
              ₹{totalFare}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn-secondary" 
            onClick={onDecline}
            style={{ flex: 1, padding: '14px 0' }}
          >
            Decline
          </button>
          <button 
            className="btn-primary" 
            onClick={() => onAccept(id)}
            style={{ flex: 2, padding: '14px 0' }}
          >
            Accept Ride
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverRequestModal;
