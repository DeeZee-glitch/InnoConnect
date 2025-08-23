import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import MDButton from "components/MDButton";
import PropTypes from "prop-types";

function AddIPConfigPopup({ open, onClose, onAddIP }) {
  const [selectedConfig, setSelectedConfig] = useState(""); // Track dropdown selection
  const [ipAddress, setIpAddress] = useState("");
  const [ipList, setIpList] = useState([]);
  const [loading, setLoading] = useState(false);

  const authHeader = `Basic ${window.btoa(
    `${process.env.REACT_APP_AUTH_USER}:${process.env.REACT_APP_AUTH_PASS}`
  )}`;

  // Fetch data when the dialog opens or when selectedConfig changes
  useEffect(() => {
    if (open && selectedConfig === "IP Config") {
      const fetchIPAddresses = async () => {
        try {
          setLoading(true);
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider:ui/getIPs`,
            {
              method: "GET",
              headers: {
                Authorization: authHeader,
                "Content-Type": "application/json",
              },
            }
          );

          if (response.ok) {
            const result = await response.json();
            setIpList(result.IPAddresses || []);
          } else {
            alert("Failed to fetch IP addresses.");
          }
        } catch (error) {
          console.error("Error fetching IPs:", error);
          alert("Error fetching IP addresses.");
        } finally {
          setLoading(false);
        }
      };

      fetchIPAddresses();
    }
  }, [open, selectedConfig]); // Trigger when dialog opens or selectedConfig changes

  const handleSave = () => {
    if (!ipAddress) {
      alert("Please select an IP address.");
      return;
    }

    onAddIP({ ipAddress });
    alert("IP Configuration saved successfully!");
    onClose(); // Close the popup after saving
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Configuration</DialogTitle>
      <DialogContent>
        {/* Dropdown to select IP Config or DB Config */}
        <TextField
          label="Select Config"
          variant="outlined"
          fullWidth
          margin="normal"
          InputProps={{
            style: { padding: "12px 10px" },
          }}
          select
          value={selectedConfig}
          onChange={(e) => setSelectedConfig(e.target.value)}
        >
          <MenuItem value="IP Config">IP Config</MenuItem>
          <MenuItem value="DB Config">DB Config</MenuItem>
        </TextField>

        {selectedConfig === "IP Config" && (
          <TextField
            label="Select IP Address"
            variant="outlined"
            fullWidth
            margin="normal"
            InputProps={{
              style: { padding: "12px 10px" },
            }}
            select
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
          >
            {ipList.map((ip, index) => (
              <MenuItem key={index} value={ip.ipAddress}>
                {ip.ipAddress}
              </MenuItem>
            ))}
          </TextField>
        )}
      </DialogContent>
      <DialogActions>
        <MDButton onClick={handleSave} variant="contained" color="info" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </MDButton>
        <MDButton onClick={onClose} variant="outlined" color="error">
          Cancel
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

AddIPConfigPopup.propTypes = {
  open: PropTypes.bool.isRequired, // Open state passed from parent
  onClose: PropTypes.func.isRequired, // Function to close popup
  onAddIP: PropTypes.func.isRequired, // Function to handle adding IP
};

export default AddIPConfigPopup;
