import { Bar } from "react-chartjs-2";

// @mui material components
import axios from "axios";
import { Menu, MenuItem, ListItemIcon, ListItemText, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";
// Material Dashboard 2 PRO React components

import AddIPConfigPopup from "layouts/pages/overview/utils/AddIPConfigPopup";
import DefaultDoughnutChart from "examples/Charts/DoughnutCharts/DefaultDoughnutChart";

import { transformApiDataToChartData1 } from "layouts/pages/charts/data/defaultDoughnutChartData1";
import { transformApiDataToChartData2 } from "layouts/pages/charts/data/defaultDoughnutChartData2";
import { transformApiDataToChartData3 } from "layouts/pages/charts/data/defaultDoughnutChartData3";

//DB Metrics imports start
import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "layouts/pages/dbMetrics/DataTable";
// import { exportToCSV } from "./utils/exportToCSV";
import Grid from "@mui/material/Grid";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MDTypography from "components/MDTypography";
//DB Metrics imports End

function Overview() {
  const [doughnutChartData1, setDoughnutChartData1] = useState(null);
  const [doughtnutChartData2, setDoughnutChartData2] = useState(null);
  const [doughtnutChartData3, setDoughnutChartData3] = useState(null);
  const [loading, setLoading] = useState(true);

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedChart, setSelectedChart] = useState(null);
  //mera
  const [openIPConfig, setOpenIPConfig] = useState(false);

  const handleConfigure = () => {
    setOpenIPConfig(true);
    handleMenuClose(); // Close the dropdown menu when opening the popup
  };
  <AddIPConfigPopup open={openIPConfig} onClose={() => setOpenIPConfig(false)} />;

  //tera
  // Function to open menu
  const handleMenuClick = (event, chartTitle) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedChart(chartTitle);
  };

  // Function to close menu
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedChart(null);
  };

  // Placeholder functions for actions
  // const handleConfigure = () => {
  //   console.log(`Configuring: ${selectedChart}`);
  //   handleMenuClose();
  // };

  //storage start
  const authHeader = `Basic ${window.btoa(
    `${process.env.REACT_APP_AUTH_USER}:${process.env.REACT_APP_AUTH_PASS}`
  )}`;
  // Storage data and chart state
  const [storageData, setStorageData] = useState([]);
  const [chartData, setChartData] = useState(null);

  const username = "Administrator";
  const password = "manageaudit";

  // Base64 encode the username and password
  const encodedCredentials = btoa(`${username}:${password}`);

  //DB Metrics functions start
  const [originalData, setOriginalData] = useState([]); // Default connection data
  const [slowQueriesPerf, setSlowQuries] = useState([]); // slow queries
  const [highQueriesPerf, setHighQuries] = useState([]); // high queries
  const [userActMetrics, setUserActMetrics] = useState([]); // User Actvity Metrics

  const [avgExeTimeData, setAvgExeTimeData] = useState({
    avgExeTime: "",
    totalQueries: "",
    timestamp: "",
  });
  const [errorTrackingData, setErrorTrackingData] = useState([]); // Error tracking data
  const [open, setOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  //DB Metrics functions end

  // Function to handle modal open
  const handleOpen = (content) => {
    setModalContent(content);
    setOpen(true);
  };

  //DB Metrics APIs Calls Start
  // Fetch all necessary data when the page loads
  useEffect(() => {
    const fetchData = async () => {
      // Fetch connection data
      try {
        const connectionResponse = await fetch(
          `/restv2/BInRestInterface.restful.provider:ui/getConnections`,
          {
            method: "GET",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json",
            },
          }
        );
        const connectionData = await connectionResponse.json();
        const connectionRows = connectionData.connections.map((connection) => ({
          dbName: connection.dbName,
          activeConnections: connection.activeConnections,
          idleConnections: connection.idleConnections,
          availableConnections: connection.availableConnections,
          latestUpdateTimestamp: connection.latestUpdateTimestamp,
        }));
        setOriginalData(connectionRows);
      } catch (error) {
        console.error("Error fetching connection data:", error);
      }
      // Fetch slow query data
      // const basicAuth = "Basic " + btoa("Administrator:manageaudit");
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider:ui/getQueryPerf?queryType=SLOWQUERIES`,
          {
            method: "GET",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        const slowQueries = data.queryPerformance.slowQueries.map((query) => ({
          // queryText: query.queryText,
          queryText: (
            <MDButton
              variant="outlined"
              color="info"
              size="small"
              onClick={() => handleOpen(query.queryText)}
            >
              View Content
            </MDButton>
          ),
          executionTime: query.executionTime,
          timestamp: query.timestamp,
        }));
        setSlowQuries(slowQueries);
      } catch (error) {
        console.error("Error fetching query performance data:", error);
      }
      // Fetch high concurrency query data
      // const basicAuth = "Basic " + btoa("Administrator:manageaudit");
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider:ui/getQueryPerf?queryType=HIGHCONSQUERIES`,
          {
            method: "GET",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        const highConcurrencyQueries = data.queryPerformance.highConsQueries.map((query) => ({
          queryText: (
            <MDButton
              variant="outlined"
              color="info"
              size="small"
              onClick={() => handleOpen(query.query)}
            >
              View Content
            </MDButton>
          ),
          noOfReads: query.noOfReads,
          noOfWrites: query.noOfWrites,
        }));
        setHighQuries(highConcurrencyQueries);
      } catch (error) {
        console.error("Error fetching high concurrency query data:", error);
      }
      // Fetch user activity metrics data
      //  const basicAuth = "Basic " + btoa("Administrator:manageaudit");
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider:ui/getUsrActMetrics`,
          {
            method: "GET",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        const userActivityMetrics = data.getUsrActMetrics.map((metric) => ({
          userName: metric.userName,
          queryText: (
            <MDButton
              variant="outlined"
              color="info"
              size="small"
              onClick={() => handleOpen(metric.queryText)}
            >
              View Content
            </MDButton>
          ),
          totalBlocksAcc: metric.totalBlocksAcc,
          totalBlockWritten: metric.totalBlockWritten,
          queryCount: metric.queryCount,
          latestUpdatedTimestamp: metric.latestUpdatedTimestamp,
        }));
        setUserActMetrics(userActivityMetrics);
      } catch (error) {
        console.error("Error fetching user activity data:", error);
      }
      // Fetch error tracking data
      try {
        const errorTrackingResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider:ui/getErrorTracking`,
          {
            method: "GET",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json",
            },
          }
        );
        const errorTracking = await errorTrackingResponse.json();
        const errorTrackingRows = errorTracking.errorTracking.map((error) => ({
          dbName: error.dbName,
          conState: error.conState,
          currentQuery: (
            <MDButton
              variant="outlined"
              color="info"
              size="small"
              onClick={() => handleOpen(error.currentQuery)}
            >
              View Content
            </MDButton>
          ),
          issueStatus: error.issueStatus,
          latestUpdatedTime: error.latestUpdatedTime,
        }));
        setErrorTrackingData(errorTrackingRows);
      } catch (error) {
        console.error("Error fetching error tracking data:", error);
      }
      // Fetch query performance (avgExeTime) data
      try {
        const queryPerfResponse = await fetch(
          `/restv2/BInRestInterface.restful.provider:ui/getQueryPerf?queryType=AVGEXECTIME`,
          {
            method: "GET",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json",
            },
          }
        );
        const queryPerfData = await queryPerfResponse.json();
        const avgExeTime = queryPerfData.queryPerformance.avgExeTime;
        setAvgExeTimeData({
          avgExeTime: avgExeTime.avgExeTime,
          totalQueries: avgExeTime.totalQueries,
          timestamp: avgExeTime.timestamp,
        });
      } catch (error) {
        console.error("Error fetching avg execution time data:", error);
      }
    };

    fetchData();
  }, []);

  //DB Metrics APIs Calls end

  useEffect(() => {
    // Fetch API data with Basic Auth
    const fetchStorageData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider:ui/getDBStorage`,
          {
            method: "GET",
            headers: {
              Authorization: authHeader, // Adding Basic Auth header
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const apiResponse = await response.json();

        // Using KB values directly (no conversion)
        const formattedData = apiResponse.dbStorageUsage.map((item) => ({
          dbName: item.dbName,
          total: parseFloat(item.total), // Keep in KB
          used: parseFloat(item.used), // Keep in KB
          free: parseFloat(item.free), // Keep in KB
        }));

        setStorageData(formattedData);

        // Setting chart data for a stacked bar chart
        setChartData({
          labels: formattedData.map((item) => item.dbName),
          datasets: [
            {
              label: "Used Storage (KB)",
              data: formattedData.map((item) => item.used),
              backgroundColor: "rgba(19, 134, 228, 0.94)",
            },
            {
              label: "Free Storage (KB)",
              data: formattedData.map((item) => item.free),
              backgroundColor: "rgba(65, 66, 66, 0.6)",
            },
            {
              label: "Total Storage (KB)",
              data: formattedData.map((item) => item.total),
              backgroundColor: "rgba(183, 193, 193, 0.6)",
            },
          ],
        });
      } catch (error) {
        console.error("Failed to fetch storage data:", error);
      }
    };

    fetchStorageData();
  }, []);

  //storage end
  //storage start2
  // trxMetrics start

  // Transaction data and chart state for chart2
  const [trxData, setTrxData] = useState([]);
  const [chart2Data, setChart2Data] = useState(null);

  // Fetching trxMetrics API data
  useEffect(() => {
    const fetchTrxData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider:ui/getTrxMetrics`,
          {
            method: "GET",
            headers: {
              Authorization: authHeader, // Adding Basic Auth header
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const apiResponse = await response.json();

        // Format the data to be used in chart (e.g., totalTrx, commitedTrx, rollBackTrx)
        const formattedTrxData = apiResponse.trxMetrics.map((item) => ({
          dbName: item.dbName,
          totalTrx: parseInt(item.totalTrx),
          commitedTrx: parseInt(item.commitedTrx),
          rollBackTrx: parseInt(item.rollBackTrx),
          tps: parseFloat(item.tps),
        }));

        setTrxData(formattedTrxData);

        // Setting chart data for a stacked bar chart (similar to chart1)
        setChart2Data({
          labels: formattedTrxData.map((item) => item.dbName),
          datasets: [
            {
              label: "Committed Transactions",
              data: formattedTrxData.map((item) => item.commitedTrx),
              backgroundColor: "rgba(0, 128, 0, 0.8)", // Green color for committed transactions
            },
            {
              label: "Rolled Back Transactions",
              data: formattedTrxData.map((item) => item.rollBackTrx),
              backgroundColor: "rgba(255, 69, 0, 0.8)", // Red color for rolled back transactions
            },
            {
              label: "Total Transactions",
              data: formattedTrxData.map((item) => item.totalTrx),
              backgroundColor: "rgba(75, 192, 192, 0.6)", // Light blue color for total transactions
            },
          ],
        });
      } catch (error) {
        console.error("Failed to fetch transaction data:", error);
      }
    };

    fetchTrxData();
  }, []);

  // trxMetrics end

  //storage end2

  useEffect(() => {
    // Fetch API data
    const fetchDoughnutChartData1 = axios.get(`/systemMetrics/systemMetrics`); // Replace with Doughnut Chart API
    const fetchDoughnutChartData2 = axios.get(`/systemMetrics/systemMetrics`); // Replace with Doughnut Chart API
    const fetchDoughnutChartData3 = axios.get(`/systemMetrics/systemMetrics`); // Replace with Doughnut Chart API

    // Fetch both APIs simultaneously
    Promise.all([fetchDoughnutChartData1, fetchDoughnutChartData2, fetchDoughnutChartData3])
      .then(([doughnutChartResponse1, doughnutChartResponse2, doughnutChartResponse3]) => {
        // Transform API response into chart data

        const fetchDoughnutChartData1 = transformApiDataToChartData1(doughnutChartResponse1.data);
        const fetchDoughnutChartData2 = transformApiDataToChartData2(doughnutChartResponse2.data);
        const fetchDoughnutChartData3 = transformApiDataToChartData3(doughnutChartResponse3.data);

        setDoughnutChartData1(fetchDoughnutChartData1);
        setDoughnutChartData2(fetchDoughnutChartData2);
        setDoughnutChartData3(fetchDoughnutChartData3);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);

        if (error.message) {
          console.error("Error message:", error.message);
        } else {
          console.warn("No error message available.");
        }

        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
        } else {
          console.warn("No response available.");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // if (loading) {
  //   return <div>Loading...</div>; // Handle loading state
  // }

  // Function to handle modal close
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox my={2}>
        <MDBox mb={5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} sx={{ lineHeight: 0 }}>
              <MDTypography variant="h5">Infrastructure Metrics</MDTypography>
            </Grid>
          </Grid>
        </MDBox>

        <MDBox mb={6}>
          <Grid container spacing={3}>
            {[
              { title: "CPU", chart: doughnutChartData1, description: "CPU Usage" },
              { title: "RAM", chart: doughtnutChartData2, description: "RAM Usage" },
              { title: "Hard Disk", chart: doughtnutChartData3, description: "HDD Usage" },
            ].map((item, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <MDBox position="relative">
                  {/* More actions icon */}
                  <IconButton
                    size="small"
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      color: "black",
                      zIndex: 10,
                    }}
                    onClick={(event) => handleMenuClick(event, item.title)}
                  >
                    <Icon>more_horiz</Icon>
                  </IconButton>

                  {/* Doughnut Chart */}
                  <DefaultDoughnutChart
                    icon={{ color: "success", component: "donut_small" }}
                    title={item.title}
                    height="15.5rem"
                    description={item.description}
                    chart={item.chart}
                  />
                </MDBox>
              </Grid>
            ))}
          </Grid>

          {/* Menu for More Actions */}
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "top", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={handleConfigure}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              Configure
            </MenuItem>
          </Menu>

          {/* AddIPConfigPopup Component */}
          <AddIPConfigPopup open={openIPConfig} onClose={() => setOpenIPConfig(false)} />
        </MDBox>

        {/* Bar Chart */}
        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={6}>
              {/* First Bar Chart */}
              <Card>
                <MDBox pt={2} px={3}>
                  <MDTypography variant="h6" fontWeight="medium">
                    DBs Storage
                  </MDTypography>
                </MDBox>
                <MDBox py={2}>
                  {chartData && (
                    <Bar
                      data={chartData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: "top",
                          },
                          tooltip: {
                            mode: "index",
                            intersect: false,
                          },
                        },
                        scales: {
                          x: {
                            title: {
                              display: true,
                              text: "Database",
                            },
                            stacked: true,
                          },
                          y: {
                            title: {
                              display: true,
                              text: "Storage (KB)",
                            },
                            stacked: true,
                          },
                        },
                        elements: {
                          bar: {
                            barThickness: 6, // Bar thickness is still reduced
                          },
                        },
                      }}
                    />
                  )}
                </MDBox>
              </Card>
            </Grid>

            {/* Second Bar Chart - Duplicate */}
            <Grid item xs={12} lg={6}>
              {/* Second Bar Chart */}
              <Card>
                <MDBox pt={2} px={3}>
                  <MDTypography variant="h6" fontWeight="medium">
                    Transactions Metrics
                  </MDTypography>
                </MDBox>
                <MDBox py={2}>
                  {chart2Data && (
                    <Bar
                      data={chart2Data} // Same chart data used for the second chart
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: "top",
                          },
                          tooltip: {
                            mode: "index",
                            intersect: false,
                          },
                        },
                        scales: {
                          x: {
                            title: {
                              display: true,
                              text: "Database",
                            },
                            stacked: true,
                          },
                          y: {
                            title: {
                              display: true,
                              text: "Numbers of transactions (Integer)",
                            },
                            stacked: true,
                          },
                        },
                        elements: {
                          bar: {
                            barThickness: 6, // Bar thickness is still reduced
                          },
                        },
                      }}
                    />
                  )}
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>

        {/* DB Metrics Rendering starts */}
        {/* Display tables */}
        <MDBox mb={3}>
          <Grid container spacing={3}>
            {/* First Row of Tables */}
            <Grid item xs={12} sm={6} md={6}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium">
                    High Resources Consuming Queries
                  </MDTypography>
                  <DataTable
                    table={{
                      columns: [
                        { Header: "Query", accessor: "queryText" },
                        { Header: "No Of Reads", accessor: "noOfReads" },
                        { Header: "No Of Writes", accessor: "noOfWrites" },
                      ],
                      rows: highQueriesPerf,
                    }}
                    entriesPerPage={5}
                    showTotalEntries
                  />
                </MDBox>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={6}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium">
                    Slow Queries
                  </MDTypography>
                  <DataTable
                    table={{
                      columns: [
                        { Header: "Query", accessor: "queryText" },
                        { Header: "Execution Time", accessor: "executionTime" },
                        { Header: "Latest Time", accessor: "timestamp" },
                      ],
                      rows: slowQueriesPerf,
                    }}
                    entriesPerPage={5}
                    showTotalEntries
                  />
                </MDBox>
              </Card>
            </Grid>

            {/* Second Row of Tables */}
            <Grid item xs={12} sm={6} md={6}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium">
                    Error Tracking
                  </MDTypography>
                  <DataTable
                    table={{
                      columns: [
                        { Header: "Database Name", accessor: "dbName" },
                        { Header: "Connection State", accessor: "conState" },
                        { Header: "Current Query", accessor: "currentQuery" },
                        { Header: "Issue Status", accessor: "issueStatus" },
                        { Header: "Latest Updated", accessor: "latestUpdatedTime" },
                      ],
                      rows: errorTrackingData,
                    }}
                    entriesPerPage={5}
                    showTotalEntries
                  />
                </MDBox>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={6}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium">
                    User Activity Monitoring
                  </MDTypography>
                  <DataTable
                    table={{
                      columns: [
                        { Header: "Usesr Name", accessor: "userName" },
                        { Header: "Query", accessor: "queryText" },
                        { Header: "Total Blocks Acc", accessor: "totalBlocksAcc" },
                        { Header: "Total Blocks Written", accessor: "totalBlockWritten" },
                        { Header: "Query Count", accessor: "queryCount" },
                        { Header: "Last Updated", accessor: "latestUpdatedTimestamp" },
                      ],
                      rows: userActMetrics,
                    }}
                    entriesPerPage={5}
                    showTotalEntries
                  />
                </MDBox>
              </Card>
            </Grid>

            {/* Third Row of Tables */}
            <Grid item xs={12} sm={6} md={6}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium">
                    Avg execution queries
                  </MDTypography>
                  <DataTable
                    table={{
                      columns: [
                        { Header: "Avg Execution Time (ms)", accessor: "avgExeTime" },
                        { Header: "Total Queries", accessor: "totalQueries" },
                        { Header: "Last Updated", accessor: "timestamp" },
                      ],
                      rows: [
                        {
                          avgExeTime: avgExeTimeData.avgExeTime,
                          totalQueries: avgExeTimeData.totalQueries,
                          timestamp: avgExeTimeData.timestamp,
                        },
                      ],
                    }}
                    entriesPerPage={5}
                    showTotalEntries
                  />
                </MDBox>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={6}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium">
                    DBs Connections
                  </MDTypography>
                  <DataTable
                    table={{
                      columns: [
                        { Header: "Database Name", accessor: "dbName" },
                        { Header: "Active Connections", accessor: "activeConnections" },
                        { Header: "Idle Connections", accessor: "idleConnections" },
                        { Header: "Available Connections", accessor: "availableConnections" },
                        { Header: "Last Updated", accessor: "latestUpdateTimestamp" },
                      ],
                      rows: originalData,
                    }}
                    entriesPerPage={5}
                    showTotalEntries
                  />
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      {/* DB Metrics Rendering ends */}

      {/* </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox> */}

      <Footer />

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Query Text</DialogTitle>
        <DialogContent>
          <MDBox>
            <pre>{modalContent}</pre>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleClose} color="primary">
            Close
          </MDButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default Overview;
