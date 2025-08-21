import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import DefaultDoughnutChart from "examples/Charts/DoughnutCharts/DefaultDoughnutChart";
import defaultLineChartData1 from "layouts/pages/charts/data/defaultLineChartData1";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
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
  // const [loading, setLoading] = useState(true);

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
  const [doughnutChartData1, setDoughnutChartData1] = useState(null);

  //transaction start
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

  // List of available components
  const availableComponents = [
    {
      id: "ActiveFeeds",
      name: "Active Feeds",
      component: (
        <ComplexStatisticsCard
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
        <ComplexStatisticsCard
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
        <ComplexStatisticsCard
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
        <ComplexStatisticsCard
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
          chart={defaultLineChartData1}
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
          chart={defaultLineChartData1}
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
  const handleMenuClose = () => setAnchorEl(null);

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
          onClose={handleMenuClose}
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
                                backgroundColor: "gray",
                                color: "white",
                                zIndex: 10,
                              }}
                              onClick={() => handleRemoveComponent(id)}
                            >
                              <Icon>close</Icon>
                            </IconButton>
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

export default Widgets;
