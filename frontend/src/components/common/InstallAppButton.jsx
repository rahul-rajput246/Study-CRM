import React, { useState, useEffect } from 'react';
import { FaMobileAlt, FaDownload, FaCheckCircle, FaTimes, FaApple, FaAndroid, FaDesktop } from 'react-icons/fa';

export default function InstallAppButton({ className = '', variant = 'outline-primary', size = 'sm' }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  useEffect(() => {
    // 1. Check if already running in standalone/PWA mode
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
    }

    // 2. Capture the native PWA install prompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // 3. Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Trigger native browser install dialog
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Show device-specific install instructions
      setShowGuideModal(true);
    }
  };

  if (isInstalled) {
    return (
      <span className="badge bg-success bg-opacity-15 text-success small d-flex align-items-center gap-1 py-2 px-3 rounded-pill">
        <FaCheckCircle />
        <span>App Installed</span>
      </span>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`btn btn-${size} btn-${variant} d-flex align-items-center gap-2 rounded-pill px-3 fw-semibold ${className}`}
        title="Install StudyOS on your Mobile or Desktop"
      >
        <FaMobileAlt className="text-primary" />
        <span>Install App</span>
      </button>

      {/* Device Install Guide Modal */}
      {showGuideModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '440px' }}>
            <div className="modal-content shadow-lg border-0" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-bottom py-3">
                <h6 className="modal-title fw-bold theme-text-main d-flex align-items-center gap-2 mb-0">
                  <FaDownload className="text-primary" />
                  Install StudyOS on Your Device
                </h6>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowGuideModal(false)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <p className="theme-text-sub small mb-4">
                  StudyOS runs as a full-screen mobile app with home screen launch and offline caching:
                </p>

                <div className="d-flex flex-column gap-3">
                  {/* Android Guide */}
                  <div className="p-3 rounded hero-box border">
                    <div className="fw-bold theme-text-main small d-flex align-items-center gap-2 mb-1">
                      <FaAndroid className="text-success fs-5" />
                      <span>Android (Chrome / Brave / Edge)</span>
                    </div>
                    <ol className="mb-0 ps-3 small theme-text-sub">
                      <li>Tap the three dots (<strong>&vellip;</strong>) menu in the top right.</li>
                      <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                      <li>Tap <strong>Install</strong> to add StudyOS to your app drawer.</li>
                    </ol>
                  </div>

                  {/* iOS Apple Guide */}
                  <div className="p-3 rounded hero-box border">
                    <div className="fw-bold theme-text-main small d-flex align-items-center gap-2 mb-1">
                      <FaApple className="text-secondary fs-5" />
                      <span>iPhone & iPad (Safari)</span>
                    </div>
                    <ol className="mb-0 ps-3 small theme-text-sub">
                      <li>Tap the <strong>Share</strong> button (square with arrow ⎋) at the bottom.</li>
                      <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
                      <li>Tap <strong>Add</strong> in the top right corner.</li>
                    </ol>
                  </div>

                  {/* Desktop Guide */}
                  <div className="p-3 rounded hero-box border">
                    <div className="fw-bold theme-text-main small d-flex align-items-center gap-2 mb-1">
                      <FaDesktop className="text-primary fs-5" />
                      <span>PC / Laptop (Chrome / Edge)</span>
                    </div>
                    <p className="mb-0 small theme-text-sub">
                      Click the <strong>Install</strong> icon on the right side of your browser URL bar.
                    </p>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-top py-2">
                <button
                  type="button"
                  onClick={() => setShowGuideModal(false)}
                  className="btn btn-sm btn-primary w-100 py-2 fw-semibold"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
