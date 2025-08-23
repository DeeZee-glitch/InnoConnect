import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import MDButton from "components/MDButton";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";

import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { FormControlLabel, Checkbox } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton, Typography } from "@mui/material";

// Wizard page components
import Feeds from "./components/Feeds";
import Rules from "./components/Rules";
import Review from "./components/Review";

function AddFeedPopup({ onAddFeed }) {
  const [open, setOpen] = useState(false);
  const [feedName, setFeedName] = useState("");
  const [feedIsActive, setFeedIsActive] = useState("TRUE");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    handleReset();
  };

  const handleReset = () => {
    setFeedName("");
    setFeedIsActive("TRUE");
  };

  const handleSave = async () => {
    if (!feedName || !feedIsActive) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    const apiUrl = "http://172.20.150.134:5555/feed/feed";

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: basicAuth,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedName,
          feedIsActive,
        }),
      });

      if (response.ok) {
        const result = await response.json();

        onAddFeed({
          feedName,
          isActive: feedIsActive === "TRUE",
          regiseterFeedId: result.regiseterFeedId || "temp-id-" + Date.now(),
        });

        alert(result.message || "Feed added successfully!");
        handleClose();
      } else {
        const error = await response.json();
        alert(error.message || "Failed to add the feed. Please try again.");
      }
    } catch (error) {
      console.error("Error saving feed:", error);
      alert("An error occurred while saving the feed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  //Wizard functionalities
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
      evaluatorId: "7001",
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

  const [executorName, setExecutorName] = useState("");

  const [evaluatorName, setEvaluatorName] = useState("");

  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);

  function getSteps() {
    return ["Feeds", "Rules", "Review"];
  }

  function getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <Feeds allFormData={allFormData} setAllFormData={setAllFormData} touched={touched} />
        );
      case 1:
        return (
          <Rules
            allFormData={allFormData}
            setAllFormData={setAllFormData}
            setExecutorName={setExecutorName}
            setEvaluatorName={setEvaluatorName}
            touched={touched}
          />
        );
      case 2:
        return (
          <Review
            allFormData={allFormData}
            executorName={executorName}
            evaluatorName={evaluatorName}
          />
        );

      default:
        return null;
    }
  }

  const [activeStep, setActiveStep] = useState(0);
  const steps = getSteps();
  const isLastStep = activeStep === steps.length - 1;

  const handleNext = () => {
    setTouched(true); // Set touched to true when the user clicks "Next"

    // Add validation before moving to the next step
    if (
      activeStep === 0 &&
      (!allFormData.feed?.feedName ||
        !allFormData.monitor?.auditSystemName ||
        !allFormData.monitor?.measureFieldPath)
    ) {
      // alert("Please fill in the required fields.");
      return;
    }
    if (
      activeStep === 1 &&
      (!allFormData.rule?.ruleName || !allFormData.ruleDefinition?.definitionLabel)
    ) {
      // alert("Please fill in the required fields.");
      return;
    }
    setTouched(false);
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
        onAddFeed();
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

  return (
    <div>
      <MDBox display="flex" gap={2}>
        <MDButton variant="contained" color="info" onClick={handleOpen}>
          Add Feed
        </MDButton>
        <MDButton variant="contained" color="info" sx={{ marginRight: 1 }} onClick={togglePopup}>
          Open Wizard
        </MDButton>
      </MDBox>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add Feed</DialogTitle>
        <DialogContent>
          <TextField
            label="Feed Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={feedName}
            onChange={(e) => setFeedName(e.target.value)}
          />
          <TextField
            label="Active"
            variant="outlined"
            fullWidth
            margin="normal"
            InputProps={{
              style: { padding: "12px 10px" },
            }}
            select
            value={feedIsActive}
            onChange={(e) => setFeedIsActive(e.target.value)}
          >
            <MenuItem value="TRUE">TRUE</MenuItem>
            <MenuItem value="FALSE">FALSE</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleSave} variant="contained" color="info" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </MDButton>
          <MDButton onClick={handleReset} variant="outlined" color="secondary">
            Reset
          </MDButton>
          <MDButton onClick={handleClose} variant="outlined" color="error">
            Cancel
          </MDButton>
        </DialogActions>
      </Dialog>
      {/* Wizard Dialog */}
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
            <Typography sx={{ marginBottom: 1.5, visibility: "hidden" }}>
              Monitored Feed Wizard
            </Typography>
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
    </div>
  );
}

AddFeedPopup.propTypes = {
  onAddFeed: PropTypes.func.isRequired,
};

export default AddFeedPopup;
