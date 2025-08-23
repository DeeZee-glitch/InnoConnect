import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MDButton from "components/MDButton"; // Custom Material-UI button

function ConfirmationDialog({ open, onClose, onConfirm }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        Are you sure you want to delete this feed? This action cannot be undone.
      </DialogContent>
      <DialogActions>
        <MDButton variant="contained" color="error" onClick={onConfirm}>
          Delete
        </MDButton>
        <MDButton variant="outlined" color="secondary" onClick={onClose}>
          Cancel
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmationDialog;
