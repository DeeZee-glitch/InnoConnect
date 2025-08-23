import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
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

import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

//Material Icons
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";
import Switch from "@mui/material/Switch";

import { useParams } from "react-router-dom";

import TopBar from "./utils/TopBar";
import { ZoomOutSharp } from "@mui/icons-material";

function RuleAction() {
  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [dataTableData, setDataTableData] = useState({
    columns: [
      { Header: "Executor Name", accessor: "executorName" },
      { Header: "Status", accessor: "isActive" },
      { Header: "Options", accessor: "options" },
    ],
    rows: [],
  });

  const { ruleName, ruleId } = useParams();
  const [editingRowId, setEditingRowId] = useState(null); // Track the row being edited
  const [editingRowData, setEditingRowData] = useState({}); // Data of the row being edited
  const [executors, setExecutors] = useState([]); // Store executors for dropdown
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    executorId: "",
    isActive: "TRUE",
  });

  // Additional states for dynamic modal
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [actionConfig, setActionConfig] = useState([]);
  const [settingsFormData, setSettingsFormData] = useState({});

  const [selectedActionId, setSelectedActionId] = useState(null); // State to store the actionId of the clicked row

  const authHeader = `Basic ${btoa(
    `${process.env.REACT_APP_AUTH_USER}:${process.env.REACT_APP_AUTH_PASS}`
  )}`;
  // Fetch executors from the API
  const fetchExecutors = async () => {
    // const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider:ui/rule/executors/all`,
        {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ruleId }),
        }
      );
      const data = await response.json();
      setExecutors(data.executors || []); // Save executors to state
    } catch (error) {
      console.error("Error fetching executors:", error);
    }
  };

  // Fetch rule actions data from the API
  const fetchData = async () => {
    const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider:ui/rule/action/all`,
        {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ruleId }),
        }
      );
      const data = await response.json();

      const rows = data.ruleActions.map((row) => {
        const isEditing = editingRowId === row.actionId;

        return {
          executorName: isEditing ? (
            <TextField
              select
              name="executorName"
              value={editingRowData.executorName || ""}
              onChange={(e) => handleInputChange(e, "executorName")}
              fullWidth
              InputProps={{
                style: { padding: "12px 10px" },
              }}
            >
              {executors.map((executor) => (
                <MenuItem key={executor.executorId} value={executor.executorName}>
                  {executor.executorName}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            row.executorName
          ),
          isActive: isEditing ? (
            <Switch
              checked={editingRowData.isActive === "TRUE"}
              onChange={(e) =>
                handleInputChange(
                  { target: { value: e.target.checked ? "TRUE" : "FALSE" } },
                  "isActive"
                )
              }
              color="success"
            />
          ) : row.isActive === "TRUE" ? (
            <IconButton color="success">
              <CheckIcon />
            </IconButton>
          ) : (
            <IconButton color="error">
              <CloseIcon />
            </IconButton>
          ),
          options: isEditing ? (
            <>
              <MDBox display="flex" gap={2}>
                <MDButton
                  variant="outlined"
                  color="info"
                  size="small"
                  onClick={() => handleUpdate(row.actionId)}
                >
                  Update
                </MDButton>
                <MDButton variant="outlined" color="secondary" size="small" onClick={handleCancel}>
                  Cancel
                </MDButton>
              </MDBox>
            </>
          ) : (
            <>
              <IconButton onClick={() => handleSettingsClick(row.actionId)}>
                <SettingsIcon />
              </IconButton>
              <IconButton onClick={() => handleEdit(row)}>
                <EditIcon color="info" />
              </IconButton>
              <IconButton onClick={() => handleDelete(row.actionId)}>
                <DeleteIcon color="secondary" />
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
    fetchExecutors(); // Fetch executors once
    fetchData(); // Fetch table data
    console.log("executors: ", executors);
  }, [editingRowId, editingRowData]); // Refetch data when editing state changes

  const handleSearchChange = (query) => {
    setFilteredData(
      originalData.filter((row) => row.executorName.toLowerCase().includes(query.toLowerCase()))
    );
  };

  // const handleStatusChange = (selectedStatuses) => {
  //   if (selectedStatuses.length === 0) {
  //     setFilteredData(originalData); // Reset to original data if no filter applied
  //   } else {
  //     setFilteredData(originalData.filter((row) => selectedStatuses.includes(row.isActive)));
  //   }
  // };

  const handleStatusChange = (selectedStatuses) => {
    if (selectedStatuses.length === 0) {
      setFilteredData(originalData); // Reset to original data if no filter applied
    } else {
      const filteredRows = originalData.filter((row) => {
        // Access the original rule action data and compare
        const originalRow = dataTableData.rows.find(
          (r) => r.executorName === row.executorName && r.options === row.options
        );
        const isActive = originalRow?.isActive === "TRUE";
        return selectedStatuses.includes(isActive ? "TRUE" : "FALSE");
      });
      setFilteredData(filteredRows);
    }
  };

  const handleInputChange = (e, field) => {
    const { value } = e.target;
    setEditingRowData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = (row) => {
    setEditingRowId(row.actionId);
    setEditingRowData({
      executorName: row.executorName,
      isActive: row.isActive,
    });
  };

  const handleCancel = () => {
    setEditingRowId(null);
    setEditingRowData({});
  };

  const handleUpdate = async (actionId) => {
    const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    const payload = {
      isAction: editingRowData.isActive === "TRUE" ? "TRUE" : "FALSE",
      actionId,
      ruleId,
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/rules/rule/action`, {
        method: "PUT",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Rule Action updated successfully!");
        fetchData();
        handleCancel();
      } else {
        alert("Failed to update Rule Action.");
      }
    } catch (error) {
      console.error("Error updating Rule Action:", error);
    }
  };

  const handleDelete = async (actionId) => {
    const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    const payload = {
      ruleId,
      actionId,
    };

    const confirmDelete = window.confirm(`Are you sure you want to delete this Rule Action?`);
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/rules/rule/action`, {
        method: "DELETE",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Rule Action deleted successfully!");
        fetchData(); // Refresh the table data
      } else {
        alert("Failed to delete Rule Action.");
      }
    } catch (error) {
      console.error("Error deleting Rule Action:", error);
    }
  };

  // Handle form input change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle modal actions
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ executorId: "", isActive: "TRUE" });
  };

  const handleSave = async () => {
    const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    const payload = { ...formData, ruleId };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/rules/rule/action`, {
        method: "POST",
        headers: {
          Authorization: basicAuth,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Rule Action added successfully!");
        closeModal();
        fetchData(); // Refresh table data
      } else {
        alert("Failed to add Rule Action.");
      }
    } catch (error) {
      console.error("Error adding Rule Action:", error);
    }
  };

  //Settings icon click functionalities
  // Function to fetch the configuration for the selected action
  const fetchActionConfig = async (actionId) => {
    const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider:ui/rule/action/getActionConfig`,
        {
          method: "POST",
          headers: {
            Authorization: basicAuth,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ actionId }),
        }
      );

      const data = await response.json();
      if (data?.configs) {
        setActionConfig(data.configs);
        const initialFormData = data.configs.reduce((acc, config) => {
          acc[config.name] = config.value || ""; // Set default values
          return acc;
        }, {});
        setSettingsFormData(initialFormData);
        setIsSettingsModalOpen(true); // Open the modal
      } else {
        alert("Failed to fetch configuration for the action.");
      }
    } catch (error) {
      console.error("Error fetching action configuration:", error);
    }
  };

  // Handle dynamic form input changes
  const handleSettingsFormChange = (e) => {
    const { name, value } = e.target;
    setSettingsFormData((prev) => ({ ...prev, [name]: value }));
    console.log("settingsformdata", settingsFormData);
  };

  // Close settings modal
  const closeSettingsModal = () => {
    setIsSettingsModalOpen(false);
    setActionConfig([]);
    setSettingsFormData({});
  };

  // Update handleEdit function to trigger fetchActionConfig for settings
  const handleSettingsClick = (actionId) => {
    setSelectedActionId(actionId);
    fetchActionConfig(actionId);
  };

  // Function to handle the save
  const handleSettingsSave = async () => {
    const basicAuth = "Basic " + btoa("Administrator:manageaudit");

    const requestBody = {
      actionId: selectedActionId, // Use the selectedActionId from state
      configs: actionConfig.map((config) => ({
        name: config.name, // Name from actionConfig
        label: config.label, // Label from actionConfig
        value: settingsFormData[config.name] || "", // Updated value from settingsFormData
      })),
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider:ui/rule/action/updateConfig`,
        {
          method: "POST",
          headers: {
            Authorization: basicAuth,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        alert("Settings updated successfully!");
        closeSettingsModal(); // Close the modal
        fetchData(); // Refresh the table
      } else {
        alert("Failed to update settings.");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
    }
  };
  //Function to clear cache
  const handleApplyChanges = async () => {
    const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    const payload = { ruleId };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider:ui/rule/action/clearCache`,
        {
          method: "POST",
          headers: {
            Authorization: basicAuth,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        alert("Changes applied successfully!");
      } else {
        alert("Failed to apply changes.");
      }
    } catch (error) {
      console.error("Error clearing cache:", error);
      alert("An error occurred while clearing the cache.");
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <MDBox flex="1">
            <TopBar onSearchChange={handleSearchChange} onStatusChange={handleStatusChange} />
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
              Rule Actions
            </MDTypography>
          </MDBox>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" px={3}>
            <h5>{ruleName}</h5>
          </MDBox>
          <MDBox display="flex" justifyContent="flex-end" alignItems="center" px={3}>
            <MDButton
              style={{ marginRight: 16 }}
              variant="gradient"
              color="info"
              size="medium"
              onClick={openModal}
            >
              Add Action
            </MDButton>
            <MDButton
              variant="outlined"
              color="secondary"
              size="medium"
              onClick={handleApplyChanges}
            >
              Apply Changes
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
      {/* Add Action Modal */}
      <Dialog open={isModalOpen} onClose={closeModal} fullWidth>
        <DialogTitle>Add Rule Action</DialogTitle>
        <DialogContent>
          <TextField
            select
            name="executorId"
            label="Executor Name"
            value={formData.executorId}
            onChange={handleFormChange}
            fullWidth
            margin="dense"
            InputProps={{
              style: { padding: "12px 10px" },
            }}
          >
            {executors.map((executor) => (
              <MenuItem key={executor.executorId} value={executor.executorId}>
                {executor.executorName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            name="isActive"
            label="Status"
            value={formData.isActive}
            onChange={handleFormChange}
            fullWidth
            margin="dense"
            InputProps={{
              style: { padding: "12px 10px" },
            }}
          >
            <MenuItem value="TRUE">Active</MenuItem>
            <MenuItem value="FALSE">Inactive</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleSave} variant="gradient" color="info">
            Save
          </MDButton>
          <MDButton
            onClick={() => setFormData({ executorId: "", isActive: "TRUE" })}
            variant="outlined"
            color="secondary"
          >
            Reset
          </MDButton>
          <MDButton onClick={closeModal} variant="outlined" color="error">
            Cancel
          </MDButton>
        </DialogActions>
      </Dialog>
      {/* Dynamic Modal for Settings */}
      <Dialog open={isSettingsModalOpen} onClose={closeSettingsModal} maxWidth="sm" fullWidth>
        <DialogTitle>Rule Action Configuration</DialogTitle>
        <DialogContent>
          {actionConfig.map((field) => {
            // Parse the dropDownValues string into an array
            const dropdownOptions =
              field.type === "dropdown" && field.dropDownValues
                ? field.dropDownValues.split(",").map((value) => value.trim()) // Split and trim the values
                : [];

            return (
              <TextField
                key={field.name}
                name={field.name}
                label={field.label}
                type={field.type === "dropdown" ? "text" : field.type} // Ensure dropdown is rendered correctly
                value={settingsFormData[field.name] || ""}
                onChange={handleSettingsFormChange}
                fullWidth
                margin="dense"
                select={field.type === "dropdown"} // Render dropdown if type is "dropdown"
                InputProps={{
                  style: { padding: "12px 10px" },
                }}
              >
                {field.type === "dropdown" &&
                  dropdownOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
              </TextField>
            );
          })}
        </DialogContent>
        <DialogActions>
          {/* onClick={handleSettingsSave} */}
          <MDButton onClick={handleSettingsSave} variant="gradient" color="info">
            Save
          </MDButton>
          <MDButton onClick={closeSettingsModal} variant="outlined" color="error">
            Cancel
          </MDButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default RuleAction;
