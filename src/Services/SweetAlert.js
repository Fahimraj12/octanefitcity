import Swal from "sweetalert2";

/**
 * Modernized Alert Utility
 * Uses a centralized configuration for consistent UI/UX.
 */

const COLORS = {
  success: "#10b981", // Emerald 500
  error:   "#ef4444", // Red 500
  warning: "#f59e0b", // Amber 500
  info:    "#3b82f6", // Blue 500
  primary: "#6366f1", // Indigo 500
  gray:    "#94a3b8", // Slate 400
};

// Create a base instance to avoid repeating standard configurations
const BaseSwal = Swal.mixin({
  reverseButtons: true, // Modern UX: Primary action on the right
  confirmButtonColor: COLORS.primary,
  cancelButtonColor: COLORS.gray,
  customClass: {
    container: 'my-swal-container', // Hook for custom global CSS
  }
});

const alert = {
  /**
   * Internal helper for standard alerts
   */
  _fire: (title, text, icon, confirmColor) => {
    return BaseSwal.fire({
      title,
      text,
      icon,
      confirmButtonColor: confirmColor,
    });
  },

  success: (message, title = "Success") => 
    alert._fire(title, message, "success", COLORS.success),

  error: (message, title = "Error") => 
    alert._fire(title, message, "error", COLORS.error),

  warning: (message, title = "Warning") => 
    alert._fire(title, message, "warning", COLORS.warning),

  info: (message, title = "Info") => 
    alert._fire(title, message, "info", COLORS.info),

  /**
   * Confirmation Dialog
   * Returns a promise: .then((res) => { if(res.isConfirmed) ... })
   */
  confirm: (message, title = "Are you sure?") => {
    return BaseSwal.fire({
      icon: "question",
      title,
      text: message,
      showCancelButton: true,
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
    });
  },

  /**
   * Toast Notification
   * Non-blocking alert that appears in the corner
   */
  toast: (message, icon = "success") => {
    return Swal.fire({
      toast: true,
      position: "top-end",
      icon,
      title: message,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      // Pause timer when user hovers over the toast
      didOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
    });
  },
};

export default alert;