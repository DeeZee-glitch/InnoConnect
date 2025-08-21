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

function DBMetrics() {
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

  // Fetch all necessary data when the page loads
  useEffect(() => {
    const fetchData = async () => {
      const basicAuth = "Basic " + btoa("Administrator:manageaudit");

      // Fetch connection data
      try {
        const connectionResponse = await fetch(
          "http://localhost:5555/restv2/BInRestInterface.restful.provider:ui/getConnections",
          {
            method: "GET",
            headers: {
              Authorization: basicAuth,
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
          "http://localhost:5555/restv2/BInRestInterface.restful.provider:ui/getQueryPerf?queryType=SLOWQUERIES",
          {
            method: "GET",
            headers: {
              Authorization: basicAuth,
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
          "http://localhost:5555/restv2/BInRestInterface.restful.provider:ui/getQueryPerf?queryType=HIGHCONSQUERIES",
          {
            method: "GET",
            headers: {
              Authorization: basicAuth,
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
              onClick={() => handleOpen(query.queryText)}
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
          "http://localhost:5555/restv2/BInRestInterface.restful.provider:ui/getUsrActMetrics",
          {
            method: "GET",
            headers: {
              Authorization: basicAuth,
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
          "http://localhost:5555/restv2/BInRestInterface.restful.provider:ui/getErrorTracking",
          {
            method: "GET",
            headers: {
              Authorization: basicAuth,
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
          `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider:ui/getQueryPerf?queryType=AVGEXECTIME`,
          {
            method: "GET",
            headers: {
              Authorization: basicAuth,
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

  // Function to handle modal open
  const handleOpen = (content) => {
    setModalContent(content);
    setOpen(true);
  };

  // Function to handle modal close
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          {/* Export Button
          <MDButton
            variant="contained"
            color="info"
            onClick={() =>
              exportToCSV(originalData, [
                { Header: "Database Name", accessor: "dbName" },
                { Header: "Active Connections", accessor: "activeConnections" },
                { Header: "Idle Connections", accessor: "idleConnections" },
                { Header: "Available Connections", accessor: "availableConnections" },
                { Header: "Last Updated", accessor: "latestUpdateTimestamp" },
              ])
            }
          >
            <Icon>description</Icon>
            &nbsp;Export
          </MDButton> */}
        </MDBox>

        {/* Display tables */}
        <Grid container spacing={3}>
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
      <Footer />

      {/* DB Modal for displaying query text */}
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

export default DBMetrics;
