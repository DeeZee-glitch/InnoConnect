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

import TopBar from "./utils/TopBar";

import { useParams } from "react-router-dom";

function RuleEscalation() {
  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [dataTableData, setDataTableData] = useState({
    columns: [
      { Header: "Send SMS", accessor: "sendSMS" },
      { Header: "SMS Groups", accessor: "smsGroups" },
      { Header: "SMS Template", accessor: "smsTemplateId" },
      { Header: "Send Email", accessor: "sendEmail" },
      { Header: "Email Groups", accessor: "emailGroups" },
      { Header: "Email Template", accessor: "emailTemplateId" },
      { Header: "Escalation in Mins", accessor: "escalationInMins" },
      { Header: "Action", accessor: "actions" },
    ],
    rows: [],
  });

  const { ruleId } = useParams();
  const [editingRowId, setEditingRowId] = useState(null); // Track the row being edited
  const [editingRowData, setEditingRowData] = useState({}); // Data of the row being edited

  const [emailGroupsOptions, setEmailGroupsOptions] = useState([]);
  const [emailTemplateOptions, setEmailTemplateOptions] = useState([]); // State to store email templates
  const [smsGroupsOptions, setSmsGroupsOptions] = useState([]);
  // State to store email templates
  const [smsTemplateOptions, setSmsTemplateOptions] = useState([]);

  const [openModal, setOpenModal] = useState(false); // Track modal state
  const [newEscalation, setNewEscalation] = useState({
    sendSMS: "FALSE",
    smsTemplateId: "",
    smsGroups: "",
    sendEmail: "FALSE",
    emailGroups: "",
    emailTemplateId: "",
    escalationInMins: "",
    ruleId: ruleId,
  });

  const authHeader = `Basic ${btoa(
    `${process.env.REACT_APP_AUTH_USER}:${process.env.REACT_APP_AUTH_PASS}`
  )}`;

  // Fetch rule actions data from the API
  const fetchData = async () => {
    //const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider:ui/rule/escalation`,
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

      const rows = data.ruleEscalations.map((row) => {
        const isEditing = editingRowId === row.escalationId;

        return {
          sendSMS: isEditing ? (
            // <TextField
            //   value={editingRowData.sendSMS}
            //   onChange={(e) => handleChange("sendSMS", e.target.value)}
            // />
            <Switch
              checked={editingRowData.sendSMS === "TRUE"}
              onChange={(e) => handleChange("sendSMS", e.target.checked ? "TRUE" : "FALSE")}
              color="primary"
            />
          ) : row.sendSMS === "TRUE" ? (
            <IconButton color="success">
              <CheckIcon />
            </IconButton>
          ) : (
            <IconButton color="error">
              <CloseIcon />
            </IconButton>
          ),
          smsGroups: isEditing ? (
            <TextField
              value={editingRowData.smsGroups}
              onChange={(e) => handleChange("smsGroups", e.target.value)}
              disabled={editingRowData.sendSMS === "FALSE"} // Disable if Send SMS is FALSE
            />
          ) : (
            // <TextField
            //   value={editingRowData.smsGroups || ""} // Pre-fill value from editingRowData
            //   onChange={(e) => handleChange("smsGroups", e.target.value)}
            //   select
            //   fullwidth
            //   margin="dense"
            //   InputProps={{
            //     style: { padding: "12px 10px" },
            //   }}
            // >
            //   {smsGroupsOptions.map((groupName) => (
            //     <MenuItem key={groupName} value={groupName}>
            //       {groupName}
            //     </MenuItem>
            //   ))}
            // </TextField>
            row.smsGroups
          ),
          smsTemplateId: isEditing ? (
            <TextField
              value={editingRowData.smsTemplateId}
              onChange={(e) => handleChange("smsTemplateId", e.target.value)}
              disabled={editingRowData.sendSMS === "FALSE"} // Disable if Send SMS is FALSE
            />
          ) : (
            row.smsTemplateId
          ),
          sendEmail: isEditing ? (
            <Switch
              checked={editingRowData.sendEmail === "TRUE"}
              onChange={(e) => handleChange("sendEmail", e.target.checked ? "TRUE" : "FALSE")}
              color="primary"
            />
          ) : row.sendEmail === "TRUE" ? (
            <IconButton color="success">
              <CheckIcon />
            </IconButton>
          ) : (
            <IconButton color="error">
              <CloseIcon />
            </IconButton>
          ),

          emailGroups: isEditing ? (
            <TextField
              value={editingRowData.emailGroups}
              onChange={(e) => handleChange("emailGroups", e.target.value)}
              disabled={editingRowData.sendEmail === "FALSE"} // Disable if Send Email is FALSE
            />
          ) : (
            row.emailGroups
          ),
          emailTemplateId: isEditing ? (
            <TextField
              value={editingRowData.emailTemplateId}
              onChange={(e) => handleChange("emailTemplateId", e.target.value)}
              disabled={editingRowData.sendEmail === "FALSE"} // Disable if Send Email is FALSE
            />
          ) : (
            row.emailTemplateId
          ),
          escalationInMins: isEditing ? (
            <TextField
              value={editingRowData.escalationInMins}
              onChange={(e) => handleChange("escalationInMins", e.target.value)}
            />
          ) : (
            row.escalationInMins
          ),
          actions: isEditing ? (
            <>
              <MDBox display="flex" gap={2}>
                <MDButton variant="outlined" color="info" size="small" onClick={handleSaveClick}>
                  Update
                </MDButton>
                <MDButton
                  variant="outlined"
                  color="secondary"
                  size="small"
                  onClick={handleCancelClick}
                >
                  Cancel
                </MDButton>
              </MDBox>
            </>
          ) : (
            <>
              <IconButton>
                <EditIcon color="info" onClick={() => handleEditClick(row)} />
              </IconButton>
              <IconButton>
                <DeleteIcon color="secondary" onClick={() => handleDeleteClick(row)} />
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
    fetchData(); // Fetch table data
  }, [editingRowId, editingRowData]); // Refetch data when editing state changes

  // const handleSearchChange = (query) => {
  //   setFilteredData(
  //     originalData.filter((row) => row.smsGroups.toLowerCase().includes(query.toLowerCase()))
  //   );
  // };

  const handleSearchChange = (query) => {
    setFilteredData(
      originalData.filter(
        (row) =>
          row.smsGroups.toLowerCase().includes(query.toLowerCase()) ||
          row.emailGroups.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  //Edit Functionalities
  const handleEditClick = (row) => {
    setEditingRowId(row.escalationId);
    setEditingRowData({ ...row });
    console.log("Edit clicked", row);
    console.log("Editing row data ", row);
  };

  const handleChange = (field, value) => {
    setEditingRowData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSaveClick = async () => {
    const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    const payload = {
      escalationId: editingRowData.escalationId,
      smsGroups: editingRowData.smsGroups,
      emailGroups: editingRowData.emailGroups,
      smsTemplateId: editingRowData.smsTemplateId,
      emailTemplateId: editingRowData.emailTemplateId,
      sendSMS: editingRowData.sendSMS,
      sendEmail: editingRowData.sendEmail,
      escalationInMins: editingRowData.escalationInMins,
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider:ui/rule/escalation`,
        {
          method: "PUT",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        alert("Rule Escalation updated successfully!");
        setEditingRowId(null);
        //setEditingRowData(null);
        fetchData(); // Refresh the table data
      } else {
        alert("Failed to update the row.");
      }
    } catch (error) {
      console.error("Error updating row:", error);
      alert("An error occurred while updating the row.");
    }
  };

  const handleCancelClick = () => {
    setEditingRowId(null);
    setEditingRowData({});
  };

  //Add Functionality
  const handleOpenModal = () => {
    fetchEmailGroups(); // Fetch email groups when opening modal
    fetchEmailTemplates(); // Fetch email templates
    setOpenModal(true);
  };

  const handleCloseModal = () => setOpenModal(false);

  const handleInputChange = (field, value) => {
    setNewEscalation((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setNewEscalation({
      sendSMS: "FALSE",
      smsTemplateId: "",
      smsGroups: "",
      sendEmail: "FALSE",
      emailGroups: "",
      emailTemplateId: "",
      escalationInMins: "",
      ruleId: ruleId,
    });
  };

  const handleSave = async () => {
    const basicAuth = "Basic " + btoa("Administrator:manageaudit");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider:ui/rule/escalation/add`,
        {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newEscalation),
        }
      );

      if (response.ok) {
        alert("Escalation added successfully!");
        handleCloseModal();
        handleReset();
        fetchData(); // Refresh table data
      } else {
        alert("Failed to add escalation.");
      }
    } catch (error) {
      console.error("Error adding escalation:", error);
      alert("An error occurred while adding escalation.");
    }
  };

  //Dropdowns in Add functionality
  const fetchEmailGroups = async () => {
    //const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/configuration/groupConfig`, {
        method: "GET",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const emailGroups = data.groupConfigs
          .filter((group) => group.groupType === "Email") // Filter for email groups
          .map((group) => group.groupName); // Extract groupName
        setEmailGroupsOptions(emailGroups); // Set the state

        const smsGroups = data.groupConfigs
          .filter((group) => group.groupType === "SMS")
          .map((group) => group.groupName);
        setSmsGroupsOptions(smsGroups);
      } else {
        console.error("Failed to fetch group configurations.");
      }
    } catch (error) {
      console.error("Error fetching group configurations:", error);
    }
  };

  // Function to fetch email templates
  const fetchEmailTemplates = async () => {
    const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/configuration/template`, {
        method: "GET",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const templates = data.templates
          .filter((template) => template.templateType === "EMAIL") // Ensure only EMAIL templates
          .map((template) => ({
            id: template.templateId,
            name: template.templateName,
          })); // Extract required fields
        setEmailTemplateOptions(templates); // Set state with templates

        const smsTemplates = data.templates
          .filter((template) => template.templateType === "SMS")
          .map((template) => ({
            id: template.templateId,
            name: template.templateName,
          }));
        setSmsTemplateOptions(smsTemplates);
      } else {
        console.error("Failed to fetch email templates.");
      }
    } catch (error) {
      console.error("Error fetching email templates:", error);
    }
  };

  //Delete Functionality
  const handleDeleteClick = async (row) => {
    const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    const payload = {
      ruleId: ruleId,
      escalationId: row.escalationId, // Use escalationId from the row data
    };

    const confirmDelete = window.confirm(`Are you sure you want to delete this escalation?`);
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider:ui/rule/escalation`,
        {
          method: "DELETE",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        alert("Escalation deleted successfully!");
        fetchData(); // Refresh the table data
      } else {
        alert("Failed to delete escalation.");
      }
    } catch (error) {
      console.error("Error deleting escalation:", error);
      alert("An error occurred while deleting the escalation.");
    }
  };

  //Function to clear cache
  const handleApplyChanges = async () => {
    //const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    const payload = { ruleId };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider:ui/rule/escalation/clearCache`,
        {
          method: "DELETE",
          headers: {
            Authorization: authHeader,
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
            <MDTypography variant="h5" fontWeight="medium" onClick={handleOpenModal}>
              Rule Escalations
            </MDTypography>
          </MDBox>

          <MDBox display="flex" justifyContent="flex-end" alignItems="center" px={3}>
            <MDButton
              style={{ marginRight: 16 }}
              variant="gradient"
              color="info"
              size="medium"
              onClick={handleOpenModal}
            >
              Add Escalation
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
      {/* Modal for Adding Escalation */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth>
        <DialogTitle>
          <MDTypography variant="h6" fontWeight="medium" style={{ marginBottom: "16px" }}>
            Add Escalations
          </MDTypography>
        </DialogTitle>
        <DialogContent>
          <MDBox display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Send SMS"
              select
              value={newEscalation.sendSMS}
              onChange={(e) => handleInputChange("sendSMS", e.target.value)}
              fullWidth // Ensures the field spans the available space
              margin="dense" // Adjust spacing to make the layout more compact
              InputProps={{
                style: { padding: "12px 10px" },
              }}
            >
              <MenuItem value="TRUE">TRUE</MenuItem>
              <MenuItem value="FALSE">FALSE</MenuItem>
            </TextField>
            {/* <TextField
              label="SMS Groups"
              value={newEscalation.smsGroups}
              onChange={(e) => handleInputChange("smsGroups", e.target.value)}
            /> */}
            <TextField
              label="SMS Groups"
              select
              value={newEscalation.smsGroups}
              onChange={(e) => handleInputChange("smsGroups", e.target.value)}
              InputProps={{
                style: { padding: "12px 10px" },
              }}
              disabled={newEscalation.sendSMS === "FALSE"} // Disable if Send Email is FALSE
            >
              {smsGroupsOptions.map((groupName) => (
                <MenuItem key={groupName} value={groupName}>
                  {groupName}
                </MenuItem>
              ))}
            </TextField>
            {/* <TextField
              label="SMS Template"
              value={newEscalation.smsTemplateId}
              onChange={(e) => handleInputChange("smsTemplateId", e.target.value)}
            /> */}

            <TextField
              label="SMS Template"
              select
              value={newEscalation.smsTemplateId}
              onChange={(e) => handleInputChange("smsTemplateId", e.target.value)}
              InputProps={{
                style: { padding: "12px 10px" },
              }}
              disabled={newEscalation.sendSMS === "FALSE"} // Disable if Send Email is FALSE
            >
              {smsTemplateOptions.map((groupName) => (
                <MenuItem key={groupName.id} value={groupName.name}>
                  {groupName.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Send Email"
              select
              value={newEscalation.sendEmail}
              onChange={(e) => handleInputChange("sendEmail", e.target.value)}
              InputProps={{
                style: { padding: "12px 10px" },
              }}
            >
              <MenuItem value="TRUE">TRUE</MenuItem>
              <MenuItem value="FALSE">FALSE</MenuItem>
            </TextField>
            {/* <TextField
              label="Email Groups"
              value={newEscalation.emailGroups}
              onChange={(e) => handleInputChange("emailGroups", e.target.value)}
            /> */}
            <TextField
              label="Email Groups"
              select
              value={newEscalation.emailGroups}
              onChange={(e) => handleInputChange("emailGroups", e.target.value)}
              InputProps={{
                style: { padding: "12px 10px" },
              }}
              disabled={newEscalation.sendEmail === "FALSE"} // Disable if Send Email is FALSE
            >
              {emailGroupsOptions.map((groupName) => (
                <MenuItem key={groupName} value={groupName}>
                  {groupName}
                </MenuItem>
              ))}
            </TextField>
            {/* <TextField
              label="Email Template ID"
              value={newEscalation.emailTemplateId}
              onChange={(e) => handleInputChange("emailTemplateId", e.target.value)}
            /> */}

            <TextField
              label="Email Template"
              select
              value={newEscalation.emailTemplateId}
              onChange={(e) => handleInputChange("emailTemplateId", e.target.value)}
              InputProps={{
                style: { padding: "12px 10px" },
              }}
              disabled={newEscalation.sendEmail === "FALSE"} // Disable if Send Email is FALSE
            >
              {emailTemplateOptions.map((template) => (
                <MenuItem key={template.id} value={template.name}>
                  {template.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Escalation in Minutes"
              value={newEscalation.escalationInMins}
              onChange={(e) => handleInputChange("escalationInMins", e.target.value)}
              type="number"
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
          <MDButton onClick={handleCloseModal} variant="outlined" color="error">
            Cancel
          </MDButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default RuleEscalation;
