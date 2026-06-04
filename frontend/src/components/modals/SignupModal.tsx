"use client";

import { useState, useCallback } from "react";
import { useModal } from "./ModalProvider";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { authAPI } from "@/lib/api";
import { CredentialResponse } from "@react-oauth/google";
import GoogleCredentialButton from "@/components/GoogleCredentialButton";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignupModal({ isOpen, onClose }: SignupModalProps) {
  const { closeSignupModal, openLoginModal, handleAuthSuccess, authRedirectTo } = useModal();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (formData.password !== formData.confirmPassword) {
      addToast("Passwords do not match", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      login(response.access_token, response.refresh_token, response.user);
      addToast(`Welcome, ${response.user.name}! Account created successfully.`, "success");
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      handleAuthSuccess();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      const errorMessage = error?.response?.data?.detail || "Signup failed. Please try again.";
      addToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

   const handleGoogleSuccess = useCallback(async (credentialResponse: CredentialResponse) => {
     if (!credentialResponse.credential) {
       addToast("Google signup failed", "error");
       return;
     }
     setLoading(true);
     try {
       const response = await authAPI.googleLogin(credentialResponse.credential);
      login(response.access_token, response.refresh_token, response.user);
       addToast(`Welcome, ${response.user.name}!`, "success");
       setFormData({ name: "", email: "", password: "", confirmPassword: "" });
       handleAuthSuccess();
     } catch (err: unknown) {
       const error = err as { response?: { data?: { detail?: string } } };
       const errorMessage = error?.response?.data?.detail || "Google signup failed. Please try again.";
       addToast(errorMessage, "error");
     } finally {
       setLoading(false);
     }
   }, [login, addToast, handleAuthSuccess]);

   const handleGoogleError = useCallback(() => {
     addToast("Google signup failed", "error");
   }, [addToast]);

  const switchToLogin = () => {
    openLoginModal(authRedirectTo || undefined);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => {
              closeSignupModal();
              onClose();
            }}
            className="cursor-pointer text-slate-500 transition-colors hover:text-slate-900"
            aria-label="Close signup modal"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Create Account
          </h1>
          <p className="text-base/6 text-slate-600">
            Join us and start booking your rail journeys today.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
              Full Name
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined pointer-events-none absolute left-4 text-xl text-slate-400">
                person
              </span>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pl-12 text-base text-slate-900 outline-none transition-all focus:border-sky-700 focus:ring-1 focus:ring-sky-700"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
              Email
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined pointer-events-none absolute left-4 text-xl text-slate-400">
                mail
              </span>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pl-12 text-base text-slate-900 outline-none transition-all focus:border-sky-700 focus:ring-1 focus:ring-sky-700"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
              Password
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined pointer-events-none absolute left-4 text-xl text-slate-400">
                lock
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pl-12 pr-12 text-base text-slate-900 outline-none transition-all focus:border-sky-700 focus:ring-1 focus:ring-sky-700"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 flex items-center justify-center text-slate-400"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <span className="material-symbols-outlined text-xl">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
              Confirm Password
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined pointer-events-none absolute left-4 text-xl text-slate-400">
                lock
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pl-12 pr-12 text-base text-slate-900 outline-none transition-all focus:border-sky-700 focus:ring-1 focus:ring-sky-700"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 flex items-center justify-center text-slate-400"
                aria-label={
                  showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                }
              >
                <span className="material-symbols-outlined text-xl">
                  {showConfirmPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 px-8 py-4 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-slate-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </div>

          {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
            <>
              <div className="relative flex items-center py-4">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="mx-4 shrink-0 text-sm text-slate-400">
                  or continue with
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <GoogleCredentialButton
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                text="signup_with"
              />
            </>
          )}

          <div className="mt-2 border-t border-slate-200 pt-2 text-center">
            <p className="m-0 text-sm text-slate-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={switchToLogin}
                className="cursor-pointer border-none bg-transparent font-semibold text-sky-800 hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
