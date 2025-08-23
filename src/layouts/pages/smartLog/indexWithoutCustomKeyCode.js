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

  const handleCorrelationIDClick = (correlationID) => {
    console.log("CorrelationID clicked:", correlationID);

    // Perform the necessary action with the correlation ID
    setSearchQuery(correlationID);

    // Optionally, trigger a new search or action
    handleSearchClick(correlationID);
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

  const handleSearchClick = async (clickedCorrelationID) => {
    setLoading(true);

    try {
      // const username = "Administrator";
      // const password = "manageaudit";
      // const encodedCredentials = btoa(`${username}:${password}`);

      // Ensure clickedCorrelationID is a string or valid value, not an event
      const correlationID =
        typeof clickedCorrelationID === "string" ? clickedCorrelationID : searchQuery;

      const newPayload = {
        correlationID: correlationID || undefined,
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
      } else {
        setFetchedData([]);
        setFilteredData([]);
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
  const columns = useMemo(
    () => [
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
      // { Header: "Unique Transaction ID", accessor: "uniqueTransactionID" },
      { Header: "Resource Name", accessor: "resourceName" },
      // { Header: "Resource Path", accessor: "resourcePath" },
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
    ],
    []
  );
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
          justifyContent="space-between"
          gap={2}
          mb={3}
          sx={{
            backgroundColor: "#f9f9f9",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <MDBox
            sx={{
              display: "flex",
              alignItems: "center",
              flex: 1,
              border: "1px solid #ddd",
              borderRadius: "24px",
              padding: "5px 15px",
              backgroundColor: "#fff",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <MDInput
              placeholder="Enter correlation ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchClick(); // Trigger the search function
                }
              }}
              aria-label="Search Input"
              sx={{
                border: "none",
                outline: "none",
                flex: 1,
                fontSize: "16px",
              }}
            />
          </MDBox>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MDBox display="flex" gap={2} alignItems="center" overflow="visible">
              {/* Start Date Picker */}
              <DatePicker
                label="From Date"
                value={startDate}
                onChange={handleStartDateChange}
                disableClearable={false} // Ensure this is applied correctly
                renderInput={(params) => (
                  <TextField
                    {...params}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarTodayIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiInputLabel-root": { fontSize: "12px" }, // Make the label smaller
                      "& .MuiInputBase-root": {
                        fontSize: "12px", // Make the input text smaller
                        paddingRight: "24px", // Adjust padding to fit smaller size
                      },
                      "& .MuiInputAdornment-root": {
                        fontSize: "small", // Adjust icon size if needed
                      },
                    }}
                  />
                )}
              />

              {/* End Date Picker */}
              <DatePicker
                label="To Date"
                value={endDate}
                onChange={handleEndDateChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarTodayIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      width: "100px", // Reduce the width to make the box smaller
                      "& .MuiInputLabel-root": { fontSize: "12px" }, // Make the label smaller
                      "& .MuiInputBase-root": {
                        fontSize: "12px", // Make the input text smaller
                        paddingRight: "24px", // Adjust padding to fit smaller size
                      },
                      "& .MuiInputAdornment-root": {
                        fontSize: "small", // Adjust icon size if needed
                      },
                    }}
                  />
                )}
              />
            </MDBox>
          </LocalizationProvider>
          <MDBox display="flex" alignItems="center" gap={2}>
            {/* Elapsed Time Dropdown */}
            <MDButton
              variant="gradient"
              color="info"
              onClick={(event) => setAnchorElElapsedTime(event.currentTarget)}
              sx={{
                whiteSpace: "nowrap",
                textTransform: "none",
                padding: "8px 16px",
              }}
            >
              {selectedElapsedTime ? `> ${selectedElapsedTime}ms` : "ElapsedTime"}
            </MDButton>

            <Menu
              anchorEl={anchorElElapsedTime}
              open={Boolean(anchorElElapsedTime)}
              onClose={() => setAnchorElElapsedTime(null)}
            >
              {[100, 200, 300, 400, 500, 600, 700, 1000].map((time) => (
                <MenuItem
                  key={time}
                  onClick={() => {
                    setSelectedElapsedTime(time); // Update state with the string value
                    setAnchorElElapsedTime(null); // Close the menu
                  }}
                >
                  <MDTypography variant="body2">{`> ${time}ms`}</MDTypography>
                </MenuItem>
              ))}
            </Menu>
          </MDBox>

          <MDBox display="flex" alignItems="center" gap={2}>
            {/* Status Filter Button */}
            <MDButton
              variant="gradient"
              color="info"
              onClick={handleFilterClick}
              sx={{
                whiteSpace: "nowrap",
                textTransform: "none",
                padding: "8px 16px",
              }}
            >
              {status === "ALL" ? "Status" : `Status: ${status}`}
            </MDButton>

            {/* Dropdown Menu */}
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
              ].map(({ value, label, color }) => (
                <MenuItem
                  key={value}
                  onClick={() => handleStatusSelect(value)} // Handle selection
                >
                  <MDTypography
                    sx={{
                      color: color,
                      fontSize: "0.875rem",
                    }}
                  >
                    {label}
                  </MDTypography>
                </MenuItem>
              ))}
            </Menu>
          </MDBox>

          {/* API Dropdown */}
          <MDButton
            variant="gradient"
            color="info"
            onClick={handleApiClick}
            sx={{
              whiteSpace: "nowrap",
              textTransform: "none",
              padding: "8px 16px",
            }}
          >
            {selectedApi}
          </MDButton>
          <Menu anchorEl={anchorElApi} open={Boolean(anchorElApi)} onClose={handleApiClose}>
            {apiLoading ? (
              <MenuItem disabled>
                <CircularProgress size={20} />
              </MenuItem>
            ) : (
              apiList.map((api) => (
                <MenuItem key={api} onClick={() => handleApiSelect(api)}>
                  {api}
                </MenuItem>
              ))
            )}
          </Menu>
          <MDButton
            variant="gradient"
            color="warning"
            onClick={handleResetFilters}
            sx={{
              whiteSpace: "nowrap",
              textTransform: "none",
              padding: "8px 16px",
            }}
          >
            Reset
          </MDButton>

          {/* Search Icon at the End */}
          <MDBox>
            <IconButton
              onClick={handleSearchClick}
              sx={{
                backgroundColor: "white",
                color: "primary.main",
                boxShadow: 3,
                borderRadius: "50%",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  backgroundColor: "secondary.main",
                  transform: "scale(1.1)", // Slight scale effect on hover
                  boxShadow: 6, // Enhance shadow on hover
                },
              }}
            >
              <Icon>search</Icon>
            </IconButton>
          </MDBox>
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
                disabled={!payload.correlationID}
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
