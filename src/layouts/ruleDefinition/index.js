import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import MDButton from "components/MDButton";
import { useParams } from "react-router-dom";
import TopBar from "./utils/TopBar";

function RulDefDataTables() {
  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const authHeader = `Basic ${btoa(
    `${process.env.REACT_APP_AUTH_USER}:${process.env.REACT_APP_AUTH_PASS}`
  )}`;

  const [dataTableData, setDataTableData] = useState({
    columns: [
      { Header: "Serial Number", accessor: "serialNumber" },
      { Header: "Definition Name", accessor: "definitionLabel" },
      { Header: "Evaluation Query", accessor: "evaluationQuery", width: "20%" },
      { Header: "Evaluation Operator", accessor: "evaluationOperator" },
      { Header: "Evaluation Measure", accessor: "evaluatedMeasure" },
      { Header: "Definition Operator", accessor: "definitionOperator" },
      { Header: "Actions", accessor: "actions" },
    ],
    rows: [],
  });

  const [openModal, setOpenModal] = useState(false);
  const [definitionName, setDefinitionName] = useState("");
  const [useQuery, setUseQuery] = useState("FALSE");
  const [evaluationQuery, setEvaluationQuery] = useState(
    "SELECT SUM(cummulative_measure) AS measure FROM monitored_facts WHERE START_TIME > NOW() - INTERVAL '10 minute' AND MONITOR_ID =" // Hardcoded query
  );
  const [evaluationOperator, setEvaluationOperator] = useState("");
  const [evaluationMeasure, setEvaluationMeasure] = useState("");
  const [definitionOperator, setDefinitionOperator] = useState("");

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [latestDefinition, setLatestDefinition] = useState(null);
  const { ruleId, auditType } = useParams();

  const fetchData = async () => {
    //const basicAuth = "Basic " + btoa("Administrator:manageaudit");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider.rules_.resources.rule:definition/rule/definition?ruleId=${ruleId}&auditType=${auditType}`,
        {
          method: "GET",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      const rows = data.ruleDefinitions.map((ruleDef, index) => ({
        serialNumber: index + 1,
        definitionLabel: ruleDef.definitionLabel,
        evaluatorName: ruleDef.evaluatorName,
        evaluationQuery: ruleDef.evaluationQuery,
        evaluationOperator: ruleDef.evaluationOperator,
        evaluatedMeasure: ruleDef.evaluatedMeasure,
        definitionOperator: ruleDef.definitionOperator,
        ruleId: ruleDef.ruleId,
        definitionId: ruleDef.definitionId,
        auditType: ruleDef.auditType,
        actions: null,
      }));

      const latestInsertedDefinition = rows[rows.length - 1];
      if (latestInsertedDefinition) {
        latestInsertedDefinition.actions = (
          <MDButton
            variant="contained"
            color="primary"
            onClick={() => handleDeleteClick(latestInsertedDefinition)}
          >
            Delete
          </MDButton>
        );
        setLatestDefinition(latestInsertedDefinition);
      }

      setOriginalData(rows);
      setFilteredData(rows); // Initialize filteredData with the original data

      setDataTableData((prevData) => ({
        ...prevData,
        rows: rows,
      }));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [ruleId, auditType]);

  const fetchMonitorId = async () => {
    //const basicAuth = "Basic " + btoa("Administrator:manageaudit");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider.rules_.resources.rule:monitorId/rule/monitorId?ruleId=${ruleId}`,
        {
          method: "GET",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch monitorId");
      }

      const data = await response.json();

      // Accessing monitorId using the correct path
      const monitorId = data.monitorId;

      if (monitorId) {
        // Update the evaluationQuery with the fetched monitorId
        setEvaluationQuery(
          (prevQuery) =>
            `SELECT SUM(cummulative_measure) AS measure FROM monitored_facts WHERE START_TIME > NOW() - INTERVAL '10 minute' AND MONITOR_ID = ${monitorId}`
        );
      } else {
        console.error("monitorId not found in the response");
      }
    } catch (error) {
      console.error("Error fetching monitorId:", error);
    }
  };

  const handleSearchChange = (query) => {
    setFilteredData(
      originalData.filter((row) => row.definitionLabel.toLowerCase().includes(query.toLowerCase()))
    );
  };
  const handleDeleteClick = (rowData) => {
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (latestDefinition) {
      const { ruleId, definitionId, auditType } = latestDefinition;

      const requestBody = {
        ruleId: ruleId,
        definitionId: definitionId,
        auditType: auditType,
      };

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider.rules_.resources.rule:definition/rule/definition`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: authHeader,
            },
            body: JSON.stringify(requestBody),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete the rule definition");
        }

        alert("Rule Definition deleted successfully!");
        fetchData(); // Refresh the data after delete
        setOpenDeleteDialog(false);
      } catch (error) {
        console.error("Error deleting rule:", error);
        alert("An error occurred while trying to delete the rule.");
      }
    }
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
  };

  const handleAddDefinition = () => {
    setOpenModal(true);
    fetchMonitorId(); // Call the fetchMonitorId function when modal is opened
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleSaveDefinition = async () => {
    const requestBody = {
      evaluatorId: "7001",
      evaluationQuery: evaluationQuery,
      useQuery: useQuery,
      evaluationOperator: evaluationOperator,
      evaluatedMeasure: evaluationMeasure,
      definitionOperator: definitionOperator,
      ruleId: ruleId,
      auditType: auditType,
      definitionLabel: definitionName,
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider.rules_.resources.rule:definition/rule/definition`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save the new rule definition");
      }

      alert("Rule Definition saved successfully!");
      fetchData(); // Refresh the data after adding a definition
      setOpenModal(false);
    } catch (error) {
      console.error("Error saving rule definition:", error);
      alert("An error occurred while trying to save the rule definition.");
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <MDBox flex="1">
            <TopBar onSearchChange={handleSearchChange} />
          </MDBox>
          <MDBox ml={1}>
            {/* <MDButton
                      variant="contained"
                      color="info"
                      onClick={() => exportToCSV(dataTableData.rows, dataTableData.columns)}
                    >
                      <Icon>description</Icon>
                      &nbsp;Export
                    </MDButton> */}
          </MDBox>
        </MDBox>
        <Card>
          <MDBox p={3} lineHeight={1}>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <MDTypography variant="h5" fontWeight="medium">
                Rule Definitions
              </MDTypography>
              <MDButton variant="contained" color="info" onClick={handleAddDefinition}>
                Add Definition
              </MDButton>
            </MDBox>
            {/* <DataTable
              table={{ columns: dataTableData.columns, rows: dataTableData.rows }}
              isSorted={false}
              entriesPerPage={false}
              showTotalEntries={false}
            /> */}
            <DataTable
              table={{ columns: dataTableData.columns, rows: filteredData }}
              entriesPerPage={10}
              showTotalEntries
            />
          </MDBox>
        </Card>
      </MDBox>

      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Add New Rule Definition</DialogTitle>
        <DialogContent>
          <TextField
            label="Definition Name"
            fullWidth
            value={definitionName}
            onChange={(e) => setDefinitionName(e.target.value)}
            margin="normal"
            variant="outlined"
            InputProps={{
              style: { padding: "12px 10px", height: "48px" },
            }}
          />
          <TextField
            label="Use Query"
            variant="outlined"
            fullWidth
            margin="normal"
            select
            value={useQuery}
            onChange={(e) => setUseQuery(e.target.value)}
            InputProps={{
              style: { padding: "12px 10px" },
            }}
          >
            <MenuItem value="TRUE">TRUE</MenuItem>
            <MenuItem value="FALSE">FALSE</MenuItem>
          </TextField>

          {useQuery === "TRUE" && (
            <TextField
              label="Evaluation Query"
              fullWidth
              value={evaluationQuery}
              onChange={(e) => setEvaluationQuery(e.target.value)}
              margin="normal"
              variant="outlined"
              InputProps={{
                style: { padding: "12px 10px", height: "48px" },
              }}
            />
          )}
          <TextField
            label="Evaluation Operator"
            variant="outlined"
            fullWidth
            value={evaluationOperator}
            onChange={(e) => setEvaluationOperator(e.target.value)}
            margin="normal"
            select
            InputProps={{
              style: { padding: "12px 10px", height: "48px" },
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
          <TextField
            label="Evaluated Measure"
            fullWidth
            value={evaluationMeasure}
            onChange={(e) => setEvaluationMeasure(e.target.value)}
            margin="normal"
            InputProps={{
              style: { padding: "12px 10px", height: "48px" },
            }}
          />
          <TextField
            label="Definition Operator"
            variant="outlined"
            fullWidth
            value={definitionOperator}
            onChange={(e) => setDefinitionOperator(e.target.value)}
            margin="normal"
            select
            InputProps={{
              style: { padding: "12px 10px", height: "48px" },
            }}
          >
            <MenuItem value="AND">AND</MenuItem>
            <MenuItem value="OR">OR</MenuItem>
            <MenuItem value="NOT">NOT</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <MDButton variant="outlined" onClick={handleCloseModal} color="error">
            Cancel
          </MDButton>
          <MDButton onClick={handleSaveDefinition} color="info">
            Save
          </MDButton>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <MDTypography variant="body1">
            Are you sure you want to delete this rule definition?
          </MDTypography>
        </DialogContent>
        <DialogActions>
          <MDButton variant="outlined" onClick={handleDeleteCancel} color="secondary">
            Cancel
          </MDButton>
          <MDButton onClick={handleDeleteConfirm} color="info">
            Confirm
          </MDButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default RulDefDataTables;
