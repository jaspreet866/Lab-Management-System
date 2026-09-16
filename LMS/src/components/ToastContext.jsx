import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if used outside provider
    return {
      showToast: (msg) => console.log(msg),
      success: (msg) => console.log(msg),
      error: (msg) => console.error(msg),
      warning: (msg) => console.warn(msg),
      info: (msg) => console.info(msg),
    };
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = "info", duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    const newToast = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((msg, duration) => showToast(msg, "success", duration), [showToast]);
  const error = useCallback((msg, duration) => showToast(msg, "error", duration), [showToast]);
  const warning = useCallback((msg, duration) => showToast(msg, "warning", duration), [showToast]);
  const info = useCallback((msg, duration) => showToast(msg, "info", duration), [showToast]);

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return "bi-check-circle-fill";
      case "error":
        return "bi-exclamation-octagon-fill";
      case "warning":
        return "bi-exclamation-triangle-fill";
      case "info":
      default:
        return "bi-info-circle-fill";
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {/* Toast floating container */}
      <div className="lms-toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`lms-toast lms-toast-${toast.type} shadow-lg`}
            role="alert"
          >
            <div className="lms-toast-icon">
              <i className={`bi ${getIcon(toast.type)}`}></i>
            </div>
            <div className="lms-toast-body">
              <span>{toast.message}</span>
            </div>
            <button
              type="button"
              className="lms-toast-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Close"
            >
              <i className="bi bi-x"></i>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
