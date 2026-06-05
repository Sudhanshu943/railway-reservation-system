"use client";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { ModalProvider } from "@/components/modals/ModalProvider";
import ToastContainer from "@/components/ToastContainer";
import GoogleAuthProvider from "@/components/GoogleAuthProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleAuthProvider>
      <AuthProvider>
        <ToastProvider>
          <ModalProvider>
            {children}
            <ToastContainer />
          </ModalProvider>
        </ToastProvider>
      </AuthProvider>
    </GoogleAuthProvider>
  );
}