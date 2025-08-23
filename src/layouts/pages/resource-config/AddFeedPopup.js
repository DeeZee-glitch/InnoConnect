import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import MDButton from "components/MDButton"; // Assuming this is a custom component
import PropTypes from "prop-types";

function AddResourcePopup({ onAddResource }) {
  const [open, setOpen] = useState(false); // Controls modal visibility
  const [resourceType, setResourceType] = useState(""); // Holds selected resource type
  const [databaseType, setDatabaseType] = useState(""); // Holds selected database type (Oracle or Postgre)
  const [loading, setLoading] = useState(false); // Tracks saving/loading state
  const [openDatabaseModal, setOpenDatabaseModal] = useState(false); // Controls the visibility of the database modal
  const [databaseConfig, setDatabaseConfig] = useState({
    connectionName: "",
    serverName: "",
    user: "",
    password: "",
    databaseName: "",
    portNumber: "",
  });

  // Open the main dialog
  const handleOpen = () => {
    setOpen(true);
  };

  // Close the main dialog and reset form
  const handleClose = () => {
    setOpen(false);
    handleReset();
  };

  // Reset the form fields
  const handleReset = () => {
    setResourceType(""); // Reset the resource type
    setDatabaseType(""); // Reset the database type
    setDatabaseConfig({
      connectionName: "",
      serverName: "",
      user: "",
      password: "",
      databaseName: "",
      portNumber: "",
    }); // Reset database config form
  };

  // Open the database configuration modal when "Next" is clicked
  const handleNext = () => {
    if (!resourceType) {
      alert("Please select a resource type.");
      return;
    }

    if (resourceType === "DATABASE" && !databaseType) {
      alert("Please select a database type.");
      return;
    }

    setOpenDatabaseModal(true); // Open database config modal if resource type is DATABASE
  };

  // Save the resource and database configuration
  const handleSave = async () => {
    if (!databaseType) {
      alert("Please select a database type.");
      return;
    }
    if (!Object.values(databaseConfig).every((field) => field)) {
      alert("Please fill in all database configuration fields.");
      return;
    }

    setLoading(true);
    const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    const apiUrl =
      "http://172.20.150.134:5555/restv2/BInRestInterface.restful.provider:ui/resource/register"; // Your API URL

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: basicAuth,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          databaseType, // Ensure the databaseType is included here
          ...databaseConfig, // Spread all databaseConfig fields into the payload
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result);

        alert(result.message || "Resource added successfully!");
        handleClose();
      } else {
        const error = await response.json();
        alert(error.message || "Failed to add the resource. Please try again.");
      }
    } catch (error) {
      console.error("Error saving resource:", error);
      alert("An error occurred while saving the resource. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDatabaseConfigChange = (e) => {
    const { name, value } = e.target;
    setDatabaseConfig((prevConfig) => ({
      ...prevConfig,
      [name]: value,
    }));
  };

  // Close the database configuration modal
  const handleDatabaseModalClose = () => setOpenDatabaseModal(false);

  return (
    <div>
      <MDButton variant="contained" color="info" onClick={handleOpen}>
        Add Resource
      </MDButton>

      {/* Main modal for adding resource */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add Resource</DialogTitle>
        <DialogContent>
          {/* Dropdown for selecting resource type */}
          <TextField
            label="Resource Type"
            variant="outlined"
            fullWidth
            margin="normal"
            InputProps={{
              style: { padding: "12px 10px" },
            }}
            select
            value={resourceType}
            onChange={(e) => {
              setResourceType(e.target.value);
              setDatabaseType(""); // Reset the database type when resource type changes
            }}
          >
            <MenuItem value="DATABASE">DATABASE</MenuItem>
            <MenuItem value="FTP">FTP</MenuItem>
            <MenuItem value="SFTP">SFTP</MenuItem>
            <MenuItem value="SMTP">SMTP</MenuItem>
          </TextField>

          {/* Conditional rendering of Database Type dropdown when resourceType is DATABASE */}
          {resourceType === "DATABASE" && (
            <TextField
              label="Database Type"
              variant="outlined"
              fullWidth
              margin="normal"
              InputProps={{
                style: { padding: "12px 10px" },
              }}
              select
              value={databaseType}
              onChange={(e) => setDatabaseType(e.target.value)}
            >
              <MenuItem value="ORACLE">ORACLE</MenuItem>
              <MenuItem value="POSTGRE">POSTGRE</MenuItem>
            </TextField>
          )}
        </DialogContent>

        <DialogActions>
          {/* Next button */}
          <MDButton onClick={handleNext} variant="contained" color="info">
            Next
          </MDButton>
          <MDButton onClick={handleReset} variant="outlined" color="secondary">
            Reset
          </MDButton>
          <MDButton onClick={handleClose} variant="outlined" color="error">
            Cancel
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Database Configuration Modal for Oracle and PostgreSQL */}
      <Dialog open={openDatabaseModal} onClose={handleDatabaseModalClose} fullWidth>
        <DialogTitle>
          {databaseType === "ORACLE"
            ? "Oracle Database Configuration"
            : "PostgreSQL Database Configuration"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Connection Name"
            name="connectionName"
            fullWidth
            margin="dense"
            value={databaseConfig.connectionName}
            onChange={handleDatabaseConfigChange}
          />
          <TextField
            label="Server Name"
            name="serverName"
            fullWidth
            margin="dense"
            value={databaseConfig.serverName}
            onChange={handleDatabaseConfigChange}
          />
          <TextField
            label="Database User"
            name="user"
            fullWidth
            margin="dense"
            value={databaseConfig.user}
            onChange={handleDatabaseConfigChange}
          />
          <TextField
            label="Database Password"
            name="password"
            fullWidth
            margin="dense"
            type="password"
            value={databaseConfig.password}
            onChange={handleDatabaseConfigChange}
          />
          <TextField
            label="Database Name"
            name="databaseName"
            fullWidth
            margin="dense"
            value={databaseConfig.databaseName}
            onChange={handleDatabaseConfigChange}
          />
          <TextField
            label="Port"
            name="portNumber"
            fullWidth
            margin="dense"
            value={databaseConfig.portNumber}
            onChange={handleDatabaseConfigChange}
          />
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleSave} variant="contained" color="info" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </MDButton>
          <MDButton onClick={handleDatabaseModalClose} variant="outlined" color="error">
            Cancel
          </MDButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}

AddResourcePopup.propTypes = {
  onAddResource: PropTypes.func.isRequired, // onAddResource is a required prop
};

export default AddResourcePopup;
