"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useModal } from "@/components/modals/ModalProvider";

export default function LoginPage() {
  const router = useRouter();
  const { openLoginModal } = useModal();

  useEffect(() => {
    // Open the login modal when page is accessed directly
    openLoginModal();
    // Redirect to home after a short delay
    const timer = setTimeout(() => {
      router.push("/");
    }, 100);

    return () => clearTimeout(timer);
  }, [openLoginModal, router]);

  return null;
}
