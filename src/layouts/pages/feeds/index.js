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
import { exportToCSV } from "./utils/exportToCSV";
import AddFeedPopup from "./AddFeedPopup";
import EditFeed from "./utils/EditFeed";
import DeleteFeed from "./utils/DeleteFeed";
import TopBar from "./utils/TopBar";

function Feeds() {
  const [searchQuery, setSearchQuery] = useState("");

  // Access environment variables
  const apiUrl = process.env.REACT_APP_API_URL;
  const authUser = process.env.REACT_APP_AUTH_USER;
  const authPass = process.env.REACT_APP_AUTH_PASS;

  console.log("API URL:", apiUrl);
  console.log("Auth User:", authUser);
  console.log("Auth Pass:", authPass);

  const authHeader = `Basic ${window.btoa(
    `${process.env.REACT_APP_AUTH_USER}:${process.env.REACT_APP_AUTH_PASS}`
  )}`;

  const [dataTableData, setDataTableData] = useState({
    columns: [
      { Header: "Feed Name", accessor: "feedName" },
      { Header: "Is Active", accessor: "isActive" },
      { Header: "Actions", accessor: "actions" },
    ],
    rows: [],
  });
  const [filteredData, setFilteredData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);

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
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/feed/feed`, {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      const rows = data.registeredFeeds?.map((feed) => ({
        feedName: (
          <Link
            to={`/monitors/${feed.regiseterFeedId}`}
            style={{ textDecoration: "none", color: "#1A73E8", cursor: "pointer" }}
          >
            {feed.feedName}
          </Link>
        ),
        isActive:
          feed.isActive === "TRUE" || feed.isActive === true ? (
            <Tooltip title="Active">
              <IconButton color="success">
                <CheckIcon style={{ color: "green", fontSize: "30px" }} />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Inactive">
              <IconButton>
                <CloseIcon style={{ color: "red", fontSize: "30px" }} />
              </IconButton>
            </Tooltip>
          ),
        actions: (
          <>
            <EditFeed
              feedId={feed.regiseterFeedId}
              feedName={feed.feedName}
              feedIsActive={feed.isActive}
              onEditSuccess={fetchData}
            />
            <DeleteFeed feedId={feed.regiseterFeedId} onDeleteSuccess={fetchData} />
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
              Feeds
            </MDTypography>
          </MDBox>
          <MDBox width="20rem" ml="auto">
            <AddFeedPopup onAddFeed={fetchData} />
          </MDBox>
          <DataTable table={{ ...dataTableData, rows: filteredData }} canSearch />
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Feeds;
