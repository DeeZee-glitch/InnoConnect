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

function Templates() {
  // State to store the data from the API
  const [dataTableData, setDataTableData] = useState({
    columns: [
      { Header: "Template Name", accessor: "templateName" },
      { Header: "Template Type", accessor: "templateType" },
      { Header: "Template Description", accessor: "templateDescription" },
      { Header: "Template Contents", accessor: "templateContents" },
      { Header: "Actions", accessor: "actions" },
    ],
    rows: [],
  });

  // State for modal visibility and content
  const [open, setOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");

  // State for adding a new template
  const [openAddModal, setOpenAddModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    templateName: "",
    templateType: "",
    templateDescription: "",
    templateContents: "",
  });

  //state to track the row being edited:
  const [editingRow, setEditingRow] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Fetch data from the API
  const fetchData = async () => {
    const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    try {
      const response = await fetch("http://172.20.150.134:5555/configuration/template", {
        headers: {
          Authorization: basicAuth,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      // const rows = data.templates.map((template) => ({
      //   templateName: template.templateName,
      //   templateType: template.templateType === "EMAIL" ? <EmailIcon /> : <SmsIcon />,
      //   templateDescription: template.templateDescription,
      //   templateContents: (
      //     <MDButton
      //       variant="outlined"
      //       color="info"
      //       size="small"
      //       onClick={() => handleOpen(template.templateContents)}
      //     >
      //       View Content
      //     </MDButton>
      //   ),

      //   actions: (
      //     <>
      //       <EditIcon color="info" style={{ cursor: "pointer" }} />
      //       {/* <DeleteIcon></DeleteIcon> */}
      //       <DeleteIcon style={{ cursor: "pointer", color: "red" }} />
      //     </>
      //   ),
      // }));

      const rows = data.templates.map((template) => {
        const isEditing = editingRow && editingRow.templateId === template.templateId;
        console.log("isEditing: " + isEditing + " editingRow: " + editingRow);
        //return isEditing
        return editingId === template.templateId
          ? {
              templateName: (
                <TextField
                  fullWidth
                  name="templateName"
                  value={editingRow.templateName}
                  onChange={(e) =>
                    setEditingRow((prev) => ({ ...prev, templateName: e.target.value }))
                  }
                />
              ),
              templateType: (
                <TextField
                  select
                  fullWidth
                  name="templateType"
                  value={editingRow.templateType}
                  onChange={(e) =>
                    setEditingRow((prev) => ({ ...prev, templateType: e.target.value }))
                  }
                >
                  <MenuItem value="EMAIL">EMAIL</MenuItem>
                  <MenuItem value="SMS">SMS</MenuItem>
                </TextField>
              ),
              templateDescription: (
                <TextField
                  fullWidth
                  name="templateDescription"
                  value={editingRow.templateDescription}
                  onChange={(e) =>
                    setEditingRow((prev) => ({ ...prev, templateDescription: e.target.value }))
                  }
                />
              ),
              templateContents: (
                <MDButton
                  variant="outlined"
                  color="info"
                  size="small"
                  onClick={() => handleOpen(editingRow.templateContents)}
                >
                  View Content
                </MDButton>
              ),
              actions: (
                <>
                  <MDButton variant="outlined" color="success" size="small" onClick={handleSaveRow}>
                    Save
                  </MDButton>
                  <MDButton
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </MDButton>
                </>
              ),
            }
          : {
              templateName: template.templateName,
              templateType: template.templateType === "EMAIL" ? <EmailIcon /> : <SmsIcon />,
              templateDescription: template.templateDescription,
              templateContents: (
                <MDButton
                  variant="outlined"
                  color="info"
                  size="small"
                  onClick={() => handleOpen(template.templateContents)}
                >
                  View Content
                </MDButton>
              ),
              actions: (
                <>
                  <EditIcon
                    color="info"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleEditRow(template)}
                  />
                  <DeleteIcon style={{ cursor: "pointer", color: "red" }} />
                </>
              ),
            };
      });

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

  // Function to handle modal open
  const handleOpen = (content) => {
    setModalContent(content);
    setOpen(true);
  };

  // Function to handle modal close
  const handleClose = () => {
    setOpen(false);
    setModalContent("");
  };

  // Function to handle opening the add modal
  const handleOpenAddModal = () => setOpenAddModal(true);
  const handleCloseAddModal = () => setOpenAddModal(false);

  // Function to handle input changes in the add modal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTemplate((prev) => ({ ...prev, [name]: value }));
  };

  // Function to reset the form
  const handleReset = () => {
    setNewTemplate({
      templateName: "",
      templateType: "",
      templateDescription: "",
      templateContents: "",
    });
  };

  // Function to save the new template
  const handleSave = async () => {
    const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    try {
      const response = await fetch("http://172.20.150.134:5555/configuration/template", {
        method: "POST",
        headers: {
          Authorization: basicAuth,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTemplate),
      });

      if (response.ok) {
        alert("Template saved successfully!");
        handleCloseAddModal();
        handleReset(); // Reset form after saving
      } else {
        alert("Failed to save template.");
      }
    } catch (error) {
      console.error("Error saving template:", error);
    }
  };

  const handleEditRow = (row) => {
    setEditingRow({ ...row });
    setEditingId(row.templateId);
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
      const response = await fetch("http://172.20.150.134:5555/configuration/template", {
        method: "PUT",
        headers: {
          Authorization: basicAuth,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId: editingRow.templateId,
          templateName: editingRow.templateName,
          templateContents: editingRow.templateContents,
          templateType: editingRow.templateType,
          templateDescription: editingRow.templateDescription,
        }),
      });

      if (response.ok) {
        alert("Template updated successfully!");
        setEditingRow(null);
        setEditingId(null);
        // Optionally, refetch data here to update the table.
      } else {
        alert("Failed to update template.");
      }
    } catch (error) {
      console.error("Error updating template:", error);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Card>
          <MDBox p={3} lineHeight={1}>
            <MDTypography variant="h5" fontWeight="medium">
              Templates
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
              Add Template
            </MDButton>
          </MDBox>
          <DataTable table={dataTableData} canSearch />
        </Card>
      </MDBox>
      <Footer />
      {/* Modal for displaying template content */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
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
      </Dialog>
      {/* Modal for adding a new template */}
      <Dialog open={openAddModal} onClose={handleCloseAddModal} fullWidth maxWidth="sm">
        <DialogTitle>Add New Template</DialogTitle>
        <DialogContent>
          <MDBox component="form" px={3}>
            <TextField
              fullWidth
              label="Template Name"
              name="templateName"
              value={newTemplate.templateName}
              onChange={handleInputChange}
              margin="normal"
            />
            <TextField
              select
              label="Template Type"
              name="templateType"
              value={newTemplate.templateType}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
              InputProps={{
                style: { padding: "12px 10px" },
              }}
            >
              <MenuItem selected value="EMAIL">
                EMAIL
              </MenuItem>
              <MenuItem value="SMS">SMS</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Template Description"
              name="templateDescription"
              value={newTemplate.templateDescription}
              onChange={handleInputChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Template Contents"
              name="templateContents"
              value={newTemplate.templateContents}
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
export default Templates;
