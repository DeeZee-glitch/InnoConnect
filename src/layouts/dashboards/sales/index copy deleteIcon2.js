import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";

import { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

function DashboardWithWidget() {
  const [widgets, setWidgets] = useState([]);
  const [data, setData] = useState(null);

  // Function to fetch data from the REST API
  const fetchData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/restv2/homeStats`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

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
  };

  useEffect(() => {
    fetchData(); // Fetch data when the component mounts
  }, []);

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
                    color=""
                    onClick={() => removeWidget(widget.id)}
                    sx={{ position: "absolute", top: 8, right: 8 }}
                  >
                    <Icon>delete</Icon>
                  </IconButton>
                  <MDTypography variant="h6">{widget.title}</MDTypography>
                  <MDTypography variant="body2" color="text">
                    {widget.content}
                  </MDTypography>
                </MDBox>
              </Card>
            </Grid>
          ))}
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default DashboardWithWidget;
