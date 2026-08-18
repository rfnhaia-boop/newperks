"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type GoogleCredentialResponse = { credential?: string };
type GooglePromptMoment = {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
};
type GoogleIdentityApi = {
  initialize: (options: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void;
  prompt: (callback?: (moment: GooglePromptMoment) => void) => void;
};

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleIdentityApi } };
  }
}

type Options = {
  onCredential: (idToken: string) => void | Promise<void>;
  onError: (message: string) => void;
};

export function useGoogleIdTokenLogin({ onCredential, onError }: Options) {
  const handlers = useRef({ onCredential, onError });
  handlers.current = { onCredential, onError };
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    if (document.getElementById("google-identity-script")) {
      setPronto(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "google-identity-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setPronto(true);
    document.head.appendChild(script);
  }, []);

  return useCallback(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
    const identity = window.google?.accounts?.id;
    if (!clientId) {
      handlers.current.onError("Login com Google não está configurado.");
      return;
    }
    if (!pronto || !identity) {
      handlers.current.onError("Login com Google ainda não carregou. Tente de novo em instantes.");
      return;
    }

    identity.initialize({
      client_id: clientId,
      callback: (response) => {
        if (!response.credential) {
          handlers.current.onError("Não foi possível obter a credencial do Google.");
          return;
        }
        void handlers.current.onCredential(response.credential);
      },
    });
    identity.prompt((moment) => {
      if (moment.isNotDisplayed() || moment.isSkippedMoment()) {
        handlers.current.onError("Não foi possível abrir o Google Login. Verifique os cookies e tente de novo.");
      }
    });
  }, [pronto]);
}
