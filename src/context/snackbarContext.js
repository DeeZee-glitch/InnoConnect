import React, { createContext, useState, useContext } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import PropTypes from "prop-types";

const SnackbarContext = createContext();

export const SnackbarProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info", // Valid options: info, success, warning, error
  });

  const showSnackbar = (message, severity = "info") => {
    // Validate severity
    const validSeverities = ["info", "success", "warning", "error"];
    if (!validSeverities.includes(severity)) {
      console.warn(`Invalid severity "${severity}". Defaulting to "info".`);
      severity = "info";
    }
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar, closeSnackbar, snackbar }}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ "& .MuiSnackbarContent-root": { fontSize: "1.2rem" } }}
        aria-live="assertive"
        aria-label="Notification"
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          sx={{
            fontSize: "1.3rem",
            padding: "16px",
            minWidth: "300px",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

SnackbarProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};
