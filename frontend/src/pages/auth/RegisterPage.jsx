import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaGraduationCap, FaUser, FaEnvelope, FaLock, FaBullseye, FaArrowRight } from 'react-icons/fa';

export default function RegisterPage({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    target_role: 'Senior Full-Stack Developer (₹40 LPA+)',
    daily_goal_minutes: 240,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (formData.password !== formData.password_confirmation) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await register(formData);
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-4" style={{ backgroundColor: 'var(--bg-main)' }}>
      <div className="card shadow-lg border-0" style={{ maxWidth: '480px', width: '100%', borderRadius: '16px' }}>
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <div className="d-inline-flex align-items-center justify-content-center rounded-3 p-3 bg-primary bg-opacity-10 text-primary mb-3">
              <FaGraduationCap className="fs-1" />
            </div>
            <h3 className="fw-bold mb-1 theme-text-main">Create Account</h3>
            <p className="text-muted small">Begin your disciplined journey to ₹40 LPA+ engineering</p>
          </div>

          {errorMessage && (
            <div className="alert alert-danger py-2 small" role="alert">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Full Name</label>
              <div className="input-group">
                <span className="input-group-text border-end-0">
                  <FaUser />
                </span>
                <input
                  type="text"
                  name="name"
                  className="form-control border-start-0"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Ashish"
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Email Address</label>
              <div className="input-group">
                <span className="input-group-text border-end-0">
                  <FaEnvelope />
                </span>
                <input
                  type="email"
                  name="email"
                  className="form-control border-start-0"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@domain.com"
                  required
                />
              </div>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-sm-6">
                <label className="form-label small fw-semibold text-muted">Password</label>
                <div className="input-group">
                  <span className="input-group-text border-end-0">
                    <FaLock />
                  </span>
                  <input
                    type="password"
                    name="password"
                    className="form-control border-start-0"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 8 chars"
                    required
                  />
                </div>
              </div>
              <div className="col-sm-6">
                <label className="form-label small fw-semibold text-muted">Confirm Password</label>
                <div className="input-group">
                  <span className="input-group-text border-end-0">
                    <FaLock />
                  </span>
                  <input
                    type="password"
                    name="password_confirmation"
                    className="form-control border-start-0"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Career Target</label>
              <div className="input-group">
                <span className="input-group-text border-end-0">
                  <FaBullseye />
                </span>
                <input
                  type="text"
                  name="target_role"
                  className="form-control border-start-0"
                  value={formData.target_role}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold text-muted">
                Daily Study Goal: <span className="text-primary fw-bold">{formData.daily_goal_minutes / 60} Hours</span> ({formData.daily_goal_minutes} mins)
              </label>
              <input
                type="range"
                className="form-range"
                min="60"
                max="600"
                step="30"
                name="daily_goal_minutes"
                value={formData.daily_goal_minutes}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2 mb-3 fw-semibold shadow-sm"
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Command Center
                  <FaArrowRight />
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <span className="text-muted small">Already registered? </span>
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

