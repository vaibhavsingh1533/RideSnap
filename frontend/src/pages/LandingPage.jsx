import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CarFront,
  CheckCircle2,
  Clock3,
  MapPin,
  Navigation,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const features = [
  {
    icon: ShieldCheck,
    title: 'OTP-secured rides',
    text: 'A simple 4-digit verification keeps every pickup clear and secure.',
  },
  {
    icon: Navigation,
    title: 'Live ride tracking',
    text: 'Follow the ride in real time with Socket.IO-powered location updates.',
  },
  {
    icon: Zap,
    title: 'Transparent fares',
    text: 'See distance, duration and fare details before confirming the ride.',
  },
];

const LandingPage = () => {
  return (
    <div className="landing-page">
      <div className="landing-orb landing-orb-one" />
      <div className="landing-orb landing-orb-two" />
      <div className="landing-grid" />

      <motion.header
        className="landing-nav glass-panel"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
      >
        <Link to="/" className="landing-logo">
          Ride<span>Snap</span>
        </Link>

        <div className="landing-nav-actions">
          <Link to="/login" className="landing-link">Sign in</Link>
          <Link to="/register" className="btn-primary landing-register">Get started <ArrowRight size={16} /></Link>
        </div>
      </motion.header>

      <main>
        <section className="landing-hero">
          <div className="hero-copy">
            <motion.div
              className="hero-badge"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45 }}
            >
              <Sparkles size={15} /> Smart intercity travel
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.65, delay: 0.08 }}
            >
              Your next ride,
              <span> without the guesswork.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.65, delay: 0.16 }}
            >
              Book reliable outstation rides with transparent pricing, secure OTP boarding and live ride updates — all in one place.
            </motion.p>

            <motion.div
              className="hero-actions"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.65, delay: 0.24 }}
            >
              <Link to="/register?role=rider" className="btn-primary hero-primary">
                Book a ride <ArrowRight size={18} />
              </Link>
              <Link to="/register?role=driver" className="btn-secondary hero-secondary">
                Drive with RideSnap
              </Link>
            </motion.div>

            <motion.div
              className="hero-trust"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <div className="trust-avatars">
                <span>AK</span><span>RS</span><span>MP</span>
              </div>
              <div>
                <div className="trust-stars"><Star size={14} fill="currentColor" /> <strong>4.9/5</strong></div>
                <small>Loved by riders & drivers</small>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, x: 45, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
          >
            <div className="route-card glass-panel">
              <div className="route-topline">
                <div>
                  <span className="eyebrow">LIVE RIDE PREVIEW</span>
                  <h3>Delhi → Jaipur</h3>
                </div>
                <motion.div
                  className="live-pill"
                  animate={{ opacity: [0.55, 1, 0.55] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                >
                  <span /> Live
                </motion.div>
              </div>

              <div className="route-map">
                <div className="map-glow" />
                <svg className="route-svg" viewBox="0 0 520 260" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M44 204 C120 172, 118 104, 202 128 S302 202, 360 126 S430 58, 484 70" />
                  <path className="route-main" d="M44 204 C120 172, 118 104, 202 128 S302 202, 360 126 S430 58, 484 70" />
                </svg>
                <div className="map-point point-start"><MapPin size={16} /></div>
                <div className="map-point point-end"><Navigation size={15} /></div>
                <motion.div
                  className="moving-car"
                  animate={{ x: [0, 105, 215, 320, 405], y: [0, -30, -2, -60, -72] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <CarFront size={18} />
                </motion.div>
              </div>

              <div className="route-details">
                <div><span>Distance</span><strong>268 km</strong></div>
                <div><span>Duration</span><strong>4h 52m</strong></div>
                <div><span>Estimated fare</span><strong>₹4,899</strong></div>
              </div>

              <div className="driver-mini">
                <div className="driver-avatar">RS</div>
                <div className="driver-info"><strong>Ramesh Sharma</strong><span>Honda City · 4.9 ★</span></div>
                <div className="verified"><CheckCircle2 size={18} /> Verified</div>
              </div>
            </div>

            <motion.div
              className="floating-stat floating-stat-one glass-panel"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Clock3 size={17} /> <span><strong>On time</strong><small>98% rides</small></span>
            </motion.div>

            <motion.div
              className="floating-stat floating-stat-two glass-panel"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ShieldCheck size={17} /> <span><strong>OTP protected</strong><small>Every pickup</small></span>
            </motion.div>
          </motion.div>
        </section>

        <motion.section
          className="stats-strip glass-panel"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
        >
          <div><strong>15k+</strong><span>Trips completed</span></div>
          <div><strong>4.9★</strong><span>Average rating</span></div>
          <div><strong>1.75×</strong><span>Return fare factor</span></div>
          <div><strong>100%</strong><span>OTP secured</span></div>
        </motion.section>

        <section className="features-section">
          <motion.div
            className="section-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <span>BUILT FOR REAL RIDES</span>
            <h2>Everything you need for a smoother journey.</h2>
            <p>Designed like a production product, not just a demo screen.</p>
          </motion.div>

          <div className="feature-grid">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  className="feature-card glass-panel"
                  key={feature.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <div className="feature-icon"><Icon size={22} /></div>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                  <span className="feature-number">0{index + 1}</span>
                </motion.div>
              );
            })}
          </div>
        </section>

        <motion.section
          className="cta-panel"
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <span>READY WHEN YOU ARE</span>
            <h2>Turn the next trip into the easiest one.</h2>
          </div>
          <Link to="/register?role=rider" className="btn-primary">Start riding <ArrowRight size={18} /></Link>
        </motion.section>
      </main>

      <footer className="landing-footer">
        <div className="landing-logo">Ride<span>Snap</span></div>
        <p>Real-time outstation ride booking platform.</p>
        <small>© 2026 RideSnap. Built as a CSE major project.</small>
      </footer>
    </div>
  );
};

export default LandingPage;
