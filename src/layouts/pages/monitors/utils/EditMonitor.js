import React, { useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import TextField from "@mui/material/TextField";
import PropTypes from "prop-types";
import MDButton from "components/MDButton";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";

function EditMonitor({
  feedId,
  auditId, // Added this field to support API body
  auditSystemName,
  auditDescription,
  measure,
  measureFieldPath,
  chronoFieldFormat,
  chronoFieldPath,
  onEditSuccess,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [updatedAuditSystemName, setUpdatedAuditSystemName] = useState(auditSystemName);
  const [updatedAuditDescription, setUpdatedAuditDescription] = useState(auditDescription);
  const [updatedMeasure, setUpdatedMeasure] = useState(measure);
  const [updatedMeasureFieldPath, setUpdatedMeasureFieldPath] = useState(measureFieldPath);
  const [updatedChronoFieldFormat, setUpdatedChronoFieldFormat] = useState(chronoFieldFormat);
  const [updatedChronoFieldPath, setUpdatedChronoFieldPath] = useState(chronoFieldPath);

  const authHeader = `Basic ${window.btoa(
    `${process.env.REACT_APP_AUTH_USER}:${process.env.REACT_APP_AUTH_PASS}`
  )}`;
  // Reset state when props change
  useEffect(() => {
    setUpdatedAuditSystemName(auditSystemName);
    setUpdatedAuditDescription(auditDescription);
    setUpdatedMeasure(measure);
    setUpdatedMeasureFieldPath(measureFieldPath);
    setUpdatedChronoFieldFormat(chronoFieldFormat);
    setUpdatedChronoFieldPath(chronoFieldPath);
  }, [
    auditSystemName,
    auditDescription,
    measure,
    measureFieldPath,
    chronoFieldFormat,
    chronoFieldPath,
  ]);

  const handleEditClick = () => {
    console.log("Edit button clicked");
    setIsEditing(true);
  };

  const handleCancel = () => {
    console.log("Edit cancelled");
    setIsEditing(false);
    setUpdatedAuditSystemName(auditSystemName);
    setUpdatedAuditDescription(auditDescription);
    setUpdatedMeasure(measure);
    setUpdatedMeasureFieldPath(measureFieldPath);
    setUpdatedChronoFieldFormat(chronoFieldFormat);
    setUpdatedChronoFieldPath(chronoFieldPath);
  };

  const handleSubmit = async () => {
    const apiUrl = `${process.env.REACT_APP_API_URL}/monitor/feed/monitor`;
    //const basicAuth = "Basic " + btoa("Administrator:manageaudit");

    try {
      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedId,
          auditId, // Include auditId
          auditSystemName: updatedAuditSystemName,
          auditDescription: updatedAuditDescription,
          measure: updatedMeasure,
          measureFieldPath: updatedMeasureFieldPath,
          chronoFieldFormat: updatedChronoFieldFormat,
          chronoFieldPath: updatedChronoFieldPath,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Update successful:", result);
        alert(result.message || "Feed updated successfully!");
        setIsEditing(false);
        if (onEditSuccess) onEditSuccess();
      } else {
        const error = await response.json();
        console.error("Update failed:", error);
        alert(error.message || "Failed to update feed. Please try again.");
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

      <Dialog open={isEditing} onClose={handleCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Feed</DialogTitle>
        <DialogContent>
          <TextField
            label="Audit System Name"
            value={updatedAuditSystemName}
            onChange={(e) => setUpdatedAuditSystemName(e.target.value)}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Audit Description"
            value={updatedAuditDescription}
            onChange={(e) => setUpdatedAuditDescription(e.target.value)}
            fullWidth
            margin="dense"
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Measure</InputLabel>
            <Select
              value={updatedMeasure}
              onChange={(e) => setUpdatedMeasure(e.target.value)}
              label="Measure"
            >
              <MenuItem value="Transaction">Transaction</MenuItem>
              <MenuItem value="Identity">Identity</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Measure Field Path"
            value={updatedMeasureFieldPath}
            onChange={(e) => setUpdatedMeasureFieldPath(e.target.value)}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Chrono Field Format"
            value={updatedChronoFieldFormat}
            onChange={(e) => setUpdatedChronoFieldFormat(e.target.value)}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Chrono Field Path"
            value={updatedChronoFieldPath}
            onChange={(e) => setUpdatedChronoFieldPath(e.target.value)}
            fullWidth
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <MDButton variant="contained" color="info" onClick={handleSubmit}>
            Update
          </MDButton>
          <MDButton variant="outlined" color="secondary" onClick={handleCancel}>
            Cancel
          </MDButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

EditMonitor.propTypes = {
  feedId: PropTypes.string.isRequired,
  auditId: PropTypes.string.isRequired,
  auditSystemName: PropTypes.string.isRequired,
  auditDescription: PropTypes.string.isRequired,
  measure: PropTypes.string.isRequired,
  measureFieldPath: PropTypes.string.isRequired,
  chronoFieldFormat: PropTypes.string.isRequired,
  chronoFieldPath: PropTypes.string.isRequired,
  onEditSuccess: PropTypes.func.isRequired,
};

export default EditMonitor;
