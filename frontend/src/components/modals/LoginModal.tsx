"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useModal } from "./ModalProvider";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { authAPI } from "@/lib/api";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const { closeLoginModal, openSignupModal } = useModal();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(formData.email, formData.password);
      login(response.access_token, response.user);
      addToast(`Welcome back, ${response.user.name}!`, "success");
      closeLoginModal();
      router.push("/");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      const errorMessage = error?.response?.data?.detail || "Login failed. Please try again.";
      addToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const switchToSignup = () => {
    closeLoginModal();
    openSignupModal();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-outline-variant bg-surface-container-lowest p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant transition-colors hover:text-on-surface"
            aria-label="Close login modal"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Welcome back
          </h1>
          <p className="text-base/6 text-on-surface-variant">
            Sign in to manage your rail journeys and bookings.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface">
              Email or Username
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined pointer-events-none absolute left-4 text-xl text-outline">
                person
              </span>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 pl-12 text-base text-on-surface outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-on-primary-fixed-variant no-underline transition-opacity hover:opacity-80"
                onClick={onClose}
              >
                Forgot Password?
              </Link>
            </div>

            <div className="relative flex items-center">
              <span className="material-symbols-outlined pointer-events-none absolute left-4 text-xl text-outline">
                lock
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 pl-12 pr-12 text-base text-on-surface outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 flex items-center justify-center text-outline"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <span className="material-symbols-outlined text-xl">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary px-8 py-4 text-sm font-bold uppercase tracking-wider text-on-primary transition-all hover:bg-primary-container hover:text-on-primary-container active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </div>

          <div className="relative flex items-center py-4">
            <div className="h-px flex-1 bg-outline-variant" />
            <span className="mx-4 flex-shrink-0 text-sm text-outline">
              or continue with
            </span>
            <div className="h-px flex-1 bg-outline-variant" />
          </div>

     
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 transition-all hover:bg-surface-container"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
                Google
              </span>
            </button>


          <div className="mt-2 border-t border-outline-variant pt-2 text-center">
            <p className="m-0 text-sm text-on-surface-variant">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={switchToSignup}
                className="cursor-pointer border-none bg-transparent font-semibold text-primary hover:underline"
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