import TextField from "@mui/material/TextField";
import MDBox from "components/MDBox";
import { Typography } from "@mui/material";

export default function Review({ allFormData, executorName, evaluatorName }) {
  const renderField = (label, value) => (
    <div style={{ display: "block", marginBottom: "8px" }}>
      <span
        style={{
          display: "inline-block",
          width: "30%",
          fontWeight: "bold",
          color: "#757575",
          textAlign: "left",
        }}
      >
        {label}:
      </span>
      <span style={{ display: "inline-block", width: "30%", textAlign: "left" }}>
        {value || "N/A"}
      </span>
    </div>
  );
  return (
    <>
      <MDBox p={1}>
        <Typography variant="h5" sx={{ textAlign: "left" }}>
          Please review the details you have filled
        </Typography>
        <Typography sx={{ marginTop: 2, textAlign: "left" }} variant="subtitle1">
          Feed
        </Typography>
        {renderField("Feed Name", allFormData.feed?.feedName)}
        {renderField("Active", allFormData.feed?.feedIsActive)}
      </MDBox>

      <MDBox p={1}>
        <Typography sx={{ textAlign: "left" }} variant="subtitle1">
          Monitor
        </Typography>
        {renderField("Monitor Name", allFormData.monitor?.auditSystemName)}
        {renderField("Monitor Description", allFormData.monitor?.auditDescription)}
        {renderField("Measure", allFormData.monitor?.measure)}
        {renderField("Measure Field Path", allFormData.monitor?.measureFieldPath)}
        {renderField("Identity Field Path", allFormData.monitor?.identifyFieldPath)}
        {renderField("Chrono Field Path", allFormData.monitor?.chronoFieldPath)}
        {renderField("Chrono Field Format", allFormData.monitor?.chronoFieldFormat)}
      </MDBox>

      <MDBox p={1}>
        <Typography sx={{ textAlign: "left" }} variant="subtitle1">
          Monitor Condition
        </Typography>
        {renderField("Feed Path Name", allFormData.monitorCondition?.feedPathName)}
        {renderField("Condition Operator", allFormData.monitorCondition?.condtionOperator)}
        {renderField("Comparator", allFormData.monitorCondition?.comparator)}
        {renderField("Group Operator", allFormData.monitorCondition?.groupOperator)}
      </MDBox>

      <MDBox p={1}>
        <Typography sx={{ textAlign: "left" }} variant="subtitle1">
          Rule
        </Typography>
        {renderField("Rule Name", allFormData.rule?.ruleName)}
        {renderField("Monitor Feed", allFormData.monitor?.auditSystemName)}
        {renderField("Execute On", allFormData.rule?.executeOn)}
        {renderField("Do Remind", allFormData.rule?.doRemind)}
        {renderField("Use Calendar", allFormData.rule?.useCalendar)}
        {allFormData.rule?.useCalendar === "TRUE" &&
          renderField("Calendar Name", allFormData.rule?.calandarName)}
        {renderField("Active", allFormData.rule?.ruleIsActive)}
      </MDBox>

      <MDBox p={1}>
        <Typography sx={{ textAlign: "left" }} variant="subtitle1">
          Rule Definition
        </Typography>
        {renderField("Definition Name", allFormData.ruleDefinition?.definitionLabel)}
        {renderField("Use Query", allFormData.ruleDefinition?.useQuery)}
        {allFormData.ruleDefinition?.useQuery === "TRUE" &&
          renderField("Evaluation Query", allFormData.ruleDefinition?.evaluationQuery)}
        {allFormData.ruleDefinition?.useQuery === "TRUE" &&
          renderField("Evaluation Operator", allFormData.ruleDefinition?.evaluationOperator)}
        {allFormData.ruleDefinition?.useQuery !== "TRUE" &&
          renderField("Evaluator Name", evaluatorName)}
        {renderField("Evaluation Measure", allFormData.ruleDefinition?.evaluatedMeasure)}
        {renderField("Definition Operator", allFormData.ruleDefinition?.definitionOperator)}
      </MDBox>

      <MDBox p={1}>
        <Typography sx={{ textAlign: "left" }} variant="subtitle1">
          Rule Action
        </Typography>
        {renderField("Executor Name", executorName)}
        {renderField("Status", allFormData.ruleAction?.isActive)}
      </MDBox>

      <MDBox p={1}>
        <Typography sx={{ textAlign: "left" }} variant="subtitle1">
          Rule Escalation
        </Typography>
        {renderField("Send SMS", allFormData.ruleEscalation?.sendSMS)}
        {renderField("SMS Groups", allFormData.ruleEscalation?.smsGroups)}
        {renderField("SMS Template", allFormData.ruleEscalation?.smsTemplateId)}
        {renderField("Send Email", allFormData.ruleEscalation?.sendEmail)}
        {renderField("Email Groups", allFormData.ruleEscalation?.emailGroups)}
        {renderField("Email Template", allFormData.ruleEscalation?.emailTemplateId)}
        {renderField("Escalation in Minutes", allFormData.ruleEscalation?.escalationInMins)}
      </MDBox>
    </>
  );
}
