/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
import { useEffect, useState, useRef } from "react";
import keycloak from "./keycloakInstance";
import { setToken } from "./keycloakService";

const useAuth = () => {
  const isRun = useRef(false);
  const [isLogin, setLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setTokenState] = useState("");

  // Avoid SSR issues and initialization during server-side rendering
  if (!keycloak) {
    console.warn("Keycloak is not initialized in SSR mode.");
    setLoading(false);
    return;
  }

  const logout = () => {
    localStorage.removeItem("token"); // Clear the token from local storage

    if (keycloak.authenticated) {
      keycloak.logout({
        redirectUri: "http://192.168.217.129:5555/InnoConnect", // Change the URL to your actual logout destination
        id_token_hint: keycloak.idToken, // Helps Keycloak properly end the session
      });
    }
  };

  useEffect(() => {
    const initializeKeycloak = async () => {
      try {
        // Initialize Keycloak instance
        const authenticated = await keycloak.init({
          onLoad: "login-required",
          checkLoginIframe: false,
        });

        setLogin(authenticated);
        setLoading(false);

        if (authenticated) {
          const newToken = keycloak.token;
          setTokenState(newToken);
          setToken(newToken); // Save in keycloakService

          keycloak.onAuthSuccess = () => {
            console.log("User logged in successfully");
            // Trigger widget layout reload here
          };

          keycloak.onAuthLogout = () => {
            console.log("User logged out, redirecting...");
            setLogin(false); // Ensure isLogin updates
            localStorage.removeItem("token");
            window.location.href = "http://192.168.217.129:5555/InnoConnect"; // Force full redirect
          };
          // Set up a token refresh check every 30 seconds
          const tokenRefreshInterval = setInterval(() => {
            if (keycloak.token && keycloak.isTokenExpired(30)) {
              // Refresh token if expiring within 30 seconds
              keycloak
                .updateToken(30)
                .then((refreshed) => {
                  if (refreshed) {
                    const refreshedToken = keycloak.token;
                    setTokenState(refreshedToken);
                    setToken(refreshedToken); // Save refreshed token
                    console.log("Token refreshed successfully");
                  }
                })
                .catch((err) => {
                  console.error("Failed to refresh token:", err);
                });
            }
          }, 10000); // Check every 10 seconds

          // Clear interval on unmount
          return () => clearInterval(tokenRefreshInterval);
        }
      } catch (err) {
        console.error("Keycloak initialization failed", err);
        setLoading(false);
      }
    };

    initializeKeycloak();
  }, []);

  return { isLogin, loading, token, logout }; // Return logout function
};

export default useAuth;
