import React, { useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import DefaultLineChart from "examples/Charts/LineCharts/DefaultLineChart";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

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

function DashboardWithWidget() {
  const [widgets, setWidgets] = useState([]); // State to hold widgets
  const [defaultLineChartData, setDefaultLineChartData] = useState({}); // Holds data for charts
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null); // Menu anchor for dropdown
  const [menuOpen, setMenuOpen] = useState(false); // Control menu open/close

  // Function to fetch data for the chart (with Basic Auth)
  const fetchData = async () => {
    try {
      const username = "Administrator";
      const password = "manageaudit";
      const encodedCredentials = btoa(`${username}:${password}`);
      const response = await fetch("http://172.20.150.134:5555/dashboard/dashboard/transaction", {
        headers: {
          Authorization: `Basic ${encodedCredentials}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        // Use the fetched data for the chart (assuming 'sample_counts' and 'dates' in the API response)
        const apiData = result.sample_counts.split(",").map(Number);
        const labels = result.dates.split(",");
        setDefaultLineChartData({
          labels: labels,
          datasets: [
            {
              label: "Transaction",
              data: apiData,
              color: "info",
            },
          ],
        });
      } else {
        console.error("Failed to fetch data:", response.status);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Load widgets from localStorage on mount
  useEffect(() => {
    const savedWidgets = localStorage.getItem("widgets");
    if (savedWidgets) {
      setWidgets(JSON.parse(savedWidgets));
    }
    fetchData(); // Fetch data for the chart when the component mounts
  }, []);

  // Save widgets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("widgets", JSON.stringify(widgets));
  }, [widgets]);

  // Add a new widget (chart)
  const addWidget = (widgetType) => {
    if (widgetType === "chart") {
      const newWidget = {
        id: widgets.length + 1,
        title: `Chart Widget ${widgets.length + 1}`,
        content: "Dynamic chart content here",
        chartData: defaultLineChartData, // Adding dynamic chart data
      };
      setWidgets([...widgets, newWidget]);
    }
    setMenuOpen(false); // Close the menu after widget is added
  };

  // Remove a widget (and its associated data)
  const removeWidget = (id) => {
    setWidgets(widgets.filter((widget) => widget.id !== id));
    setAnchorEl(null); // Close the menu after deletion
  };

  const handleMenuClick = (event, widget) => {
    setAnchorEl(event.currentTarget);
    setSelectedWidget(widget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Open the dropdown menu when the + icon is clicked
  const handleAddButtonClick = (event) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={2} display="flex" justifyContent="flex-end">
        <IconButton
          color="success"
          onClick={handleAddButtonClick} // Trigger dropdown on click
          sx={{ mr: 5 }}
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
          <Icon>add</Icon>
        </IconButton>

        {/* Dropdown menu for widget selection */}
        <Menu anchorEl={menuAnchorEl} open={menuOpen} onClose={() => setMenuOpen(false)}>
          <MenuItem onClick={() => addWidget("chart")}>Transaction</MenuItem>
          {/* Add other widget types here if needed */}
        </Menu>
      </MDBox>
      <MDBox py={3}>
        <Grid container spacing={3}>
          {widgets.map((widget) => (
            <Grid item xs={12} md={6} lg={4} key={widget.id}>
              <Card>
                <MDBox position="relative" p={2}>
                  <IconButton
                    onClick={(event) => handleMenuClick(event, widget)}
                    sx={{ position: "absolute", top: 8, right: 8 }}
                  >
                    <Icon>more_horiz</Icon>
                  </IconButton>
                  <MDTypography variant="h6">{widget.title}</MDTypography>
                  <MDTypography variant="body2" color="text">
                    {widget.content}
                  </MDTypography>
                </MDBox>

                {/* Conditionally render chart widget */}
                {widget.chartData && (
                  <MDBox mb={3}>
                    <DefaultLineChart
                      icon={{ component: <AccountBalanceIcon /> }}
                      title="Transaction"
                      height="15.5rem"
                      description="Transaction insights"
                      chart={widget.chartData} // Pass chart data specific to the widget
                    />
                  </MDBox>
                )}
              </Card>

              {/* Dropdown Menu for Delete */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl) && selectedWidget === widget}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => removeWidget(widget.id)}>Delete</MenuItem>
              </Menu>
            </Grid>
          ))}
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default DashboardWithWidget;
