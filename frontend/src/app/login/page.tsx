"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useModal } from "@/components/modals/ModalProvider";

export default function LoginPage() {
  const router = useRouter();
  const { openLoginModal } = useModal();
  const { isLoggedIn, loading } = useAuth();

  useEffect(() => {
    // If already logged in, redirect to home
    if (!loading && isLoggedIn) {
      router.push("/");
      return;
    }

    // Open the login modal when page is accessed directly
    if (!loading) {
      openLoginModal();
    }
  }, [isLoggedIn, loading, openLoginModal, router]);

  return null;
}
