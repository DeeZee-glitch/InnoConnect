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

function Holidays() {
  const { calendarId } = useParams();

  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // State to store the data from the API
  const [dataTableData, setDataTableData] = useState({
    columns: [
      { Header: "Holiday Name", accessor: "holidayName" },
      { Header: "From Date Time", accessor: "fromDateTime" },
      { Header: "To Date Time", accessor: "toDateTime" },
      { Header: "Action", accessor: "action" },
    ],
    rows: [],
  });

  // State for adding a new template
  const [openAddModal, setOpenAddModal] = useState(false);
  const [newHoliday, setNewHoliday] = useState({
    calandarId: calendarId,
    holidayName: "",
    fromDateTime: "",
    toDateTime: "",
  });

  // Fetch data from the API
  const fetchData = async () => {
    const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}http://172.20.150.134:5555/calander/calendar/holiday?calandarId=${calendarId}`,
        {
          headers: {
            Authorization: basicAuth,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      const rows = data.holidays?.map((holiday) => ({
        holidayName: holiday.holidayName,
        fromDateTime: holiday.fromDateTime,
        toDateTime: holiday.toDateTime,
        action: (
          <>
            <IconButton>
              <DeleteIcon
                color="secondary"
                style={{ cursor: "pointer" }}
                onClick={() => handleDeleteRow(holiday)}
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

  const handleSearchChange = (query) => {
    setFilteredData(
      originalData.filter((row) => {
        // Extract the text from the Link component if it exists
        const ruleName =
          typeof row.holidayName === "object" ? row.holidayName.props.children : row.holidayName;
        return ruleName.toLowerCase().includes(query.toLowerCase());
      })
    );
  };

  // Function to handle opening and closing the add modal
  //const handleOpenAddModal = () => setOpenAddModal(true);
  const handleCloseAddModal = () => setOpenAddModal(false);

  // Function to handle opening the add modal and reset newCalendar state
  const handleOpenAddModal = () => {
    setNewHoliday({
      calandarId: calendarId,
      holidayName: "",
      fromDateTime: "",
      toDateTime: "", // Reset to default value when modal opens
    });
    setOpenAddModal(true);
  };

  // Function to handle input changes in the add modal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewHoliday((prev) => ({ ...prev, [name]: value }));
  };

  // Function to reset the form
  const handleReset = () => {
    setNewHoliday({
      calandarId: calendarId,
      holidayName: "",
      fromDateTime: "",
      toDateTime: "", // Reset to default value when modal opens
    });
  };

  // Function to save the new holiday
  const handleSave = async () => {
    const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    try {
      const response = await fetch("http://172.20.150.134:5555/calander/calendar/holiday", {
        method: "POST",
        headers: {
          Authorization: basicAuth,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newHoliday),
      });

      if (response.ok) {
        alert("Holiday saved successfully!");
        handleCloseAddModal();
        handleReset(); // Reset form after saving
        fetchData();
      } else {
        alert("Failed to save Holiday.");
      }
    } catch (error) {
      console.error("Error saving Holiday:", error);
    }
  };

  // Function to handle the delete action
  const handleDeleteRow = async (holiday) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this Holiday?");
    if (!confirmDelete) return;

    const payload = {
      calanderId: calendarId,
      holidayId: holiday.holidayId,
    };

    const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    try {
      const response = await fetch("http://172.20.150.134:5555/calander/calendar/holiday", {
        method: "DELETE",
        headers: {
          Authorization: basicAuth,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Holiday deleted successfully!");
        fetchData(); // Refresh the data
      } else {
        alert("Failed to delete Holiday.");
      }
    } catch (error) {
      console.error("Error deleting Holiday:", error);
    }
  };

  return (
    <DashboardLayout>
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
              Holidays
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
      <Footer />

      {/* Modal for adding a new group config */}
      <Dialog open={openAddModal} onClose={handleCloseAddModal} fullWidth maxWidth="sm">
        <DialogTitle>Add Holidays</DialogTitle>
        <DialogContent>
          <MDBox component="form" px={3}>
            <TextField
              fullWidth
              label="Holiday Name"
              name="holidayName"
              value={newHoliday.holidayName}
              onChange={handleInputChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="From Date Time"
              name="fromDateTime"
              value={newHoliday.fromDateTime}
              onChange={handleInputChange}
              type="datetime-local"
              InputLabelProps={{
                shrink: true,
              }}
              style={{ marginTop: 15 }}
              // inputProps={{
              //   step: 300, // 5 min
              // }}
              //   sx={{ width: 150 }}
            />

            <TextField
              fullWidth
              label="To Date Time"
              name="toDateTime"
              value={newHoliday.toDateTime}
              onChange={handleInputChange}
              type="datetime-local"
              InputLabelProps={{
                shrink: true,
              }}
              style={{ marginTop: 20 }}
              // inputProps={{
              //   step: 300, // 5 min
              // }}
              //   sx={{ width: 150 }}
            />
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
export default Holidays;
