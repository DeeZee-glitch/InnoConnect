/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import { v4 as uuidv4 } from "uuid";
import DefaultDoughnutChart from "examples/Charts/DoughnutCharts/DefaultDoughnutChart";
import DefaultLineChart from "examples/Charts/LineCharts/DefaultLineChart";
import {
  Card,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  TextField,
  Box,
  IconButton,
  Menu,
  CircularProgress,
} from "@mui/material";
import { Close, PieChart, ShowChart, TableChart } from "@mui/icons-material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { useSnackbar } from "context/snackbarContext";
import { getToken } from "hooks/keycloakService";
import keycloak from "hooks/keycloakInstance";
import configs from "examples/Charts/LineCharts/DefaultLineChart/configs";
import { jwtDecode } from "jwt-decode";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const widgetTypes = {
  LINE_CHART: "LINE_CHART",
  DOUGHNUT_CHART: "DOUGHNUT_CHART",
  TABLE: "TABLE",
};

const initialWidgets = [
  {
    id: uuidv4(),
    type: widgetTypes.TABLE,
    title: "API Performance Data",
    layout: { i: "initial-table", x: 0, y: 0, w: 12, h: 4, minW: 4, minH: 3 },
  },
];

const SmartAnalytics = () => {
  const { showSnackbar } = useSnackbar();
  const token = getToken();

  const getPreferredUsername = () => {
    const decodedToken = jwtDecode(token);
    return decodedToken.preferred_username;
  };

  const getUserSpecificKey = () => {
    const username = getPreferredUsername();
    return `dashboardLayout_${username}`;
  };

  // const [widgets, setWidgets] = useState(() => {
  //   const userKey = getUserSpecificKey();
  //   const saved = localStorage.getItem(userKey);
  //   return saved ? JSON.parse(saved) : initialWidgets;
  // });
  const [widgets, setWidgets] = useState([]);
  const updateWidgetLayout = async (widget) => {
    try {
      await fetch(
        `https://172.20.150.10:8098/user/${getPreferredUsername()}/dashboard/widgets/${widget.type}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            x_layout: widget.layout.x,
            y_layout: widget.layout.y,
            w_layout: widget.layout.w,
            h_layout: widget.layout.h,
          }),
        }
      );
    } catch (err) {
      console.error(`Failed to update widget ${widget.type}:`, err);
    }
  };

  const createWidgetInBackend = async (widget) => {
    try {
      await fetch(`https://172.20.150.10:8098/user/${getPreferredUsername()}/dashboard/widgets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          widget_name: widget.type,
          x_layout: widget.layout.x,
          y_layout: widget.layout.y,
          w_layout: widget.layout.w,
          h_layout: widget.layout.h,
        }),
      });
    } catch (err) {
      console.error("Failed to save new widget:", err);
    }
  };

  // This will restore the layout from the backend if available

  useEffect(() => {
    async function loadWidgets() {
      try {
        const storedApi = localStorage.getItem("preferredApi"); // <-- Read here
        if (storedApi) {
          setSelectedApi(storedApi); // Optional: set it in state too
        }
        await fetchApiList();
        const res = await fetch(
          `https://172.20.150.10:8098/user/${getPreferredUsername()}/dashboard/widgets`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch widgets");

        const data = await res.json();

        // If no widgets found, include the default Table widget
        let widgetsData = data;
        if (!widgetsData || widgetsData.length === 0) {
          const defaultTableWidget = {
            widget_name: widgetTypes.TABLE,
            x_layout: 0,
            y_layout: 0,
            w_layout: 12,
            h_layout: 4,
          };

          // Save to backend
          await fetch(
            `https://172.20.150.10:8098/user/${getPreferredUsername()}/dashboard/widgets`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(defaultTableWidget),
            }
          );

          widgetsData = [defaultTableWidget];
        }

        const restoredWidgets = widgetsData.map(
          ({ widget_name, x_layout, y_layout, w_layout, h_layout }) => ({
            id: uuidv4(),
            widget_name,
            type: widget_name,
            title: getApiBasedTitle(widget_name, storedApi || selectedApi), // use storedApi
            layout: {
              i: uuidv4(),
              x: x_layout,
              y: y_layout,
              w: w_layout,
              h: h_layout,
              minW: 4,
              minH: 3,
            },
          })
        );

        setWidgets(restoredWidgets);
      } catch (error) {
        console.error("Error loading widgets:", error);
        setWidgets(initialWidgets);
      }
    }

    loadWidgets();
  }, []);

  const [newWidgetIds, setNewWidgetIds] = useState(new Set());
  const [lineChartData, setLineChartData] = useState("");
  const [doughnutChartData, setDoughnutChartData] = useState("");
  const [apiList, setApiList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedApi, setSelectedApi] = useState(() => localStorage.getItem("preferredApi") || "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [interval, setInterval] = useState("");
  const [selectedWidgetTypes, setSelectedWidgetTypes] = useState([]);
  const [hasInitialized, setHasInitialized] = useState(false);

  const getTitleForType = (type) => {
    switch (type) {
      case widgetTypes.LINE_CHART:
        return "Transaction Metrics";
      case widgetTypes.DOUGHNUT_CHART:
        return "Request Data";
      case widgetTypes.TABLE:
        return "API Performance Data";
      default:
        return "New Widget";
    }
  };

  const getApiBasedTitle = (type, selectedApi) => {
    const baseTitle = getTitleForType(type);
    return selectedApi ? `${baseTitle} for ${selectedApi}` : baseTitle;
  };

  const handleAddWidgets = () => {
    const typesToAdd = [...new Set(selectedWidgetTypes)];
    const currentWidgets = [...widgets];
    const newWidgets = [];
    const duplicateTypes = new Set();

    typesToAdd.forEach((type) => {
      if (type !== widgetTypes.TABLE && currentWidgets.some((w) => w.type === type)) {
        duplicateTypes.add(type);
        return;
      }

      const newWidgetWidth =
        type === widgetTypes.TABLE ? 12 : type === widgetTypes.LINE_CHART ? 8 : 4;
      const newWidgetHeight = 4;

      let newX = 0;
      let newY = 0;
      const cols = 12;

      const sortedWidgets = [...currentWidgets, ...newWidgets].sort((a, b) => {
        if (a.layout.y === b.layout.y) return a.layout.x - b.layout.x;
        return a.layout.y - b.layout.y;
      });

      let currentY = 0;
      let rowWidth = 0;

      for (const widget of sortedWidgets) {
        if (widget.layout.y > currentY) {
          if (rowWidth + newWidgetWidth <= cols) {
            newX = rowWidth;
            newY = currentY;
            break;
          }
          currentY = widget.layout.y;
          rowWidth = 0;
        }
        rowWidth += widget.layout.w;
        if (rowWidth >= cols) {
          currentY++;
          rowWidth = 0;
        }
      }

      if (rowWidth + newWidgetWidth <= cols) {
        newX = rowWidth;
        newY = currentY;
      } else {
        newY = currentY + 1;
        newX = 0;
      }

      newWidgets.push({
        id: uuidv4(),
        widget_name: type, // Store the widget type as name
        type,
        title: getApiBasedTitle(type, selectedApi),
        layout: {
          i: uuidv4(),
          x: newX,
          y: newY,
          w: newWidgetWidth,
          h: newWidgetHeight,
          minW: 4,
          minH: 3,
        },
      });
    });

    if (duplicateTypes.size > 0) {
      const duplicateList = Array.from(duplicateTypes)
        .map((type) => {
          switch (type) {
            case widgetTypes.LINE_CHART:
              return "Line Chart";
            case widgetTypes.DOUGHNUT_CHART:
              return "Doughnut Chart";
            default:
              return "";
          }
        })
        .join(", ");
      showSnackbar(`These widgets already exist and were skipped: ${duplicateList}`);
    }

    if (newWidgets.length === 0) {
      showSnackbar("No new widgets to add");
      return;
    }

    setWidgets((prev) => {
      const updatedWidgets = [...prev, ...newWidgets];
      const userKey = getUserSpecificKey();
      localStorage.setItem(userKey, JSON.stringify(updatedWidgets));
      return updatedWidgets;
    });

    // Persist each new widget
    newWidgets.forEach((widget) => {
      createWidgetInBackend(widget);
    });

    setNewWidgetIds((prev) => {
      const newSet = new Set(prev);
      newWidgets.forEach((w) => newSet.add(w.id));
      return newSet;
    });

    setTimeout(() => {
      setNewWidgetIds((prev) => {
        const newSet = new Set(prev);
        newWidgets.forEach((w) => newSet.delete(w.id));
        return newSet;
      });
    }, 500);

    setSelectedWidgetTypes([]);
  };

  const fetchStatsData = async (api) => {
    const payload = { startTime: startDate, endTime: endDate, interval, apiName: api };
    const token1 = getToken();
    try {
      setLoading(true);
      const response = await fetch("https://172.20.150.10:8098/smartlogger/getAnalytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token1}`,
        },
        body: JSON.stringify(payload),
      });
      if (response.status === 401) {
        showSnackbar("401 Unauthorized: ACCESS DENIED.");
        return;
      }
      const data = await response.json();
      const responseData = data || {};
      const timeSeries = responseData.timeSeries || [];
      const newDoughnutChartData = {
        labels: ["Successful Requests", "Failed Requests", "Validation Requests"],
        datasets: {
          label: "Requests",
          backgroundColors: ["#4CAF50", "#FF0000", "#FFA500"],
          data: [
            Number(responseData.successfulRequests) || 0,
            Number(responseData.failedRequests) || 0,
            Number(responseData.validationRequests) || 0,
          ],
        },
      };
      setDoughnutChartData(newDoughnutChartData);
      const newLineChartData = {
        labels: timeSeries.map(
          (entry) => new Date(entry.timestamp).toISOString().slice(0, 16) + "Z"
        ),
        datasets: [
          {
            label: "Total Count",
            data: timeSeries.map((entry) => Number(entry.totalCount)),
            borderColor: "#FF0000",
            tension: 0.4,
          },
          {
            label: "Success Count",
            data: timeSeries.map((entry) => Number(entry.successCount)),
            borderColor: "#00FF00",
            tension: 0.4,
          },
          {
            label: "Validation Count",
            data: timeSeries.map((entry) => Number(entry.validationCount)),
            borderColor: "#0000FF",
            tension: 0.4,
          },
          {
            label: "Error Count",
            data: timeSeries.map((entry) => Number(entry.errorCount)),
            borderColor: "#FFFF00",
            tension: 0.4,
          },
        ],
      };
      setLineChartData(newLineChartData);
      // Pass the labels and datasets to the `configs` function
      const lineChartData = configs(newLineChartData.labels, newLineChartData.datasets);
    } catch (error) {
      showSnackbar("Failed to fetch stats data. Please try again.", error);
    }
  };

  const fetchTableData = async (api, startDate, endDate) => {
    const payload = {
      startTime: startDate || "",
      endTime: endDate || "",
      apiName: api || "",
    };
    const token1 = getToken();
    try {
      setLoading(true);
      const response = await fetch("https://172.20.150.10:8098/smartlogger/statistics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token1}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setTableData(
        (data || []).map((entry, index) => ({
          index: index + 1,
          apiName: entry.apiName,
          totalHits: entry.totalHits,
          successCount: entry.successCount,
          errorCount: entry.errorCount,
          averageTime: entry.averageTime,
          validationError: entry.validationError,
        }))
      );
    } catch (error) {
      showSnackbar("Failed to fetch table data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchApiList = async () => {
    const token1 = getToken();
    try {
      setLoading(true);
      const response = await fetch("https://172.20.150.10:8098/smartlogger/api-names", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token1}`,
        },
      });
      const data = await response.json();
      setApiList(data || []);
    } catch (error) {
      showSnackbar("Failed to fetch API names. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removeWidget = async (id) => {
    const widgetToRemove = widgets.find((w) => w.id === id);
    if (!widgetToRemove) return;

    try {
      const res = await fetch(
        `https://172.20.150.10:8098/user/${getPreferredUsername()}/dashboard/widgets/${widgetToRemove.widget_name}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Delete failed");

      setWidgets((prev) => {
        const updated = prev.filter((w) => w.id !== id);
        const userKey = getUserSpecificKey();
        localStorage.setItem(userKey, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error("Failed to delete widget:", error);
    }
  };

  const handleApiChange = (event) => {
    const api = event.target.value;
    setSelectedApi(api);
    localStorage.setItem("preferredApi", api); // ✅ use `api` not `selectedApi`

    fetchStatsData(api);
    fetchTableData(api);
  };

  const handleIntervalChange = (event) => {
    setInterval(event.target.value);
  };

  const handleStartDateChange = (event) => {
    const newStartDate = event.target.value;
    if (newStartDate > new Date().toISOString()) {
      setDateError("Start date cannot be in the future");
      return;
    }
    setDateError("");
    setStartDate(newStartDate);
  };

  const handleEndDateChange = (event) => {
    const newEndDate = event.target.value;
    if (newEndDate > new Date().toISOString()) {
      setDateError("End date cannot be in the future");
      return;
    }
    if (newEndDate < startDate) {
      setDateError("End date cannot be before start date");
      return;
    }
    setDateError("");
    setEndDate(newEndDate);
  };

  useEffect(() => {
    if (keycloak.authenticated) {
      const userKey = getUserSpecificKey();
      const saved = localStorage.getItem(userKey);
      setWidgets(saved ? JSON.parse(saved) : initialWidgets);
    }
  }, [keycloak.authenticated]);

  useEffect(() => {
    if (!hasInitialized) return;

    fetchStatsData(selectedApi);
    fetchTableData(selectedApi);
  }, [selectedApi, startDate, endDate, interval, hasInitialized]);

  useEffect(() => {
    fetchStatsData(selectedApi);
    fetchTableData(selectedApi);
  }, [selectedApi, startDate, endDate, interval]);

  // Simple dual-axis compaction function
  function dualAxisCompact(layout) {
    // Create a copy and sort by y then x for consistency
    const sorted = [...layout].sort((a, b) => a.y - b.y || a.x - b.x);
    let moved = true;
    while (moved) {
      moved = false;
      sorted.forEach((item) => {
        // Try to move left if no collision
        if (
          item.x > 0 &&
          !sorted.some((other) => other.i !== item.i && collides({ ...item, x: item.x - 1 }, other))
        ) {
          item.x--;
          moved = true;
        }
        // Try to move up if no collision
        if (
          item.y > 0 &&
          !sorted.some((other) => other.i !== item.i && collides({ ...item, y: item.y - 1 }, other))
        ) {
          item.y--;
          moved = true;
        }
      });
    }
    return sorted;
  }

  // Helper collision detection function
  function collides(a, b) {
    return !(a.x + a.w <= b.x || a.x >= b.x + b.w || a.y + a.h <= b.y || a.y >= b.y + b.h);
  }

  const renderWidget = (widget) => {
    switch (widget.type) {
      case widgetTypes.LINE_CHART:
        return (
          <Box sx={{ height: "calc(100% - 40px)", padding: "20px 10px" }}>
            <DefaultLineChart
              chart={{
                ...lineChartData,
                options: {
                  ...lineChartData.options,
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                  },
                },
              }}
            />
          </Box>
        );
      case widgetTypes.DOUGHNUT_CHART:
        return (
          <Box sx={{ height: "calc(100% - 40px)", padding: "20px" }}>
            <DefaultDoughnutChart
              chart={{
                ...doughnutChartData,
                options: {
                  ...doughnutChartData.options,
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: {
                        usePointStyle: true,
                        padding: 20,
                      },
                    },
                  },
                },
              }}
            />
          </Box>
        );
      case widgetTypes.TABLE:
        return (
          <Box sx={{ height: "calc(100% - 40px)", overflow: "auto" }}>
            <DataTable
              table={{
                columns: [
                  { Header: "Index", accessor: "index" },
                  { Header: "API Name", accessor: "apiName" },
                  { Header: "Total Hits", accessor: "totalHits" },
                  { Header: "Success Count", accessor: "successCount" },
                  { Header: "Error Count", accessor: "errorCount" },
                  { Header: "Average Time (ms)", accessor: "averageTime" },
                  { Header: "Validation Error", accessor: "validationError" },
                ],
                rows: tableData,
              }}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Card
          sx={{
            p: 3,
            mb: 4,
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            backgroundColor: "#ffffff",
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Select API</InputLabel>
                {/* In the API Select component */}
                <Select
                  value={selectedApi}
                  onChange={handleApiChange}
                  label="Select API"
                  sx={{ height: "3rem" }}
                >
                  <MenuItem value="">
                    <em>All APIs</em>
                  </MenuItem>
                  {apiList.map((api, index) => (
                    <MenuItem key={index} value={api}>
                      {api}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Interval</InputLabel>
                <Select
                  value={interval}
                  onChange={handleIntervalChange}
                  label="Select Interval"
                  sx={{ height: "3rem" }}
                >
                  <MenuItem value="day">Daily</MenuItem>
                  <MenuItem value="month">Monthly</MenuItem>
                  <MenuItem value="hour">Hourly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Start Date"
                type="datetime-local"
                value={startDate}
                onChange={handleStartDateChange}
                InputLabelProps={{ shrink: true }}
                error={!!dateError}
                helperText={dateError}
                sx={{ height: "3rem" }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="End Date"
                type="datetime-local"
                value={endDate}
                onChange={handleEndDateChange}
                InputLabelProps={{ shrink: true }}
                error={!!dateError}
                helperText={dateError}
                sx={{ height: "3rem" }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Select Widgets</InputLabel>
                <Select
                  multiple
                  value={selectedWidgetTypes}
                  onChange={(e) => setSelectedWidgetTypes(e.target.value)}
                  renderValue={(selected) =>
                    selected
                      .map((type) => {
                        switch (type) {
                          case widgetTypes.LINE_CHART:
                            return "Line Chart";
                          case widgetTypes.DOUGHNUT_CHART:
                            return "Doughnut Chart";
                          case widgetTypes.TABLE:
                            return "Table";
                          default:
                            return "";
                        }
                      })
                      .join(", ")
                  }
                  sx={{ height: "3rem", fontSize: "0.875rem" }} // reduced font size if needed
                >
                  <MenuItem value={widgetTypes.LINE_CHART}>
                    <ShowChart sx={{ mr: 1 }} /> Line Chart
                  </MenuItem>
                  <MenuItem value={widgetTypes.DOUGHNUT_CHART}>
                    <PieChart sx={{ mr: 1 }} /> Doughnut Chart
                  </MenuItem>
                  <MenuItem value={widgetTypes.TABLE}>
                    <TableChart sx={{ mr: 1 }} /> Data Table
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <MDButton
                variant="contained"
                color="primary"
                onClick={handleAddWidgets}
                disabled={selectedWidgetTypes.length === 0}
                fullWidth
                sx={{ height: "3rem" }}
              >
                Add Widgets
              </MDButton>
            </Grid>
          </Grid>
        </Card>

        <ResponsiveReactGridLayout
          className="layout"
          layouts={{ lg: widgets.map((w) => w.layout) }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
          rowHeight={100}
          compactType="null"
          itemSort={(a, b) => a.x - b.x || a.y - b.y} // Horizontal-first sorting
          // onLayoutChange={(layout, allLayouts) => {
          //   const newLayout = dualAxisCompact(allLayouts.lg);

          //   const updatedWidgets = widgets.map((widget, index) => ({
          //     ...widget,
          //     layout: {
          //       ...allLayouts.lg[index],
          //       i: widget.id, // Ensure layout ID matches widget ID
          //       minW: widget.layout.minW,
          //       minH: widget.layout.minH,
          //     },
          //   }));
          //   setWidgets(updatedWidgets);
          //   const userKey = getUserSpecificKey();
          //   localStorage.setItem(userKey, JSON.stringify(updatedWidgets));
          // }}

          onLayoutChange={(layout, allLayouts) => {
            const newLayout = dualAxisCompact(allLayouts.lg);

            const updatedWidgets = widgets.map((widget, index) => {
              const layoutItem = allLayouts.lg[index];

              const updatedWidget = {
                ...widget,
                layout: {
                  ...layoutItem,
                  i: widget.id,
                  minW: widget.layout.minW,
                  minH: widget.layout.minH,
                },
              };

              // ✅ Update backend for this widget
              updateWidgetLayout(updatedWidget);

              return updatedWidget;
            });

            setWidgets(updatedWidgets);
          }}
          isResizable={true}
          isDraggable={true}
          autoSize={true}
          margin={[20, 20]}
          containerPadding={[20, 20]}
          preventCollision={false}
        >
          {widgets.map((widget) => (
            <div
              key={widget.id}
              data-grid={{
                ...widget.layout,
                i: widget.id, // Ensure data-grid ID matches widget ID
              }}
            >
              <Card
                sx={{
                  height: "100%",
                  p: 2,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  borderRadius: "8px",
                  backgroundColor: "#ffffff",
                  position: "relative",
                  overflow: "hidden",
                  minHeight: "300px",
                  "&:hover": { boxShadow: "0 6px 18px rgba(0,0,0,0.15)" },
                  transition: "box-shadow 0.2s ease-in-out, opacity 0.5s ease-in",
                  opacity: newWidgetIds.has(widget.id) ? 0 : 1,
                  animation: newWidgetIds.has(widget.id) ? "fadeIn 0.5s forwards" : "none",
                }}
              >
                <MDBox
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                  p={1}
                  bgcolor="grey.200"
                  borderRadius="4px 4px 0 0"
                  borderBottom="1px solid #e0e0e0"
                >
                  <MDBox display="flex" alignItems="center">
                    {widget.type === widgetTypes.LINE_CHART && (
                      <ShowChart sx={{ mr: 1, color: "info.main" }} />
                    )}
                    {widget.type === widgetTypes.DOUGHNUT_CHART && (
                      <PieChart sx={{ mr: 1, color: "success.main" }} />
                    )}
                    {widget.type === widgetTypes.TABLE && (
                      <TableChart sx={{ mr: 1, color: "warning.main" }} />
                    )}
                    <MDTypography variant="h6" fontWeight="medium">
                      {getApiBasedTitle(widget.type, selectedApi)}
                    </MDTypography>
                  </MDBox>
                  <IconButton
                    size="small"
                    data-no-drag
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeWidget(widget.id);
                    }}
                    sx={{
                      bgcolor: "transparent",
                      color: "text.secondary",
                      "&:hover": { bgcolor: "grey.300" },
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </MDBox>
                <Box sx={{ height: "calc(100% - 40px)" }}>{renderWidget(widget)}</Box>
              </Card>
            </div>
          ))}
        </ResponsiveReactGridLayout>

        {loading && (
          <MDBox
            position="fixed"
            top={0}
            left={0}
            zIndex={9999}
            width="100%"
            height="100%"
            display="flex"
            justifyContent="center"
            alignItems="center"
            bgcolor="rgba(0, 0, 0, 0.6)"
          >
            <CircularProgress color="primary" size={60} thickness={5} />
            <MDTypography variant="h6" color="white" ml={2}>
              Loading data...
            </MDTypography>
          </MDBox>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default SmartAnalytics;
