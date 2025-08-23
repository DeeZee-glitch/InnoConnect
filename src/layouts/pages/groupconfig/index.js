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
import IconButton from "@mui/material/IconButton";
import TopBar from "./utils/TopBar";

import Tooltip from "@mui/material/Tooltip";

import { Link } from "react-router-dom";

function GroupConfig() {
  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // State to store the data from the API
  const [dataTableData, setDataTableData] = useState({
    columns: [
      { Header: "Group Name", accessor: "groupName" },
      { Header: "Group Value", accessor: "groupValue" },
      { Header: "Group Type", accessor: "groupType" },
      { Header: "Description", accessor: "description" },
      { Header: "Actions", accessor: "actions" },
    ],
    rows: [],
  });

  // State for adding a new template
  const [openAddModal, setOpenAddModal] = useState(false);
  const [newGroupConfig, setNewGroupConfig] = useState({
    groupName: "",
    groupValue: "",
    groupType: "",
    description: "",
  });

  //state to track the row being edited:
  const [editingRow, setEditingRow] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const authHeader = `Basic ${window.btoa(
    `${process.env.REACT_APP_AUTH_USER}:${process.env.REACT_APP_AUTH_PASS}`
  )}`;
  // Fetch data from the API
  const fetchData = async () => {
    //const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/configuration/groupConfig`, {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      const rows = data.groupConfigs?.map((groupConfig) => {
        //   groupConfigId: groupConfig.groupConfigId,
        //   groupName: groupConfig.groupName,
        //   groupValue: groupConfig.groupValue,
        //   groupType: groupConfig.groupType,
        //   description: groupConfig.description,
        //   actions: (
        //     <>
        //       <EditIcon color="info" style={{ cursor: "pointer" }} />
        //       {/* <DeleteIcon></DeleteIcon> */}
        //       <DeleteIcon style={{ cursor: "pointer", color: "red" }} />
        //     </>
        //   ),
        // })) || [];

        return editingId === groupConfig.groupConfigId
          ? {
              groupName: (
                <TextField
                  fullWidth
                  name="groupName"
                  // value={editingRow.groupName}
                  defaultValue={editingRow.groupName}
                  onChange={(e) =>
                    setEditingRow((prev) => ({ ...prev, groupName: e.target.value }))
                  }
                />
              ),
              groupValue: (
                <TextField
                  fullWidth
                  name="groupValue"
                  // value={editingRow.groupValue}
                  defaultValue={editingRow.groupValue}
                  // InputProps={{
                  //   style: { padding: "12px 10px" },
                  // }}
                  onChange={(e) =>
                    setEditingRow((prev) => ({ ...prev, groupValue: e.target.value }))
                  }
                />
              ),
              groupType: (
                <TextField
                  fullWidth
                  name="groupType"
                  //value={editingRow.groupType}
                  defaultValue={editingRow.groupType}
                  onChange={(e) =>
                    setEditingRow((prev) => ({ ...prev, groupType: e.target.value }))
                  }
                />
              ),
              description: (
                <TextField
                  fullWidth
                  name="description"
                  //value={editingRow.description}
                  defaultValue={editingRow.description}
                  onChange={(e) =>
                    setEditingRow((prev) => ({ ...prev, description: e.target.value }))
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
              groupConfigId: groupConfig.groupConfigId,
              groupName: groupConfig.groupName,
              groupValue: groupConfig.groupValue,
              groupType: groupConfig.groupType,
              description: groupConfig.description,
              actions: (
                <>
                  <IconButton>
                    <EditIcon
                      color="info"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleEditRow(groupConfig)}
                    />
                  </IconButton>

                  {/* <DeleteIcon></DeleteIcon> */}
                  <IconButton>
                    <DeleteIcon
                      color="secondary"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleDeleteRow(groupConfig.groupConfigId)}
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
          typeof row.groupName === "object" ? row.groupName.props.children : row.groupName;
        return ruleName.toLowerCase().includes(query.toLowerCase());
      })
    );
  };

  // // Function to handle modal open
  // const handleOpen = (content) => {
  //   setModalContent(content);
  //   setOpen(true);
  // };

  // // Function to handle modal close
  // const handleClose = () => {
  //   setOpen(false);
  //   setModalContent("");
  // };

  // Function to handle opening and closing the add modal
  const handleOpenAddModal = () => setOpenAddModal(true);
  const handleCloseAddModal = () => setOpenAddModal(false);

  // Function to handle input changes in the add modal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGroupConfig((prev) => ({ ...prev, [name]: value }));
  };

  // Function to reset the form
  const handleReset = () => {
    setNewGroupConfig({
      groupName: "",
      groupValue: "",
      groupType: "",
      description: "",
    });
  };

  // Function to save the new group Config
  const handleSave = async () => {
    const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/configuration/groupConfig`, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newGroupConfig),
      });

      if (response.ok) {
        alert("Group Config saved successfully!");
        handleCloseAddModal();
        handleReset(); // Reset form after saving
        fetchData();
      } else {
        alert("Failed to save Group Config.");
      }
    } catch (error) {
      console.error("Error saving Group Config:", error);
    }
  };

  const handleEditRow = (row) => {
    setEditingRow({ ...row });
    setEditingId(row.groupConfigId);
    console.log(" Edit clicked; editId: " + editingId + " editingRow: " + editingRow);
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditingId(null);
  };

  //Function to save edited row
  const handleSaveRow = async () => {
    const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/configuration/groupConfig`, {
        method: "PUT",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupConfigId: editingRow.groupConfigId,
          groupName: editingRow.groupName,
          groupValue: editingRow.groupValue,
          groupType: editingRow.groupType,
          description: editingRow.description,
        }),
      });

      if (response.ok) {
        alert("Group Config updated successfully!");
        setEditingRow(null);
        setEditingId(null);
        // Optionally, refetch data here to update the table.
      } else {
        alert("Failed to update Group Config.");
      }
    } catch (error) {
      console.error("Error updating Group Config:", error);
    }
  };

  // Function to handle the delete action
  const handleDeleteRow = async (groupConfigId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this Group Config?");
    if (!confirmDelete) return;

    //const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/configuration/groupConfig`, {
        method: "DELETE",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupConfigId }),
      });

      if (response.ok) {
        alert("Group Config deleted successfully!");
        fetchData(); // Refresh the data
      } else {
        alert("Failed to delete template.");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
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
              Group Config
            </MDTypography>
          </MDBox>
          <MDBox width="13.2rem" ml="auto">
            <MDButton
              style={{ marginLeft: 23 }}
              variant="gradient"
              color="info"
              size="medium"
              onClick={handleOpenAddModal}
            >
              Add Group Config
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
      {/* Modal for displaying template content */}
      {/* <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Template Contents</DialogTitle>
        <DialogContent>
          <MDBox>
            <pre>{modalContent}</pre>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleClose} color="primary">
            Close
          </MDButton>
        </DialogActions>
      </Dialog> */}
      {/* Modal for adding a new group config */}
      <Dialog open={openAddModal} onClose={handleCloseAddModal} fullWidth maxWidth="sm">
        <DialogTitle>Add New Group Config</DialogTitle>
        <DialogContent>
          <MDBox component="form" px={3}>
            <TextField
              fullWidth
              label="Group Name"
              name="groupName"
              value={newGroupConfig.groupName}
              onChange={handleInputChange}
              margin="normal"
            />
            <TextField
              label="Group Value"
              name="groupValue"
              value={newGroupConfig.groupValue}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              // InputProps={{
              //   style: { padding: "12px 10px" },
              // }}
            />
            <TextField
              fullWidth
              label="Group Type"
              name="groupType"
              value={newGroupConfig.groupType}
              onChange={handleInputChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={newGroupConfig.description}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={4}
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
export default GroupConfig;
