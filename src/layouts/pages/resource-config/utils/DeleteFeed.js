import React from "react";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import PropTypes from "prop-types";

function DeleteFeed({ connectionName, onDeleteSuccess }) {
  const handleDelete = async () => {
    if (!connectionName) return;

    const confirmDelete = window.confirm("Are you sure you want to delete this resource?");
    if (!confirmDelete) return;

    const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    const apiUrl = `${process.env.REACT_APP_API_URL}http://localhost:5555/restv2/BInRestInterface.restful.provider:ui/resource/register`;

    try {
      const response = await fetch(apiUrl, {
        method: "DELETE",
        headers: {
          Authorization: basicAuth,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ connectionName }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || "Feed deleted successfully!");

        // Notify the parent component to update the UI
        if (onDeleteSuccess) {
          onDeleteSuccess(connectionName);
        }
      } else {
        const result = await response.json();
        alert(result.message || "Failed to delete resource. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
      alert("An error occurred while deleting the resource. Please try again.");
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
  connectionName: PropTypes.string.isRequired,
  onDeleteSuccess: PropTypes.func.isRequired,
};

export default DeleteFeed;
