import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, FileText, Car, Check } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Basic Info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('rider'); // 'rider' or 'driver'

  // Driver vehicle details
  const [carName, setCarName] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [carType, setCarType] = useState('sedan');
  const [licenseNumber, setLicenseNumber] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !email || !password) {
      setErrorMsg('Please fill in all basic credentials.');
      return;
    }

    if (role === 'driver') {
      if (!carName || !carModel || !carNumber || !licenseNumber) {
        setErrorMsg('Please complete all vehicle onboarding details.');
        return;
      }
    }

    setSubmitting(true);

    const payload = {
      name,
      email,
      password,
      role,
      ...(role === 'driver' && {
        carName,
        carModel,
        carNumber,
        carType,
        licenseNumber
      })
    };

    try {
      const registeredUser = await register(payload);
      if (registeredUser.role === 'driver') {
        navigate('/driver');
      } else {
        navigate('/rider');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Try a different email.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Glows */}
      <div className="cyber-glow-bg" style={{ top: '-10%', right: '-10%' }} />
      <div className="cyber-glow-bg" style={{ bottom: '-10%', left: '-10%', background: 'radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, rgba(0,0,0,0) 70%)' }} />

      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '520px',
        padding: '40px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '2.2rem', color: 'var(--text-primary)', fontWeight: 800 }}>
            Ride<span style={{ color: 'var(--primary)' }}>Snap</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '0.9rem' }}>
            Register to ride or earn on outstation travels
          </p>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: 'var(--accent-danger)',
            fontSize: '0.85rem',
            marginBottom: '20px'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Role selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>
              CHOOSE YOUR PROFILE TYPE
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setRole('rider')}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  background: role === 'rider' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.02)',
                  border: role === 'rider' ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.06)',
                  color: role === 'rider' ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {role === 'rider' && <Check size={16} />}
                I want to Ride
              </button>
              <button
                type="button"
                onClick={() => setRole('driver')}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  background: role === 'driver' ? 'rgba(14, 165, 233, 0.15)' : 'rgba(255,255,255,0.02)',
                  border: role === 'driver' ? '1px solid var(--secondary)' : '1px solid rgba(255,255,255,0.06)',
                  color: role === 'driver' ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {role === 'driver' && <Check size={16} />}
                I want to Drive
              </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              FULL NAME
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="input-field"
                style={{ paddingLeft: '48px' }}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              EMAIL ADDRESS
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="input-field"
                style={{ paddingLeft: '48px' }}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (Min 6 characters)"
                className="input-field"
                style={{ paddingLeft: '48px' }}
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Driver vehicle details fields if role is 'driver' */}
          {role === 'driver' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              paddingTop: '20px',
              marginTop: '10px'
            }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                Vehicle & Driver Profile
              </h3>

              {/* Car Name & Model */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    CAR NAME / BRAND
                  </label>
                  <input
                    type="text"
                    value={carName}
                    onChange={(e) => setCarName(e.target.value)}
                    placeholder="e.g. Honda City"
                    className="input-field"
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    CAR MODEL / YEAR
                  </label>
                  <input
                    type="text"
                    value={carModel}
                    onChange={(e) => setCarModel(e.target.value)}
                    placeholder="e.g. 2022"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              {/* Car Number & Type */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    VEHICLE NUMBER PLATE
                  </label>
                  <input
                    type="text"
                    value={carNumber}
                    onChange={(e) => setCarNumber(e.target.value)}
                    placeholder="e.g. DL 3C AB 1234"
                    className="input-field"
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    VEHICLE CATEGORY
                  </label>
                  <select
                    value={carType}
                    onChange={(e) => setCarType(e.target.value)}
                    className="input-field"
                    style={{ height: '51px' }}
                  >
                    <option value="hatchback">Hatchback (Budget)</option>
                    <option value="sedan">Sedan (Comfort)</option>
                    <option value="suv">SUV (Premium)</option>
                  </select>
                </div>
              </div>

              {/* License Number */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  DRIVING LICENSE NUMBER
                </label>
                <div style={{ position: 'relative' }}>
                  <FileText size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="e.g. DL-123456789"
                    className="input-field"
                    style={{ paddingLeft: '48px' }}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
            style={{ width: '100%', padding: '16px 0', marginTop: '10px' }}
          >
            {submitting ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '28px',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)'
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
