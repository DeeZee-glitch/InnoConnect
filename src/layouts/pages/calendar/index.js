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

import { Link } from "react-router-dom";
import { IconBase } from "react-icons";
import { IconButton } from "@mui/material";

import TopBar from "./utils/TopBar";

function Calendar() {
  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // State to store the data from the API
  const [dataTableData, setDataTableData] = useState({
    columns: [
      { Header: "Calendar Name", accessor: "calandarName" },
      { Header: "Calendar Time Zone", accessor: "calandarTimeZone" },
      { Header: "Actions", accessor: "actions" },
    ],
    rows: [],
  });

  // State for adding a new template
  const [openAddModal, setOpenAddModal] = useState(false);
  const [newCalendar, setNewCalendar] = useState({
    calandarName: "",
    calandarTimeZone: "Asia/Riyadh",
  });

  //state to track the row being edited:
  const [editingRow, setEditingRow] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const authHeader = `Basic ${window.btoa(
    `${process.env.REACT_APP_AUTH_USER}:${process.env.REACT_APP_AUTH_PASS}`
  )}`;
  // Fetch data from the API
  const fetchData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider:ui/calendar/all`,
        {
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      const rows = data.allCalandars?.map((calendar) => {
        return editingId === calendar.calandarId
          ? {
              calandarName: (
                <TextField
                  fullWidth
                  name="calandarName"
                  //value={editingRow.calandarName}
                  defaultValue={editingRow.calandarName}
                  onChange={(e) =>
                    setEditingRow((prev) => ({ ...prev, calandarName: e.target.value }))
                  }
                />
              ),
              calandarTimeZone: (
                <TextField
                  fullWidth
                  name="calandarTimeZone"
                  //value={editingRow.calandarTimeZone}
                  defaultValue={editingRow.calandarTimeZone}
                  onChange={(e) =>
                    setEditingRow((prev) => ({ ...prev, calandarTimeZone: e.target.value }))
                  }
                />
              ),
              actions: (
                <>
                  <MDBox display="flex" gap={2}>
                    <MDButton variant="outlined" color="info" size="small" onClick={handleSaveRow}>
                      Save
                    </MDButton>
                    <MDButton
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </MDButton>
                  </MDBox>
                </>
              ),
            }
          : {
              calandarName: (
                <Link
                  to={`/pages/calendarConfiguration/${calendar.calandarId}`}
                  style={{ textDecoration: "none", color: "#1A73E8" }}
                >
                  {calendar.calandarName}
                </Link>
              ),
              calandarTimeZone: calendar.calandarTimeZone,
              actions: (
                <>
                  <IconButton>
                    <EditIcon
                      color="info"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleEditRow(calendar)}
                    />
                  </IconButton>

                  <IconButton>
                    <DeleteIcon
                      color="secondary"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleDeleteRow(calendar.calandarId)}
                    />
                  </IconButton>
                </>
              ),
            };
      });

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
  }, [editingId, editingRow]);

  const handleSearchChange = (query) => {
    setFilteredData(
      originalData.filter((row) => {
        // Extract the text from the Link component if it exists
        const ruleName =
          typeof row.calandarName === "object" ? row.calandarName.props.children : row.calandarName;
        return ruleName.toLowerCase().includes(query.toLowerCase());
      })
    );
  };

  // Function to handle opening and closing the add modal
  //const handleOpenAddModal = () => setOpenAddModal(true);
  const handleCloseAddModal = () => setOpenAddModal(false);

  // Function to handle opening the add modal and reset newCalendar state
  const handleOpenAddModal = () => {
    setNewCalendar({
      calandarName: "",
      calandarTimeZone: "Asia/Riyadh", // Reset to default value when modal opens
    });
    setOpenAddModal(true);
  };

  // Function to handle input changes in the add modal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCalendar((prev) => ({ ...prev, [name]: value }));
  };

  // Function to reset the form
  const handleReset = () => {
    setNewCalendar({
      calandarName: "",
      calandarTimeZone: "",
    });
  };

  // Function to save the new user calendar
  const handleSave = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider:ui/calendar/insert`,
        {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newCalendar),
        }
      );

      if (response.ok) {
        alert("User Calendar saved successfully!");
        handleCloseAddModal();
        handleReset(); // Reset form after saving
        fetchData();
      } else {
        alert("Failed to save User Calendar.");
      }
    } catch (error) {
      console.error("Error saving User Calendar:", error);
    }
  };

  const handleEditRow = (row) => {
    setEditingRow({ ...row });
    setEditingId(row.calandarId);
    console.log(" Edit clicked; editId: " + editingId + " editingRow: " + editingRow);
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditingId(null);
  };

  //Function to save edited row
  const handleSaveRow = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider:ui/calendar/update`,
        {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            calandarId: editingRow.calandarId,
            calandarName: editingRow.calandarName,
            calandarTimeZone: editingRow.calandarTimeZone,
          }),
        }
      );

      if (response.ok) {
        alert("User Calendar updated successfully!");
        setEditingRow(null);
        setEditingId(null);
        // Optionally, refetch data here to update the table.
      } else {
        alert("Failed to update User Calendar.");
      }
    } catch (error) {
      console.error("Error updating User Calendar:", error);
    }
  };

  // Function to handle the delete action
  const handleDeleteRow = async (calandarId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this User Calendar?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider:ui/calendar/delete`,
        {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ calandarId }),
        }
      );

      if (response.ok) {
        alert("User Calendar deleted successfully!");
        fetchData(); // Refresh the data
      } else {
        alert("Failed to delete Calendar.");
      }
    } catch (error) {
      console.error("Error deleting Calendar:", error);
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
              User Calendar
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
              Add Calendar
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
        <DialogTitle>Add Calendar</DialogTitle>
        <DialogContent>
          <MDBox component="form" px={3}>
            <TextField
              fullWidth
              label="Calenar Name"
              name="calandarName"
              value={newCalendar.calandarName}
              onChange={handleInputChange}
              margin="normal"
            />
            <TextField
              label="Calendar Time Zone"
              name="calandarTimeZone"
              value={newCalendar.calandarTimeZone}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              // InputProps={{
              //   style: { padding: "12px 10px" },
              // }}
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
export default Calendar;
