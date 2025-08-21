/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */

import React, { useMemo, useState, useEffect } from "react";
import Popup from "./Popup"; // Importing the Popup component
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import { useSearchParams } from "react-router-dom";
import Footer from "examples/Footer";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";

import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import InputAdornment from "@mui/material/InputAdornment"; // Import InputAdornment
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"; // Import CalendarTodayIcon
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
LocalizationProvider;
import { LocalizationProvider } from "@mui/x-date-pickers/";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"; // Use Day.js as the date library
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FlowDiagram from "./flow";
import TextField from "@mui/material/TextField";
import { useSnackbar } from "context/snackbarContext";
import { CircularProgress, Icon, IconButton, Menu, Alert, MenuItem } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import DataTableExpandableRow from "examples/Tables/TableExpandableRow";
import { getToken } from "hooks/keycloakService";

function SmartLog() {
  const token = getToken();
  const { showSnackbar } = useSnackbar();
  const [showTable, setShowTable] = useState(false);
  const [fetchedData, setFetchedData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [anchorElApi, setAnchorElApi] = useState(null);
  const [selectedApi, setSelectedApi] = useState("API Name");
  const [apiList, setApiList] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedKey, setSelectedKey] = useState("");
  const [searchExecuted, setSearchExecuted] = useState(false);

  const [anchorElElapsedTime, setAnchorElElapsedTime] = useState(null);
  const [selectedElapsedTime, setSelectedElapsedTime] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  // const correlationIDFromURL = searchParams.get("correlationID");
  const [diagramOpen, setDiagramOpen] = useState([]);
  const [flowData, setFlowData] = useState([]);

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showSnackbar("Copied to clipboard!", "success");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      handleSearchClick();
      setDiagramOpen(false); // Pass default date range
    };

    fetchData();
  }, [setSearchQuery, searchParams, setSearchParams]);

  const openModal = (title, content) => {
    setModalTitle(title);
    setModalContent(content);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  //State to store the payload
  const [payload, setPayload] = useState({});

  const [status, setStatus] = useState("ALL");
  const [anchorElFilter, setAnchorElFilter] = useState(null);

  const handleFilterClick = (event) => setAnchorElFilter(event.currentTarget);
  const handleFilterClose = () => setAnchorElFilter(null);

  const handleStatusSelect = (selectedStatus) => {
    // Map status codes to descriptive strings if needed
    const statusStringMap = {
      200: "Success",
      400: "ClientError",
      500: "ServerError",
    };

    const statusPayload =
      selectedStatus === "ALL" ? undefined : statusStringMap[selectedStatus] || selectedStatus;

    setStatus(selectedStatus); // Update the button label
    setAnchorElFilter(null);

    // Apply the filter directly using the mapped status string
    const filteredData =
      selectedStatus === "ALL"
        ? fetchedData
        : fetchedData.filter((row) => row.status === statusPayload);
    setFilteredData(filteredData);

    applyAllFilters(statusPayload); // Pass the status string to the API payload
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
    filterDataByDateRange(date, endDate); // Corrected parameter usage
    applyAllFilters();
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    filterDataByDateRange(startDate, date); // Corrected parameter usage
    applyAllFilters();
  };

  const formatDate = (date) => {
    const pad = (num) => (num < 10 ? "0" + num : num); // Adds leading zeroes
    const d = new Date(date);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const filterDataByDateRange = (startDate, endDate) => {
    if (startDate && endDate) {
      const filtered = fetchedData.filter((entry) => {
        const responseDate = new Date(entry.responseTime); // Ensure responseTime is in proper format
        return responseDate >= new Date(startDate) && responseDate <= new Date(endDate);
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(fetchedData); // If one or both dates are missing, show all data
    }
  };

  const handleApiClick = async (event) => {
    setAnchorElApi(event.currentTarget);
    if (apiList.length === 0) {
      setApiLoading(true);

      // Replace these with your actual username and password
      const username = "Administrator";
      const password = "manageaudit";

      // Encode credentials for Basic Authorization
      const encodedCredentials = btoa(`${username}:${password}`);

      try {
        const response = await fetch(
          "https://172.20.150.10:8098/smartlogger/api-names",
          // "http://172.20.150.134:5555/restv2/SmartLogger.restAPI:orderResource/getAPINames",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          console.error("401 Unauthorized: Invalid AuthToken");
          "401 Unauthorized:ACCESS DENIED", "error";
          return; // Exit the function since further processing isn't needed
        }
        if (!response.ok) {
          throw new Error("Failed to fetch API names.");
        }
        const data = await response.json();

        const validUrls = data || [];

        setApiList(validUrls);
      } catch (error) {
        showSnackbar("Failed to fetch data. Please try again.", "error");
      } finally {
        setApiLoading(false);
      }
    }
  };

  const handleApiClose = () => setAnchorElApi(null);

  const handleApiSelect = (api) => {
    setSelectedApi(api); // Store the selected API
    setAnchorElApi(null); // Close the dropdown menu
  };

  const handleResetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setStatus("ALL");
    setSelectedApi("API Name");
    setSelectedElapsedTime(null);
    setFilteredData(fetchedData); // Reset the data table to show all fetched data
    setSearchQuery(""); // Clear the search query
    setSelectedKey(""); // Reset the selected key to default
    setSearchExecuted(false); // Reset the search executed state
  };

  const handleViewFlow = () => {
    if (!filteredData || filteredData.length === 0) {
      showSnackbar("No data available to generate the flow diagram.");
      return;
    }

    // Store the data in localStorage
    // localStorage.setItem("flowData", JSON.stringify(filteredData));
    setFlowData(filteredData);
    setDiagramOpen(true); // Open the DIAGRAM
  };
  const handleCloseDiagram = () => {
    setDiagramOpen(false); // Close the modal
  };

  const parseJson = (jsonString) => {
    try {
      // Parse outer JSON string
      let parsedData = JSON.parse(jsonString);

      // Check if the 'payload' field is a string, and parse it if it is
      if (typeof parsedData.payload === "string") {
        parsedData.payload = JSON.parse(parsedData.payload);
      }

      return parsedData;
    } catch (e) {
      return jsonString; // Return as is if not valid JSON
    }
  };

  const handleCorrelationIDClick = (correlationID) => {
    console.log("CorrelationID clicked:", correlationID);

    // Perform the necessary action with the correlation ID
    setSearchQuery(correlationID);

    // Optionally, trigger a new search or action
    handleSearchClick("correlationID", correlationID);
  };

  const handleSearchClick = async (customKey, customValue) => {
    setLoading(true);

    try {
      const key = customKey;
      const value = customValue;

      const newPayload = {
        ...(key && value ? { key, value } : {}),
        apiName: selectedApi && selectedApi !== "API Name" ? selectedApi : undefined,
        startTime: startDate ? formatDate(startDate) : undefined,
        endTime: endDate ? formatDate(endDate) : undefined,
        elapsedTime: selectedElapsedTime ? String(selectedElapsedTime) : undefined,
        status: status === "ALL" ? undefined : status,
      };
      // Debugging: Ensure the payload is correct
      console.log("Payload before sending to API:", newPayload);

      // Validate the payload
      try {
        JSON.stringify(newPayload);
      } catch (error) {
        console.error("Invalid payload with circular references:", error, newPayload);
        throw new Error("Payload contains circular references and cannot be sent.");
      }

      setPayload(newPayload); // Update state with the validated payload

      const response = await fetch("https://172.20.150.10:8098/smartlogger/search/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(newPayload),
      });

      const responseBody = await response.text(); // Fetch response as text for debugging
      if (response.status === 401) {
        console.error("401 Unauthorized: Invalid AuthToken");
        showSnackbar("401 Unauthorized:ACCESS DENIED", "error");
        return; // Exit the function since further processing isn't needed
      }
      if (!response.ok) {
        console.error("API error:", response.status, responseBody);
        throw new Error(`Failed with status: ${response.status}`);
      }

      const data = JSON.parse(responseBody);

      if (Array.isArray(data.hits)) {
        const logArray = data.hits.map((response) => ({
          correlationID: response.correlationID || "N/A",
          uniqueTransactionID: response.uniqueTransactionID,
          parentID: response.parentID || "N/A",
          resourceName: response.apiName || "N/A",
          resourcePath: response.resourcePath || "N/A",
          requestTime: response.requestTime ? formatDate(response.requestTime) : "N/A",
          selectedElapsedTime: response.elapsedTime || "N/A",
          status: response.status || "N/A",
          host: response.host || "N/A",

          requestPayload: response.request
            ? JSON.stringify(
                parseJson(
                  JSON.stringify({
                    headers: response.request.Headers || "N/A",
                    payload: response.request.payload || "N/A",
                  })
                ),
                null,
                2 // Indentation level
              )
            : "N/A",

          responsePayload: response.response
            ? JSON.stringify(
                parseJson(
                  JSON.stringify({
                    headers: response.response.Headers || "N/A",
                    payload: response.response.payload || "N/A",
                  })
                ),
                null,
                2 // Indentation level
              )
            : "N/A",
        }));

        setFetchedData(logArray);
        setFilteredData(logArray);
        setShowTable(true);
        // Set searchExecuted to true after fetching data
      } else {
        setFetchedData([]);
        setFilteredData([]);
        // Reset searchExecuted if no data is found
        setShowTable(true);
        showSnackbar("No data available for last 7 days. Please contact support.", "error");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setFetchedData([]);
      setFilteredData([]);
      setShowTable(true);
      showSnackbar("Failed to fetch data. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  //Declaring the columns for the table
  const columns = useMemo(() => {
    const base = [
      {
        Header: "Correlation ID",
        accessor: "correlationID",
        Cell: ({ value }) => (
          <MDTypography
            component="span"
            variant="button"
            color="info"
            onClick={() => handleCorrelationIDClick(value)}
            sx={{ cursor: "pointer", textDecoration: "underline" }}
          >
            {value}
          </MDTypography>
        ),
      },
      { Header: "Resource Name", accessor: "resourceName" },
      { Header: "Request Timestamp", accessor: "requestTime" },
      { Header: "Elapsed Time", accessor: "selectedElapsedTime" },
      { Header: "Status", accessor: "status" },
      {
        Header: "Request Payload",
        accessor: "requestPayload",
        Cell: ({ value }) => (
          <MDButton
            onClick={() => openModal("Request Payload", value)}
            variant="gradient"
            color="info"
          >
            View Request
          </MDButton>
        ),
      },
      {
        Header: "Response Payload",
        accessor: "responsePayload",
        Cell: ({ value }) => (
          <MDButton
            onClick={() => openModal("Response Payload", value)}
            variant="gradient"
            color="info"
          >
            View Response
          </MDButton>
        ),
      },
    ];

    // 2. If the user searched by something else, add that column at index 1:
    if (searchExecuted && selectedKey && selectedKey !== "correlationID") {
      base.splice(1, 0, {
        Header: selectedKey,
        accessor: selectedKey,
        Cell: () => <MDTypography variant="body3">{searchQuery}</MDTypography>,
      });
    }

    return base;
  }, [searchExecuted, selectedKey, searchQuery]);
  const applyAllFilters = () => {
    let data = [...fetchedData]; // Start with the full dataset

    // Apply date range filter
    if (startDate && endDate) {
      data = data.filter((entry) => {
        const responseDate = new Date(entry.responseTime);
        return responseDate >= new Date(startDate) && responseDate <= new Date(endDate);
      });
    }

    // Apply status filter
    if (status !== "ALL") {
      data = data.filter((entry) => entry.status === status);
    }

    // Apply API filter
    if (selectedApi && selectedApi !== "  Search by API name  ") {
      data = data.filter((entry) => entry.resourceName === selectedApi);
    }

    setFilteredData(data); // Update the filtered data
    console.log("Filtered Data:", filteredData);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox p={4} mt={2}>
        <MDBox
          display="flex"
          alignItems="center"
          gap={1} // reduce overall gaps
          mb={3}
          sx={{
            backgroundColor: "#f9f9f9",
            p: 2, // shorthand padding
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          {/* Search input + key selector */}
          <MDBox display="flex" alignItems="center" flex={1}>
            <MDInput
              placeholder={`Enter ${selectedKey || "value"}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSearchExecuted(true);
                  handleSearchClick(selectedKey, searchQuery);
                }
              }}
              aria-label="Search Input"
              sx={{
                flex: 1,
                fontSize: "16px",
                height: "40px",
                pr: 1,
              }}
            />

            <FormControl
              size="small"
              sx={{
                minWidth: 120,
                height: "40px",
                ml: 1,
                "& .MuiInputBase-root": {
                  height: "40px",
                  fontSize: "14px",
                },
                "& .MuiSelect-select": {
                  display: "flex",
                  alignItems: "center",
                  px: 1,
                  height: "40px",
                },
              }}
            >
              <InputLabel id="search-key-label" sx={{ fontSize: "14px" }}>
                Search By
              </InputLabel>
              <Select
                labelId="search-key-label"
                value={selectedKey}
                label="Search By"
                onChange={(e) => setSelectedKey(e.target.value)}
              >
                <MenuItem value="correlationID">Correlation ID</MenuItem>
                <MenuItem value="OrderID">OrderID</MenuItem>
                <MenuItem value="customer_id">Customer ID</MenuItem>
              </Select>
            </FormControl>
          </MDBox>

          {/* Date pickers */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MDBox display="flex" alignItems="center" gap={1}>
              {["From Date", "To Date"].map((label, idx) => (
                <DatePicker
                  key={label}
                  label={label}
                  value={idx === 0 ? startDate : endDate}
                  onChange={idx === 0 ? handleStartDateChange : handleEndDateChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      sx={{
                        width: idx === 0 ? "120px" : "100px",
                        "& .MuiInputBase-root": { height: "36px", fontSize: "12px" },
                        "& .MuiInputLabel-root": { fontSize: "12px", top: 4 },
                      }}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarTodayIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              ))}
            </MDBox>
          </LocalizationProvider>

          {/* Elapsed time */}
          <MDBox display="flex" alignItems="center">
            <MDButton
              size="small"
              variant="gradient"
              color="info"
              onClick={(e) => setAnchorElElapsedTime(e.currentTarget)}
              sx={{ textTransform: "none", px: 1.5 }}
            >
              {selectedElapsedTime ? `> ${selectedElapsedTime}ms` : "ElapsedTime"}
            </MDButton>
            <Menu
              anchorEl={anchorElElapsedTime}
              open={Boolean(anchorElElapsedTime)}
              onClose={() => setAnchorElElapsedTime(null)}
            >
              {[100, 200, 300, 400, 500, 600, 700, 1000].map((t) => (
                <MenuItem
                  key={t}
                  onClick={() => {
                    setSelectedElapsedTime(t);
                    setAnchorElElapsedTime(null);
                  }}
                >
                  {`> ${t}ms`}
                </MenuItem>
              ))}
            </Menu>
          </MDBox>

          {/* Status filter */}
          <MDBox display="flex" alignItems="center">
            <MDButton
              size="small"
              variant="gradient"
              color="info"
              onClick={handleFilterClick}
              sx={{ textTransform: "none", px: 1.5 }}
            >
              {status === "ALL" ? "Status" : `Status: ${status}`}
            </MDButton>
            <Menu
              anchorEl={anchorElFilter}
              open={Boolean(anchorElFilter)}
              onClose={handleFilterClose}
            >
              {[
                { value: "ALL", label: "All", color: "black" },
                { value: "200", label: "Success (200)", color: "green" },
                { value: "400", label: "Client Error (400)", color: "orange" },
                { value: "500", label: "Server Error (500)", color: "red" },
              ].map((opt) => (
                <MenuItem key={opt.value} onClick={() => handleStatusSelect(opt.value)}>
                  <MDTypography sx={{ color: opt.color, fontSize: "0.875rem" }}>
                    {opt.label}
                  </MDTypography>
                </MenuItem>
              ))}
            </Menu>
          </MDBox>

          {/* API selector */}
          <MDBox display="flex" alignItems="center">
            <MDButton
              size="small"
              variant="gradient"
              color="info"
              onClick={handleApiClick}
              sx={{ textTransform: "none", px: 1.5 }}
            >
              {selectedApi}
            </MDButton>
            <Menu anchorEl={anchorElApi} open={Boolean(anchorElApi)} onClose={handleApiClose}>
              {apiLoading ? (
                <MenuItem disabled>
                  <CircularProgress size={18} />
                </MenuItem>
              ) : (
                apiList.map((api) => (
                  <MenuItem key={api} onClick={() => handleApiSelect(api)}>
                    {api}
                  </MenuItem>
                ))
              )}
            </Menu>
          </MDBox>

          {/* Reset button */}
          <MDButton
            size="small"
            variant="gradient"
            color="warning"
            onClick={handleResetFilters}
            sx={{ textTransform: "none", px: 1.5 }}
          >
            Reset
          </MDButton>

          {/* Search icon */}
          <IconButton
            onClick={() => handleSearchClick(selectedKey, searchQuery)}
            sx={{
              backgroundColor: "white",
              color: "primary.main",
              boxShadow: 3,
              p: 1,
              "&:hover": {
                backgroundColor: "secondary.main",
                transform: "scale(1.1)",
                boxShadow: 6,
              },
            }}
          >
            <Icon>search</Icon>
          </IconButton>
        </MDBox>

        {loading && (
          <MDBox display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </MDBox>
        )}

        {!loading && showTable && (
          <MDBox>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <MDTypography variant="h4" fontWeight="bold">
                Smart Logs
              </MDTypography>
              <MDButton
                variant="gradient"
                color="info"
                onClick={handleViewFlow}
                disabled={!searchQuery}
              >
                View end-to-end API flow
              </MDButton>
              <Dialog
                open={diagramOpen}
                onClose={handleCloseDiagram}
                fullWidth
                maxWidth="lg"
                sx={{
                  "& .MuiDialog-paper": {
                    width: "85%",
                    maxWidth: "none",
                    margin: "auto",
                    alignContent: "center",
                  },
                }}
              >
                <DialogTitle>
                  Flow Diagram
                  <IconButton
                    aria-label="close"
                    onClick={handleCloseDiagram}
                    style={{ position: "absolute", right: 8, top: 8 }}
                  >
                    <CloseIcon />
                  </IconButton>
                </DialogTitle>
                <DialogContent style={{ height: "80vh", padding: 0 }}>
                  <FlowDiagram flowData={flowData} />
                </DialogContent>

                <DialogActions>
                  <Button onClick={handleCloseDiagram} color="primary">
                    Close
                  </Button>
                </DialogActions>
              </Dialog>
            </MDBox>
            {/* Here we are passing the columns and rows to the
            DataTableExpandableRow component that i created from the creative
            tims template aaccording to our needs , we need expandable rows*/}
            <DataTableExpandableRow
              entriesPerPage
              canSearch={true}
              showTotalEntries
              table={{ columns, rows: filteredData }}
              isSorted
              openModal={openModal}
            />
            {/* Conditionally render the Popup when isModalOpen is true */}
            {isModalOpen && (
              <Popup
                title={modalTitle}
                content={modalContent}
                open={isModalOpen}
                onClose={closeModal} // Close modal when the Close button is clicked
              />
            )}
          </MDBox>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default SmartLog;
