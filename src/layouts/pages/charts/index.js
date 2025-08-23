// @mui material components
import { useState, useEffect } from "react";
import axios from "axios";
import Grid from "@mui/material/Grid";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DefaultLineChart from "examples/Charts/LineCharts/DefaultLineChart";
import GradientLineChart from "examples/Charts/LineCharts/GradientLineChart";
import VerticalBarChart from "examples/Charts/BarCharts/VerticalBarChart";
import HorizontalBarChart from "examples/Charts/BarCharts/HorizontalBarChart";
import MixedChart from "examples/Charts/MixedChart";
import BubbleChart from "examples/Charts/BubbleChart";
import DefaultDoughnutChart from "examples/Charts/DoughnutCharts/DefaultDoughnutChart";
import PieChart from "examples/Charts/PieChart";
import RadarChart from "examples/Charts/RadarChart";
import PolarChart from "examples/Charts/PolarChart";

// Data
//import defaultLineChartData from "layouts/pages/charts/data/defaultLineChartData";
//import gradientLineChartData from "layouts/pages/charts/data/gradientLineChartData";
import verticalBarChartData from "layouts/pages/charts/data/verticalBarChartData";
import horizontalBarChartData from "layouts/pages/charts/data/horizontalBarChartData";
//import mixedChartData from "layouts/pages/charts/data/mixedChartData";
//import bubbleChartData from "layouts/pages/charts/data/bubbleChartData";
//import defaultDoughnutChartData from "layouts/pages/charts/data/defaultDoughnutChartData";
import pieChartData from "layouts/pages/charts/data/pieChartData";
import radarChartData from "layouts/pages/charts/data/radarChartData";
import polarChartData from "layouts/pages/charts/data/polarChartData";
import { transformApiDataToChartData1 } from "layouts/pages/charts/data/defaultDoughnutChartData1";
import { transformApiDataToChartData2 } from "layouts/pages/charts/data/defaultDoughnutChartData2";
import { transformApiDataToChartData3 } from "layouts/pages/charts/data/defaultDoughnutChartData3";
import { transformApiDataToLineChartData } from "layouts/pages/charts/data/defaultLineChartData";
import { transformApiDataToLineChartData1 } from "layouts/pages/charts/data/defaultLineChartData1";
import { transformApiDataToLineChartData2 } from "layouts/pages/charts/data/defaultLineChartData2";
//import { getLineChartData } from "layouts/pages/charts/data/defaultLineChartData";

