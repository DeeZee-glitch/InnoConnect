/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */

// keycloakService.js

const TOKEN_KEY = "authToken";

const storage = localStorage;
// Set the token and persist it in localStorage
export const setToken = (newToken) => {
  if (newToken) {
    storage.setItem(TOKEN_KEY, newToken); //
    console.log("Tokenwaa::", TOKEN_KEY);
  } else {
    storage.removeItem(TOKEN_KEY); // Clear token if null/undefined
  }
};

// Retrieve the token from localStorage
export const getToken = () => {
  return storage.getItem(TOKEN_KEY);
};
