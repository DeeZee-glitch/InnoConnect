import { useState, useEffect } from "react";
import axios from "axios";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DefaultLineChart from "examples/Charts/LineCharts/DefaultLineChart";

// Function to transform API data into chart-friendly format
import { transformApiDataToLineChartData1 } from "layouts/pages/Trend_Analysis/data/defaultLineChartData1";

function Trend_Analysis() {
  const [startDate, setStartDate] = useState("2024-12-14T09:45:29");
  const [endDate, setEndDate] = useState("2025-01-13T09:45:29");
  const [interval, setInterval] = useState("day");
  const [LineChartData, setLineChartData1] = useState(null);
  const [loading, setLoading] = useState(true);

  // Effect hook for API call on filter change
  useEffect(() => {
    if (startDate && endDate && interval) {
      const requestData = {
        getSysMetricsRq: {
          metrics: "RAM", // Keeping the metrics value as "RAM"
          startTimestamp: startDate,
          endTimestamp: endDate,
          interval: interval,
        },
      };

      const fetchLineChartData1 = axios.post(
        "http://localhost:5555/restv2/BInRestInterface.restful.provider:ui/getSysMetrics",
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${btoa("Administrator:manageaudit")}`,
          },
        }
      );

      fetchLineChartData1
        .then((response) => {
          const transformedData = transformApiDataToLineChartData1(response.data.getSysMetricsRs); // Use transformed data
          setLineChartData1(transformedData);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [startDate, endDate, interval]);

  if (loading) {
    return <div>Loading...</div>; // Handle loading state
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox my={2}>
        <MDBox mb={5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} sx={{ lineHeight: 0 }}>
              <MDTypography variant="h5">Trend Analysis</MDTypography>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox mb={6}>
          <Grid container spacing={3}>
            {/* Start Date Filter */}
            <Grid item xs={12} md={2}>
              <TextField
                label="Start Date"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* End Date Filter */}
            <Grid item xs={12} md={2}>
              <TextField
                label="End Date"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Interval Filter */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Select Interval</InputLabel>
                <Select
                  value={interval}
                  onChange={(e) => setInterval(e.target.value)}
                  sx={{
                    height: 45,
                    fontSize: "0.9rem",
                  }}
                >
                  <MenuItem value="day">Daily</MenuItem>
                  <MenuItem value="month">Monthly</MenuItem>
                  <MenuItem value="hour">Hourly</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Line Chart Rendering */}
            <Grid item xs={12} md={6}>
              <DefaultLineChart
                icon={{ component: "insights" }}
                title="RAM Metrics"
                height="17.5rem"
                description=""
                chart={LineChartData}
              />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Trend_Analysis;
