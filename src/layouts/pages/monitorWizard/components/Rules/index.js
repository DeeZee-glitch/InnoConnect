/* eslint-disable react/prop-types */
import MDBox from "components/MDBox";
import { React, useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import MDButton from "components/MDButton";
import { Typography } from "@mui/material";

export default function Rules({ allFormData, setAllFormData }) {
  // State to store calendar data
  const [calendars, setCalendars] = useState([]);
  const [evaluators, setEvaluators] = useState([]);
  //const [evaluatorName, setEvaluatorName] = useState("");
  const [executors, setExecutors] = useState([]); // Store executors for dropdown
  const [emailGroupsOptions, setEmailGroupsOptions] = useState([]);
  const [emailTemplateOptions, setEmailTemplateOptions] = useState([]); // State to store email templates
  const [smsGroupsOptions, setSmsGroupsOptions] = useState([]);
  const [smsTemplateOptions, setSmsTemplateOptions] = useState([]);

  // Fetch calendar data from the API
  useEffect(() => {
    const fetchCalendars = async () => {
      const basicAuth = "Basic " + btoa("Administrator:manageaudit");

      try {
        const response = await fetch("http://172.20.150.134:5555/rules/rule/calendar", {
          headers: {
            Authorization: basicAuth,
            "Content-Type": "application/json",
          },
        });

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

    if (allFormData.rule.useCalandar === "TRUE") {
      fetchCalendars(); // Fetch only if Use Calendar is TRUE
    }
  }, [allFormData.rule.useCalandar]);

  // Fetch all evaluators
  useEffect(() => {
    const fetchEvaluators = async () => {
      const basicAuth = "Basic " + btoa("Administrator:manageaudit");

      try {
        const response = await fetch("http://172.20.150.134:5555/rules/rule/evaluator", {
          headers: {
            Authorization: basicAuth,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setEvaluators(data.auditEvaluators || []);
        } else {
          console.error("Failed to fetch calendars.");
        }
      } catch (error) {
        console.error("Error fetching calendars:", error);
      }
    };

    fetchEvaluators();
  }, []);

  // Fetch executors from the API
  useEffect(() => {
    const fetchExecutors = async () => {
      const basicAuth = "Basic " + btoa("Administrator:manageaudit");
      try {
        const response = await fetch("http://172.20.150.134:5555/rules/rule/executor", {
          method: "GET",
          headers: {
            Authorization: basicAuth,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setExecutors(data.executors || []); // Save executors to state
      } catch (error) {
        console.error("Error fetching executors:", error);
      }
    };
    fetchExecutors();
  }, []);

  //Fetch Email and SMS Groups
  const fetchEmailGroups = async () => {
    const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    try {
      const response = await fetch("http://172.20.150.134:5555/configuration/groupConfig", {
        method: "GET",
        headers: {
          Authorization: basicAuth,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const emailGroups = data.groupConfigs
          .filter((group) => group.groupType === "Email") // Filter for email groups
          .map((group) => group.groupName); // Extract groupName
        setEmailGroupsOptions(emailGroups); // Set the state

        const smsGroups = data.groupConfigs
          .filter((group) => group.groupType === "SMS")
          .map((group) => group.groupName);
        setSmsGroupsOptions(smsGroups);
      } else {
        console.error("Failed to fetch group configurations.");
      }
    } catch (error) {
      console.error("Error fetching group configurations:", error);
    }
  };

  // Fetch Email and SMS Template
  const fetchEmailTemplates = async () => {
    const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    try {
      const response = await fetch("http://172.20.150.134:5555/configuration/template", {
        method: "GET",
        headers: {
          Authorization: basicAuth,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const templates = data.templates
          .filter((template) => template.templateType === "EMAIL") // Ensure only EMAIL templates
          .map((template) => ({
            id: template.templateId,
            name: template.templateName,
          })); // Extract required fields
        setEmailTemplateOptions(templates); // Set state with templates

        const smsTemplates = data.templates
          .filter((template) => template.templateType === "SMS")
          .map((template) => ({
            id: template.templateId,
            name: template.templateName,
          }));
        setSmsTemplateOptions(smsTemplates);
      } else {
        console.error("Failed to fetch email templates.");
      }
    } catch (error) {
      console.error("Error fetching email templates:", error);
    }
  };

  useEffect(() => {
    fetchEmailGroups();
    fetchEmailTemplates();
  }, []);

  //If user initially selects useQuery false and selects evaluator name
  //evaluatorId is assigned but if user again set useQuery TRUE then manually set evaluatorId empty string
  useEffect(() => {
    if (allFormData.ruleDefinition.useQuery === "TRUE") {
      setAllFormData((prevData) => ({
        ...prevData,
        ruleDefinition: {
          ...prevData.ruleDefinition,
          evaluatorId: "",
        },
      }));
    }
  }, [allFormData.ruleDefinition.useQuery]);

  useEffect(() => {
    console.log("data: ", allFormData);
    console.log("calendars: ", calendars);
    console.log("monitor name: ", allFormData.monitor.auditSystemName);
    console.log("evaluator: ", evaluators);
    console.log("sms groups: ", smsGroupsOptions);
  }, [allFormData]);

  const handleRuleChange = (event) => {
    const { name, value } = event.target;
    setAllFormData((prevData) => ({
      ...prevData,
      rule: {
        ...prevData.rule,
        [name]: value,
      },
    }));
  };

  const handleRuleDefChange = (event) => {
    const { name, value } = event.target;
    setAllFormData((prevData) => ({
      ...prevData,
      ruleDefinition: {
        ...prevData.ruleDefinition,
        [name]: value,
      },
    }));
  };

  const handleRuleActionChange = (event) => {
    const { name, value } = event.target;
    setAllFormData((prevData) => ({
      ...prevData,
      ruleAction: {
        ...prevData.ruleAction,
        [name]: value,
      },
    }));
  };

  const handleRuleEscalationChange = (event) => {
    const { name, value } = event.target;
    setAllFormData((prevData) => ({
      ...prevData,
      ruleEscalation: {
        ...prevData.ruleEscalation,
        [name]: value,
      },
    }));
  };

  return (
    <>
      <MDBox>
        {" "}
        {/* <Typography variant="h4">
          Step 2: Create Rules to track any violations of Monitors
        </Typography> */}
        <Typography sx={{ mt: 2 }} variant="subtitle1" align="left">
          Rule
        </Typography>
        <TextField
          label="Rule Name"
          name="ruleName"
          value={allFormData.rule?.ruleName || ""}
          onChange={handleRuleChange}
          fullWidth
          margin="dense"
          required // Indicates this field is mandatory
          error={!allFormData.rule?.ruleName} // Shows an error state if the field is empty
          helperText={!allFormData.rule?.ruleName ? "Rule Name is required" : ""} // Helper text for validation feedback
        />
        <TextField
          label="Monitor Feed"
          name="monitoredAuditsId"
          value={allFormData.rule?.monitoredAuditsId}
          placeholder={allFormData.monitor?.auditSystemName || ""}
          fullWidth
          margin="dense"
          InputProps={{
            readOnly: true, // Make the field read-only
          }}
        />
        <TextField
          label="Execute On"
          name="executeOn"
          value={allFormData.rule?.executeOn}
          onChange={handleRuleChange}
          select
          fullWidth
          margin="dense"
          InputProps={{
            style: { padding: "12px 10px", textAlign: "left" },
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
          value={allFormData.rule?.doRemind}
          onChange={handleRuleChange}
          select
          fullWidth
          margin="dense"
          InputProps={{
            style: { padding: "12px 10px", textAlign: "left" },
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
          value={allFormData.rule?.useCalandar}
          onChange={handleRuleChange}
          select
          fullWidth
          margin="dense"
          InputProps={{
            style: { padding: "12px 10px", textAlign: "left" },
          }}
        >
          <MenuItem value="FALSE">FALSE</MenuItem>
          <MenuItem value="TRUE">TRUE</MenuItem>
        </TextField>
        {/* Conditionally render Calendar Name dropdown */}
        {allFormData.rule?.useCalandar === "TRUE" && (
          <TextField
            label="Calendar Name"
            name="calandarName"
            value={allFormData.rule?.calandarName}
            onChange={handleRuleChange}
            select
            fullWidth
            margin="dense"
            InputProps={{
              style: { padding: "12px 10px", textAlign: "left" },
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
          value={allFormData.rule?.ruleIsActive}
          onChange={handleRuleChange}
          select
          fullWidth
          margin="dense"
          InputProps={{
            style: { padding: "12px 10px", textAlign: "left" },
          }}
        >
          <MenuItem value="FALSE" selected>
            FALSE
          </MenuItem>
          <MenuItem value="TRUE">TRUE</MenuItem>
        </TextField>
      </MDBox>

      <MDBox sx={{ marginTop: 3 }}>
        <Typography sx={{ mt: 2 }} variant="subtitle1" align="left">
          Rule Definition
        </Typography>
        <TextField
          label="Definition Name"
          fullWidth
          name="definitionLabel"
          value={allFormData.ruleDefinition?.definitionLabel || ""}
          onChange={handleRuleDefChange}
          margin="dense"
          variant="outlined"
          InputProps={{
            style: { padding: "12px 10px", height: "48px", textAlign: "left" },
          }}
          required // Indicates this field is mandatory
          error={!allFormData.ruleDefinition?.definitionLabel} // Shows an error state if the field is empty
          helperText={
            !allFormData.ruleDefinition?.definitionLabel ? "Definition Name is required" : ""
          } // Helper text for validation feedback
        />
        <TextField
          label="Use Query"
          variant="outlined"
          fullWidth
          margin="dense"
          select
          name="useQuery"
          value={allFormData.ruleDefinition?.useQuery || ""}
          onChange={handleRuleDefChange}
          InputProps={{
            style: { padding: "12px 10px", textAlign: "left" },
          }}
        >
          <MenuItem value="TRUE">TRUE</MenuItem>
          <MenuItem value="FALSE">FALSE</MenuItem>
        </TextField>

        {allFormData.ruleDefinition.useQuery === "TRUE" && (
          <TextField
            label="Evaluation Query"
            fullWidth
            name="evaluationQuery"
            value={allFormData.ruleDefinition?.evaluationQuery}
            onChange={handleRuleDefChange}
            margin="dense"
            variant="outlined"
            InputProps={{
              style: { padding: "12px 10px", height: "48px", textAlign: "left" },
            }}
          />
        )}
        {allFormData.ruleDefinition.useQuery === "TRUE" && (
          <TextField
            label="Evaluation Operator"
            name="evaluationOperator"
            variant="outlined"
            fullWidth
            value={allFormData.ruleDefinition?.evaluationOperator}
            onChange={handleRuleDefChange}
            margin="dense"
            select
            InputProps={{
              style: { padding: "12px 10px", height: "48px", textAlign: "left" },
            }}
          >
            <MenuItem value="=">=</MenuItem>
            <MenuItem value=">">{">"}</MenuItem>
            <MenuItem value="<">{"<"}</MenuItem>
            <MenuItem value=">=">{">="}</MenuItem>
            <MenuItem value="<=">{"<="}</MenuItem>
            <MenuItem value="!=">{"!="}</MenuItem>
            <MenuItem value="IN">IN</MenuItem>
          </TextField>
        )}
        {allFormData.ruleDefinition.useQuery !== "TRUE" && (
          <TextField
            label="Evaluator Name"
            select
            fullWidth
            name="evaluatorId"
            value={allFormData.ruleDefinition?.evaluatorId || ""}
            onChange={handleRuleDefChange}
            margin="dense"
            InputProps={{
              style: { padding: "12px 10px", textAlign: "left" },
            }}
          >
            {evaluators.map((evaluator) => (
              <MenuItem key={evaluator.evaluatorId} value={evaluator.evaluatorId}>
                {evaluator.evaluatorName}
              </MenuItem>
            ))}
          </TextField>
        )}

        <TextField
          label="Evaluation Measure"
          fullWidth
          name="evaluatedMeasure"
          value={allFormData.ruleDefinition?.evaluatedMeasure}
          onChange={handleRuleDefChange}
          margin="dense"
          InputProps={{
            style: { padding: "12px 10px", height: "48px", textAlign: "left" },
          }}
        />
        <TextField
          label="Definition Operator"
          name="definitionOperator"
          variant="outlined"
          fullWidth
          value={allFormData.ruleDefinition?.definitionOperator}
          onChange={handleRuleDefChange}
          margin="dense"
          select
          InputProps={{
            style: { padding: "12px 10px", height: "48px", textAlign: "left" },
          }}
        >
          <MenuItem value="AND">AND</MenuItem>
          <MenuItem value="OR">OR</MenuItem>
          <MenuItem value="NOT">NOT</MenuItem>
        </TextField>
      </MDBox>

      <MDBox sx={{ marginTop: 3 }}>
        <Typography sx={{ mt: 2 }} variant="subtitle1" align="left">
          Rule Action
        </Typography>
        <TextField
          select
          name="executorId"
          label="Executor Name"
          value={allFormData.ruleAction?.executorId || ""}
          onChange={handleRuleActionChange}
          fullWidth
          margin="dense"
          InputProps={{
            style: { padding: "12px 10px", textAlign: "left" },
          }}
          required // Indicates this field is mandatory
          error={!allFormData.ruleAction?.executorId} // Shows an error state if the field is empty
          helperText={!allFormData.ruleAction?.executorId ? "Executor Name is required" : ""} // Helper text for validation feedback
        >
          {executors.map((executor) => (
            <MenuItem key={executor.executorId} value={executor.executorId}>
              {executor.executorName}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          name="isActive"
          label="Status"
          value={allFormData.ruleAction?.isActive}
          onChange={handleRuleActionChange}
          fullWidth
          margin="dense"
          InputProps={{
            style: { padding: "12px 10px", textAlign: "left" },
          }}
        >
          <MenuItem value="TRUE">Active</MenuItem>
          <MenuItem value="FALSE">Inactive</MenuItem>
        </TextField>
      </MDBox>

      <MDBox sx={{ marginTop: 3 }}>
        <Typography sx={{ mt: 2 }} variant="subtitle1" align="left">
          Rule Escalation
        </Typography>
        <TextField
          label="Send SMS"
          select
          name="sendSMS"
          value={allFormData.ruleEscalation?.sendSMS}
          onChange={handleRuleEscalationChange}
          fullWidth // Ensures the field spans the available space
          margin="dense" // Adjust spacing to make the layout more compact
          InputProps={{
            style: { padding: "12px 10px", textAlign: "left" },
          }}
        >
          <MenuItem value="TRUE">TRUE</MenuItem>
          <MenuItem value="FALSE">FALSE</MenuItem>
        </TextField>

        <TextField
          label="SMS Groups"
          fullWidth
          select
          margin="dense"
          name="smsGroups"
          value={allFormData.ruleEscalation?.smsGroups}
          onChange={handleRuleEscalationChange}
          InputProps={{
            style: { padding: "12px 10px", textAlign: "left" },
          }}
          disabled={allFormData.ruleEscalation.sendSMS === "FALSE"} // Disable if Send Email is FALSE
        >
          {smsGroupsOptions.map((groupName) => (
            <MenuItem key={groupName} value={groupName}>
              {groupName}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="SMS Template"
          select
          fullWidth
          margin="dense"
          name="smsTemplateId"
          value={allFormData.ruleEscalation?.smsTemplateId}
          onChange={handleRuleEscalationChange}
          InputProps={{
            style: { padding: "12px 10px", textAlign: "left" },
          }}
          disabled={allFormData.ruleEscalation.sendSMS === "FALSE"} // Disable if Send Email is FALSE
        >
          {smsTemplateOptions.map((groupName) => (
            <MenuItem key={groupName.id} value={groupName.name}>
              {groupName.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Send Email"
          select
          margin="dense"
          fullWidth
          name="sendEmail"
          value={allFormData.ruleEscalation?.sendEmail}
          onChange={handleRuleEscalationChange}
          InputProps={{
            style: { padding: "12px 10px", textAlign: "left" },
          }}
        >
          <MenuItem value="TRUE">TRUE</MenuItem>
          <MenuItem value="FALSE">FALSE</MenuItem>
        </TextField>

        <TextField
          label="Email Groups"
          select
          margin="dense"
          fullWidth
          name="emailGroups"
          value={allFormData.ruleEscalation?.emailGroups}
          onChange={handleRuleEscalationChange}
          InputProps={{
            style: { padding: "12px 10px", textAlign: "left" },
          }}
          disabled={allFormData.ruleEscalation.sendEmail === "FALSE"} // Disable if Send Email is FALSE
        >
          {emailGroupsOptions.map((groupName) => (
            <MenuItem key={groupName} value={groupName}>
              {groupName}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Email Template"
          select
          margin="dense"
          fullWidth
          name="emailTemplateId"
          value={allFormData.ruleEscalation?.emailTemplateId}
          onChange={handleRuleEscalationChange}
          InputProps={{
            style: { padding: "12px 10px", textAlign: "left" },
          }}
          disabled={allFormData.ruleEscalation.sendEmail === "FALSE"} // Disable if Send Email is FALSE
        >
          {emailTemplateOptions.map((template) => (
            <MenuItem key={template.id} value={template.name}>
              {template.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Escalation in Minutes"
          fullWidth
          margin="dense"
          name="escalationInMins"
          value={allFormData.ruleEscalation?.escalationInMins}
          onChange={handleRuleEscalationChange}
          type="number"
        />
      </MDBox>
    </>
  );
}
