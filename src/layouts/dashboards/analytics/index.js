import { useState, useEffect, use } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import DefaultDoughnutChart from "examples/Charts/DoughnutCharts/DefaultDoughnutChart";
import defaultLineChartData1 from "layouts/pages/charts/data/defaultLineChartData1";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import ComplexStatisticsCardForWidget from "examples/Cards/StatisticsCards/ComplexStatisticsCardForWidget";
// import { useSnackbar } from "context/snackbarContext";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Select, InputLabel, FormControl, TextField, Chip, ListItemIcon } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import VerticalBarChart from "examples/Charts/BarCharts/VerticalBarChart";
import ViolateAlert from "./utils/violateAlert";
//
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";
import Card from "@mui/material/Card";
import { Bar } from "react-chartjs-2";
import MDTypography from "components/MDTypography";
//
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
import ProgressLineChart from "examples/Charts/LineCharts/ProgressLineChart";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { Modal, Box, Typography, Button, Drawer, Checkbox, ListItemText } from "@mui/material";
// Data
import BusinessMonitoringWidget from "layouts/dashboards/analytics/utils/businessMonitoringWidget";
import { fetchStorageDataAndSetChartData } from "./utils/getDBStorage";
import TransactionByDay from "layouts/dashboards/analytics/utils/transactionByDay";
import HomePageStats from "layouts/dashboards/analytics/utils/homePageStats";
import Chatbot from "./utils/Chatbot";
import { fetchTrxDataAndSetChartData } from "./utils/getTrxData";
//import AddIPConfigPopup from "layouts/pages/overview/utils/AddIPConfigPopup";
import AddIPConfigPopup from "layouts/dashboards/analytics/utils/AddIPConfigPopup";
// Restful Services
import axios from "axios";
import DefaultLineChart from "examples/Charts/LineCharts/DefaultLineChart";
import defaultLineChartData from "../alerts/data/defaultLineChartData";

