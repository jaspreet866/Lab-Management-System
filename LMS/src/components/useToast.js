import { createContext, useContext } from "react";

export const ToastContext = createContext(null);

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