function Charts() {
  const [LineChartData, setLineChartData] = useState(null);
  const [LineChartData1, setLineChartData1] = useState(null);
  const [LineChartData2, setLineChartData2] = useState(null);

  const [doughnutChartData1, setDoughnutChartData1] = useState(null);
  const [doughtnutChartData2, setDoughnutChartData2] = useState(null);
  const [doughtnutChartData3, setDoughnutChartData3] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    //const keys = ["CPU1", "CPU2", "CPU3", "CPU4"]; // List of keys

    // Fetch API data
    // const fetchLineChartData= keys.map((key) =>
    //                    axios.get(`http://localhost:5555/systemMetrics/systemMetrics?metrics=${key}`));

    const fetchCPU1 = axios.get(
      `${process.env.REACT_APP_API_URL}/systemMetrics/systemMetrics?metrics=CPU1`
    );
    const fetchCPU2 = axios.get(
      `${process.env.REACT_APP_API_URL}/systemMetrics/systemMetrics?metrics=CPU2`
    );
    const fetchCPU3 = axios.get(
      `${process.env.REACT_APP_API_URL}/systemMetrics/systemMetrics?metrics=CPU3`
    );
    const fetchCPU4 = axios.get(
      `${process.env.REACT_APP_API_URL}/systemMetrics/systemMetrics?metrics=CPU4`
    );

    const fetchLineChartData1 = axios.get(
      "${process.env.REACT_APP_API_URL}/systemMetrics/systemMetrics?metrics=RAM"
    );

    const fetchFD1 = axios.get(
      `${process.env.REACT_APP_API_URL}/systemMetrics/systemMetrics?metrics=FD1`
    );
    const fetchFD3 = axios.get(
      `${process.env.REACT_APP_API_URL}/systemMetrics/systemMetrics?metrics=FD3`
    );
    const fetchFD4 = axios.get(
      `${process.env.REACT_APP_API_URL}/systemMetrics/systemMetrics?metrics=FD4`
    );

    // const fetchLineChartData2 = axios.get("http://localhost:5555/systemMetrics/systemMetrics?metrics=FD1");
    // Replace with Line Chart API
    const fetchDoughnutChartData1 = axios.get(
      "${process.env.REACT_APP_API_URL}/systemMetrics/systemMetrics"
    ); // Replace with Doughnut Chart API
    const fetchDoughnutChartData2 = axios.get(
      "${process.env.REACT_APP_API_URL}/systemMetrics/systemMetrics"
    ); // Replace with Doughnut Chart API
    const fetchDoughnutChartData3 = axios.get(
      "${process.env.REACT_APP_API_URL}/systemMetrics/systemMetrics"
    ); // Replace with Doughnut Chart API

    // Fetch both APIs simultaneously
    Promise.all([
      fetchCPU1,
      fetchCPU2,
      fetchCPU3,
      fetchCPU4,
      fetchLineChartData1,
      fetchFD1,
      fetchFD3,
      fetchFD4,
      fetchDoughnutChartData1,
      fetchDoughnutChartData2,
      fetchDoughnutChartData3,
    ])
      .then(
        ([
          responseCPU1,
          responseCPU2,
          responseCPU3,
          responseCPU4,
          lineChart1Response,
          responseFD1,
          responseFD3,
          responseFD4,
          doughnutChartResponse1,
          doughnutChartResponse2,
          doughnutChartResponse3,
        ]) => {
          // Transform and set data
          //const fetchLineChartData = transformApiDataToLineChartData(lineChartResponse.data);
          const cpu1Data = transformApiDataToLineChartData(responseCPU1.data, "CPU1");
          const cpu2Data = transformApiDataToLineChartData(responseCPU2.data, "CPU2");
          const cpu3Data = transformApiDataToLineChartData(responseCPU3.data, "CPU3");
          const cpu4Data = transformApiDataToLineChartData(responseCPU4.data, "CPU4");

          //Combine datasets into one line chart data structure
          const combinedData = {
            labels: cpu1Data.labels, // Assuming all CPUs have the same labels (timestamps)
            datasets: [
              {
                label: "CPU1",
                data: cpu1Data.datasets[0].data,
                borderColor: "#FF0000",
                backgroundColor: "rgba(255, 0, 0, 0.2)",
                tension: 0.4,
              },
              {
                label: "CPU2",
                data: cpu2Data.datasets[0].data,
                borderColor: "#00FF00",
                backgroundColor: "rgba(0, 255, 0, 0.2)",
                tension: 0.4,
              },
              {
                label: "CPU3",
                data: cpu3Data.datasets[0].data,
                borderColor: "#0000FF",
                backgroundColor: "rgba(0, 0, 255, 0.2)",
                tension: 0.4,
              },
              {
                label: "CPU4",
                data: cpu4Data.datasets[0].data,
                borderColor: "#FFFF00",
                backgroundColor: "rgba(0, 0, 255, 0.2)",
                tension: 0.4,
              },
            ],
          };
          const fetchLineChartData1 = transformApiDataToLineChartData1(lineChart1Response.data);

          const fd1Data = transformApiDataToLineChartData2(responseFD1.data, "FD1");
          const fd3Data = transformApiDataToLineChartData2(responseFD3.data, "FD3");
          const fd4Data = transformApiDataToLineChartData2(responseFD4.data, "FD4");
          const combinedData1 = {
            labels: fd1Data.labels, // Assuming all CPUs have the same labels (timestamps)
            datasets: [
              {
                label: "FD1",
                data: fd1Data.datasets[0].data,
                borderColor: "#f00",
                backgroundColor: "rgba(255, 0, 0, 0.2)",
                tension: 0.4,
              },
              {
                label: "FD3",
                data: fd3Data.datasets[0].data,
                borderColor: "#0f0",
                backgroundColor: "rgba(0, 255, 0, 0.2)",
                tension: 0.4,
              },
              {
                label: "FD4",
                data: fd4Data.datasets[0].data,
                borderColor: "#00f",
                backgroundColor: "rgba(0, 0, 255, 0.2)",
                tension: 0.4,
              },
            ],
          };

          //const fetchLineChartData1 =transformApiDataToLineChartData1(lineChart1Response.data);
          //const fetchLineChartData2=transformApiDataToLineChartData2(lineChart2Response.data);
          // Transform API response into chart data

          const fetchDoughnutChartData1 = transformApiDataToChartData1(doughnutChartResponse1.data);
          const fetchDoughnutChartData2 = transformApiDataToChartData2(doughnutChartResponse2.data);
          const fetchDoughnutChartData3 = transformApiDataToChartData3(doughnutChartResponse3.data);

          setLineChartData(combinedData);
          setLineChartData1(fetchLineChartData1);
          setLineChartData2(combinedData1);
          setDoughnutChartData1(fetchDoughnutChartData1);
          setDoughnutChartData2(fetchDoughnutChartData2);
          setDoughnutChartData3(fetchDoughnutChartData3);
        }
      )
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

  if (loading) {
    return <div>Loading...</div>; // Handle loading state
  }
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox my={3}>
        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} sx={{ lineHeight: 0 }}>
              <MDTypography variant="h5">Charts</MDTypography>
              <MDTypography variant="button" color="text">
                Charts on this page use Chart.js - Simple yet flexible JavaScript charting for
                designers & developers.
              </MDTypography>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox mb={6}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <DefaultLineChart
                icon={{ component: "insights" }}
                title="CPUs Metrics"
                height="20rem"
                description=""
                chart={LineChartData}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DefaultLineChart
                icon={{ component: "insights" }}
                title="RAM Metrics"
                height="20rem"
                description=""
                chart={LineChartData1}
              />
            </Grid>
          </Grid>
        </MDBox>
        <MDBox mb={6}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <DefaultLineChart
                icon={{ component: "insights" }}
                title="FixedDisks Metrics"
                height="20rem"
                description=""
                chart={LineChartData2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DefaultDoughnutChart
                icon={{ color: "success", component: "donut_small" }}
                title="CPU"
                height="20rem"
                description="CPU Usage"
                chart={doughnutChartData1}
              />
            </Grid>
          </Grid>
        </MDBox>
        <MDBox mb={6}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <DefaultDoughnutChart
                icon={{ color: "success", component: "donut_small" }}
                title="RAM"
                height="20rem"
                description="RAM Usage"
                chart={doughtnutChartData2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DefaultDoughnutChart
                icon={{ color: "success", component: "donut_small" }}
                title="Hard Disk"
                height="20rem"
                description="HDD Usage"
                chart={doughtnutChartData3}
              />
            </Grid>
          </Grid>
        </MDBox>
        {/* <MDBox mb={6}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
            <HorizontalBarChart
                icon={{ color: "dark", component: "splitscreen" }}
                title="Bar chart horizontal"
                height="20rem"
                description="Sales related to age average"
                chart={horizontalBarChartData}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PieChart
                icon={{ color: "success", component: "donut_small" }}
                title="Pie chart"
                height="20rem"
                description="Analytics Insights"
                chart={pieChartData}
              />
            </Grid>
          </Grid>
        </MDBox> */}
        {/* <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <RadarChart
                icon={{ color: "warning", component: "data_saver_on" }}
                title="Radar chart"
                height="32rem"
                description="Sciences score"
                chart={radarChartData}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <PolarChart
                icon={{ color: "warning", component: "scatter_plot" }}
                title="Polar chart"
                height="32rem"
                description="Analytics Insights"
                chart={polarChartData}
              />
            </Grid>
          </Grid>
        </MDBox> */}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Charts;
