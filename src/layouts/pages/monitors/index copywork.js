import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import { useParams, useNavigate } from "react-router-dom";
import AddMonitorPage from "./AddMonitorPage"; // Import AddMonitorPage
import { exportToCSV } from "./utils/exportToCSV";
import DeleteMonitor from "./utils/DeleteMonitor"; // Import DeleteMonitor component

//filter
import Icon from "@mui/material/Icon";
import MDButton from "components/MDButton";
import TopBar from "./utils/TopBar";

function Monitors() {
  const [dataTableData, setDataTableData] = useState({
    columns: [
      { Header: "Monitor Name", accessor: "auditSystemName" },
      { Header: "Monitor Description", accessor: "auditDescription" },
      { Header: "Measure", accessor: "measureTransaction" },
      { Header: "Edit", accessor: "edit" },
      { Header: "Delete", accessor: "delete" },
      { Header: "View Graph", accessor: "viewGraph" },
    ],
    rows: [],
  });

  const [filteredData, setFilteredData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const navigate = useNavigate();
  const { feedId } = useParams(); // Get the feedId from the URL

  // Define the handleAddMonitor function to be passed as a prop
  const handleAddMonitor = (monitorData) => {
    // Handle monitor addition logic here, such as calling an API or updating state
    console.log("Monitor Added:", monitorData);
    // You can refresh or update the table data here
  };

  const handleSearchChange = (query) => {
    setFilteredData(
      originalData.filter((row) => row.ruleName.toLowerCase().includes(query.toLowerCase()))
    );
  };

  const handleStatusChange = (selectedStatuses) => {
    if (selectedStatuses.length === 0) {
      setFilteredData(originalData); // Reset to original data if no filter applied
    } else {
      const updatedFilteredData = originalData.filter((row) => {
        const isActiveValue =
          row.isActive === true || row.isActive === "TRUE" ? "ACTIVE" : "INACTIVE";
        return selectedStatuses.includes(isActiveValue);
      });
      setFilteredData(updatedFilteredData);
    }
  };

  // Fetch data from the API when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      const basicAuth = "Basic " + btoa("Administrator:manageaudit");

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}http://172.20.150.134:5555/rad/BInRestInterface.restful.provider:monitor/feed/monitor?feedId=${feedId}`,
          {
            method: "GET",
            headers: {
              Authorization: basicAuth,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();

        if (data.monitoredAudits) {
          const rows = data.monitoredAudits.map((monitor) => ({
            auditSystemName: (
              <MDTypography
                style={{ textDecoration: "none", color: "#1A73E8" }}
                component="a"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  const basePath = `/monitorConditions/${monitor.auditId}`;
                  navigate(basePath);
                }}
                variant="subtitle2"
                color="secondary"
                sx={{ cursor: "pointer", textDecoration: "underline" }}
              >
                {monitor.auditSystemName}
              </MDTypography>
            ),
            auditDescription: monitor.auditDescription,
            measureTransaction: monitor.measureTransaction === "TRUE" ? "Transaction" : "Identity",
            edit: (
              <MDBox display="flex" justifyContent="space-evenly">
                <IconButton color="info" onClick={() => handleEdit(monitor.auditId)}>
                  <EditIcon />
                </IconButton>
              </MDBox>
            ),
            delete: (
              <DeleteMonitor
                feedId={feedId} // Pass feedId to DeleteMonitor component
                auditId={monitor.auditId} // Pass auditId for the monitor
                onDeleteSuccess={handleDeleteSuccess} // Callback for when deletion is successful
              />
            ),
            viewGraph: (
              <IconButton color="secondary" onClick={() => handleViewGraph(monitor.auditId)}>
                <SignalCellularAltIcon />
              </IconButton>
            ),
          }));

          setDataTableData((prevData) => ({
            ...prevData,
            rows: rows,
          }));
        } else {
          console.error("No monitoredAudits found in the response.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (feedId) {
      fetchData(); // Fetch data if feedId exists
    }
  }, [feedId]);

  const handleEdit = (id) => {
    console.log("Edit clicked for ID:", id);
    // Add your edit logic here
  };

  const handleViewGraph = (id) => {
    console.log("View Graph clicked for ID:", id);
    // Add your graph viewing logic here
  };

  const handleDeleteSuccess = (feedId, auditId) => {
    // You can handle post-delete actions here like re-fetching the data or updating the state
    console.log("Deleted successfully:", feedId, auditId);
    setDataTableData((prevData) => ({
      ...prevData,
      rows: prevData.rows.filter((row) => row.auditId !== auditId), // Remove the deleted monitor from the rows
    }));
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
            <MDButton
              variant="contained"
              color="info"
              onClick={() => exportToCSV(dataTableData.rows, dataTableData.columns)}
            >
              <Icon>description</Icon>
              &nbsp;Export
            </MDButton>
          </MDBox>
        </MDBox>
        <Card>
          <MDBox p={3} display="flex" justifyContent="space-between" alignItems="center">
            <MDTypography variant="h2" fontWeight="medium">
              Monitors
            </MDTypography>
            <AddMonitorPage feedId={feedId} onAddMonitor={handleAddMonitor} />
          </MDBox>
          <DataTable table={dataTableData} canSearch />
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Monitors;
