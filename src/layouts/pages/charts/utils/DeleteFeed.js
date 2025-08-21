import React from "react";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import PropTypes from "prop-types";

function DeleteFeed({ feedId, onDeleteSuccess }) {
  const handleDelete = async () => {
    if (!feedId) return;

    const confirmDelete = window.confirm("Are you sure you want to delete this feed?");
    if (!confirmDelete) return;

    const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    const apiUrl = `${process.env.REACT_APP_API_URL}http://localhost:5555/feed/feed`;

    try {
      const response = await fetch(apiUrl, {
        method: "DELETE",
        headers: {
          Authorization: basicAuth,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedId }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || "Feed deleted successfully!");

        // Notify the parent component to update the UI
        if (onDeleteSuccess) {
          onDeleteSuccess(feedId);
        }
      } else {
        const result = await response.json();
        alert(result.message || "Failed to delete feed. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting feed:", error);
      alert("An error occurred while deleting the feed. Please try again.");
    }
  };

  return (
    <IconButton color="secondary" onClick={handleDelete}>
      <DeleteIcon />
    </IconButton>
  );
}

// PropTypes validation
DeleteFeed.propTypes = {
  feedId: PropTypes.string.isRequired,
  onDeleteSuccess: PropTypes.func.isRequired,
};

export default DeleteFeed;
