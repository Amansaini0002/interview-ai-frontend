import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { FiCheckCircle, FiAlertCircle, FiAlertTriangle } from "react-icons/fi";
import "./Toast.scss";

//  Hook //
function useToast() {
  const [toast, setToast] = useState({
    message: "",
    type: "success",
    confirm: false,
    confirmLabel: "Confirm",
    onConfirm: null,
    onCancel: null,
  });

  const timeoutRef = useRef(null);

  const hideToast = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToast({
      message: "",
      type: "success",
      confirm: false,
      confirmLabel: "Confirm",
      onConfirm: null,
      onCancel: null,
    });
  }, []);

  const showToast = useCallback((message, type = "success") => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setToast({
      message,
      type,
      confirm: false,
      confirmLabel: "Confirm",
      onConfirm: null,
      onCancel: null,
    });

    timeoutRef.current = setTimeout(() => {
      hideToast();
    }, 2000);
  }, [hideToast]);

  const showConfirm = useCallback((message, onConfirm, confirmLabel = "Confirm") => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setToast({
      message,
      type: "warning",
      confirm: true,
      confirmLabel,
      onConfirm: () => {
        onConfirm();
        hideToast();
      },
      onCancel: hideToast,
    });

    timeoutRef.current = setTimeout(hideToast, 4000);
  }, [hideToast]);

  return { toast, showToast, showConfirm, hideToast };
}

// Display Component //
function ToastDisplay({ message, type = "success", confirm = false, confirmLabel = "Confirm", onConfirm, onCancel }) {
  if (!message) return null;

  const isError = type === "error";
  const isWarning = type === "warning";

  const typeClass = isError ? "toast--error" : isWarning ? "toast--warning" : "toast--success";
  const Icon = isError ? FiAlertCircle : isWarning ? FiAlertTriangle : FiCheckCircle;

  return (
    <div className="toast-wrapper">
      <div className={`toast ${typeClass} ${confirm ? "toast--confirm" : ""}`}>
        <Icon className="toast__icon" />
        <span className="toast__message">{message}</span>

        {confirm && (
          <div className="toast__actions">
            <button onClick={onConfirm} className="toast__btn toast__btn--confirm">
              {confirmLabel}
            </button>
            <button onClick={onCancel} className="toast__btn toast__btn--cancel">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

//  Context / Provider //
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const { toast, showToast, showConfirm, hideToast } = useToast();

  return (
    <ToastContext.Provider value={{ showToast, showConfirm, hideToast }}>
      {children}
      <ToastDisplay
        message={toast.message}
        type={toast.type}
        confirm={toast.confirm}
        confirmLabel={toast.confirmLabel}
        onConfirm={toast.onConfirm}
        onCancel={toast.onCancel}
      />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToastContext must be used within a ToastProvider");
  return ctx;
}