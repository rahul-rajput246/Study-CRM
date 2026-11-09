import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  FaGraduationCap,
  FaEnvelope,
  FaLock,
  FaArrowRight,
  FaKey,
  FaCheckCircle,
} from 'react-icons/fa';

export default function LoginPage({ onSwitchToRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [demoLoaded, setDemoLoaded] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('engineer@studyos.local');
    setPassword('password123');
    setDemoLoaded(true);
    setErrorMessage('');
    setTimeout(() => setDemoLoaded(false), 3000);
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-4"
      style={{ backgroundColor: 'var(--bg-main)' }}
    >
      <div
        className="card shadow-lg border-0"
        style={{ maxWidth: '440px', width: '100%', borderRadius: '16px' }}
      >
        <div className="card-body p-4 p-md-5">
          {/* Logo & Heading */}
          <div className="text-center mb-4">
            <div className="d-inline-flex align-items-center justify-content-center rounded-3 p-3 bg-primary bg-opacity-10 text-primary mb-3">
              <FaGraduationCap className="fs-1" />
            </div>
            <h3 className="fw-bold mb-1 theme-text-main">StudyOS Login</h3>
            <p className="text-muted small">
              Personal Learning & Cognitive Command Center
            </p>
          </div>

          {errorMessage && (
            <div className="alert alert-danger py-2 small" role="alert">
              {errorMessage}
            </div>
          )}

          {demoLoaded && (
            <div className="alert alert-success py-2 small d-flex align-items-center gap-2" role="alert">
              <FaCheckCircle />
              <span>Demo credentials loaded into inputs! Click "Sign In" below.</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Email Address</label>
              <div className="input-group">
                <span className="input-group-text border-end-0">
                  <FaEnvelope />
                </span>
                <input
                  type="email"
                  className="form-control border-start-0"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. engineer@studyos.local"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small fw-semibold text-muted mb-0">Password</label>
              </div>
              <div className="input-group">
                <span className="input-group-text border-end-0">
                  <FaLock />
                </span>
                <input
                  type="password"
                  className="form-control border-start-0"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. password123"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2 mb-3 fw-semibold shadow-sm"
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Command Center</span>
                  <FaArrowRight />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Helper Box */}
          <div className="p-3 rounded-3 bg-secondary bg-opacity-10 border border-secondary border-opacity-25 mb-4 text-center">
            <div className="small fw-semibold theme-text-main mb-1">One-Click Demo Access</div>
            <div className="small text-muted mb-2 font-monospace" style={{ fontSize: '0.75rem' }}>
              engineer@studyos.local / password123
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="btn btn-sm btn-outline-info d-inline-flex align-items-center gap-2"
            >
              <FaKey />
              <span>Fill Seeded Demo Account</span>
            </button>
          </div>

          <div className="text-center">
            <span className="text-muted small">Don't have an account? </span>
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
