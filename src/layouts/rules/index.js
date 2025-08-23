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

//React Icons
import { RxCross2 } from "react-icons/rx";
import { FaCheck } from "react-icons/fa6";
import { ImCross } from "react-icons/im";
import { IoMdSettings } from "react-icons/io";
import { FaArrowUp } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";

//Material Icons
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { ArrowUpward } from "@mui/icons-material";
import SettingsIcon from "@mui/icons-material/Settings";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import EventIcon from "@mui/icons-material/Event";

import Tooltip from "@mui/material/Tooltip";
import TopBar from "./utils/TopBar";

import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";

function DataTables() {
  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const authHeader = `Basic ${btoa(
    `${process.env.REACT_APP_AUTH_USER}:${process.env.REACT_APP_AUTH_PASS}`
  )}`;
  // State to store the data from the API
  const [dataTableData, setDataTableData] = useState({
    columns: [
      { Header: "Rule Name", accessor: "ruleName" },
      { Header: "Monitor Name", accessor: "auditSystemName" },
      { Header: "Status", accessor: "isViolated" },
      { Header: "Active", accessor: "isActive" },
      { Header: "Execute On", accessor: "executeOn" },
      { Header: "Calendar Name", accessor: "calandarName" },
      { Header: "Options", accessor: "options" },
    ],
    rows: [],
  });

  const [isEditMode, setIsEditMode] = useState(false); // To track if in edit mode
  const [currentEditRow, setCurrentEditRow] = useState(null); // To store data of the row being edited

  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    ruleName: "",
    monitoredAuditsId: "",
    executeOn: "TRANSITION",
    doRemind: "FALSE",
    useCalandar: "FALSE",
    ruleIsActive: "TRUE",
  });

  const [editData, setEditData] = useState({
    ruleName: "",
    monitoredAuditsId: "",
    executeOn: "",
    doRemind: "",
    useCalandar: "",
    calandarName: "",
    ruleIsActive: "",
    ruleId: "",
  });

  const navigate = useNavigate();

  //State to store monitors
  const [monitorFeeds, setMonitorFeeds] = useState([]);

  // State to store calendar data
  const [calendars, setCalendars] = useState([]);

  // Fetch data from the API
  const fetchData = async () => {
    //const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    //"http://172.20.150.134:5555/restv2/BInRestInterface.restful.provider.rules_.resources:rule/rule",
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/rules/rule`, {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      const rows = data.auditorRules.map((rule) => ({
        isViolated:
          rule.isViolated === "TRUE" ? (
            <span style={{ color: "#f44335" }}>VIOLATED </span>
          ) : (
            <span style={{ color: "#4CAF50" }}>OK</span>
          ),
        auditSystemName: rule.auditSystemName,
        ruleName: (
          <Link
            //to={`/ruleDefinition/data-tables`}
            to={`/rules/ruleDefinition/${rule.ruleId}/${rule.auditType}`}
            style={{ textDecoration: "none", color: "#1A73E8" }}
          >
            {rule.ruleName}
          </Link>
        ),

        isActive:
          rule.isActive === "TRUE" ? (
            <IconButton>
              <CheckIcon />
            </IconButton>
          ) : (
            <IconButton>
              <CloseIcon />
            </IconButton>
          ),
        executeOn:
          rule.executeOn === "TRANSITION" ? (
            <IconButton>
              <Tooltip title="Transition">
                <ShuffleIcon />
              </Tooltip>
            </IconButton>
          ) : (
            <IconButton>
              <Tooltip title="Event">
                <EventIcon />
              </Tooltip>
            </IconButton>
          ),
        calandarName: rule.calandarName,
        options: (
          <>
            <IconButton>
              <Tooltip title="Actions">
                <SettingsIcon
                  color="info"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSettingsClick(rule)}
                />
              </Tooltip>
            </IconButton>

            <IconButton>
              <Tooltip title="Escalations">
                <ArrowUpward
                  color="info"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleArrowClick(rule)}
                />
              </Tooltip>
            </IconButton>

            <IconButton>
              <Tooltip title="Edit">
                <EditIcon
                  color="info"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleEditClick(rule)}
                />
              </Tooltip>
            </IconButton>

            <IconButton>
              <Tooltip title="Delete">
                <DeleteIcon
                  color="secondary"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleDeleteClick(rule.ruleId)}
                />
              </Tooltip>
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
      console.log("rows for rule:" + rows);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch monitor feeds data from the API
  useEffect(() => {
    const fetchMonitorFeeds = async () => {
      const basicAuth = "Basic " + btoa("Administrator:manageaudit");

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}${process.env.REACT_APP_API_URL}/rules/rule/monitor`,
          {
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setMonitorFeeds(data.monitoredAudits || []);
        } else {
          console.error("Failed to fetch monitor feeds.");
        }
      } catch (error) {
        console.error("Error fetching monitor feeds:", error);
      }
    };

    fetchMonitorFeeds();
  }, []);

  // Fetch calendar data from the API
  useEffect(() => {
    const fetchCalendars = async () => {
      const basicAuth = "Basic " + btoa("Administrator:manageaudit");

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}${process.env.REACT_APP_API_URL}/rules/rule/calendar`,
          {
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setCalendars(data.allCalandars || []);
        } else {
          console.error("Failed to fetch calendars.");
        }
      } catch (error) {
        console.error("Error fetching calendars:", error);
      }
    };

    if (formData.useCalandar === "TRUE" || editData.useCalandar === "TRUE") {
      fetchCalendars(); // Fetch only if Use Calendar is TRUE
    }
  }, [formData.useCalandar, editData.useCalandar]);

  // const handleSearchChange = (query) => {
  //   setFilteredData(
  //     originalData.filter((row) => row.ruleName.toLowerCase().includes(query.toLowerCase()))
  //   );
  // };

  const handleSearchChange = (query) => {
    setFilteredData(
      originalData.filter((row) => {
        // Extract the text from the Link component if it exists
        const ruleName =
          typeof row.ruleName === "object" ? row.ruleName.props.children : row.ruleName;
        return ruleName.toLowerCase().includes(query.toLowerCase());
      })
    );
  };

  const handleSettingsClick = (rule) => {
    navigate(`/rules/ruleActions/${rule.ruleId}/${rule.ruleName}`);
    console.log("settings clicked: ");
  };

  const handleArrowClick = (rule) => {
    navigate(`/rules/ruleEscalations/${rule.ruleId}`);
    console.log("Escalation clicked");
  };

  // Function to handle clicking on the edit icon
  const handleEditClick = (row) => {
    setIsEditMode(true); // Set modal to edit mode
    setCurrentEditRow(row); // Store row data to prepopulate form
    console.log("row is: " + row);
    // setFormData({
    //   ruleName: row.ruleName, // Extract text from Link component
    //   monitoredAuditsId: row.auditSystemName,
    //   executeOn: row.executeOn,
    //   doRemind: row.doRemind,
    //   useCalendar: row.useCalendar,
    //   calandarName: row.calandarName || "",
    //   isActive: row.isActive,
    // });

    setEditData({
      ruleName: row.ruleName,
      monitoredAuditsId: row.auditId,
      executeOn: row.executeOn,
      doRemind: row.doRemind,
      useCalandar: row.useCalandar,
      calandarName: row.calandarName || "",
      ruleIsActive: row.isActive,
      ruleId: row.ruleId,
    });
    setOpenModal(true); // Open the modal
  };

  // Function to handle submitting edited data
  const handleUpdate = async () => {
    //const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    const payload = {
      ruleName: editData.ruleName,
      monitoredAuditsId: editData.monitoredAuditsId,
      ruleIsActive: editData.ruleIsActive,
      execution: editData.executeOn,
      doRemind: editData.doRemind,
      useCalandar: editData.useCalandar,
      calandarName: editData.calandarName || "",
      ruleId: editData.ruleId,
      //...(isEditMode && { ruleId: currentEditRow.ruleId }), // Include ruleId only in edit mode
    };
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/rules/rule`, {
        method: "PUT", // Use PUT for updates
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        //body: JSON.stringify(formData),
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        alert("Rule updated successfully!");
        handleCloseModal();
        setIsEditMode(false); // Exit edit mode
        // Optionally, refresh table data
        fetchData();
      } else {
        alert("Failed to update rule!");
      }
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  const handleDeleteClick = async (ruleId) => {
    //const basicAuth = "Basic " + btoa("Administrator:manageaudit");

    if (window.confirm("Are you sure you want to delete this rule?")) {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}${process.env.REACT_APP_API_URL}/rules/rule`,
          {
            method: "DELETE",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ruleId }), // Send ruleId in the body
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log(data.status);
          if (data.status === "ERROR") {
            alert("Child Rule Definition found. Cannot Delete Rule");
          } else {
            alert("Rule deleted successfully!");
            // Refresh the data table by refetching the data
            fetchData();
            setDataTableData((prevData) => ({
              ...prevData,
              rows: prevData.rows.filter((row) => row.ruleId !== ruleId), // Remove the deleted row
            }));
          }
        } else {
          alert("Failed to delete rule!");
        }
      } catch (error) {
        console.error("Error deleting rule:", error);
      }
    }
  };

  const handleOpenModal = () => setOpenModal(true);

  const handleCloseModal = () => {
    setOpenModal(false);
    if (isEditMode === true) {
      setIsEditMode(false);
    }
  };

  // const handleChange = (event) => {
  //   setFormData({ ...formData, [event.target.name]: event.target.value });
  // };

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (isEditMode) {
      setEditData((prevEditData) => ({
        ...prevEditData,
        [name]: value,
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    //const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/rules/rule`, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Rule added successfully!");
        handleCloseModal();
        fetchData(); //To refresh (to see new changes without refresh)
        setFormData({
          ruleName: "",
          monitoredAuditsId: "",
          executeOn: "TRANSITION",
          doRemind: "FALSE",
          useCalendar: "FALSE",
          ruleIsActive: "TRUE",
        });
      } else {
        alert("Failed to add rule!");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  const handleReset = () => {
    setFormData({
      ruleName: "",
      monitoredAuditsId: "",
      executeOn: "TRANSITION",
      doRemind: "FALSE",
      useCalendar: "FALSE",
      ruleIsActive: "TRUE",
    });
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
              Rules
            </MDTypography>
          </MDBox>
          <MDBox width="13.2rem" ml="auto">
            <MDButton
              style={{ marginLeft: 80 }}
              variant="gradient"
              color="info"
              size="medium"
              onClick={handleOpenModal}
            >
              Add Rule
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

      {/* Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth>
        <DialogTitle>{isEditMode ? "Edit Rule" : "Add New Rule"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Rule Name"
            name="ruleName"
            value={isEditMode ? editData.ruleName : formData.ruleName}
            onChange={handleChange}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Monitor Feed"
            name="monitoredAuditsId"
            value={isEditMode ? editData.monitoredAuditsId : formData.monitoredAuditsId}
            onChange={handleChange}
            select
            fullWidth
            margin="dense"
            InputProps={{
              style: { padding: "12px 10px" },
            }}
          >
            {monitorFeeds.map((feed) => (
              <MenuItem key={feed.auditId} value={feed.auditId}>
                {feed.auditSystemName}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Execute On"
            name="executeOn"
            value={isEditMode ? editData.executeOn : formData.executeOn}
            onChange={handleChange}
            select
            fullWidth
            margin="dense"
            InputProps={{
              style: { padding: "12px 10px" },
            }}
          >
            <MenuItem value="EVENT">EVENT</MenuItem>
            <MenuItem selected value="TRANSITION">
              TRANSITION
            </MenuItem>
          </TextField>
          <TextField
            label="Do Remind"
            name="doRemind"
            value={isEditMode ? editData.doRemind : formData.doRemind}
            onChange={handleChange}
            select
            fullWidth
            margin="dense"
            InputProps={{
              style: { padding: "12px 10px" },
            }}
          >
            <MenuItem selected value="FALSE">
              FALSE
            </MenuItem>
            <MenuItem value="TRUE">TRUE</MenuItem>
          </TextField>
          <TextField
            label="Use Calendar"
            name="useCalandar"
            value={isEditMode ? editData.useCalandar : formData.useCalendar}
            onChange={handleChange}
            select
            fullWidth
            margin="dense"
            InputProps={{
              style: { padding: "12px 10px" },
            }}
          >
            <MenuItem selected value="FALSE">
              FALSE
            </MenuItem>
            <MenuItem value="TRUE">TRUE</MenuItem>
          </TextField>
          {/* Conditionally render Calendar Name dropdown */}
          {/* {formData.useCalendar === "TRUE" && (
              <TextField
                label="Calendar Name"
                name="calandarName"
                value={isEditMode ? editData.calandarName : formData.calandarName}
                onChange={handleChange}
                select
                fullWidth
                margin="dense"
                InputProps={{
                  style: { padding: "12px 10px" },
                }}
              >
                {calendars.map((calendar) => (
                  <MenuItem key={calendar.calendarId} value={calendar.calandarName}>
                    {calendar.calandarName}
                  </MenuItem>
                ))}
              </TextField>
            )} */}

          {/* Conditionally render Calendar Name dropdown */}
          {(isEditMode ? editData.useCalandar === "TRUE" : formData.useCalandar === "TRUE") && (
            <TextField
              label="Calendar Name"
              name="calandarName"
              value={isEditMode ? editData.calandarName : formData.calandarName}
              onChange={handleChange}
              select
              fullWidth
              margin="dense"
              InputProps={{
                style: { padding: "12px 10px" },
              }}
            >
              {calendars.map((calendar) => (
                <MenuItem key={calendar.calendarId} value={calendar.calandarName}>
                  {calendar.calandarName}
                </MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            label="Active"
            name="ruleIsActive"
            value={isEditMode ? editData.ruleIsActive : formData.ruleIsActive}
            onChange={handleChange}
            select
            fullWidth
            margin="dense"
            InputProps={{
              style: { padding: "12px 10px" },
            }}
          >
            <MenuItem value="FALSE" selected>
              FALSE
            </MenuItem>
            <MenuItem value="TRUE">TRUE</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <MDButton
            variant="gradient"
            color="info"
            onClick={isEditMode ? handleUpdate : handleSubmit}
          >
            {isEditMode ? "Update" : "Save"}
          </MDButton>
          {!isEditMode && (
            <MDButton variant="outlined" color="secondary" onClick={handleReset}>
              Reset
            </MDButton>
          )}

          <MDButton variant="outlined" color="error" onClick={handleCloseModal}>
            Cancel
          </MDButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default DataTables;
