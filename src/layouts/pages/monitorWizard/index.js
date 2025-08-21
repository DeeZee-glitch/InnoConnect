/* eslint-disable react/prop-types */
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

import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { FormControlLabel, Checkbox } from "@mui/material";

import Tooltip from "@mui/material/Tooltip";
import TopBar from "./utils/TopBar";
import "./utils/styles.css";
// import Register from "../register";

import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { IconButton, Typography } from "@mui/material";

// Wizard page components
import Feeds from "./components/Feeds";
import Rules from "./components/Rules";
import Review from "./components/Review";

function MonitorWizard() {
  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  //Wizard pop up
  const [showPopup, setShowPopup] = useState(false);
  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  //Wizard
  const [allFormData, setAllFormData] = useState({
    feed: {
      feedName: "",
      feedIsActive: "TRUE",
    },
    monitor: {
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
    },
    monitorCondition: {
      auditId: "",
      auditTypeName: "",
      comparator: "",
      feedId: "",
      feedPathName: "",
      groupOperator: "AND",
      condtionOperator: "=",
    },
    rule: {
      ruleName: "",
      monitoredAuditsId: "",
      executeOn: "TRANSITION",
      doRemind: "FALSE",
      reminderInterval: "",
      useCalandar: "FALSE",
      ruleIsActive: "TRUE",
      calandarName: "",
    },
    ruleDefinition: {
      evaluatorId: "",
      evaluationQuery:
        "SELECT SUM(cummulative_measure) AS measure FROM monitored_facts WHERE START_TIME > NOW() - INTERVAL '10 minute' AND MONITOR_ID =",
      useQuery: "FALSE",
      evaluationOperator: "",
      evaluatedMeasure: "",
      definitionOperator: "",
      ruleId: "",
      auditType: "",
      definitionLabel: "",
    },
    ruleAction: {
      executorId: "",
      isActive: "TRUE",
      ruleId: "",
    },
    ruleActionConfiguration: {},
    ruleEscalation: {
      sendSMS: "FALSE",
      smsTemplateId: "",
      smsGroups: "",
      sendEmail: "FALSE",
      emailGroups: "",
      emailTemplateId: "",
      escalationInMins: "",
      ruleId: "",
    },
  });
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);

  function getSteps() {
    return ["Feeds", "Rules", "Review"];
  }

  function getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return <Feeds allFormData={allFormData} setAllFormData={setAllFormData} />;
      case 1:
        return <Rules allFormData={allFormData} setAllFormData={setAllFormData} />;
      case 2:
        return <Review allFormData={allFormData} setAllFormData={setAllFormData} />;

      default:
        return null;
    }
  }

  const [activeStep, setActiveStep] = useState(0);
  const steps = getSteps();
  const isLastStep = activeStep === steps.length - 1;

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => setActiveStep(activeStep - 1);

  const handleSubmit = async () => {
    if (!allFormData.feed?.feedName) {
      alert("Please fill in the Feed Name before submitting.");
      return;
    }
    if (!allFormData.monitor?.auditSystemName) {
      alert("Please fill in the Monitor Name before submitting.");
      return;
    }
    if (!allFormData.rule?.ruleName) {
      alert("Please fill in the Rule Name before submitting.");
      return;
    }
    if (!allFormData.ruleDefinition?.definitionLabel) {
      alert("Please fill in the Rule Definition before submitting.");
      return;
    }
    const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    try {
      const response = await fetch(
        "http://172.20.150.134:5555/restv2/BInRestInterface.restful.provider:ui/register",
        {
          method: "POST",
          headers: {
            Authorization: basicAuth,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(allFormData),
        }
      );

      if (response.ok) {
        alert("Your Registration for Feeds and Rules is successful");
        togglePopup();
      } else {
        alert("Failed to Register!");
        togglePopup();
      }
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  const handleCheckboxChange = (event) => {
    setIsCheckboxChecked(event.target.checked);
  };

  // State to store the data from the API
  const [dataTableData, setDataTableData] = useState({
    columns: [
      { Header: "Monitor Name", accessor: "auditSystemName" },
      { Header: "Rule Name", accessor: "ruleName" },
      { Header: "Status", accessor: "isViolated" },
      { Header: "Active", accessor: "isActive" },
      { Header: "Execute On", accessor: "executeOn" },
      { Header: "Options", accessor: "options" },
    ],
    rows: [],
  });

  // Fetch data from the API
  const fetchData = async () => {
    const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    //"http://172.20.150.134:5555/restv2/BInRestInterface.restful.provider.rules_.resources:rule/rule",
    try {
      const response = await fetch("http://172.20.150.134:5555/rules/rule", {
        headers: {
          Authorization: basicAuth,
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
        ruleName: rule.ruleName,

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
        options: (
          <>
            {/* <IconButton>
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
            </IconButton> */}

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

  // Function to handle clicking on the edit icon
  const handleEditClick = (row) => {
    console.log("row is: " + row);

    setOpenModal(true); // Open the modal
  };

  const handleDeleteClick = async (ruleId) => {
    console.log("rule id: ", ruleId);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <MDBox flex="1">
            <TopBar onSearchChange={handleSearchChange} />
          </MDBox>
          <MDBox ml={1}></MDBox>
        </MDBox>
        <Card>
          <MDBox p={3} lineHeight={1}>
            <MDTypography variant="h5" fontWeight="medium">
              Monitored Rules
            </MDTypography>
          </MDBox>
          <MDBox width="13.2rem" ml="auto">
            <MDButton
              style={{ marginLeft: 80 }}
              variant="gradient"
              color="info"
              size="medium"
              className="create-button"
              onClick={togglePopup}
            >
              Create
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

      <Dialog
        open={showPopup}
        onClose={togglePopup}
        fullWidth={false}
        maxWidth={false} // Prevents default width constraints
        PaperProps={{
          sx: {
            width: "40vw",
            height: "90vh",
            resize: "both",
            overflow: "auto",
          },
        }}
      >
        <DialogTitle>
          <MDBox display="flex" justifyContent="space-between" alignItems="center">
            <Typography sx={{ marginBottom: 1.5 }}>Monitored Feed Wizard</Typography>
            <IconButton
              onClick={togglePopup}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                transition: "transform 0.2s, background-color 0.2s",
                "&:hover": {
                  transform: "scale(1.2)", // Slightly increase the size
                  backgroundColor: "rgba(0, 0, 0, 0.1)", // Add a subtle highlight
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </MDBox>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </DialogTitle>
        <DialogContent
          sx={{
            width: "100%", // Set the width to 100% of the dialog or any desired size
            maxWidth: "none", // Ensure no default constraints are applied
            padding: 2, // Add padding for spacing
          }}
        >
          <MDBox display="flex" flexDirection="column" alignItems="center" justifyContent="center">
            <MDBox style={{ width: "100%", textAlign: "center", marginTop: "20px" }}>
              {getStepContent(activeStep)}
            </MDBox>
          </MDBox>
          <MDBox>
            {isLastStep && (
              <FormControlLabel
                control={
                  <Checkbox
                    color="primary"
                    checked={isCheckboxChecked}
                    onChange={handleCheckboxChange}
                  />
                }
                label="I have reviewed all the information above."
                sx={{
                  alignItems: "flex-start", // Ensures checkbox aligns to the top-left
                  marginLeft: 0, // Removes any additional left margin
                }}
                componentsProps={{
                  typography: { align: "left" }, // Ensures label text aligns to the left
                }}
              />
            )}
          </MDBox>
        </DialogContent>
        <DialogActions>
          {/* <MDButton onClick={togglePopup} color="primary">
            Close
          </MDButton> */}
          <MDBox mt={3} width="100%" display="flex" justifyContent="space-between">
            {activeStep === 0 ? (
              <MDBox />
            ) : (
              <MDButton variant="outlined" color="dark" onClick={handleBack}>
                back
              </MDButton>
            )}
            <MDButton
              variant="gradient"
              color="dark"
              onClick={!isLastStep ? handleNext : handleSubmit}
              disabled={isLastStep && !isCheckboxChecked}
            >
              {isLastStep ? "submit" : "next"}
            </MDButton>
          </MDBox>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default MonitorWizard;
