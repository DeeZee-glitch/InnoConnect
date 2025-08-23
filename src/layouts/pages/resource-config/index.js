import React, { useState, useEffect } from "react";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { IconButton, Tooltip } from "@mui/material";
import { Link } from "react-router-dom";
import MDButton from "components/MDButton";

import AddFeedPopup from "./AddFeedPopup";
import EditFeed from "./utils/EditFeed";
import DeleteFeed from "./utils/DeleteFeed";
import TopBar from "./utils/TopBar";

function ResourceSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dataTableData, setDataTableData] = useState({
    columns: [
      { Header: "Resource Name", accessor: "connectionName" },
      { Header: "Resource Type", accessor: "databaseType" },
      { Header: "Actions", accessor: "actions" },
    ],
    rows: [],
  });
  const [filteredData, setFilteredData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);

  const authHeader = `Basic ${btoa(
    `${process.env.REACT_APP_AUTH_USER}:${process.env.REACT_APP_AUTH_PASS}`
  )}`;
  const handleSearchChange = (query) => {
    setSearchQuery(query);

    const updatedFilteredData = originalData.filter((row) => {
      const feedNameMatch = row.feedName.props.children.toLowerCase().includes(query.toLowerCase());
      const isActiveMatch = row.isActive.props.title.toLowerCase().includes(query.toLowerCase());

      return feedNameMatch || isActiveMatch;
    });

    setFilteredData(updatedFilteredData);
  };

  const handleStatusChange = (selectedItems) => {
    setSelectedStatus(selectedItems);

    const statusFilter = selectedItems.length ? selectedItems[0].toLowerCase() : null;

    const updatedFilteredData = originalData.filter((row) => {
      const isActive = row.isActive.props.title.toLowerCase();
      return statusFilter ? isActive === statusFilter : true;
    });

    setFilteredData(updatedFilteredData);
  };

  const fetchData = async () => {
    // const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider:ui/resource/register`,
        {
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      console.log(data);

      const rows = data.results.map((resource) => ({
        connectionName: resource.connectionName,
        databaseType: resource.databaseType,
        actions: (
          <>
            <EditFeed
              connectionName={resource.connectionName}
              databaseType={resource.databaseType}
              onEditSuccess={fetchData}
            />
            <DeleteFeed connectionName={resource.connectionName} onDeleteSuccess={fetchData} />
          </>
        ),
      }));

      setDataTableData((prevData) => ({
        ...prevData,
        rows: rows,
      }));

      setOriginalData(rows);
      setFilteredData(rows);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
              onClick={() => exportToCSV(filteredData, dataTableData.columns)}
            >
              Export
            </MDButton> */}
          </MDBox>
        </MDBox>
        <Card>
          <MDBox p={3} lineHeight={1}>
            <MDTypography variant="h2" fontWeight="medium">
              Resources
            </MDTypography>
          </MDBox>
          <MDBox width="13.2rem" ml="auto">
            <AddFeedPopup onAddResource={fetchData} />
          </MDBox>
          <DataTable table={{ ...dataTableData, rows: filteredData }} canSearch />
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default ResourceSearch;
