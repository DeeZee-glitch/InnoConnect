import { useState, useEffect, use } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import DefaultDoughnutChart from "examples/Charts/DoughnutCharts/DefaultDoughnutChart";
import defaultLineChartData1 from "layouts/pages/charts/data/defaultLineChartData1";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import ComplexStatisticsCardForWidget from "examples/Cards/StatisticsCards/ComplexStatisticsCardForWidget";
// import { useSnackbar } from "context/snackbarContext";
// @mui material components
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import { transformApiDataToChartData1 } from "layouts/pages/charts/data/defaultDoughnutChartData1";
import { transformApiDataToChartData2 } from "layouts/pages/charts/data/defaultDoughnutChartData2";
import { transformApiDataToChartData3 } from "layouts/pages/charts/data/defaultDoughnutChartData3";

// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import UpcomingEvents from "layouts/pages/widgets/components/UpcomingEvents";
import ProgressLineChart from "examples/Charts/LineCharts/ProgressLineChart";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
// Data
import progressLineChartData from "layouts/pages/widgets/data/progressLineChartData";
// Restful Services
import axios from "axios";
import DefaultLineChart from "examples/Charts/LineCharts/DefaultLineChart";

function Widgets() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);
  // const { showSnackBar } = useSnackbar();
  const [menuAnchorEl, setMenuAnchorEl] = useState({});
  const handleMenuClick = (event, id) => {
    setMenuAnchorEl((prevState) => ({
      ...prevState,
      [id]: event.currentTarget,
    }));
  };
  const handleMenuClose = (id) => {
    setMenuAnchorEl((prevState) => {
      const newState = { ...prevState };
      delete newState[id]; // Remove the entry for this card
      return newState;
    });
  };
  const handleDelete = (id) => {
    handleRemoveComponent(id);
    handleMenuClose(id);
  };
  //ComplexStatisticsCard start
  const [counts, setCounts] = useState({
    totalFeedCount: 0,
    totalActiveFeedCount: 0,
    totalActiveMonitors: 0,
    totalMonitors: 0,
    totalRules: 0,
    totalActiveRules: 0,
    totalAlerts: 0,
  });

  //

  //
  useEffect(() => {
    axios
      .get("http://172.20.150.134:5555/dashboard/dashboard/homePageStats", {
        auth: {
          username: "Administrator",
          password: "manageaudit",
        },
      })
      .then((response) => {
        setCounts(response.data); // Update counts with the fetched data
      })
      .catch((error) => {
        console.error("Error fetching data:", error); // Log error for debugging
      });
  }, []);
  //ComplexStatisticsCard end

  //transaction start
  // State to hold chart data with dynamic labels (Last 7 days)
  const [defaultLineChartData, setReportsBarChartData] = useState({
    labels: getLast7Dates(), // Setting the last 7 dates as labels
    datasets: [
      {
        label: "Transaction",
        data: [], // Data will be fetched and updated dynamically
        color: "info",
      },
    ],
  });
  //

  // Fetching data from the API and updating the chart
  useEffect(() => {
    // Fetch data from the API
    axios
      .get("http://172.20.150.134:5555/dashboard/dashboard/transaction", {
        auth: {
          username: "Administrator",
          password: "manageaudit",
        },
      })
      .then((response) => {
        // Parse the API response and update the state
        const apiData = response.data.sample_counts.split(",").map(Number);
        if (apiData) {
          setReportsBarChartData((prevData) => ({
            ...prevData,
            datasets: prevData.datasets.map((dataset) => ({
              ...dataset,
              data: apiData, // Update the data with the fetched values
            })),
          }));
        }
      })
      .catch((error) => {
        console.error("Error fetching bar chart data:", error);
      });
  }, []); // Empty dependency
  //
  const [doughtnutChartData1, setDoughnutChartData1] = useState(null);
  const [doughtnutChartData2, setDoughnutChartData2] = useState(null);
  const [doughtnutChartData3, setDoughnutChartData3] = useState(null);
  useEffect(() => {
    // Fetch API data
    const fetchDoughnutChartData1 = axios.get(
      "http://172.20.150.134:5555/systemMetrics/systemMetrics"
    ); // Replace with Doughnut Chart API
    const fetchDoughnutChartData2 = axios.get(
      "http://172.20.150.134:5555/systemMetrics/systemMetrics"
    ); // Replace with Doughnut Chart API
    const fetchDoughnutChartData3 = axios.get(
      "http://172.20.150.134:5555/systemMetrics/systemMetrics"
    ); // Replace with Doughnut Chart API

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

  //

  // List of available components
  const availableComponents = [
    {
      id: "ActiveFeeds",
      name: "Active Feeds",
      component: (
        <ComplexStatisticsCardForWidget
          color="dark"
          icon="check_circle"
          title="Active Feeds"
          count={`${counts.totalActiveFeedCount}/${counts.totalFeedCount}`}
        />
      ),
      size: { xs: 12, sm: 6, lg: 3 },
    },

    {
      id: "ActiveMonitor",
      name: "Active Monitor",
      component: (
        <ComplexStatisticsCardForWidget
          icon="leaderboard"
          title="Active Monitor"
          count={`${counts.totalActiveMonitors}/${counts.totalMonitors}`}
        />
      ),
      size: { xs: 12, sm: 6, lg: 3 },
    },
    {
      id: "ActiveRules",
      name: "Active Rules",
      component: (
        <ComplexStatisticsCardForWidget
          color="success"
          icon="rule"
          title="Active Rules"
          count={`${counts.totalActiveRules}/${counts.totalRules}`}
        />
      ),
      size: { xs: 12, sm: 6, lg: 3 },
    },
    {
      id: "GeneratedAlerts",
      name: "Generated Alerts",
      component: (
        <ComplexStatisticsCardForWidget
          color="primary"
          icon="warning"
          title="Generated Alerts"
          count={counts.totalAlerts}
        />
      ),
      size: { xs: 12, sm: 6, lg: 3 },
    },

    {
      id: "Transaction",
      name: "Transaction",
      component: (
        <DefaultLineChart
          icon={{ component: <AccountBalanceIcon /> }}
          title="Transaction"
          height="15.5rem"
          description="Transaction insights"
          chart={defaultLineChartData}
        />
      ),
      size: { xs: 12, sm: 6, lg: 6 },
    },
    {
      id: "CPUUsage",
      name: "CPU Usage",
      component: (
        <DefaultDoughnutChart
          icon={{ color: "success", component: "donut_small" }}
          title="CPU"
          height="15.5rem"
          description="CPU Usage"
          chart={doughtnutChartData1}
        />
      ),
      size: { xs: 12, sm: 6, lg: 4 },
    },
    {
      id: "RAMUsage",
      name: "RAM Usage",
      component: (
        <DefaultDoughnutChart
          icon={{ color: "success", component: "donut_small" }}
          title="RAM"
          height="15.5rem"
          description="RAM Usage"
          chart={doughtnutChartData2}
        />
      ),
      size: { xs: 12, sm: 6, lg: 4 },
    },
    {
      id: "HDDUsage",
      name: "HDD Usage",
      component: (
        <DefaultDoughnutChart
          icon={{ color: "success", component: "donut_small" }}
          title="Hard Disk"
          height="15.5rem"
          description="HDD Usage"
          chart={doughtnutChartData3}
        />
      ),
      size: { xs: 12, sm: 6, lg: 4 },
    },

    {
      id: "upcoming-events",
      name: "Upcoming Events",
      component: <UpcomingEvents />,
      size: { xs: 12, sm: 6, lg: 4 },
    },
    {
      id: "progress-line-chart",
      name: "Progress Line Chart",
      component: (
        <ProgressLineChart
          icon="date_range"
          title="Tasks"
          count={480}
          progress={60}
          height="15.5rem"
          chart={progressLineChartData}
        />
      ),
      size: { xs: 12, sm: 6, lg: 6 },
    },
  ];

  // Initialize dashboard components from localStorage
  const [dashboardComponents, setDashboardComponents] = useState(() => {
    const savedComponents = localStorage.getItem("dashboardComponents");
    return savedComponents
      ? JSON.parse(savedComponents)
      : ["upcoming-events", "progress-line-chart"];
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Save dashboard components to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("dashboardComponents", JSON.stringify(dashboardComponents));
  }, [dashboardComponents]);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuCloseDropdown = () => setAnchorEl(null);

  const handleAddComponent = (id) => {
    if (!dashboardComponents.includes(id)) {
      setDashboardComponents((prev) => [...prev, id]);
    } else {
      setSnackbarMessage(
        `"${availableComponents.find((comp) => comp.id === id).name}" is already added.`
      );
      setSnackbarOpen(true);
    }
    setAnchorEl(null);
  };

  const handleRemoveComponent = (id) => {
    setDashboardComponents((prev) => prev.filter((compId) => compId !== id));
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedComponents = Array.from(dashboardComponents);
    const [removed] = reorderedComponents.splice(result.source.index, 1);
    reorderedComponents.splice(result.destination.index, 0, removed);

    setDashboardComponents(reorderedComponents);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      {/* Add (+) Button */}
      <div style={{ textAlign: "right", padding: "1px" }}>
        <button
          onClick={handleMenuOpen}
          style={{
            backgroundColor: "#14629F",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            fontSize: "20px",
            cursor: "pointer",
          }}
        >
          +
        </button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuCloseDropdown}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          {availableComponents.map((item) => (
            <MenuItem key={item.id} onClick={() => handleAddComponent(item.id)}>
              {item.name}
            </MenuItem>
          ))}
        </Menu>
      </div>

      {/* Dashboard Components with Drag and Drop */}
      <MDBox my={3}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="dashboard">
            {(provided) => (
              <Grid container spacing={3} {...provided.droppableProps} ref={provided.innerRef}>
                {dashboardComponents.map((id, index) => {
                  const item = availableComponents.find((comp) => comp.id === id);
                  if (!item) return null; // Ignore missing components

                  return (
                    <Draggable key={id} draggableId={id} index={index}>
                      {(provided) => (
                        <Grid
                          item
                          {...item.size} // Dynamic grid size
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <MDBox
                            position="relative"
                            border="0px solid #ddd"
                            borderRadius="8px"
                            p={0}
                          >
                            <IconButton
                              size="small"
                              style={{
                                position: "absolute",
                                top: "8px",
                                right: "8px",
                                color: "black",
                                zIndex: 10,
                              }}
                              onClick={(event) => handleMenuClick(event, id)}
                            >
                              <Icon>more_horiz</Icon>
                            </IconButton>
                            <Menu
                              anchorEl={menuAnchorEl[id]}
                              open={Boolean(menuAnchorEl[id])}
                              onClose={() => handleMenuClose(id)}
                            >
                              <MenuItem onClick={() => handleDelete(id)}>Delete</MenuItem>
                            </Menu>
                            {item.component}
                          </MDBox>
                        </Grid>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </Grid>
            )}
          </Droppable>
        </DragDropContext>
      </MDBox>
      <Footer />
      {/* Snackbar for duplicate message */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity="warning" sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

// Function to generate the last 7 dates
function getLast7Dates() {
  const dates = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split("T")[0]); // Format: YYYY-MM-DD
  }
  return dates;
}

export default Widgets;
