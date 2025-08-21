import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import MDButton from "components/MDButton";
import { InputAdornment } from "@mui/material";
import { ArrowDropDown } from "@mui/icons-material";

function AddMonitorPage() {
  const [open, setOpen] = useState(false);
  const [auditSystemName, setAuditSystemName] = useState("");
  const [auditDescription, setAuditDescription] = useState("");
  const [measure, setMeasure] = useState("");
  const [measureFieldPath, setMeasureFieldPath] = useState("");
  const [identityFieldPath, setIdentityFieldPath] = useState("");
  const [chronoFieldPath, setChronoFieldPath] = useState("");
  const [chronoFieldFormat, setChronoFieldFormat] = useState("");

  // Open popup
  const handleOpen = () => {
    setOpen(true);
  };

  // Close popup
  const handleClose = () => {
    setOpen(false);
  };

  // Reset form fields
  const handleReset = () => {
    setAuditSystemName("");
    setAuditDescription("");
    setMeasure("");
    setMeasureFieldPath("");
    setIdentityFieldPath("");
    setChronoFieldPath("");
    setChronoFieldFormat("");
  };

  // Handle Save action
  const handleSave = async () => {
    if (!auditSystemName || !auditDescription || !measure || !measureFieldPath) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    const apiUrl =
      "http://localhost:5555/rad/BInRestInterface.restful.provider:monitor/feed/monitor";
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: basicAuth,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auditSystemName: auditSystemName,
          auditDescription: auditDescription,
          measure: measure,
          auditType: auditType,
          chronoFieldFormat: chronoFieldFormat,
          chronoFieldPath: chronoFieldPath,
          feedId: feedId,
          identifyFieldPath: identityFieldPath,
          measureFieldPath: measureFieldPath,
          measureTransaction: measureTransaction,
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
      {/* Button to open the popup */}
      <MDButton variant="contained" color="info" onClick={handleOpen}>
        Add Monitor
      </MDButton>

      {/* Popup Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add Monitor</DialogTitle>
        <DialogContent>
          <TextField
            label="Monitor Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={auditSystemName}
            onChange={(e) => setAuditSystemName(e.target.value)}
          />
          <TextField
            label="Monitor Description"
            variant="outlined"
            fullWidth
            margin="normal"
            value={auditDescription}
            onChange={(e) => setAuditDescription(e.target.value)}
          />
          <TextField
            label="Measure"
            variant="outlined"
            fullWidth
            margin="normal"
            select
            value={measure}
            IconComponent={ArrowDropDown} // Custom arrow icon
            endAdornment={
              <InputAdornment position="end">
                <ArrowDropDown />
              </InputAdornment>
            }
            onChange={(e) => setMeasure(e.target.value)}
            InputProps={{
              style: { padding: "12px 10px" },
            }}
          >
            <MenuItem value="TRANSACTION">TRANSACTION</MenuItem>
            <MenuItem value="IDENTITY">IDENTITY</MenuItem>
            <MenuItem value="VALUE">VALUE</MenuItem>
          </TextField>
          <TextField
            label="Measure Field Path"
            variant="outlined"
            fullWidth
            margin="normal"
            value={measureFieldPath}
            onChange={(e) => setMeasureFieldPath(e.target.value)}
          />
          <TextField
            label="Identity Field Path"
            variant="outlined"
            fullWidth
            margin="normal"
            value={identityFieldPath}
            onChange={(e) => setIdentityFieldPath(e.target.value)}
          />
          <TextField
            label="Chrono Field Path"
            variant="outlined"
            fullWidth
            margin="normal"
            value={chronoFieldPath}
            onChange={(e) => setChronoFieldPath(e.target.value)}
          />
          <TextField
            label="Chrono Field Format"
            variant="outlined"
            fullWidth
            margin="normal"
            value={chronoFieldFormat}
            onChange={(e) => setChronoFieldFormat(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleSave} variant="contained" color="info">
            Save
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

export default AddMonitorPage;
