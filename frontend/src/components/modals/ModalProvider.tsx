"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";

interface ModalContextType {
  openLoginModal: (redirectTo?: string) => void;
  closeLoginModal: () => void;
  openSignupModal: (redirectTo?: string) => void;
  closeSignupModal: () => void;
  handleAuthSuccess: () => void;
  authRedirectTo: string | null;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [authRedirectTo, setAuthRedirectTo] = useState<string | null>(null);

  const openLoginModal = useCallback((redirectTo?: string) => {
    setAuthRedirectTo(redirectTo ?? null);
    setIsSignupModalOpen(false);
    setIsLoginModalOpen(true);
  }, []);

  const openSignupModal = useCallback((redirectTo?: string) => {
    setAuthRedirectTo(redirectTo ?? null);
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
    setAuthRedirectTo(null);
  }, []);

  const closeSignupModal = useCallback(() => {
    setIsSignupModalOpen(false);
    setAuthRedirectTo(null);
  }, []);

  const handleAuthSuccess = useCallback(() => {
    const redirectTo = authRedirectTo || "/";
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(false);
    setAuthRedirectTo(null);
    router.push(redirectTo);
  }, [authRedirectTo, router]);

  return (
    <ModalContext.Provider
      value={{
        openLoginModal,
        closeLoginModal,
        openSignupModal,
        closeSignupModal,
        handleAuthSuccess,
        authRedirectTo,
      }}
    >
      {children}
      {isLoginModalOpen && <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />}
      {isSignupModalOpen && <SignupModal isOpen={isSignupModalOpen} onClose={closeSignupModal} />}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
