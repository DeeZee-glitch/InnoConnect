import { useState } from "react";
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
import MiniStatisticsCard from "examples/Cards/StatisticsCards/MiniStatisticsCard";

// Data
import progressLineChartData from "layouts/pages/widgets/data/progressLineChartData";

function Widgets() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [dashboardComponents, setDashboardComponents] = useState([
    {
      id: "upcoming-events",
      component: <UpcomingEvents />,
      size: { xs: 12, sm: 6, lg: 4 }, // Example of dynamic size
    },
    {
      id: "progress-line-chart",
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
      size: { xs: 12, sm: 6, lg: 8 }, // Dynamic size
    },
  ]);

  const [availableComponents, setAvailableComponents] = useState([
    {
      id: "Alerts",
      name: "Generated Alerts",
      component: (
        <ComplexStatisticsCard
          color="primary"
          icon="warning"
          height="15.5rem"
          title="Generated Alerts"
          count={20}
        />
      ),
      size: { xs: 12, sm: 6, lg: 3 },
    },
    {
      id: "Alerts2",
      name: "Generated Alerts2",
      component: (
        <ComplexStatisticsCard color="primary" icon="warning" title="Generated Alerts" count={20} />
      ),
      size: { xs: 12, sm: 6, lg: 3 },
    },
    {
      id: "Alerts3",
      name: "Generated Alerts3",
      component: (
        <ComplexStatisticsCard color="primary" icon="warning" title="Generated Alerts" count={20} />
      ),
      size: { xs: 12, sm: 6, lg: 3 },
    },
    {
      id: "Alerts4",
      name: "Generated Alerts4",
      component: (
        <ComplexStatisticsCard color="info" icon="warning" title="Generated Alerts" count={20} />
      ),
      size: { xs: 12, sm: 6, lg: 3 },
    },
    {
      id: "DefaultDoughnutChart1",
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
      id: "DefaultDoughnutChart2",
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
      size: { xs: 12, sm: 6, lg: 4 },
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
          height="15.5rem"
          chart={progressLineChartData}
        />
      ),
      size: { xs: 12, sm: 6, lg: 8 },
    },
    {
      id: "battery-health2",
      name: "Battery Health2",
      component: (
        <MiniStatisticsCard
          title={{ text: "battery health" }}
          count="99 %"
          icon={{ color: "info", component: "battery_charging_full" }}
          direction="left"
        />
      ),
      size: { xs: 12, sm: 6, lg: 4 },
    },

    // Add more available components with dynamic sizes here...
  ]);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleAddComponent = (item) => {
    if (!dashboardComponents.find((component) => component.id === item.id)) {
      setDashboardComponents((prevComponents) => [...prevComponents, item]);
    } else {
      setSnackbarMessage(`"${item.name}" is already added to the dashboard.`);
      setSnackbarOpen(true);
    }
    setAnchorEl(null);
  };

  const handleRemoveComponent = (id) => {
    setDashboardComponents((prevComponents) =>
      prevComponents.filter((component) => component.id !== id)
    );
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
            <MenuItem key={item.id} onClick={() => handleAddComponent(item)}>
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
                {dashboardComponents.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided) => (
                      <Grid
                        item
                        {...item.size} // Dynamic grid size
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <MDBox position="relative" border="0px solid #ddd" borderRadius="8px" p={0}>
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
                            onClick={() => handleRemoveComponent(item.id)}
                          >
                            <Icon>close</Icon>
                          </IconButton>
                          {item.component}
                        </MDBox>
                      </Grid>
                    )}
                  </Draggable>
                ))}
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
