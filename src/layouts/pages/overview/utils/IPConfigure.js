import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import MDButton from "components/MDButton";
import PropTypes from "prop-types";

function AddIPConfigPopup({ onAddIP }) {
  const [open, setOpen] = useState(false);
  const [ipAddress, setIpAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const authHeader = `Basic ${window.btoa(
    `${process.env.REACT_APP_AUTH_USER}:${process.env.REACT_APP_AUTH_PASS}`
  )}`;

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    handleReset();
  };

  const handleReset = () => {
    setIpAddress("");
    setFeedIsActive("TRUE");
  };

  const handleSave = async () => {
    if (!feedName || !feedIsActive) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);

    const apiUrl = `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider:ui/getIPs`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedName,
          feedIsActive,
        }),
      });

      if (response.ok) {
        const result = await response.json();

        onAddIP({
          feedName,
          isActive: feedIsActive === "TRUE",
          regiseterFeedId: result.regiseterFeedId || "temp-id-" + Date.now(),
        });

        alert(result.message || "Feed added successfully!");
        handleClose();
      } else {
        const error = await response.json();
        alert(error.message || "Failed to add the feed. Please try again.");
      }
    } catch (error) {
      console.error("Error saving feed:", error);
      alert("An error occurred while saving the feed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <MDButton variant="contained" color="info" onClick={handleOpen}>
        Add Configuration
      </MDButton>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add Configuration</DialogTitle>
        <DialogContent>
          <TextField
            label="select"
            variant="outlined"
            fullWidth
            margin="normal"
            value={feedName}
            onChange={(e) => setFeedName(e.target.value)}
          />
          <TextField
            label="Select Configure"
            variant="outlined"
            fullWidth
            margin="normal"
            InputProps={{
              style: { padding: "12px 10px" },
            }}
            select
            value={feedIsActive}
            onChange={(e) => setFeedIsActive(e.target.value)}
          >
            <MenuItem value="TRUE">TRUE</MenuItem>
            <MenuItem value="FALSE">FALSE</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleSave} variant="contained" color="info" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </MDButton>
          <MDButton onClick={handleReset} variant="outlined" color="secondary">
            Reset
          </MDButton>
          <MDButton onClick={handleClose} variant="outlined" color="error">
            Cancel
          </MDButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}

AddIPConfigPopup.propTypes = {
  onAddIP: PropTypes.func.isRequired,
};

export default AddIPConfigPopup;
