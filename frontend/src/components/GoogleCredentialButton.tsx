"use client";

import { useEffect, useRef } from "react";
import { CredentialResponse, useGoogleOAuth } from "@react-oauth/google";

interface GoogleCredentialButtonProps {
  text: "signin_with" | "signup_with";
  onSuccess: (credentialResponse: CredentialResponse) => void;
  onError: () => void;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (options: {
            client_id: string;
            callback: (credentialResponse: CredentialResponse) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              size: "large";
              text: "signin_with" | "signup_with";
              type: "standard";
              theme: "outline";
            }
          ) => void;
        };
      };
    };
    railLinkGoogleAuth?: {
      clientId?: string;
      onSuccess?: (credentialResponse: CredentialResponse) => void;
      onError?: () => void;
    };
  }
}

export default function GoogleCredentialButton({
  text,
  onSuccess,
  onError,
}: GoogleCredentialButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const { clientId, scriptLoadedSuccessfully } = useGoogleOAuth();

  useEffect(() => {
    if (!scriptLoadedSuccessfully || !clientId || !buttonRef.current) return;

    const googleId = window.google?.accounts?.id;
    if (!googleId) return;

    window.railLinkGoogleAuth ??= {};
    window.railLinkGoogleAuth.onSuccess = onSuccess;
    window.railLinkGoogleAuth.onError = onError;

    if (window.railLinkGoogleAuth.clientId !== clientId) {
      googleId.initialize({
        client_id: clientId,
        callback: (credentialResponse) => {
          if (!credentialResponse.credential) {
            window.railLinkGoogleAuth?.onError?.();
            return;
          }
          window.railLinkGoogleAuth?.onSuccess?.(credentialResponse);
        },
      });
      window.railLinkGoogleAuth.clientId = clientId;
    }

    buttonRef.current.replaceChildren();
    googleId.renderButton(buttonRef.current, {
      size: "large",
      text,
      type: "standard",
      theme: "outline",
    });
  }, [clientId, onError, onSuccess, scriptLoadedSuccessfully, text]);

  return <div ref={buttonRef} className="flex justify-center" />;
}
