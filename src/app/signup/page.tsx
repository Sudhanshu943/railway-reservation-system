"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useModal } from "@/components/modals/ModalProvider";

export default function SignupPage() {
  const router = useRouter();
  const { openSignupModal } = useModal();

  useEffect(() => {
    // Open the signup modal when page is accessed directly
    openSignupModal();
    // Redirect to home after a short delay
    const timer = setTimeout(() => {
      router.push("/");
    }, 100);

    return () => clearTimeout(timer);
  }, [openSignupModal, router]);

  return null;
}
