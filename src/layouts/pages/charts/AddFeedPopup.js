import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import MDButton from "components/MDButton";
import PropTypes from "prop-types";

function AddFeedPopup({ onAddFeed }) {
  const [open, setOpen] = useState(false);
  const [feedName, setFeedName] = useState("");
  const [feedIsActive, setFeedIsActive] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    handleReset();
  };

  const handleReset = () => {
    setFeedName("");
    setFeedIsActive("");
  };

  const handleSave = async () => {
    if (!feedName || !feedIsActive) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    const apiUrl = `${process.env.REACT_APP_API_URL}/feed/feed`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: basicAuth,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedName: feedName,
          feedIsActive: feedIsActive,
        }),
      });

      if (response.ok) {
        const result = await response.json();

        onAddFeed({
          feedName,
          isActive: feedIsActive === "TRUE",
          regiseterFeedId: result.regiseterFeedId || "temp-id-" + Date.now(), // Fallback ID
        });

        alert(result.message || "Feed added successfully!");
        handleClose();
      } else {
        const error = await response.json();
        console.error("Error response from API:", error); // Debugging
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
        Add Feed
      </MDButton>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add Feed</DialogTitle>
        <DialogContent>
          <TextField
            label="Feed Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={feedName}
            onChange={(e) => setFeedName(e.target.value)}
          />
          <TextField
            label="Active"
            variant="outlined"
            fullWidth
            margin="normal"
            select
            value={feedIsActive}
            onChange={(e) => {
              setFeedIsActive(e.target.value);
            }}
            InputProps={{
              style: { padding: "12px 10px" },
            }}
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

AddFeedPopup.propTypes = {
  onAddFeed: PropTypes.func.isRequired,
};

export default AddFeedPopup;
