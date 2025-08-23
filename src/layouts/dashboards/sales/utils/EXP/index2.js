import { useState } from "react";

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
import MiniStatisticsCard from "examples/Cards/StatisticsCards/MiniStatisticsCard";

// Data
import progressLineChartData from "layouts/pages/widgets/data/progressLineChartData";

function Widgets() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [dashboardComponents, setDashboardComponents] = useState([
    {
      id: "upcoming-events",
      component: <UpcomingEvents />,
    },
    {
      id: "progress-line-chart",
      component: (
        <ProgressLineChart
          icon="date_range"
          title="Tasks"
          count={480}
          progress={60}
          height="13.375rem"
          chart={progressLineChartData}
        />
      ),
    },
  ]);

  const [availableComponents, setAvailableComponents] = useState([
    {
      id: "upcoming-events",
      name: "Upcoming Events",
      component: <UpcomingEvents />,
    },
    {
      id: "progress-line-chart",
      name: "Tasks Chart",
      component: (
        <ProgressLineChart
          icon="date_range"
          title="Tasks"
          count={480}
          progress={60}
          height="13.375rem"
          chart={progressLineChartData}
        />
      ),
    },
    {
      id: "battery-health",
      name: "Battery Health",
      component: (
        <MiniStatisticsCard
          title={{ text: "battery health" }}
          count="99 %"
          icon={{ color: "info", component: "battery_charging_full" }}
          direction="left"
        />
      ),
    },
  ]);

  const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar state for duplicate message
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Message text for snackbar

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddComponent = (item) => {
    if (!dashboardComponents.find((component) => component.id === item.id)) {
      setDashboardComponents((prevComponents) => [...prevComponents, item]);
    } else {
      // Show snackbar if already added
      setSnackbarMessage(`"${item.name}" is already added to the dashboard.`);
      setSnackbarOpen(true);
    }
    setAnchorEl(null); // Close the dropdown
  };

  const handleRemoveComponent = (id) => {
    setDashboardComponents((prevComponents) =>
      prevComponents.filter((component) => component.id !== id)
    );
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
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
            <MenuItem key={item.id} onClick={() => handleAddComponent(item)}>
              {item.name}
            </MenuItem>
          ))}
        </Menu>
      </div>

      {/* Dashboard Components */}
      <MDBox my={3}>
        <Grid container spacing={3}>
          {dashboardComponents.map((item) => (
            <Grid item xs={12} sm={6} lg={4} key={item.id}>
              <MDBox
                position="relative"
                border="0px solid #ddd"
                borderRadius="8px"
                p={0}
                boxShadow="lg"
              >
                {/* Remove Icon */}
                <IconButton
                  size="small"
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    backgroundColor: "red",
                    color: "white",
                    zIndex: 10,
                  }}
                  onClick={() => handleRemoveComponent(item.id)}
                >
                  <Icon>close</Icon>
                </IconButton>

                {/* Component */}
                {item.component}
              </MDBox>
            </Grid>
          ))}
        </Grid>
      </MDBox>
      <Footer />
      {/* Snackbar for duplicate message */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }} // Positioned at the top-middle
      >
        <Alert onClose={handleSnackbarClose} severity="warning" sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

export default Widgets;
