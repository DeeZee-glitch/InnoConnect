import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import Icon from "@mui/material/Icon";
import TopBar from "./utils/TopBar";
import MDButton from "components/MDButton";
import { exportToCSV } from "./utils/exportToCSV";
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
import AddMonitorCondition from "./AddMonitorCondition";

function MonitorCondition() {
  const { feedId, auditId } = useParams(); // Use useParams to get feedId and auditId from URL params

  const [dataTableData, setDataTableData] = useState({
    columns: [
      { Header: "Serial Number", accessor: "serialNumber" },
      { Header: "Feed Path Name", accessor: "feedPathName" },
      { Header: "Condition Operator", accessor: "conditionOperator" },
      { Header: "Comparator", accessor: "comparator" },
      { Header: "Group Operator", accessor: "groupOperator" },
      { Header: "Action", accessor: "action" },
    ],
    rows: [],
  });

  const basicAuth = "Basic " + btoa("Administrator:manageaudit");

  const [filteredData, setFilteredData] = useState([]);
  const [originalData, setOriginalData] = useState([]);

  // Fetch data
  const fetchData = async () => {
    const apiUrl = `${process.env.REACT_APP_API_URL}http://172.20.150.134:5555/restv2/BInRestInterface.restful.provider.monitor_.resources.feed:monitorCondition/feed/monitorCondition?auditId=${auditId}&feedId=${feedId}`;

    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: basicAuth,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      const auditConditions = data.auditConditions || [];
      const rows = auditConditions.map((item) => ({
        serialNumber: item.serialNumber,
        feedPathName: item.feedPathName,
        conditionOperator: item.conditionOperator,
        comparator: item.comparator,
        groupOperator: item.groupOperator,
        action: item.deleteFlag === "true" ? "Delete" : "Active", // Modify as needed
      }));

      setOriginalData(rows); // Set original data here
      setFilteredData(rows); // Initially set filtered data as the original data
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    fetchData(); // Fetch data when the component mounts
  }, [auditId, feedId]); // Dependency array ensures re-fetching when auditId or feedId changes

  // Handle search query
  const handleSearchChange = (query) => {
    // Ensure the query is lowercase for case-insensitive comparison
    const lowerQuery = query.toLowerCase();

    // Filter data based on the query, converting each value to a string and then to lowercase
    setFilteredData(
      originalData.filter(
        (row) =>
          Object.values(row)
            .map((value) => value && value.toString().toLowerCase()) // Convert value to string and lowercase
            .join(" ") // Join all the values of a row into a single string
            .includes(lowerQuery) // Check if the query is in the row
      )
    );
  };

  // Handle status filter
  const handleStatusChange = (selectedStatuses) => {
    if (selectedStatuses.length === 0) {
      setFilteredData(originalData); // Reset to original data if no filter applied
    } else {
      const updatedFilteredData = originalData.filter((row) => {
        const isActiveValue = row.action === "ACTIVE" ? "ACTIVE" : "INACTIVE";
        return selectedStatuses.includes(isActiveValue);
      });
      setFilteredData(updatedFilteredData);
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
            <MDButton
              variant="contained"
              color="info"
              onClick={() => exportToCSV(filteredData, dataTableData.columns)}
            >
              <Icon>description</Icon>
              &nbsp;Export
            </MDButton>
          </MDBox>
        </MDBox>
        <Card>
          <MDBox p={3} display="flex" justifyContent="space-between" alignItems="center">
            <MDTypography variant="h2" fontWeight="medium">
              Monitor Condition
            </MDTypography>
            <AddMonitorCondition feedId={feedId} auditId={auditId} />
          </MDBox>
          <DataTable table={{ columns: dataTableData.columns, rows: filteredData }} canSearch />
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default MonitorCondition;
