/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
import Keycloak from "keycloak-js";

const isBrowser = typeof window !== "undefined";

const keycloak = isBrowser
  ? new Keycloak({
      url: "http://192.168.217.129:9898",
      realm: "InnoConnect",
      clientId: "InnoConnect_Client",
    })
  : null;

export default keycloak;
