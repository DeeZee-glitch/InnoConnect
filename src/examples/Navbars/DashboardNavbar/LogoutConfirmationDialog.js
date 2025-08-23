import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

const LogoutConfirmationDialog = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirm Logout</DialogTitle>
      <DialogContent>
        <MDTypography variant="h7">
          Are you sure you want to <strong>logout</strong>?
        </MDTypography>
      </DialogContent>
      <DialogActions>
        <MDButton onClick={onClose} color="secondary">
          Cancel
        </MDButton>
        <MDButton onClick={onConfirm} color="error">
          Yes, Logout
        </MDButton>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutConfirmationDialog;
