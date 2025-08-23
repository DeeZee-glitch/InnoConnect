import React, { useState } from "react";
import PropTypes from "prop-types";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem"; // Import MenuItem for dropdown options
import MDButton from "components/MDButton";

function AddMonitorPage({ onAddMonitor }) {
  const [open, setOpen] = useState(false);
  const authHeader = `Basic ${window.btoa(
    `${process.env.REACT_APP_AUTH_USER}:${process.env.REACT_APP_AUTH_PASS}`
  )}`;
  // New fields
  const [feedPathName, setFeedPathName] = useState("");
  const [conditionOperator, setConditionOperator] = useState(""); // Condition operator dropdown
  const [comparator, setComparator] = useState("");
  const [groupOperator, setGroupOperator] = useState(""); // Group operator dropdown

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (
      !feedPathName || // Validate the new fields
      !conditionOperator ||
      !comparator ||
      !groupOperator
    ) {
      alert("Please fill in all fields.");
      return;
    }

    const newMonitor = {
      feedPathName, // Add new fields to the request body
      conditionOperator,
      comparator,
      groupOperator, // Send the selected group operator in the request
    };

    // const username = "Administrator";
    // const password = "manageaudit";
    // const authHeader = `Basic ${btoa(`${username}:${password}`)}`; // Base64 encode the username and password

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider.monitor_.resources.feed:monitorCondition/feed/monitorCondition?auditId=${auditId}&feedId=${feedId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify(newMonitor),
        }
      );

      if (response.ok) {
        const result = await response.json();
        alert("Monitor added successfully!");

        // Call the parent callback to update the table (optional)
        onAddMonitor(result);

        // Reset form and close dialog
        handleReset();
        setOpen(false);
      } else {
        const errorText = await response.text();
        alert(`Failed to add monitor. Error: ${errorText}`);
      }
    } catch (error) {
      console.error("Error adding monitor:", error);
      alert("An error occurred while adding the monitor. Please try again.");
    }
  };

  // Reset the new fields
  const handleReset = () => {
    setFeedPathName("");
    setConditionOperator(""); // Reset conditionOperator
    setComparator("");
    setGroupOperator(""); // Reset groupOperator
  };

  return (
    <div>
      <MDButton variant="contained" color="info" onClick={() => setOpen(true)}>
        Add Condition
      </MDButton>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Monitor</DialogTitle>
        <DialogContent>
          {/* New fields */}
          <TextField
            label="Feed Path Name"
            fullWidth
            margin="normal"
            value={feedPathName}
            onChange={(e) => setFeedPathName(e.target.value)}
            required
          />

          {/* Condition Operator Dropdown */}
          <TextField
            label="Condition Operator"
            fullWidth
            margin="normal"
            InputProps={{
              style: { padding: "12px 10px" },
            }}
            select
            value={conditionOperator}
            onChange={(e) => setConditionOperator(e.target.value)}
            required
          >
            <MenuItem value="=">=</MenuItem>
            <MenuItem value="<">&lt; {/* Use HTML escape for '<' */}</MenuItem>
            <MenuItem value="<=">&lt;= {/* Use HTML escape for '<=' */}</MenuItem>
            <MenuItem value=">">&gt; {/* Use HTML escape for '>' */}</MenuItem>
            <MenuItem value=">=">&gt;= {/* Use HTML escape for '>=' */}</MenuItem>
            <MenuItem value="!=">!=</MenuItem>
            <MenuItem value="IN">IN</MenuItem>
          </TextField>

          <TextField
            label="Comparator"
            fullWidth
            margin="normal"
            value={comparator}
            onChange={(e) => setComparator(e.target.value)}
            required
          />

          {/* Group Operator Dropdown */}
          <TextField
            label="Group Operator"
            fullWidth
            margin="normal"
            InputProps={{
              style: { padding: "12px 10px" },
            }}
            select
            value={groupOperator}
            onChange={(e) => setGroupOperator(e.target.value)}
            required
          >
            <MenuItem value="AND">AND</MenuItem>
            <MenuItem value="OR">OR</MenuItem>
            <MenuItem value="NOT">NOT</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleSave} color="info" variant="contained" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </MDButton>
          <MDButton onClick={handleReset} color="secondary" variant="outlined" disabled={loading}>
            Reset
          </MDButton>
          <MDButton
            onClick={() => setOpen(false)}
            color="error"
            variant="outlined"
            disabled={loading}
          >
            Cancel
          </MDButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}

AddMonitorPage.propTypes = {
  onAddMonitor: PropTypes.func.isRequired,
};

export default AddMonitorPage;
