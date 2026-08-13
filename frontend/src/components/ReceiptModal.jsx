import React, { useRef } from 'react';
import { X, Printer, CheckCircle, MapPin, Navigation } from 'lucide-react';

const ReceiptModal = ({ ride, onClose }) => {
  const printAreaRef = useRef();

  if (!ride) return null;

  const {
    id,
    pickupAddress,
    dropoffAddress,
    distance,
    baseFare,
    distanceFare,
    allowance,
    totalFare,
    rideType,
    createdAt,
    rider,
    driver
  } = ride;

  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const tax = Math.round(totalFare * 0.05); // 5% mock tax
  const subTotal = totalFare - tax;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="receipt-modal-overlay" style={{
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
        className="glass-panel" 
        style={{
          width: '100%',
          maxWidth: '550px',
          background: 'var(--bg-dark)',
          border: '1px solid var(--border-glow-active)',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-glow)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 700 }}>
            Ride Receipt
          </h3>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Print Content Area */}
        <div 
          ref={printAreaRef}
          className="printable-receipt"
          style={{
            flex: 1,
            padding: '30px 40px',
            overflowY: 'auto',
            background: 'var(--bg-dark)',
            color: 'var(--text-primary)'
          }}
        >
          {/* Brand Logo & Success status */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--accent-success)',
              marginBottom: '12px'
            }}>
              <CheckCircle size={24} />
            </div>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', fontWeight: 800 }}>
              Ride<span style={{ color: 'var(--primary)' }}>Snap</span>
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-success)', fontWeight: 700 }}>
              TRANSACTION SECURED & PAID
            </span>
          </div>

          {/* Details list */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            fontSize: '0.8rem',
            borderBottom: '1px dashed var(--border-glow)',
            paddingBottom: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>RIDE ID</span>
              <strong style={{ color: 'var(--text-primary)', fontSize: '0.75rem' }}>{id}</strong>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>DATE</span>
              <strong style={{ color: 'var(--text-primary)' }}>{formattedDate}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>PASSENGER</span>
              <strong style={{ color: 'var(--text-primary)' }}>{rider?.name || 'RideSnap User'}</strong>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>DRIVER & VEHICLE</span>
              <strong style={{ color: 'var(--text-primary)' }}>
                {driver?.name || 'Driver'} ({driver?.driverDetail?.carNumber || 'N/A'})
              </strong>
            </div>
          </div>

          {/* Route Section */}
          <div style={{
            fontSize: '0.85rem',
            borderBottom: '1px dashed var(--border-glow)',
            paddingBottom: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <MapPin size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>FROM</span>
                <span style={{ color: 'var(--text-primary)' }}>{pickupAddress}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Navigation size={16} style={{ color: 'var(--secondary)', flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>TO</span>
                <span style={{ color: 'var(--text-primary)' }}>{dropoffAddress}</span>
              </div>
            </div>
          </div>

          {/* Fare Summary Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              Fare Breakdown
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Base Booking Fare</span>
              <span>₹{baseFare}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Outstation Distance ({distance} km @ {rideType === 'both' ? '3.5x factor' : '2.0x factor'})</span>
              <span>₹{distanceFare}</span>
            </div>
            {allowance > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Driver Overnight Allowance ({rideType === 'both' ? 'Round Trip' : 'N/A'})</span>
                <span>₹{allowance}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>SGST & CGST (Flat 5%)</span>
              <span>₹{tax}</span>
            </div>
            <hr style={{ border: 'none', borderTop: '1px dashed var(--border-glow)', margin: '6px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem' }}>
              <span style={{ color: 'var(--text-primary)' }}>TOTAL CHARGED</span>
              <span style={{ color: 'var(--accent-success)' }}>₹{totalFare}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-glow)',
          background: 'rgba(255,255,255,0.01)',
          display: 'flex',
          gap: '12px'
        }}>
          <button 
            className="btn-secondary" 
            onClick={onClose}
            style={{ flex: 1, padding: '12px 0', fontSize: '0.9rem', borderRadius: '10px' }}
          >
            Close
          </button>
          <button 
            className="btn-primary" 
            onClick={handlePrint}
            style={{ flex: 2, padding: '12px 0', fontSize: '0.9rem', borderRadius: '10px' }}
          >
            <Printer size={18} />
            Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
