/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import axios from "axios";
import DataTable from "examples/Tables/DataTable";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  maxHeight: "80vh",
  overflowY: "auto",
};

function TeamSummary() {
  const [loginDetails, setLoginDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalData, setModalData] = useState([]);

  useEffect(() => {
    axios
      .get(
        `http://192.168.217.129:5555/restv2/CustomAdminUI.InnoConnect.MyTeam.Summary.restful:InTm_Summary/TeamSummary`
      )
      .then((response) => {
        setLoginDetails(response.data.loginDetails);
      })
      .catch((error) => console.error("Error fetching login details:", error))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !loginDetails) return <div>Loading...</div>;

  const {
    remoteClockInCount,
    rightTimeEmployees,
    lateEmployees,
    wfhEmp,
    completeClockInList,
    rightTimeArrivals,
    lateArrivals,
    wfh,
  } = loginDetails;

  const getEmployeesByCondition = (condition) => {
    switch (condition) {
      case "ontime":
        return rightTimeArrivals || [];
      case "late":
        return lateArrivals || [];
      case "wfh":
        return wfh || [];
      case "remote":
        return (completeClockInList || []).filter(
          (emp) => emp.loggedIn?.toLowerCase() === "yes"
        );
      default:
        return [];
    }
  };

  const columns = [
    { Header: "Emp ID", accessor: "empId" },
    { Header: "Employee Name", accessor: "empName" },
    { Header: "Arrival Time", accessor: "arrivalTime" },
    { Header: "Clock-In Type", accessor: (row) => row.clockInType.toUpperCase() },
    { Header: "Login Date", accessor: "loginDate" },
  ];

  const openEmployeeModal = (title, condition) => {
    setModalTitle(title);
    setModalData(getEmployeesByCondition(condition));
    setOpenModal(true);
  };

  const handleClose = () => setOpenModal(false);

  const EmployeeCard = ({ emp }) => {
    const getInitials = (name) => {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    };

    return (
      <Card sx={{ p: 2, display: "flex", flexDirection: "column", height: "100%" }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar>{getInitials(emp.empName)}</Avatar>
          <Box ml={2}>
            <MDTypography variant="h6">{emp.empName}</MDTypography>
            <MDTypography variant="caption" color="text">
              Assistant Consultant - webMethods
            </MDTypography>
          </Box>
        </Box>

        <MDTypography variant="caption" color="text">
          <strong>Location:</strong> Hyderabad
        </MDTypography>
        <MDTypography variant="caption" color="text">
          <strong>Department:</strong> Centre of Excellence
        </MDTypography>
        <MDTypography variant="caption" color="text">
          <strong>Email:</strong> {emp.empName.split(" ").join("").toLowerCase()}@innovationteam.com
        </MDTypography>

        <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
          <Chip label="IN" color="success" size="small" />
          {emp.clockInType?.toLowerCase() === "wfh" && (
            <Chip label="WFH" color="info" size="small" />
          )}
          <Chip label="REMOTE" color="warning" size="small" />
        </Box>
      </Card>
    );
  };

  EmployeeCard.propTypes = {
    emp: PropTypes.shape({
      empId: PropTypes.string,
      empName: PropTypes.string,
      arrivalTime: PropTypes.string,
      clockInType: PropTypes.string,
      loginDate: PropTypes.string,
      loggedIn: PropTypes.string,
    }).isRequired,
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2 }}>
              <MDTypography variant="h6">Remote Clock-ins today</MDTypography>
              <MDTypography variant="h3" color="info">
                {remoteClockInCount}
              </MDTypography>
              <MDTypography
                variant="body2"
                color="primary"
                sx={{ cursor: "pointer", mt: 1 }}
                onClick={() => openEmployeeModal("Remote Clock-in Employees", "remote")}
              >
                View Employees
              </MDTypography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2 }}>
              <MDTypography variant="h6">Employees On Time today</MDTypography>
              <MDTypography variant="h3" color="success">
                {rightTimeEmployees}
              </MDTypography>
              <MDTypography
                variant="body2"
                color="primary"
                sx={{ cursor: "pointer", mt: 1 }}
                onClick={() => openEmployeeModal("On-time Employees", "ontime")}
              >
                View Employees
              </MDTypography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2 }}>
              <MDTypography variant="h6">Late Arrivals today</MDTypography>
              <MDTypography variant="h3" color="error">
                {lateEmployees}
              </MDTypography>
              <MDTypography
                variant="body2"
                color="primary"
                sx={{ cursor: "pointer", mt: 1 }}
                onClick={() => openEmployeeModal("Late Employees", "late")}
              >
                View Employees
              </MDTypography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2 }}>
              <MDTypography variant="h6">Work from Home / On Duty today</MDTypography>
              <MDTypography variant="h3" color="warning">
                {wfhEmp}
              </MDTypography>
              <MDTypography
                variant="body2"
                color="primary"
                sx={{ cursor: "pointer", mt: 1 }}
                onClick={() => openEmployeeModal("WFH Employees", "wfh")}
              >
                View Employees
              </MDTypography>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <MDTypography variant="h5" mb={2}>
              Logged-in Employees
            </MDTypography>
            <Grid container spacing={2}>
              {(completeClockInList || []).map((emp) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={emp.empId}>
                  <EmployeeCard emp={emp} />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </MDBox>

      <Modal open={openModal} onClose={handleClose}>
        <Box sx={modalStyle}>
          <MDTypography variant="h5" gutterBottom>
            {modalTitle}
          </MDTypography>
          <DataTable
            table={{ columns, rows: modalData }}
            canSearch
            entriesPerPage
            showTotalEntries
          />
          <Box mt={2} textAlign="right">
            <Button
              variant="contained"
              color="primary"
              sx={{ color: "#fff" }}
              onClick={handleClose}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Modal>

      <Footer />
    </DashboardLayout>
  );
}

export default TeamSummary;