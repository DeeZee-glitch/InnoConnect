import React from "react";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import PropTypes from "prop-types";

function DeleteMonitor({ feedId, auditId, onDeleteSuccess }) {
  const handleDelete = async () => {
    if (!feedId || !auditId) {
      alert("Feed ID and Audit ID are required to delete the monitor.");
      return;
    }

    const confirmDelete = window.confirm("Are you sure you want to delete this monitor?");
    if (!confirmDelete) return;

    const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    const apiUrl = `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider.monitor_.resources.feed:monitor/feed/monitor`;

    try {
      const response = await fetch(apiUrl, {
        method: "DELETE",
        headers: {
          Authorization: basicAuth,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedId, auditId }), // Send both feedId and auditId
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || "Monitor deleted successfully!");

        // Notify the parent component to update the UI
        if (onDeleteSuccess) {
          onDeleteSuccess(feedId, auditId);
        }
      } else {
        const result = await response.json();
        alert(result.message || "Failed to delete monitor. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting monitor:", error);
      alert("An error occurred while deleting the monitor. Please try again.");
    }
  };

  return (
    <IconButton color="secondary" onClick={handleDelete}>
      <DeleteIcon />
    </IconButton>
  );
}

// PropTypes validation
DeleteMonitor.propTypes = {
  feedId: PropTypes.string.isRequired,
  auditId: PropTypes.string.isRequired,
  onDeleteSuccess: PropTypes.func.isRequired,
};

export default DeleteMonitor;
