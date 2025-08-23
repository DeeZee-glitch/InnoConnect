import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

function DashboardWithWidget() {
  const [widgets, setWidgets] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedWidget, setSelectedWidget] = useState(null);

  // Add a new widget
  const addWidget = () => {
    const newWidget = {
      id: widgets.length + 1,
      title: `Widget ${widgets.length + 1}`,
      content: "Dynamic content here",
    };
    setWidgets([...widgets, newWidget]);
  };

  // Remove a widget
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

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={2} display="flex" justifyContent="flex-end">
        <IconButton color="success" onClick={addWidget} sx={{ mr: 5 }}>
          <Icon>add</Icon>
        </IconButton>
      </MDBox>
      <MDBox py={3}>
        <Grid container spacing={3}>
          {widgets.map((widget) => (
            <Grid item xs={12} sm={6} lg={4} key={widget.id}>
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
