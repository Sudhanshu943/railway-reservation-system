"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useModal } from "@/components/modals/ModalProvider";

export default function SignupPage() {
  const router = useRouter();
  const { openSignupModal } = useModal();
  const { isLoggedIn, loading } = useAuth();

  useEffect(() => {
    // If already logged in, redirect to home
    if (!loading && isLoggedIn) {
      router.push("/");
      return;
    }

    // Open the signup modal when page is accessed directly
    if (!loading) {
      openSignupModal();
    }
  }, [isLoggedIn, loading, openSignupModal, router]);

  return null;
}
