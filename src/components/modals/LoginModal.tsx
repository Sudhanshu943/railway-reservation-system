"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useModal } from "./ModalProvider";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const { closeLoginModal, openSignupModal } = useModal();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
    router.push("/");
  };

  const switchToSignup = () => {
    closeLoginModal();
    openSignupModal();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg w-full max-w-[440px] p-[var(--spacing-stack-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
            aria-label="Close login modal"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Welcome Section */}
        <div className="flex flex-col gap-[var(--spacing-stack-sm)] mb-[var(--spacing-stack-lg)]">
          <h1 className="text-headline-lg font-bold text-primary">
            Welcome back
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Sign in to manage your rail journeys and bookings.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-[var(--spacing-stack-md)]">
          {/* Email Field */}
          <div className="flex flex-col gap-2">
            <label className="text-label-bold font-bold text-on-surface block">
              Email or Username
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-outline text-[20px] pointer-events-none">
                person
              </span>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-3 bg-surface border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-body-md"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-label-bold font-bold text-on-surface block">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-label-md text-on-primary-fixed-variant no-underline transition-opacity hover:opacity-80"
                onClick={onClose}
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-outline text-[20px] pointer-events-none">
                lock
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-12 py-3 bg-surface border border-outline-variant rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-body-md"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 bg-none border-none cursor-pointer flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-outline text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-[var(--spacing-stack-sm)]">
            <button
              type="submit"
              className="w-full bg-primary text-on-primary py-4 px-[var(--spacing-stack-lg)] text-label-bold font-bold rounded hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-95"
            >
              Login
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center py-[var(--spacing-stack-md)] relative">
            <div className="flex-1 h-[1px] bg-outline-variant"></div>
            <span className="flex-shrink-0 mx-4 text-label-md text-outline">
              or continue with
            </span>
            <div className="flex-1 h-[1px] bg-outline-variant"></div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-[var(--spacing-stack-md)]">
            <button
              type="button"
              className="flex items-center justify-center gap-[var(--spacing-stack-sm)] border border-outline-variant py-3 px-[var(--spacing-stack-md)] rounded bg-surface-container-lowest hover:bg-surface-container transition-all cursor-pointer"
            >
              <span className="text-label-bold font-bold text-on-surface">
                Google
              </span>
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-[var(--spacing-stack-sm)] border border-outline-variant py-3 px-[var(--spacing-stack-md)] rounded bg-surface-container-lowest hover:bg-surface-container transition-all cursor-pointer"
            >
              <span className="text-label-bold font-bold text-on-surface">
                Apple
              </span>
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-[var(--spacing-stack-sm)] pt-[var(--spacing-stack-sm)] border-t border-outline-variant">
            <p className="text-body-sm text-on-surface-variant m-0">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={switchToSignup}
                className="text-primary font-semibold hover:underline bg-none border-none cursor-pointer"
              >
                Sign up
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
