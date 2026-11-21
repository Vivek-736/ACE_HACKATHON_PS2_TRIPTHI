"use client";

import { useEffect, useState } from "react";

interface GoogleMapsLoadState {
  isLoaded: boolean;
  loadError: string | null;
}

let isScriptLoading = false;
let scriptLoadPromise: Promise<void> | null = null;

// Helper to check if Google Maps constructor is truly available
function isGoogleMapsReady(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.google !== "undefined" &&
    typeof window.google.maps !== "undefined" &&
    typeof window.google.maps.Map === "function"
  );
}

export function useGoogleMaps(): GoogleMapsLoadState {
  const [state, setState] = useState<GoogleMapsLoadState>(() => {
    if (isGoogleMapsReady()) {
      return { isLoaded: true, loadError: null };
    }
    return { isLoaded: false, loadError: null };
  });

  useEffect(() => {
    // If already fully ready on window
    if (isGoogleMapsReady()) {
      setState({ isLoaded: true, loadError: null });
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (
      !apiKey ||
      apiKey === "your-google-maps-api-key" ||
      apiKey.trim() === ""
    ) {
      setState({
        isLoaded: false,
        loadError: "MISSING_KEY",
      });
      return;
    }

    if (!scriptLoadPromise) {
      isScriptLoading = true;
      scriptLoadPromise = new Promise<void>((resolve, reject) => {
        // Global callback for Google Maps
        const CALLBACK_NAME = "__initTriptiGoogleMaps";

        const completeLoad = async () => {
          try {
            // If dynamic importLibrary is available in modern Maps API, ensure libraries are imported
            if (
              window.google?.maps?.importLibrary &&
              typeof window.google.maps.importLibrary === "function"
            ) {
              await Promise.all([
                window.google.maps.importLibrary("maps"),
                window.google.maps.importLibrary("routes"),
                window.google.maps.importLibrary("marker"),
              ]);
            }

            // Verify constructor is ready
            let attempts = 0;
            const checkConstructor = () => {
              if (isGoogleMapsReady()) {
                isScriptLoading = false;
                resolve();
              } else if (attempts < 20) {
                attempts++;
                setTimeout(checkConstructor, 50);
              } else {
                isScriptLoading = false;
                scriptLoadPromise = null;
                reject(new Error("CONSTRUCTOR_UNAVAILABLE"));
              }
            };

            checkConstructor();
          } catch (err) {
            isScriptLoading = false;
            scriptLoadPromise = null;
            reject(err);
          }
        };

        // Attach global callback to window
        (window as unknown as Record<string, unknown>)[CALLBACK_NAME] = () => {
          completeLoad();
        };

        // Catch authentication errors emitted by Google Maps
        (window as unknown as { gm_authFailure?: () => void }).gm_authFailure =
          () => {
            setState({
              isLoaded: false,
              loadError: "AUTH_FAILURE",
            });
          };

        // Check if script tag is already in DOM
        const existingScript = document.querySelector(
          'script[src*="maps.googleapis.com/maps/api/js"]'
        );

        if (existingScript) {
          if (isGoogleMapsReady()) {
            resolve();
          } else {
            existingScript.addEventListener("load", () => completeLoad());
            existingScript.addEventListener("error", () =>
              reject(new Error("Failed to load Google Maps script"))
            );
          }
          return;
        }

        const script = document.createElement("script");
        // Use callback parameter so Google Maps only notifies us once fully initialized
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry,marker&callback=${CALLBACK_NAME}`;
        script.async = true;
        script.defer = true;
        script.id = "google-maps-sdk";

        script.onerror = () => {
          isScriptLoading = false;
          scriptLoadPromise = null;
          reject(new Error("NETWORK_ERROR"));
        };

        document.head.appendChild(script);
      });
    }

    scriptLoadPromise
      .then(() => {
        setState({ isLoaded: true, loadError: null });
      })
      .catch((err: Error) => {
        setState({
          isLoaded: false,
          loadError: err.message || "LOAD_FAILED",
        });
      });
  }, []);

  return state;
}
