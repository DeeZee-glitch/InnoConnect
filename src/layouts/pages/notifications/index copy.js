import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import { useParams, useNavigate } from "react-router-dom";
import AddMonitorPage from "./AddMonitorPage";

function Monitors() {
  // State to store the data from the API
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

  const navigate = useNavigate();
  const { feedId } = useParams(); // Get the feedId from the URL

  // Fetch data from the API when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      const basicAuth = "Basic " + btoa("Administrator:manageaudit");

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}http://localhost:5555/rad/BInRestInterface.restful.provider:monitor/feed/monitor?feedId=${feedId}`,
          {
            method: "GET", // Use the required method
            headers: {
              Authorization: basicAuth,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();

        // Check if the response contains the expected data
        if (data.monitoredAudits) {
          const rows = data.monitoredAudits.map((monitor) => ({
            auditSystemName: (
              <MDTypography
                style={{ textDecoration: "none", color: "#1A73E8" }}
                component="a"
                href="#"
                onClick={(e) => {
                  e.preventDefault(); // Prevent default anchor behavior
                  const basePath = `/monitorConditions/${monitor.auditId}`; // Construct the path with auditId
                  navigate(basePath); // Navigate to the new page with the auditId
                }}
                variant="subtitle2"
                color="secondary"
                sx={{ cursor: "pointer", textDecoration: "underline" }} // Add pointer cursor and underline
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
              <IconButton color="secondary" onClick={() => handleDelete(monitor.auditId)}>
                <DeleteIcon />
              </IconButton>
            ),
            viewGraph: (
              <IconButton color="secondary" onClick={() => handleDelete(monitor.auditId)}>
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
  }, [feedId]); // Re-run the effect if feedId changes

  // Function to handle editing
  const handleEdit = (id) => {
    console.log("Edit clicked for ID:", id);
    // Add your edit logic here
  };

  // Function to handle deletion
  const handleDelete = (id) => {
    console.log("Delete clicked for ID:", id);
    // Add your delete logic here
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Card>
          <MDBox p={3} display="flex" justifyContent="space-between" alignItems="center">
            <MDTypography variant="h2" fontWeight="medium">
              Monitors
            </MDTypography>
            <AddMonitorPage />
          </MDBox>
          <DataTable table={dataTableData} canSearch />
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Monitors;
