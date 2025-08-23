import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import MDButton from "components/MDButton";

function AddMonitorPage({ onAddMonitor, feedId, auditId }) {
  const [open, setOpen] = useState(false);
  const [feedData, setFeedData] = useState(null); // State for fetched feed data
  const [auditSystemName, setAuditSystemName] = useState("");
  const [auditDescription, setAuditDescription] = useState("");
  const [measure, setMeasure] = useState("");
  const [measureFieldPath, setMeasureFieldPath] = useState("");
  const [identityFieldPath, setIdentityFieldPath] = useState("");
  const [chronoFieldPath, setChronoFieldPath] = useState("");
  const [chronoFieldFormat, setChronoFieldFormat] = useState("");

  const authHeader = `Basic ${window.btoa(
    `${process.env.REACT_APP_AUTH_USER}:${process.env.REACT_APP_AUTH_PASS}`
  )}`;
  // Fetch feed data based on feedId and auditId
  useEffect(() => {
    if (feedId && auditId) {
      const fetchFeedData = async () => {
        //const authHeader = "Basic " + btoa("Administrator:manageaudit");
        const apiUrl = `${process.env.REACT_APP_API_URL}/restv2/feeds/${feedId}/audit/${auditId}`;

        try {
          const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            const result = await response.json();
            setFeedData(result);
            // Optionally, populate form fields with fetched feed data
            setAuditSystemName(result.auditSystemName || "");
            setAuditDescription(result.auditDescription || "");
            // Assume other fields might be populated from the feed data
          } else {
            alert("Failed to fetch feed data.");
          }
        } catch (error) {
          console.error("Error fetching feed data:", error);
          alert("An error occurred while fetching feed data.");
        }
      };

      fetchFeedData();
    }
  }, [feedId, auditId]); // Trigger when feedId or auditId changes

  const handleSave = async () => {
    if (!auditSystemName || !auditDescription || !measure || !measureFieldPath) {
      alert("Please fill in all required fields.");
      return;
    }

    const newMonitor = {
      feedId, // Use the feedId passed as a prop
      auditId, // Use the auditId passed as a prop
      auditSystemName,
      auditDescription,
      measure,
      measureFieldPath,
      identityFieldPath,
      chronoFieldPath,
      chronoFieldFormat,
    };
    // const authHeader = "Basic " + btoa("Administrator:manageaudit");

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/monitor/feed/monitor`, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMonitor),
      });

      const responseBody = await response.text();
      if (response.ok) {
        const result = JSON.parse(responseBody); // Use JSON.parse if needed
        alert("Monitor added successfully!");

        // Call the parent callback to update the table (optional)
        onAddMonitor(result);

        // Reset form and close dialog
        handleReset();
        setOpen(false);
      } else {
        alert(`Failed to add monitor. Status: ${response.status}, Error: ${responseBody}`);
      }
    } catch (error) {
      console.error("Error adding monitor:", error);
      alert(
        `An error occurred while adding the monitor. Please try again. Details: ${error.message}`
      );
    }
  };

  const handleReset = () => {
    setAuditSystemName("");
    setAuditDescription("");
    setMeasure("");
    setMeasureFieldPath("");
    setIdentityFieldPath("");
    setChronoFieldPath("");
    setChronoFieldFormat("");
  };

  return (
    <div>
      <MDButton variant="contained" color="info" onClick={() => setOpen(true)}>
        Add Monitor
      </MDButton>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Monitor</DialogTitle>
        <DialogContent>
          {/* Monitor Name */}
          <TextField
            label="Monitor Name"
            fullWidth
            margin="normal"
            value={auditSystemName}
            onChange={(e) => setAuditSystemName(e.target.value)}
          />
          {/* Monitor Description */}
          <TextField
            label="Monitor Description"
            fullWidth
            margin="normal"
            value={auditDescription}
            onChange={(e) => setAuditDescription(e.target.value)}
          />
          {/* Measure field */}
          <TextField
            label="Measure"
            fullWidth
            margin="normal"
            InputProps={{
              style: { padding: "12px 10px" },
            }}
            select
            value={measure}
            onChange={(e) => setMeasure(e.target.value)}
          >
            <MenuItem value="TRANSACTION">TRANSACTION</MenuItem>
            <MenuItem value="IDENTITY">IDENTITY</MenuItem>
            <MenuItem value="VALUE">VALUE</MenuItem>
          </TextField>
          {/* Measure Field Path */}
          <TextField
            label="Measure Field Path"
            fullWidth
            margin="normal"
            value={measureFieldPath}
            onChange={(e) => setMeasureFieldPath(e.target.value)}
          />
          {/* Identity Field Path */}
          <TextField
            label="Identity Field Path"
            fullWidth
            margin="normal"
            value={identityFieldPath}
            onChange={(e) => setIdentityFieldPath(e.target.value)}
          />
          {/* Chrono Field Path */}
          <TextField
            label="Chrono Field Path"
            fullWidth
            margin="normal"
            value={chronoFieldPath}
            onChange={(e) => setChronoFieldPath(e.target.value)}
          />
          {/* Chrono Field Format */}
          <TextField
            label="Chrono Field Format"
            fullWidth
            margin="normal"
            value={chronoFieldFormat}
            onChange={(e) => setChronoFieldFormat(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleSave} color="info" variant="contained">
            Save
          </MDButton>
          <MDButton onClick={handleReset} color="secondary" variant="outlined">
            Reset
          </MDButton>
          <MDButton onClick={() => setOpen(false)} color="error" variant="outlined">
            Cancel
          </MDButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}

// PropTypes validation
AddMonitorPage.propTypes = {
  onAddMonitor: PropTypes.func.isRequired, // Ensure onAddMonitor is passed as a required function
  feedId: PropTypes.string.isRequired, // Ensure feedId is passed as a required string
  auditId: PropTypes.string.isRequired, // Ensure auditId is passed as a required string
};

export default AddMonitorPage;
