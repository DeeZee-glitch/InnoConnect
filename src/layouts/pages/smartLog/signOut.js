import React from "react";
import { useKeycloak } from "@react-keycloak/web";
import useAuth from "hooks/useAuth";
import { ReactKeycloakProvider } from "@react-keycloak/web";

const Signout = () => {
  const { keycloak } = useKeycloak();

  const handleLogout = () => {
    const logoutUrl = `${keycloak.authServerUrl}/realms/${keycloak.realm}/protocol/openid-connect/logout?post_logout_redirect_uri=${window.location.origin}`;
    keycloak.logout({
      redirectUri: window.location.origin,
    });
  };

  return (
    <div
      onClick={handleLogout}
      style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
    >
      <Icon fontSize="medium">Logout</Icon>
      <span>Signout</span>
    </div>
  );
};

export default Signout;
