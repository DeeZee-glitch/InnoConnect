import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import MDButton from "components/MDButton";
import PropTypes from "prop-types";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(ArcElement, Tooltip, Legend);

function AddIPConfigPopup({ open, onClose, onAddIP }) {
  const [selectedConfig, setSelectedConfig] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [ipList, setIpList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState(null);

  const handleSave = () => {
    if (!ipAddress) {
      alert("Please select a resource.");
      return;
    }

    onAddIP({
      resourceName: ipAddress,
      chartData: chartData, // Pass the chart data
    });

    alert("Configuration saved successfully!");
    onClose();
  };

  const authHeader = `Basic ${window.btoa(
    `${process.env.REACT_APP_AUTH_USER}:${process.env.REACT_APP_AUTH_PASS}`
  )}`;

  useEffect(() => {
    if (open && selectedConfig === "IP Config") {
      const fetchIPAddresses = async () => {
        try {
          setLoading(true);
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider:ui/getResourceName`,
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
            setIpList(result.resourcesName.map((item) => item.resourceName) || []);
          } else {
            alert("Failed to fetch resources.");
          }
        } catch (error) {
          console.error("Error fetching resources:", error);
          alert("Error fetching resources.");
        } finally {
          setLoading(false);
        }
      };
      fetchIPAddresses();
    }
  }, [open, selectedConfig]);

  useEffect(() => {
    if (ipAddress) {
      const fetchMetrics = async () => {
        try {
          setLoading(true);
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider:ui/getSysMetrics`,
            {
              method: "POST",
              headers: {
                Authorization: authHeader,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ getSysMetricsRq: { ipAddress } }),
            }
          );

          if (response.ok) {
            const result = await response.json();
            const metrics = result.getSysMetricsRs;

            setChartData({
              labels: metrics.map((item) => item.name),
              datasets: [
                {
                  data: metrics.map((item) => parseFloat(item.value)),
                  backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
                },
              ],
            });
          } else {
            alert("Failed to fetch system metrics.");
          }
        } catch (error) {
          console.error("Error fetching system metrics:", error);
          alert("Error fetching system metrics.");
        } finally {
          setLoading(false);
        }
      };
      fetchMetrics();
    }
  }, [ipAddress]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Configuration</DialogTitle>
      <DialogContent>
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
            label="Select Resource"
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
            {ipList.map((resource, index) => (
              <MenuItem key={index} value={resource}>
                {resource}
              </MenuItem>
            ))}
          </TextField>
        )}

        {chartData && (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Doughnut data={chartData} />
          </div>
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
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAddIP: PropTypes.func.isRequired,
};

export default AddIPConfigPopup;