function Widgets() {
  const [monitorList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [data, setData] = useState({ labels: [] }); // Default value for labels
  //configuration start
  const [openIPConfig, setOpenIPConfig] = useState(false);

  const handleConfigure = () => {
    setOpenIPConfig(true);
    setMenuAnchorEl(null);
    handleMenuClose(); // Close the dropdown menu when opening the popup
  };
  <AddIPConfigPopup open={openIPConfig} onClose={() => setOpenIPConfig(false)} />;

  //configuration end
  //start defining component
  // Use the custom hook to get the counts from HomePageState
  const counts = HomePageStats();
  //get DB storage
  const [storageData, setStorageData] = useState([]);
  useEffect(() => {
    fetchStorageDataAndSetChartData(setStorageData, setChartData); // Fetch data and update state
  }, []);

  const [trxData, setTrxData] = useState([]);
  const [chart2Data, setChart2Data] = useState(null);
  // get trxData
  useEffect(() => {
    fetchTrxDataAndSetChartData(setTrxData, setChart2Data); // Fetch data and update state
  }, []);

  //end defining component
  //default
  // Initialize dashboard components from localStorage or set default components
  const [dashboardComponents, setDashboardComponents] = useState(() => {
    const savedComponents = localStorage.getItem("dashboardComponents");
    const defaultComponents = [
      "ActiveFeeds",
      "ActiveMonitor",
      "ActiveRules",
      "GeneratedAlerts",
      "Transaction",
      "RAMUsage",
      "HDDUsage",
    ];

    // If there are saved components, use them, otherwise, use the default ones
    return savedComponents ? JSON.parse(savedComponents) : defaultComponents;
  });

  //default
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

  // // start doughtnutChartData
  const [doughtnutChartData1, setDoughnutChartData1] = useState(null);
  const [doughtnutChartData2, setDoughnutChartData2] = useState(null);
  const [doughtnutChartData3, setDoughnutChartData3] = useState(null);
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/systemMetrics/systemMetrics`)
      .then((response) => {
        console.log("API Response:", response.data);

        setDoughnutChartData1(transformApiDataToChartData1(response.data));
        setDoughnutChartData2(transformApiDataToChartData2(response.data));
        setDoughnutChartData3(transformApiDataToChartData3(response.data));
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  // end doughtnutChartData

  // List of available components
  const availableComponents = [
    {
      id: "ActiveFeeds",
      name: "Active Feeds",
      category: "Monitor Feed", // Define category
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
      category: "Monitor Feed", // Define category
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
      category: "Monitor Feed", // Define category
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
      category: "Monitor Feed", // Define category
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
      id: "businessMonitoring",
      name: "Business Monitoring",
      category: "Business Monitoring",
      component: (
        <BusinessMonitoringWidget
          monitorList={monitorList}
          defaultLineChartData={defaultLineChartData}
        />
      ),
      size: { xs: 12, sm: 6, lg: 12 },
    },

    {
      id: "Transaction",
      name: "Transaction",
      category: "Transaction", // Define category
      component: <TransactionByDay />, // Use the TransactionByDay component
      size: { xs: 12, sm: 6, lg: 4 },
    },
    {
      id: "CPUUsage",
      name: "CPU Usage",
      category: "Infrastructure Metrics",
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
      category: "Infrastructure Metrics",
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
      name: "Hard Disk Usage",
      category: "Infrastructure Metrics",
      component: (
        <DefaultDoughnutChart
          icon={{ color: "success", component: "donut_small" }}
          title="Hard Disk"
          height="15.5rem"
          description="Hard Disk Usage"
          chart={doughtnutChartData3}
        />
      ),
      size: { xs: 12, sm: 6, lg: 4 },
    },
    {
      id: "DBsStorage",
      name: "DBs Storage",
      category: "Infrastructure Metrics",
      component: (
        <Card>
          <MDBox pt={2} px={3} display="flex" alignItems="center">
            <Icon sx={{ mr: 1, color: "info.main" }}>storage</Icon>
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
      ),
      size: { xs: 12, sm: 6, lg: 6 },
    },
    {
      id: "TransactionsMetrics",
      name: "Transactions Metrics",
      category: "Infrastructure Metrics",
      component: (
        <Card>
          <MDBox pt={2} px={3} display="flex" alignItems="center">
            <Icon sx={{ mr: 1, color: "info.main" }}>leaderboard</Icon>
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
      ),
      size: { xs: 12, sm: 6, lg: 6 },
    },

    {
      id: "TransactionsMetrics2",
      name: "Transactions Metrics-2",
      category: "Infrastructure Metrics",
      // Render nothing if chart2Data is null or undefined
      component: chart2Data ? (
        <VerticalBarChart
          icon={{ color: "info", component: "leaderboard" }}
          title="Transactions Metrics"
          description="Transactions Metrics related to database and number of transactions"
          chart={{
            labels: chart2Data.labels || [], // Default to empty array if labels are missing
            datasets: [
              {
                label: "Number of transactions",
                color: "dark",
                data: chart2Data.datasets[0]?.data || [], // Default to empty array if data is missing
              },
            ],
          }}
        />
      ) : null,
      size: { xs: 12, sm: 6, lg: 6 },
    },

    {
      id: "DBsStorage2",
      name: "DBs Storage-2",
      category: "Infrastructure Metrics",
      // Render nothing if chartData is null or undefined
      component: chartData ? (
        <VerticalBarChart
          icon={{ color: "info", component: "storage" }}
          title="DBs Storage"
          description="Storage metrics for different databases"
          chart={{
            labels: chartData.labels || [], // Default to empty array if labels are missing
            datasets: [
              {
                label: "Storage (KB)",
                color: "dark", // Customize color if needed
                data: chartData.datasets[0]?.data || [], // Default to empty array if data is missing
              },
            ],
          }}
        />
      ) : null,
      size: { xs: 12, sm: 6, lg: 6 },
    },

    // Add more components with categories...
  ];

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Save dashboard components to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("dashboardComponents", JSON.stringify(dashboardComponents));
  }, [dashboardComponents]);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuCloseDropdown = () => setAnchorEl(null);

  // Handle multiple selections
  const [selectedPipelines, setSelectedPipelines] = useState([]);
  const handleChange = (event) => {
    setSelectedPipelines(event.target.value); // Update the selectedPipelines array with the selected component ids
  };
  // Add selected components to the dashboard
  const [anchorEl, setAnchorEl] = useState(null);
  const handleAddComponent = () => {
    selectedPipelines.forEach((id) => {
      if (!dashboardComponents.includes(id)) {
        setDashboardComponents((prev) => {
          const updatedComponents = [...prev, id];
          localStorage.setItem("dashboardComponents", JSON.stringify(updatedComponents)); // Save to localStorage
          return updatedComponents;
        });
      } else {
        setSnackbarMessage(
          `"${availableComponents.find((comp) => comp.id === id).name}" is already added.`
        );
        setSnackbarOpen(true);
      }
    });
    setAnchorEl(null); // Close the menu after saving
    // Reset selected values after saving
    setSelectedCategory(""); // Reset Category after Save
    setSelectedPipelines([]); // Reset Pipelines after Save

    // Close the drawer
    handleClose();
  };
  //

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

  //
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    // Reset selected values when the drawer is closed
    setSelectedCategory(""); // Reset Category
    setSelectedPipelines([]); // Reset Pipelines
  };

  //const handleClose = () => setOpen(false);
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  //
  const [open, setOpen] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState("");
  const [title, setTitle] = useState("");
  const handleSave = () => {
    console.log("Title:", title);
    console.log("Pipeline:", selectedPipeline);
    // Handle save logic here
    handleClose();
  };

  // Inside your Widgets function
  const [selectedCategory, setSelectedCategory] = useState(""); // State to hold the selected category

  const filteredComponents = availableComponents.filter((component) =>
    selectedCategory ? component.category === selectedCategory : true
  );

  const [hoveredId, setHoveredId] = useState(null);

  //const [selectedCategory, setSelectedCategory] = React.useState("All"); // Default to "All"
  return (
    <DashboardLayout>
      <DashboardNavbar />
      {/* Add (+) Button */}
      <div>
        {/* Button to open the drawer */}
        <div style={{ textAlign: "right", padding: "1px" }}>
          <button
            onClick={handleOpen}
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
        </div>

        {/* Right Sidebar (Drawer) */}
        <Drawer
          anchor="right"
          open={open}
          onClose={handleClose}
          PaperProps={{
            sx: {
              width: 300, // Width of the sidebar
            },
          }}
        >
          <Box
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Configuration
            </Typography>

            {/* Category Dropdown */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                label="Category"
                sx={{
                  height: 45,
                  fontSize: "0.9rem",
                }}
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                <MenuItem value="Monitor Feed">Monitor Feed</MenuItem>
                <MenuItem value="Business Monitoring">Business Monitoring</MenuItem>
                <MenuItem value="Infrastructure Metrics">Infrastructure Metrics</MenuItem>
                <MenuItem value="Transaction">Transaction</MenuItem>
                <MenuItem value="Trend Analysis">Trend Analysis</MenuItem>

                {/* Add more categories if needed */}
              </Select>
            </FormControl>

            {/* Rest of the content */}
            <Typography variant="h6" sx={{ mb: 2 }}>
              Add Component
            </Typography>
            <Select
              value={selectedPipelines}
              onChange={handleChange}
              multiple
              displayEmpty
              fullWidth
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return <em>Select components</em>;
                }
                return selected.join(", ");
              }}
              sx={{
                height: 45,
                fontSize: "0.9rem",
              }}
            >
              {filteredComponents.map((component) => (
                <MenuItem key={component.id} value={component.id}>
                  <Checkbox checked={selectedPipelines.includes(component.id)} />
                  <ListItemText
                    primaryTypographyProps={{ fontSize: "0.9rem" }}
                    primary={component.name}
                  />
                </MenuItem>
              ))}
            </Select>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: "auto" }}>
              <Button onClick={handleClose} sx={{ mr: 2 }}>
                Close
              </Button>
              <Button
                variant="contained"
                style={{ color: "white" }}
                onClick={handleAddComponent} // Add selected components
              >
                Save
              </Button>
            </Box>
          </Box>
        </Drawer>
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
                            onMouseEnter={() => setHoveredId(id)}
                            onMouseLeave={() => setHoveredId(null)}
                          >
                            {hoveredId === id && (
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
                            )}

                            {/* More Actions Menu */}
                            <Menu
                              anchorEl={menuAnchorEl[id]}
                              open={Boolean(menuAnchorEl[id])}
                              onClose={() => handleMenuClose(id)}
                              anchorOrigin={{
                                vertical: "top",
                                horizontal: "left", // Anchor on the left
                              }}
                              transformOrigin={{
                                vertical: "top",
                                horizontal: "right", // Make it open towards the left
                              }}
                            >
                              <MenuItem onClick={() => handleConfigure(id)}>
                                {" "}
                                <ListItemIcon>
                                  <SettingsIcon fontSize="small" />
                                </ListItemIcon>
                                Configure
                              </MenuItem>

                              <MenuItem onClick={() => handleDelete(id)}>
                                <ListItemIcon>
                                  <DeleteIcon fontSize="small" style={{ color: "red" }} />
                                </ListItemIcon>
                                Delete
                              </MenuItem>
                            </Menu>
                            {/* AddIPConfigPopup Component */}
                            <AddIPConfigPopup
                              open={openIPConfig}
                              onClose={() => setOpenIPConfig(false)}
                            />

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
      {/* ViolateAlert Component Usage */}
      <Grid item xs={12}>
        <ViolateAlert /> {/* This is where your ViolateAlert component will appear */}
      </Grid>
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
