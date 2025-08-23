import React, { useState, useEffect } from "react";
import { Grid, FormControl, InputLabel, Select, MenuItem, TextField } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Card, CardContent } from "@mui/material";

import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import MDBox from "components/MDBox";
import DefaultLineChart from "examples/Charts/LineCharts/DefaultLineChart";

const BusinessMonitoringWidget = ({ defaultLineChartData }) => {
  const [selectedMonitor, setSelectedMonitor] = useState("");
  const [selectedMonitorId, setSelectedMonitorId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [interval, setInterval] = useState("Daily");
  const [lineChartData, setLineChartData] = useState(defaultLineChartData);
  const [monitorList, setMonitorList] = useState([]);
  const formatDate = (date) => {
    const isoString = date.toISOString();
    return isoString.slice(0, 19);
  };

  useEffect(() => {
    const currentDate = new Date();
    const pastDate = new Date(currentDate);
    pastDate.setDate(currentDate.getDate() - 30);
    setStartDate(formatDate(pastDate));
    setEndDate(formatDate(currentDate));
  }, []);
  //
  useEffect(() => {
    const fetchMonitorList = async () => {
      try {
        const authHeader = `Basic ${btoa(
          `${process.env.REACT_APP_AUTH_USER}:${process.env.REACT_APP_AUTH_PASS}`
        )}`;
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/businessMonitoring/businessMonitoring`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: authHeader,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch monitor list.");
        const data = await response.json();
        setMonitorList(data.results || []);
      } catch (error) {
        console.error("Error fetching monitors:", error);
      }
    };

    fetchMonitorList();
  }, []);

  //
  useEffect(() => {
    const lastSelectedMonitor = localStorage.getItem("selectedMonitor");
    if (lastSelectedMonitor) {
      setSelectedMonitor(lastSelectedMonitor);
      const monitor = monitorList.find((m) => m.monitor_system_name === lastSelectedMonitor);
      setSelectedMonitorId(monitor ? monitor.monitor_id : "");
    }
  }, [monitorList]);

  //

  //

  useEffect(() => {
    const fetchChartData = async () => {
      if (!selectedMonitorId || !startDate || !endDate || !interval) return;

      const payload = {
        start_date: startDate,
        end_date: endDate,
        monitor_id: selectedMonitorId,
        interval: interval,
      };

      try {
        const authHeader = `Basic ${btoa(
          `${process.env.REACT_APP_AUTH_USER}:${process.env.REACT_APP_AUTH_PASS}`
        )}`;
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/restv2/ZAsif.adaptores:businessmonitor/getDataWithInterval`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: authHeader,
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) throw new Error("Failed to fetch data.");

        const responseData = await response.json();
        const result = responseData.results[0]?.data_string || "{}";
        const parsedData = JSON.parse(result);

        const labels = Object.keys(parsedData);
        const values = Object.values(parsedData);

        const chartData = {
          labels,
          datasets: [
            {
              label: "Transaction",
              data: values,
              fill: false,
              borderColor: "#ff6384",
              tension: 0.1,
            },
          ],
        };

        setLineChartData(chartData);
      } catch (error) {
        console.error("Error fetching chart data:", error);
        alert("Failed to fetch chart data. Please try again.");
      }
    };

    fetchChartData();
  }, [selectedMonitorId, startDate, endDate, interval]);

  return (
    <Card
      sx={{
        backgroundColor: "white",
        padding: "1px",
        borderRadius: "15px",
      }}
    >
      <CardContent sx={{ marginBottom: "-60px" }}>
        <Grid item xs={12}>
          <MDBox py={3}>
            <MDBox py={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <MDBox
                  display="flex"
                  style={{ backgroundColor: "white", padding: "5px", borderRadius: "10px" }}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Select Monitor</InputLabel>
                        <Select
                          value={selectedMonitor}
                          onChange={(event) => {
                            const monitorName = event.target.value;
                            setSelectedMonitor(monitorName);
                            localStorage.setItem("selectedMonitor", monitorName);
                            const monitor = monitorList.find(
                              (m) => m.monitor_system_name === monitorName
                            );
                            setSelectedMonitorId(monitor ? monitor.monitor_id : "");
                          }}
                          label="Select Monitor"
                          sx={{ height: 45, fontSize: "0.9rem" }}
                        >
                          {monitorList.map((monitor, index) => (
                            <MenuItem key={index} value={monitor.monitor_system_name}>
                              {monitor.monitor_system_name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={2}>
                      <TextField
                        label="Start Date"
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    <Grid item xs={12} md={2}>
                      <TextField
                        label="End Date"
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Interval</InputLabel>
                        <Select
                          value={interval}
                          onChange={(e) => setInterval(e.target.value)}
                          label="Interval"
                          sx={{ height: 45, fontSize: "0.9rem" }}
                        >
                          <MenuItem value="Daily">Daily</MenuItem>
                          <MenuItem value="Monthly">Monthly</MenuItem>
                          <MenuItem value="Hourly">Hourly</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </MDBox>
              </LocalizationProvider>

              <MDBox mt={4}>
                {lineChartData ? (
                  <DefaultLineChart
                    icon={{ component: "insights" }}
                    title="Transaction"
                    height="20rem"
                    chart={lineChartData}
                  />
                ) : (
                  <p>Loading chart data...</p>
                )}
              </MDBox>
            </MDBox>
          </MDBox>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default BusinessMonitoringWidget;
