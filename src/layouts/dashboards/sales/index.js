import React, { useState, useEffect } from "react";
// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Import react-grid-layout
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import DefaultLineChart from "examples/Charts/LineCharts/DefaultLineChart";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";

function Widgets() {
  return (
    <DashboardLayout style={{ width: "100%", padding: "0", margin: "0" }}>
      <DashboardNavbar />
      <MDBox py={5}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={6}>
            <DefaultLineChart
              icon={{ color: "info", component: "leaderboard" }}
              title="Default Line Chart"
              description="Product insights"
              chart={{
                labels: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                datasets: [
                  {
                    label: "Organic Search",
                    color: "info",
                    data: [50, 40, 300, 220, 500, 250, 400, 230, 500],
                  },
                  {
                    label: "Referral",
                    color: "dark",
                    data: [30, 90, 40, 140, 290, 290, 340, 230, 400],
                  },
                  {
                    label: "Direct",
                    color: "primary",
                    data: [40, 80, 70, 90, 30, 90, 140, 130, 200],
                  },
                ],
              }}
            />
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default Widgets;
