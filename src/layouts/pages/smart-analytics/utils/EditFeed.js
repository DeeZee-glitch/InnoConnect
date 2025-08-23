import React, { useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import PropTypes from "prop-types";
import MDButton from "components/MDButton";
import MDBox from "components/MDBox";

function EditFeed({ feedId, feedName, feedIsActive, onEditSuccess }) {
  const [isEditing, setIsEditing] = useState(false);
  const [updatedFeedName, setUpdatedFeedName] = useState(feedName);
  const [updatedFeedIsActive, setUpdatedFeedIsActive] = useState(
    feedIsActive === true || feedIsActive === "TRUE"
  );

  useEffect(() => {
    // Ensure the state is initialized correctly when feedIsActive prop changes
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
    const apiUrl = `http://localhost:5555/feed/feed`;

    // Ensure that the value for isActive is either "TRUE" or "FALSE"
    const feedIsActiveString = updatedFeedIsActive ? "TRUE" : "FALSE";

    try {
      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          Authorization: basicAuth,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedId,
          feedName: updatedFeedName,
          feedIsActive: feedIsActiveString, // Send as string "TRUE" or "FALSE"
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || "Feed updated successfully!");
        setIsEditing(false);

        // Notify parent component to update the UI
        if (onEditSuccess) {
          onEditSuccess(feedId, updatedFeedName, feedIsActiveString);
        }
      } else {
        alert("Failed to update feed. Please try again.");
      }
    } catch (error) {
      console.error("Error updating feed:", error);
      alert("An error occurred while updating the feed. Please try again.");
    }
  };

  return isEditing ? (
    <>
      {/* Feed Name Column */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <TextField
          label="Feed Name"
          value={updatedFeedName}
          onChange={(e) => setUpdatedFeedName(e.target.value)}
          size="small"
        />
      </div>

      {/* Is Active Column */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Switch
          checked={updatedFeedIsActive}
          onChange={(e) => setUpdatedFeedIsActive(e.target.checked)} // Update state on toggle
          color="primary"
        />
      </div>

      {/* Action Column */}
      <MDBox display="flex" justifyContent="space-evenly" alignItems="center" gap={2}>
        <MDButton variant="contained" color="success" size="small" onClick={handleSubmit}>
          Submit
        </MDButton>
        <MDButton variant="outlined" color="secondary" size="small" onClick={handleCancel}>
          Cancel
        </MDButton>
      </MDBox>
    </>
  ) : (
    <IconButton color="info" onClick={handleEditClick}>
      <EditIcon />
    </IconButton>
  );
}

// PropTypes validation
EditFeed.propTypes = {
  feedId: PropTypes.string.isRequired,
  feedName: PropTypes.string.isRequired,
  feedIsActive: PropTypes.oneOf([true, false, "TRUE", "FALSE"]).isRequired,
  onEditSuccess: PropTypes.func.isRequired,
};

export default EditFeed;
