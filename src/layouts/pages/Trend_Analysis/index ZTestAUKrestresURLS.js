import { useState, useEffect } from "react";
import axios from "axios";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DefaultLineChart from "examples/Charts/LineCharts/DefaultLineChart";

// Function to transform API data into chart-friendly format
import { transformApiDataToLineChartData } from "layouts/pages/Trend_Analysis/data/defaultLineChartData";
import { transformApiDataToLineChartData1 } from "layouts/pages/Trend_Analysis/data/defaultLineChartData1";
import { transformApiDataToLineChartData2 } from "layouts/pages/Trend_Analysis/data/defaultLineChartData2";
import { transformApiDataToLineChartData3 } from "layouts/pages/Trend_Analysis/data/defaultLineChartData3";

function Trend_Analysis() {
  const [startDate, setStartDate] = useState("2024-12-14T09:45:29");
  const [endDate, setEndDate] = useState("2025-01-13T09:45:29");
  const [interval, setInterval] = useState("day");
  const [LineChartData1, setLineChartData1] = useState({}); // for ram
  const [LineChartData, setLineChartData] = useState([]); // for cpu
  const [LineChartData2, setLineChartData2] = useState([]); // for hard disks
  const [LineChartData3, setLineChartData3] = useState([]); // for tables

  const [loading, setLoading] = useState(true);
  const authHeader = `Basic ${window.btoa(
    `${process.env.REACT_APP_AUTH_USER}:${process.env.REACT_APP_AUTH_PASS}`
  )}`;

  // Effect hook for API of RAM call strt on filter change
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
        `${process.env.REACT_APP_API_URL}/restv2/ZTestAUK.restfull.provider.restResource:sysMetrics/getSysMetrics`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
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

  //CPU Hook for api call start
  useEffect(() => {
    if (startDate && endDate && interval) {
      // Define the CPU metrics you want to request
      const cpuMetrics = ["CPU1", "CPU2", "CPU3", "CPU4", "CPU5", "CPU6", "CPU7", "CPU8"];

      // Create an empty object to store the responses
      const cpuData = {};

      // A counter to track completed API calls
      let completedRequests = 0;

      cpuMetrics.forEach((metric) => {
        const requestData = {
          getSysMetricsRq: {
            metrics: metric,
            startTimestamp: startDate,
            endTimestamp: endDate,
            interval: interval,
          },
        };

        axios
          .post(
            `${process.env.REACT_APP_API_URL}/restv2/ZTestAUK.restfull.provider.restResource:sysMetrics/getSysMetrics`,
            requestData,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: authHeader,
              },
            }
          )
          .then((response) => {
            // Transform the response data for the specific CPU metric
            const transformedData = transformApiDataToLineChartData(
              response.data.getSysMetricsRs,
              metric
            );
            cpuData[metric] = transformedData; // Store transformed data

            // Increment the counter for completed requests
            completedRequests += 1;

            /////helper function strts
            const getDataset = (metric, color, backgroundColor) => {
              // Check if data for the metric exists
              if (!cpuData[metric] || !cpuData[metric].datasets || !cpuData[metric].datasets[0]) {
                // If data is missing, return a default dataset with an empty data array
                return {
                  label: metric,
                  data: [],
                  borderColor: color,
                  backgroundColor: backgroundColor,
                  tension: 0.4,
                };
              }
              // Otherwise, return the dataset with actual data
              return {
                label: metric,
                data: cpuData[metric].datasets[0].data,
                borderColor: color,
                backgroundColor: backgroundColor,
                tension: 0.4,
              };
            };

            /////helper function ends

            // Once all requests are completed, combine the datasets and update state
            if (completedRequests === cpuMetrics.length) {
              // Combine datasets into one structure
              const combinedData = {
                labels: cpuData.CPU1 ? cpuData.CPU1.labels : [], // Use CPU1 labels as reference or an empty array if missing
                datasets: [
                  getDataset("CPU1", "#FF0000", "rgba(255, 0, 0, 0.2)"),
                  getDataset("CPU2", "#00FF00", "rgba(0, 255, 0, 0.2)"),
                  getDataset("CPU3", "#0000FF", "rgba(0, 0, 255, 0.2)"),
                  getDataset("CPU4", "#FFFF00", "rgba(255, 255, 0, 0.2)"),
                  getDataset("CPU5", "#FFA500", "rgba(255, 165, 0, 0.2)"),
                  getDataset("CPU6", "#800080", "rgba(128, 0, 128, 0.2)"),
                  getDataset("CPU7", "#800080", "rgba(213, 221, 205, 0.48)"),
                  getDataset("CPU8", "#800080", "rgba(29, 18, 29, 0.2)"),
                ],
              };

              // Update the line chart data state
              setLineChartData(combinedData);
            }
          })
          .catch((error) => {
            console.error(`Error fetching data for ${metric}:`, error);
          });
      });
    }
  }, [startDate, endDate, interval]); // Re-run when startDate, endDate, or interval change
  //CPU Hook for api call end

  //FDs Hook for api call strt
  useEffect(() => {
    if (startDate && endDate && interval) {
      // Define the Hard Disks metrics you want to request
      const fdMetrics = ["FD1", "FD2", "FD3", "FD4", "FD5"];

      // Create an empty object to store the responses
      const fdData = {};

      // A counter to track completed API calls
      let completedRequests = 0;

      fdMetrics.forEach((metric) => {
        const requestData = {
          getSysMetricsRq: {
            metrics: metric,
            startTimestamp: startDate,
            endTimestamp: endDate,
            interval: interval,
          },
        };

        axios
          .post(
            `${process.env.REACT_APP_API_URL}/restv2/ZTestAUK.restfull.provider.restResource:sysMetrics/getSysMetrics`,
            requestData,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: authHeader,
              },
            }
          )
          .then((response) => {
            // Transform the response data for the specific FDs metric
            const transformedData = transformApiDataToLineChartData2(
              response.data.getSysMetricsRs,
              metric
            );
            fdData[metric] = transformedData; // Store transformed data

            // Increment the counter for completed requests
            completedRequests += 1;

            // Helper function to generate dataset
            const getDataset = (metric, color, backgroundColor) => {
              if (!fdData[metric] || !fdData[metric].datasets || !fdData[metric].datasets[0]) {
                return {
                  label: metric,
                  data: [],
                  borderColor: color,
                  backgroundColor: backgroundColor,
                  tension: 0.4,
                };
              }
              return {
                label: metric,
                data: fdData[metric].datasets[0].data,
                borderColor: color,
                backgroundColor: backgroundColor,
                tension: 0.4,
              };
            };

            // Once all requests are completed, combine the datasets and update state
            if (completedRequests === fdMetrics.length) {
              const combinedData = {
                labels: fdData.FD1 ? fdData.FD1.labels : [], // Use FD1 labels as reference or an empty array if missing
                datasets: [
                  getDataset("FD1", "#FF0000", "rgba(255, 0, 0, 0.2)"),
                  getDataset("FD2", "#00FF00", "rgba(0, 255, 0, 0.2)"),
                  getDataset("FD3", "#0000FF", "rgba(0, 0, 255, 0.2)"),
                  getDataset("FD4", "#FFFF00", "rgba(255, 255, 0, 0.2)"),
                  getDataset("FD5", "#FFA500", "rgba(255, 165, 0, 0.2)"),
                ],
              };

              // Update the line chart data state
              setLineChartData2(combinedData);
            }
          })
          .catch((error) => {
            console.error(`Error fetching data for ${metric}:`, error);
          });
      });
    }
  }, [startDate, endDate, interval]); // Re-run when startDate, endDate, or interval change
  //Fds hook ends

  //TABLES hook for api call strt
  useEffect(() => {
    if (startDate && endDate && interval) {
      const requestData = {
        getTableStorageMetricsRq: {
          startDate: startDate,
          endDate: endDate,
          interval: interval,
        },
      };

      console.log("Sending API Request:", requestData); // Debugging log

      axios
        .post(
          `${process.env.REACT_APP_API_URL}/restv2/ZTestAUK.restfull.provider.restResource:sysMetrics/getTableStorageMetrics`,
          requestData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: authHeader,
            },
          }
        )
        .then((response) => {
          console.log("API Response:", response.data); // Log response data

          // Transform the response data for the specific CPU metric
          const transformedData = transformApiDataToLineChartData3(
            response.data.getTableStorageMetricsRs
          );

          // Update the line chart data state
          setLineChartData3(transformedData);
        })
        .catch((error) => {
          console.error("Error fetching table storage metrics:", error);
        });
    }
  }, [startDate, endDate, interval]);

  //tables hook for api call end

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

        {/* Filters Section */}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <MDBox
            display="flex"
            style={{
              backgroundColor: "#E3E6EA",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            <Grid container spacing={2} alignItems="center">
              {/* Start Date Filter */}
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Start Date"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    ".MuiInputBase-root": {
                      fontSize: "0.8rem", // Smaller font
                      height: "2.2rem", // Compact height
                    },
                  }}
                />
              </Grid>

              {/* End Date Filter */}
              <Grid item xs={12} sm={4}>
                <TextField
                  label="End Date"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    ".MuiInputBase-root": {
                      fontSize: "0.8rem", // Smaller font
                      height: "2.2rem", // Compact height
                    },
                  }}
                />
              </Grid>

              {/* Interval Filter */}
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel sx={{ fontSize: "0.8rem" }}>Select Interval</InputLabel>
                  <Select
                    label="Select Interval"
                    value={interval}
                    onChange={(e) => setInterval(e.target.value)}
                    sx={{
                      height: "2.2rem", // Compact height
                      fontSize: "0.8rem", // Smaller font
                    }}
                  >
                    <MenuItem value="day">Daily</MenuItem>
                    <MenuItem value="month">Monthly</MenuItem>
                    <MenuItem value="hour">Hourly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </MDBox>
        </LocalizationProvider>

        {/* Added margin-top to create space between filters and charts */}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <MDBox mt={5}>
              {""}
              {/* Adjust mt value here as needed */}
              <DefaultLineChart
                icon={{ component: "insights" }}
                title="CPUs Metrics"
                height="17.5rem" // Ensure the chart maintains its height
                description=""
                chart={LineChartData}
              />
            </MDBox>
          </Grid>

          <Grid item xs={12} md={6}>
            <MDBox mt={5}>
              {""}
              {/* Adjust mt value here as needed */}

              <DefaultLineChart
                icon={{ component: "insights" }}
                title="FDs Metrics"
                height="17.5rem"
                description=""
                chart={LineChartData2}
              />
            </MDBox>
          </Grid>

          {/* Line Chart Rendering */}
          <Grid item xs={12} md={6}>
            <MDBox mt={2}>
              {""}
              {/* Adjust mt value here as needed */}
              <DefaultLineChart
                icon={{ component: "insights" }}
                title="RAM Metrics"
                height="17.5rem"
                description=""
                chart={LineChartData1}
              />
            </MDBox>
          </Grid>

          <Grid item xs={12} md={6}>
            <MDBox mt={2}>
              {""}
              {/* Adjust mt value here as needed */}
              <DefaultLineChart
                icon={{ component: "insights" }}
                title="DB Storage historical table Data"
                height="17.5rem"
                description=""
                chart={LineChartData3}
              />
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
}

export default Trend_Analysis;
