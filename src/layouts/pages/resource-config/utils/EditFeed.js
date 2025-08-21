import React, { useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import TextField from "@mui/material/TextField";
import PropTypes from "prop-types";
import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";

function EditFeed({ connectionName, feedName, feedIsActive, onEditSuccess }) {
  const [isEditing, setIsEditing] = useState(false);
  const [updatedFeedName, setUpdatedFeedName] = useState(feedName);
  const [updatedFeedIsActive, setUpdatedFeedIsActive] = useState(
    feedIsActive === true || feedIsActive === "TRUE"
  );

  useEffect(() => {
    setUpdatedFeedIsActive(feedIsActive === true || feedIsActive === "TRUE");
  }, [feedIsActive]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setUpdatedFeedName(feedName); // Revert to original values
    setUpdatedFeedIsActive(feedIsActive === true || feedIsActive === "TRUE");
  };

  const handleSubmit = async () => {
    const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    const apiUrl = `${process.env.REACT_APP_API_URL}http://172.20.150.134:5555/feed/feed`;

    const feedIsActiveString = updatedFeedIsActive ? "TRUE" : "FALSE";

    try {
      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          Authorization: basicAuth,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          connectionName,
          feedName: updatedFeedName,
          feedIsActive: feedIsActiveString,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || "Feed updated successfully!");
        setIsEditing(false);

        // Trigger parent callback to refresh feed data
        if (onEditSuccess) {
          onEditSuccess(); // No need to pass parameters; let the parent trigger fetchData
        }
      } else {
        alert("Failed to update feed. Please try again.");
      }
    } catch (error) {
      console.error("Error updating feed:", error);
      alert("An error occurred while updating the feed. Please try again.");
    }
  };

  return (
    <>
      <IconButton color="info" onClick={handleEditClick}>
        <EditIcon />
      </IconButton>

      <Dialog
        open={isEditing}
        onClose={handleCancel}
        maxWidth="sm" // You can change this to 'lg' for a larger size
        fullWidth={true} // Ensures the dialog takes up the full width available
      >
        <DialogTitle>Edit Feed</DialogTitle>
        <DialogContent>
          {/* Feed Name Column */}
          <TextField
            label="Feed Name"
            value={updatedFeedName}
            onChange={(e) => setUpdatedFeedName(e.target.value)}
            size="small"
            fullWidth
            margin="dense"
          />

          {/* Is Active Column */}
          <FormControl
            fullWidth
            size="small"
            margin="dense"
            InputProps={{
              style: { padding: "12px 10px" },
            }}
          >
            <TextField
              label="Is Active"
              name="isActive"
              value={updatedFeedIsActive ? "TRUE" : "FALSE"}
              onChange={(e) => setUpdatedFeedIsActive(e.target.value === "TRUE")}
              select
              fullWidth
              margin="dense"
              InputProps={{
                style: { padding: "12px 10px" },
              }}
            >
              <MenuItem value="FALSE">FALSE</MenuItem>
              <MenuItem value="TRUE">TRUE</MenuItem>
            </TextField>
          </FormControl>
        </DialogContent>

        <DialogActions>
          <MDButton variant="contained" color="info" size="small" onClick={handleSubmit}>
            Update
          </MDButton>
          <MDButton variant="outlined" color="secondary" size="small" onClick={handleCancel}>
            Cancel
          </MDButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

// PropTypes validation
EditFeed.propTypes = {
  connectionName: PropTypes.string.isRequired,
  feedName: PropTypes.string.isRequired,
  feedIsActive: PropTypes.oneOf([true, false, "TRUE", "FALSE"]).isRequired,
  onEditSuccess: PropTypes.func.isRequired, // Callback to trigger feed data refresh
};

export default EditFeed;
