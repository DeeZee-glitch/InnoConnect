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

function EditMonitor({ monitorId, monitorData, onEditSuccess }) {
  const [isEditing, setIsEditing] = useState(false);
  const [updatedMonitorData, setUpdatedMonitorData] = useState(monitorData);

  const authHeader = `Basic ${window.btoa(
    `${process.env.REACT_APP_AUTH_USER}:${process.env.REACT_APP_AUTH_PASS}`
  )}`;
  useEffect(() => {
    setUpdatedMonitorData(monitorData); // Revert to original data on mount
  }, [monitorData]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setUpdatedMonitorData(monitorData); // Revert to original values
  };

  const handleSubmit = async () => {
    // const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    const apiUrl = `${process.env.REACT_APP_API_URL}/monitor/condition/${monitorId}`;

    try {
      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedMonitorData),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || "Monitor updated successfully!");
        setIsEditing(false);

        // Trigger parent callback to refresh monitor data
        if (onEditSuccess) {
          onEditSuccess(); // No need to pass parameters; let the parent trigger fetchData
        }
      } else {
        alert("Failed to update monitor. Please try again.");
      }
    } catch (error) {
      console.error("Error updating monitor:", error);
      alert("An error occurred while updating the monitor. Please try again.");
    }
  };

  return (
    <>
      <IconButton color="info" onClick={handleEditClick}>
        <EditIcon />
      </IconButton>

      <Dialog open={isEditing} onClose={handleCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Monitor</DialogTitle>
        <DialogContent>
          <TextField
            label="Monitor Condition"
            value={updatedMonitorData.monitorCondition}
            onChange={(e) =>
              setUpdatedMonitorData({ ...updatedMonitorData, monitorCondition: e.target.value })
            }
            size="small"
            fullWidth
            margin="dense"
          />

          <TextField
            label="Serial Number"
            value={updatedMonitorData.serialNumber}
            onChange={(e) =>
              setUpdatedMonitorData({ ...updatedMonitorData, serialNumber: e.target.value })
            }
            size="small"
            fullWidth
            margin="dense"
          />

          <TextField
            label="Feed Path"
            value={updatedMonitorData.feedPath}
            onChange={(e) =>
              setUpdatedMonitorData({ ...updatedMonitorData, feedPath: e.target.value })
            }
            size="small"
            fullWidth
            margin="dense"
          />

          <FormControl fullWidth size="small" margin="dense">
            <InputLabel>Condition Operator</InputLabel>
            <Select
              value={updatedMonitorData.conditionOperator}
              onChange={(e) =>
                setUpdatedMonitorData({ ...updatedMonitorData, conditionOperator: e.target.value })
              }
              fullWidth
            >
              <MenuItem value="equals">Equals</MenuItem>
              <MenuItem value="greaterThan">Greater Than</MenuItem>
              <MenuItem value="lessThan">Less Than</MenuItem>
              <MenuItem value="contains">Contains</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" margin="dense">
            <InputLabel>Comparator</InputLabel>
            <Select
              value={updatedMonitorData.comparator}
              onChange={(e) =>
                setUpdatedMonitorData({ ...updatedMonitorData, comparator: e.target.value })
              }
              fullWidth
            >
              <MenuItem value="value1">Value 1</MenuItem>
              <MenuItem value="value2">Value 2</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" margin="dense">
            <InputLabel>Group Operator</InputLabel>
            <Select
              value={updatedMonitorData.groupOperator}
              onChange={(e) =>
                setUpdatedMonitorData({ ...updatedMonitorData, groupOperator: e.target.value })
              }
              fullWidth
            >
              <MenuItem value="and">AND</MenuItem>
              <MenuItem value="or">OR</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" margin="dense">
            <InputLabel>Action</InputLabel>
            <Select
              value={updatedMonitorData.action}
              onChange={(e) =>
                setUpdatedMonitorData({ ...updatedMonitorData, action: e.target.value })
              }
              fullWidth
            >
              <MenuItem value="alert">Alert</MenuItem>
              <MenuItem value="log">Log</MenuItem>
              <MenuItem value="notify">Notify</MenuItem>
            </Select>
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

EditMonitor.propTypes = {
  monitorId: PropTypes.string.isRequired,
  monitorData: PropTypes.object.isRequired,
  onEditSuccess: PropTypes.func.isRequired,
};

export default EditMonitor;
