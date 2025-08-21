import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTableNoPag";

// import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

//Material Icons
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { ArrowUpward } from "@mui/icons-material";
import SettingsIcon from "@mui/icons-material/Settings";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import SmsIcon from "@mui/icons-material/Sms";

import Tooltip from "@mui/material/Tooltip";
import { useParams } from "react-router-dom";

import { Link } from "react-router-dom";
import { IconBase } from "react-icons";
import { IconButton } from "@mui/material";

import TopBar from "./TopBar";

function WorkDays() {
  const { calendarId } = useParams();

  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // State to store the data from the API
  const [dataTableData, setDataTableData] = useState({
    columns: [
      { Header: "Week Day", accessor: "weekDay" },
      { Header: "From Time", accessor: "fromTime" },
      { Header: "End Time", accessor: "toTime" },
      { Header: "All Day", accessor: "allDay" },
      { Header: "Action", accessor: "action" },
    ],
    rows: [],
  });

  // State for adding a new template
  const [openAddModal, setOpenAddModal] = useState(false);
  const [newWorkDay, setNewWorkDay] = useState({
    calandarId: calendarId,
    weekday: "",
    fromTime: "",
    toTime: "",
    allDay: "",
  });

  // Fetch data from the API
  const fetchData = async () => {
    const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}http://172.20.150.134:5555/calander/calendar/workday?calandarId=${calendarId}`,
        {
          headers: {
            Authorization: basicAuth,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      const rows = data.workingDays?.map((workday) => ({
        weekDay: workday.weekDay,
        fromTime: workday.fromTime,
        toTime: workday.toTime,
        allDay: workday.allDay,
        action: (
          <>
            <IconButton>
              <DeleteIcon
                color="secondary"
                style={{ cursor: "pointer" }}
                onClick={() => handleDeleteRow(workday)}
              />
            </IconButton>
          </>
        ),
      }));

      setOriginalData(rows);
      setFilteredData(rows); // Initialize filteredData with the original data

      setDataTableData((prevData) => ({
        ...prevData,
        rows: rows,
      }));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update newWorkDay state when allDay changes
  useEffect(() => {
    if (newWorkDay.allDay === "TRUE") {
      setNewWorkDay((prev) => ({
        ...prev,
        fromTime: "00:00",
        toTime: "23:59",
      }));
    }
  }, [newWorkDay.allDay]);

  const handleSearchChange = (query) => {
    setFilteredData(
      originalData.filter((row) => {
        // Extract the text from the Link component if it exists
        const ruleName = typeof row.weekDay === "object" ? row.weekDay.props.children : row.weekDay;
        return ruleName.toLowerCase().includes(query.toLowerCase());
      })
    );
  };

  // Function to handle opening and closing the add modal
  //const handleOpenAddModal = () => setOpenAddModal(true);
  const handleCloseAddModal = () => setOpenAddModal(false);

  // Function to handle opening the add modal and reset newCalendar state
  const handleOpenAddModal = () => {
    setNewWorkDay({
      calandarId: calendarId,
      weekDay: "",
      fromTime: "",
      toTime: "",
      allDay: "", // Reset to default value when modal opens
    });
    setOpenAddModal(true);
  };

  // Function to handle input changes in the add modal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewWorkDay((prev) => ({ ...prev, [name]: value }));
  };

  // Function to reset the form
  const handleReset = () => {
    setNewWorkDay({
      calandarId: calendarId,
      weekday: "",
      fromTime: "",
      toTime: "",
      allDay: "",
    });
  };

  // Function to save the new work day
  const handleSave = async () => {
    const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    try {
      const response = await fetch("http://172.20.150.134:5555/calander/calendar/workday", {
        method: "POST",
        headers: {
          Authorization: basicAuth,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newWorkDay),
      });

      if (response.ok) {
        alert("Work Day saved successfully!");
        handleCloseAddModal();
        handleReset(); // Reset form after saving
        fetchData();
      } else {
        alert("Failed to save Work Day.");
      }
    } catch (error) {
      console.error("Error saving Work Day:", error);
    }
  };

  // Function to handle the delete action
  const handleDeleteRow = async (workday) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this Work Day?");
    if (!confirmDelete) return;

    const payload = {
      calanderId: calendarId,
      workDayId: workday.workDayId,
    };

    const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    try {
      const response = await fetch("http://172.20.150.134:5555/calander/calendar/workday", {
        method: "DELETE",
        headers: {
          Authorization: basicAuth,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Work Day deleted successfully!");
        fetchData(); // Refresh the data
      } else {
        alert("Failed to delete Work Day.");
      }
    } catch (error) {
      console.error("Error deleting Work Day:", error);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <MDBox flex="1">
            <TopBar onSearchChange={handleSearchChange} />
          </MDBox>
          <MDBox ml={1}>
            {/* <MDButton
                              variant="contained"
                              color="info"
                              onClick={() => exportToCSV(dataTableData.rows, dataTableData.columns)}
                            >
                              <Icon>description</Icon>
                              &nbsp;Export
                            </MDButton> */}
          </MDBox>
        </MDBox>
        <Card>
          <MDBox p={3} lineHeight={1}>
            <MDTypography variant="h5" fontWeight="medium">
              Working Days
            </MDTypography>
          </MDBox>
          <MDBox width="13.2rem" ml="auto">
            <MDButton
              style={{ marginLeft: 45 }}
              variant="gradient"
              color="info"
              size="medium"
              onClick={handleOpenAddModal}
            >
              Add
            </MDButton>
          </MDBox>
          {/* <DataTable table={dataTableData} canSearch /> */}
          <DataTable
            table={{ columns: dataTableData.columns, rows: filteredData }}
            entriesPerPage={10}
            showTotalEntries
          />
        </Card>
      </MDBox>
      {/* <Footer /> */}

      {/* Modal for adding a new group config */}
      <Dialog open={openAddModal} onClose={handleCloseAddModal} fullWidth maxWidth="sm">
        <DialogTitle>Add Working Days</DialogTitle>
        <DialogContent>
          <MDBox component="form" px={3}>
            <TextField
              select
              fullWidth
              label="Week Day"
              name="weekday"
              value={newWorkDay.weekday}
              onChange={handleInputChange}
              margin="normal"
              InputProps={{
                style: { padding: "12px 10px" },
              }}
            >
              <MenuItem selected value="SUNDAY">
                SUNDAY
              </MenuItem>
              <MenuItem value="MONDAY">MONDAY</MenuItem>
              <MenuItem value="TUESDAY">TUESDAY</MenuItem>
              <MenuItem value="WEDNESDAY">WEDNESDAY</MenuItem>
              <MenuItem value="THURSDAY">THURSDAY</MenuItem>
              <MenuItem value="FRIDAY">FRIDAY</MenuItem>
              <MenuItem value="SATURDAY">SATURDAY</MenuItem>
            </TextField>
            {/* Conditionally render From Time and End Time */}
            {newWorkDay.allDay !== "TRUE" && (
              <MDBox display="flex" justifyContent="space-between">
                <TextField
                  label="From Time"
                  name="fromTime"
                  value={newWorkDay.fromTime}
                  onChange={handleInputChange}
                  type="time"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  // inputProps={{
                  //   step: 300, // 5 min
                  // }}
                  sx={{ width: 150 }}
                />

                <TextField
                  label="End Time"
                  name="toTime"
                  value={newWorkDay.toTime}
                  onChange={handleInputChange}
                  type="time"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  // inputProps={{
                  //   step: 300, // 5 min
                  // }}
                  sx={{ width: 150 }}
                />
              </MDBox>
            )}

            <TextField
              select
              label="All Day"
              name="allDay"
              value={newWorkDay.allDay}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              InputProps={{
                style: { padding: "12px 10px" },
              }}
            >
              <MenuItem selected value="FALSE">
                FALSE
              </MenuItem>
              <MenuItem value="TRUE">TRUE</MenuItem>
            </TextField>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleSave} variant="gradient" color="info">
            Save
          </MDButton>
          <MDButton onClick={handleReset} variant="outlined" color="secondary">
            Reset
          </MDButton>
          <MDButton onClick={handleCloseAddModal} variant="outlined" color="error">
            Cancel
          </MDButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
export default WorkDays;
