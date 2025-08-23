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
import DataTable from "examples/Tables/DataTable";
import { useParams } from "react-router-dom";

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

function MonitorCondition() {
  const { feedId, auditId, auditTypeName } = useParams();

  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const authHeader = `Basic ${window.btoa(
    `${process.env.REACT_APP_AUTH_USER}:${process.env.REACT_APP_AUTH_PASS}`
  )}`;
  // State to store the data from the API
  const [dataTableData, setDataTableData] = useState({
    columns: [
      { Header: "Serial Number", accessor: "serialNumber" },
      { Header: "Feed Path Name", accessor: "feedPathName" },
      { Header: "Condition Operator", accessor: "conditionOperator" },
      { Header: "Comparator", accessor: "comparator" },
      { Header: "Group Operator", accessor: "groupOperator" },
      { Header: "Actions", accessor: "actions" },
    ],
    rows: [],
  });

  // State for adding a new template
  const [openAddModal, setOpenAddModal] = useState(false);
  const [newCondition, setnewCondition] = useState({
    auditId: auditId,
    auditTypeName: auditTypeName,
    comparator: "",
    feedId: feedId,
    feedPathName: "",
    groupOperator: "AND",
    // "persistanceType": "<string>",
    condtionOperator: "=",
  });

  //state to track the row being edited:
  const [editingRow, setEditingRow] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Fetch data from the API
  const fetchData = async () => {
    //const authHeader = "Basic " + btoa("Administrator:manageaudit");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/monitor/feed/monitorCondition?auditId=${auditId}&feedId=${feedId}`,
        {
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      const rows = data.auditConditions?.map((condition) => {
        return editingId === condition.conditionId
          ? {
              feedPathName: (
                <TextField
                  fullWidth
                  name="feedPathName"
                  //value={editingRow.feedPathName}
                  defaultValue={editingRow.feedPathName}
                  onChange={(e) =>
                    setEditingRow((prev) => ({ ...prev, feedPathName: e.target.value }))
                  }
                />
              ),
              conditionOperator: (
                <TextField
                  select
                  fullWidth
                  name="conditionOperator"
                  //value={editingRow.conditionOperator}
                  defaultValue={editingRow.conditionOperator}
                  onChange={(e) =>
                    setEditingRow((prev) => ({ ...prev, conditionOperator: e.target.value }))
                  }
                  InputProps={{
                    style: { padding: "12px 10px" },
                  }}
                >
                  <MenuItem value="="> = </MenuItem>
                  <MenuItem value="&#x3C;"> &#x3C; </MenuItem>
                  <MenuItem value="&#x3C;="> &#x3C;= </MenuItem>
                  <MenuItem value="&#x3E;="> &#x3E;=</MenuItem>
                  <MenuItem value="&#x3E;">&#x3E;</MenuItem>
                  <MenuItem value="!="> !=</MenuItem>
                  <MenuItem value="IN"> IN</MenuItem>
                </TextField>
              ),
              comparator: (
                <TextField
                  fullWidth
                  name="comparator"
                  //value={editingRow.comparator}
                  defaultValue={editingRow.comparator}
                  onChange={(e) =>
                    setEditingRow((prev) => ({ ...prev, comparator: e.target.value }))
                  }
                />
              ),
              groupOperator: (
                <TextField
                  select
                  fullWidth
                  name="groupOperator"
                  //value={editingRow.groupOperator}
                  defaultValue={editingRow.groupOperator}
                  onChange={(e) =>
                    setEditingRow((prev) => ({ ...prev, groupOperator: e.target.value }))
                  }
                  InputProps={{
                    style: { padding: "12px 10px" },
                  }}
                >
                  <MenuItem value="AND">AND</MenuItem>
                  <MenuItem value="OR">OR</MenuItem>
                  <MenuItem value="NOT">NOT</MenuItem>
                </TextField>
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
              serialNumber: condition.serialNumber,
              feedPathName: condition.feedPathName,
              conditionOperator: condition.conditionOperator,
              comparator: condition.comparator,
              groupOperator: condition.groupOperator,
              actions: (
                <>
                  <IconButton>
                    <EditIcon
                      color="info"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleEditRow(condition)}
                    />
                  </IconButton>

                  <IconButton>
                    <DeleteIcon
                      color="secondary"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleDeleteRow(condition.conditionId)}
                    />
                  </IconButton>
                </>
              ),
            };
      });

      //console.log("condition: ", data.auditConditions.conditionId);
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
    console.log("feedId: ", feedId);
    console.log("auditId: ", auditId);
    console.log("auditTypeName: ", auditTypeName);
  }, [editingId, editingRow]);

  const handleSearchChange = (query) => {
    setFilteredData(
      originalData.filter((row) => {
        // Extract the text from the Link component if it exists
        const ruleName =
          typeof row.feedPathName === "object" && row.feedPathName.props.children
            ? row.feedPathName.props.children.toString()
            : row.feedPathName;

        return ruleName.toLowerCase().includes(query.toLowerCase());
      })
    );
  };

  // Function to handle opening and closing the add modal
  //const handleOpenAddModal = () => setOpenAddModal(true);
  const handleCloseAddModal = () => setOpenAddModal(false);

  // Function to handle opening the add modal and reset newCondition state
  const handleOpenAddModal = () => {
    // setNewCalendar({
    //   calandarName: "",
    //   calandarTimeZone: "Asia/Riyadh", // Reset to default value when modal opens
    // });
    setnewCondition({
      auditId: auditId,
      auditTypeName: auditTypeName,
      comparator: "",
      feedId: feedId,
      feedPathName: "",
      groupOperator: "AND",
      // "persistanceType": "<string>",
      condtionOperator: "=",
    });
    setOpenAddModal(true);
  };

  // Function to handle input changes in the add modal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setnewCondition((prev) => ({ ...prev, [name]: value }));
  };

  // Function to reset the form
  const handleReset = () => {
    setnewCondition({
      auditId: auditId,
      auditTypeName: auditTypeName,
      comparator: "",
      feedId: feedId,
      feedPathName: "",
      groupOperator: "AND",
      // "persistanceType": "<string>",
      condtionOperator: "=",
    });
  };

  // Function to save the new Monitor Condition
  const handleSave = async () => {
    const authHeader = "Basic " + btoa("Administrator:manageaudit");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/monitor/feed/monitorCondition`,
        {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newCondition),
        }
      );

      if (response.ok) {
        alert("Monitor Condition saved successfully!");
        handleCloseAddModal();
        handleReset(); // Reset form after saving
        fetchData();
      } else {
        alert("Failed to save Monitor Condition.");
      }
    } catch (error) {
      console.error("Error saving Monitor Condition:", error);
    }
  };

  const handleEditRow = (row) => {
    setEditingRow({ ...row });
    setEditingId(row.conditionId);
    //console.log(" Edit clicked; editId: ", conditionId, " editingRow: ", editingRow);
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditingId(null);
  };

  //Function to save edited row
  const handleSaveRow = async () => {
    const authHeader = "Basic " + btoa("Administrator:manageaudit");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/monitor/feed/monitorCondition`,
        {
          method: "PUT",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            auditId: auditId,
            auditTypeName: auditTypeName,
            comparator: editingRow.comparator,
            conditionId: editingRow.conditionId,
            conditionOperator: editingRow.conditionOperator,
            deleteFlag: editingRow.deleteFlag,
            feedId: feedId,
            feedPathName: editingRow.feedPathName,
            groupOperator: editingRow.groupOperator,
          }),
        }
      );

      if (response.ok) {
        alert("Monitor Condition updated successfully!");
        setEditingRow(null);
        setEditingId(null);
        // Optionally, refetch data here to update the table.
      } else {
        alert("Failed to update Monitor Condition.");
      }
    } catch (error) {
      console.error("Error updating Monitor Condition:", error);
    }
  };

  // Function to handle the delete action
  const handleDeleteRow = async (conditionId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this Monitor Condition?");
    if (!confirmDelete) return;

    const authHeader = "Basic " + btoa("Administrator:manageaudit");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/monitor/feed/monitorCondition`,
        {
          method: "DELETE",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            auditId: auditId,
            auditTypeName: auditTypeName,
            feedId: feedId,
            condition: conditionId,
          }),
        }
      );

      if (response.ok) {
        alert("Monitor Condition deleted successfully!");
        fetchData(); // Refresh the data
      } else {
        alert("Failed to delete Monitor Condition.");
      }
    } catch (error) {
      console.error("Error deleting Monitor Condition:", error);
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
              Primary Condition
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
              Add Primary
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
        <DialogTitle>Add Monitor Condition</DialogTitle>
        <DialogContent>
          <MDBox component="form" px={3}>
            <TextField
              fullWidth
              label="Feed Path Name"
              name="feedPathName"
              value={newCondition.feedPathName}
              onChange={handleInputChange}
              margin="normal"
            />
            <TextField
              select
              label="Condition Operator"
              name="condtionOperator"
              value={newCondition.condtionOperator}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              InputProps={{
                style: { padding: "12px 10px" },
              }}
            >
              <MenuItem value="="> = </MenuItem>
              <MenuItem value="&#x3C;"> &#x3C; </MenuItem>
              <MenuItem value="&#x3C;="> &#x3C;= </MenuItem>
              <MenuItem value="&#x3E;="> &#x3E;=</MenuItem>
              <MenuItem value="&#x3E;">&#x3E;</MenuItem>
              <MenuItem value="!="> !=</MenuItem>
              <MenuItem value="IN"> IN</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Comparator"
              name="comparator"
              value={newCondition.comparator}
              //defaultValue={editingRow.comparator}
              onChange={handleInputChange}
              margin="normal"
            />
            <TextField
              select
              fullWidth
              label="Group Operator"
              name="groupOperator"
              value={newCondition.groupOperator}
              //defaultValue={editingRow.groupOperator}
              onChange={handleInputChange}
              InputProps={{
                style: { padding: "12px 10px" },
              }}
            >
              <MenuItem value="AND">AND</MenuItem>
              <MenuItem value="OR">OR</MenuItem>
              <MenuItem value="NOT">NOT</MenuItem>
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
export default MonitorCondition;
