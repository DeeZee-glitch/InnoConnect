import Card from "@mui/material/Card";
import DataTable from "examples/Tables/DataTable";

// @mui material components
import Grid from "@mui/material/Grid";
import Tooltip from "@mui/material/Tooltip";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import BookingCard from "examples/Cards/BookingCard";

// Anaytics dashboard components
import SalesByCountry from "layouts/dashboards/analytics/components/SalesByCountry";

// Data
import reportsBarChartData from "layouts/dashboards/analytics/data/reportsBarChartData";
import reportsLineChartData from "layouts/dashboards/analytics/data/reportsLineChartData";

// Images
import booking1 from "assets/images/products/product-1-min.jpg";
import booking2 from "assets/images/products/product-2-min.jpg";
import booking3 from "assets/images/products/product-3-min.jpg";

//restful Services

import axios from "axios";
import React, { useEffect, useState } from "react";

function QuickAccessPage() {
  const { sales, tasks } = reportsLineChartData;
  const [counts, setCounts] = useState({
    totalFeedCount: 0,
    totalActiveFeedCount: 0,
    totalActiveMonitors: 0,
    totalMonitors: 0,
    totalRules: 0,
    totalActiveRules: 0,
    totalAlerts: 0,
  });

  //For violate Rules state

  const [dataTableData, setDataTableData] = useState({
    columns: [
      {
        Header: <span style={{ fontSize: "15px" }}>Rule Name</span>,
        accessor: "ruleName",
      },
      {
        Header: <span style={{ fontSize: "15px" }}>Monitor Name</span>,
        accessor: "auditSystemName",
      },
      {
        Header: <span style={{ fontSize: "15px" }}>Status</span>,
        accessor: "isViolated",
        width: "20%",
      },
    ],
    rows: [],
  });

  //CLose violate Rules state

  useEffect(() => {
    axios
      .get(
        "http://localhost:5555/invoke/CustomAdminUI.AZESB.interfaceAndConfig.adapter.wrapper:getAllInterfaces",
        {
          auth: {
            username: "Administrator",
            password: "manage",
          },
        }
      )
      .then((response) => {
        setCounts(response.data); // Update counts with the fetched data
      })
      .catch((error) => {
        console.error("Error fetching data:", error); // Log error for debugging
      });

    //For Rules Data

    const fetchData = async () => {
      const basicAuth = "Basic " + btoa("Administrator:manageaudit");

      try {
        const response = await fetch(
          "http://localhost:5555/restv2/BInRestInterface.restful.provider:ui/rule/all",
          {
            headers: {
              Authorization: basicAuth,
              "Content-Type": "application/json",
            },
          }
        ); // Replace with your actual API URL
        const data = await response.json();

        // Map the API response to the format expected by the DataTable
        const rows = data.auditorRules
          .filter((rule) => rule.isViolated === "TRUE") // Keep only violated rules
          .map((rule) => ({
            isViolated: rule.isViolated == "TRUE" ? "VIOLATED" : "OK",
            auditSystemName: rule.auditSystemName,
            ruleName: rule.ruleName,
          }));

        setDataTableData((prevData) => ({
          ...prevData,
          rows: rows,
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    //Close Rules Data
  }, []);

  // Action buttons for the BookingCard
  const actionButtons = (
    <>
      <Tooltip title="Refresh" placement="bottom">
        <MDTypography
          variant="body1"
          color="primary"
          lineHeight={1}
          sx={{ cursor: "pointer", mx: 3 }}
        >
          <Icon color="inherit">refresh</Icon>
        </MDTypography>
      </Tooltip>
      <Tooltip title="Edit" placement="bottom">
        <MDTypography variant="body1" color="info" lineHeight={1} sx={{ cursor: "pointer", mx: 3 }}>
          <Icon color="inherit">edit</Icon>
        </MDTypography>
      </Tooltip>
    </>
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/*<Grid container>
          <SalesByCountry />
        </Grid>*/}
        <MDBox mt={1.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="dark"
                  icon="check_circle"
                  title="Inbox"
                  percentage={{
                    color: "success",
                    amount: "Congratulations",
                    label: "than last week",
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  icon="leaderboard"
                  title="Active Monitor"
                  count={`${counts.totalActiveMonitors}/${counts.totalMonitors}`}
                  percentage={{
                    color: "success",
                    amount: "+3%",
                    label: "than last month",
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="success"
                  icon="rule"
                  title="Active Rules"
                  count={`${counts.totalActiveRules}/${counts.totalRules}`}
                  percentage={{
                    color: "success",
                    amount: "+1%",
                    label: "than yesterday",
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="primary"
                  icon="warning"
                  title="Generated Alerts"
                  count={counts.totalAlerts}
                  percentage={{
                    color: "success",
                    amount: "",
                    label: "Just updated",
                  }}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        <MDBox mt={6}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsBarChart
                  color="info"
                  title="Transaction"
                  description="Last Transaction"
                  date="Transaction sent 2 days ago"
                  chart={reportsBarChartData}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="success"
                  title="daily sales"
                  description={
                    <>
                      (<strong>+15%</strong>) increase in today sales.
                    </>
                  }
                  date="updated 4 min ago"
                  chart={sales}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="dark"
                  title="completed tasks"
                  description="Last Campaign Performance"
                  date="just updated"
                  chart={tasks}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox pt={3} px={3}>
                <MDTypography variant="h6" fontWeight="medium">
                  Top Violate Rules
                </MDTypography>
              </MDBox>
              <MDBox py={1}>
                <DataTable
                  table={dataTableData}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  isSorted={false}
                  noEndBorder
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default QuickAccessPage;
