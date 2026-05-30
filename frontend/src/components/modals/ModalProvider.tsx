"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";

interface ModalContextType {
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openSignupModal: () => void;
  closeSignupModal: () => void;
  handleAuthSuccess: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  const handleAuthSuccess = useCallback(() => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(false);
    router.push("/");
  }, [router]);

  return (
    <ModalContext.Provider
      value={{
        openLoginModal: () => setIsLoginModalOpen(true),
        closeLoginModal: () => setIsLoginModalOpen(false),
        openSignupModal: () => setIsSignupModalOpen(true),
        closeSignupModal: () => setIsSignupModalOpen(false),
        handleAuthSuccess,
      }}
    >
      {children}
      {isLoginModalOpen && <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />}
      {isSignupModalOpen && <SignupModal isOpen={isSignupModalOpen} onClose={() => setIsSignupModalOpen(false)} />}
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
