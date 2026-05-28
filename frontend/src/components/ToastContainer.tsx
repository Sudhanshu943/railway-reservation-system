"use client";

import { useToast } from "@/context/ToastContext";
import { useEffect, useState } from "react";

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getStyles = (type: string) => {
    const baseStyles =
      "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-top-4 fade-in";
    const typeStyles = {
      success: "bg-green-500 text-white",
      error: "bg-red-500 text-white",
      warning: "bg-yellow-500 text-white",
      info: "bg-blue-500 text-white",
    };
    return `${baseStyles} ${typeStyles[type as keyof typeof typeStyles] || typeStyles.info}`;
  };

  const getIcon = (type: string) => {
    const icons = {
      success: "check_circle",
      error: "error",
      warning: "warning",
      info: "info",
    };
    return icons[type as keyof typeof icons] || icons.info;
  };

  return (
    <div className="fixed top-4 right-4 z-9999 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${getStyles(toast.type)} pointer-events-auto`}
        >
          <span className="material-symbols-outlined text-xl">
            {getIcon(toast.type)}
          </span>
          <span className="font-medium">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-auto opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Close toast"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      ))}
    </div>
  );
}
