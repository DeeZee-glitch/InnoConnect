import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

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

import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import { useParams } from "react-router-dom";

import TopBar from "./utils/TopBar";

function Monitors() {
  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const authHeader = `Basic ${window.btoa(
    `${process.env.REACT_APP_AUTH_USER}:${process.env.REACT_APP_AUTH_PASS}`
  )}`;

  // State to store the data from the API
  const [dataTableData, setDataTableData] = useState({
    columns: [
      { Header: "Monitor Name", accessor: "auditSystemName" },
      { Header: "Monitor Description", accessor: "auditDescription" },
      { Header: "Measure", accessor: "measure" },
      { Header: "Edit", accessor: "edit" },
      { Header: "Delete", accessor: "delete" },
      // { Header: "View Graph", accessor: "viewGraph" },
    ],
    rows: [],
  });

  const [isEditMode, setIsEditMode] = useState(false); // To track if in edit mode
  const [currentEditRow, setCurrentEditRow] = useState(null); // To store data of the row being edited

  const { feedId } = useParams();

  const navigate = useNavigate();

  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    auditDescription: "",
    auditSystemName: "",
    auditType: "",
    chronoFieldFormat: "",
    chronoFieldPath: "",
    feedId: feedId,
    identifyFieldPath: "",
    measure: "TRANSACTION",
    measureFieldPath: "",
    measureTransaction: "",
  });

  const [editData, setEditData] = useState({
    feedId: "",
    auditId: "",
    auditTypeName: "",
    auditSystemName: "",
    auditDescription: "",
    measureFieldPath: "",
    measureTransaction: "",
    IdentityFieldPath: "",
    chronoFieldPath: "",
    chronoFieldFormat: "",
    measure: "",
  });

  //State to store monitors
  const [monitorFeeds, setMonitorFeeds] = useState([]);

  // State to store calendar data
  const [calendars, setCalendars] = useState([]);

  // Fetch data from the API
  const fetchData = async () => {
    // const authHeader = "Basic " + btoa("Administrator:manageaudit");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/monitor/feed/monitor?feedId=${feedId}`,
        {
          method: "GET",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      const rows = data.monitoredAudits.map((monitor) => ({
        auditSystemName: (
          <Link
            to={`/monitorCondition/${monitor.auditFeedId}/${monitor.auditId}/${monitor.auditType.auditTypeName}`}
            style={{ textDecoration: "none", color: "#1A73E8" }}
          >
            {" "}
            {monitor.auditSystemName}{" "}
          </Link>
        ),
        auditDescription: monitor.auditDescription,
        measure: monitor.measure,

        edit: (
          <IconButton>
            <EditIcon
              color="info"
              style={{ cursor: "pointer" }}
              onClick={() => handleEditClick(monitor)}
            />
          </IconButton>
        ),
        delete: (
          <IconButton>
            <DeleteIcon
              color="secondary"
              style={{ cursor: "pointer" }}
              onClick={() => handleDeleteClick(monitor)}
            />
          </IconButton>
        ),
        // viewGraph: (
        //   <IconButton color="secondary">
        //     <SignalCellularAltIcon />
        //   </IconButton>
        // ),
      }));

      setOriginalData(rows);
      setFilteredData(rows); // Initialize filteredData with the original data

      setDataTableData((prevData) => ({
        ...prevData,
        rows: rows,
      }));
      console.log("rows for monitor:", rows);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // const handleSearchChange = (query) => {
  //   setFilteredData(
  //     originalData.filter((row) => row.auditSystemName.toLowerCase().includes(query.toLowerCase()))
  //   );
  // };

  const handleSearchChange = (query) => {
    setFilteredData(
      originalData.filter((row) => {
        // Extract the text from the Link component if it exists
        const ruleName =
          typeof row.auditSystemName === "object" && row.auditSystemName.props.children
            ? row.auditSystemName.props.children.toString()
            : row.auditSystemName;

        return ruleName.toLowerCase().includes(query.toLowerCase());
      })
    );
  };

  // Function to handle clicking on the edit icon
  const handleEditClick = (row) => {
    setIsEditMode(true); // Set modal to edit mode
    setCurrentEditRow(row); // Store row data to prepopulate form
    console.log("row is: ", row);

    setEditData({
      feedId: row.feedId,
      auditId: row.auditId,
      auditTypeName: row.auditTypeName,
      auditSystemName: row.auditSystemName,
      auditDescription: row.auditDescription,
      measureFieldPath: row.measureFieldPath,
      measureTransaction: row.measureTransaction,
      IdentityFieldPath: row.IdentityFieldPath,
      chronoFieldPath: row.chronoFieldPath,
      chronoFieldFormat: row.chronoFieldFormat,
      measure: row.measure,
    });
    setOpenModal(true); // Open the modal
  };

  // Function to handle submitting edited data
  const handleUpdate = async () => {
    //const authHeader = "Basic " + btoa("Administrator:manageaudit");
    const payload = {
      feedId: editData.feedId,
      auditId: editData.auditId,
      auditTypeName: editData.auditTypeName,
      auditSystemName: editData.auditSystemName,
      auditDescription: editData.auditDescription,
      measureFieldPath: editData.measureFieldPath,
      measureTransaction: editData.measureTransaction,
      IdentityFieldPath: editData.IdentityFieldPath,
      chronoFieldPath: editData.chronoFieldPath,
      chronoFieldFormat: editData.chronoFieldFormat,
      measure: editData.measure,
    };
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/monitor/feed/monitor`, {
        method: "PUT", // Use PUT for updates
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        //body: JSON.stringify(formData),
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        alert("Monitor updated successfully!");
        handleCloseModal();
        setIsEditMode(false); // Exit edit mode
        // Optionally, refresh table data
        fetchData();
      } else {
        alert("Failed to update Monitor!");
      }
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  const handleDeleteClick = async (monitor) => {
    //const authHeader = "Basic " + btoa("Administrator:manageaudit");
    const payload = {
      auditId: monitor.auditId,
      feedId: monitor.feedId,
    };

    if (window.confirm("Are you sure you want to delete this Monitor?")) {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}${process.env.REACT_APP_API_URL}/monitor/feed/monitor`,
          {
            method: "DELETE",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload), // Send ruleId in the body
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log(data.status);
          if (data.status === "ERROR") {
            alert("Child Monitor Condition found. Cannot Delete Monitor");
          } else {
            alert("Monitor deleted successfully!");
            // Refresh the data table by refetching the data
            fetchData();
            setDataTableData((prevData) => ({
              ...prevData,
              rows: prevData.rows.filter((row) => row.auditId !== monitor.auditId), // Remove the deleted row
            }));
          }
        } else {
          alert("Failed to delete Monitor!");
        }
      } catch (error) {
        console.error("Error deleting monitor:", error);
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
    //const authHeader = "Basic " + btoa("Administrator:manageaudit");
    try {
      const response = await fetch("/monitor/feed/monitor", {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Monitor added successfully!");
        handleCloseModal();
        fetchData(); //To refresh (to see new changes without refresh)
        setFormData({
          auditDescription: "",
          auditSystemName: "",
          auditType: "",
          chronoFieldFormat: "",
          chronoFieldPath: "",
          feedId: "",
          identifyFieldPath: "",
          measure: "TRANSACTION",
          measureFieldPath: "",
          measureTransaction: "",
        });
      } else {
        alert("Failed to add Monitor!");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  const handleReset = () => {
    setFormData({
      auditDescription: "",
      auditSystemName: "",
      auditType: "",
      chronoFieldFormat: "",
      chronoFieldPath: "",
      feedId: "",
      identifyFieldPath: "",
      measure: "TRANSACTION",
      measureFieldPath: "",
      measureTransaction: "",
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
              Monitors
            </MDTypography>
          </MDBox>
          <MDBox ml="auto">
            <MDButton
              style={{ marginRight: 20 }}
              variant="gradient"
              color="info"
              onClick={handleOpenModal}
            >
              Add Monitor
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
        <DialogTitle>{isEditMode ? "Edit Monitor" : "Add New Monitor"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Monitor Name"
            name="auditSystemName"
            value={isEditMode ? editData.auditSystemName : formData.auditSystemName}
            onChange={handleChange}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Monitor Description"
            name="auditDescription"
            value={isEditMode ? editData.auditDescription : formData.auditDescription}
            onChange={handleChange}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Measure"
            name="measure"
            fullWidth
            margin="normal"
            InputProps={{
              style: { padding: "12px 10px" },
            }}
            select
            value={isEditMode ? editData.measure : formData.measure}
            onChange={handleChange}
          >
            <MenuItem value="TRANSACTION">TRANSACTION</MenuItem>
            <MenuItem value="IDENTITY">IDENTITY</MenuItem>
            <MenuItem value="VALUE">VALUE</MenuItem>
          </TextField>

          <TextField
            label="Measure Field Path"
            name="measureFieldPath"
            fullWidth
            margin="dense"
            value={isEditMode ? editData.measureFieldPath : formData.measureFieldPath}
            onChange={handleChange}
          />
          <TextField
            label="Identity Field Path"
            name="identifyFieldPath"
            fullWidth
            margin="dense"
            value={isEditMode ? editData.IdentityFieldPath : formData.identifyFieldPath}
            onChange={handleChange}
          />

          <TextField
            label="Chrono Field Path"
            name="chronoFieldPath"
            fullWidth
            margin="dense"
            value={isEditMode ? editData.chronoFieldPath : formData.chronoFieldPath}
            onChange={handleChange}
          />

          <TextField
            label="Chrono Field Format"
            name="chronoFieldFormat"
            fullWidth
            margin="dense"
            value={isEditMode ? editData.chronoFieldFormat : formData.chronoFieldFormat}
            onChange={handleChange}
          />
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

export default Monitors;
