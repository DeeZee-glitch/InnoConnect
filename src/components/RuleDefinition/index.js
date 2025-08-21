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

function RuleDefinition() {
  // State to store the data from the API
  const [dataTableData, setDataTableData] = useState({
    columns: [
      { Header: "Serial Number", accessor: "serialNumber" },
      { Header: "Definition Name", accessor: "definitionLabel" },
      { Header: "Evaluator Name", accessor: "evaluatorName", width: "20%" },
      { Header: "Evaluation Query", accessor: "evaluationQuery", width: "20%" },
      { Header: "Evaluation Operator", accessor: "evaluationOperator" },
      { Header: "Evaluation Measure", accessor: "evaluatedMeasure" },
      { Header: "Definition Operator", accessor: "definitionOperator" },
      { Header: "Actions", accessor: "actions" },
    ],
    rows: [],
  });

  // Modal state and form fields for adding a definition
  const [openModal, setOpenModal] = useState(false);
  const [definitionName, setDefinitionName] = useState("");
  const [useQuery, setUseQuery] = useState("");
  const [evaluationQuery, setEvaluationQuery] = useState("");
  const [evaluationOperator, setEvaluationOperator] = useState("");
  const [evaluationMeasure, setEvaluationMeasure] = useState("");
  const [definitionOperator, setDefinitionOperator] = useState("");

  // Delete confirmation modal states
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  // Fetch data from the API when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      const ruleId = "5033";
      const auditType = "MEASURE";
      const basicAuth = "Basic " + btoa("Administrator:manageaudit");

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/restv2/BInUI.restful.ruleDefinition:ruleDefinition/getRule`,
          {
            method: "POST",
            headers: {
              Authorization: basicAuth,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ruleId: ruleId,
              auditType: auditType,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        const rows = data.ruleDefinitions.map((ruleDef, index) => ({
          serialNumber: index + 1, // Use the index to create a sequential number (starts from 1)
          definitionLabel: ruleDef.definitionLabel,
          evaluatorName: ruleDef.evaluatorName,
          evaluationQuery: ruleDef.evaluationQuery,
          evaluationOperator: ruleDef.evaluationOperator,
          evaluatedMeasure: ruleDef.evaluatedMeasure,
          definitionOperator: ruleDef.definitionOperator,
          actions: (
            <MDButton
              variant="contained"
              color="primary"
              onClick={() => handleDeleteClick(ruleDef)}
            >
              Delete
            </MDButton>
          ),
        }));

        setDataTableData((prevData) => ({
          ...prevData,
          rows: rows,
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Function to handle delete button click
  const handleDeleteClick = (rowData) => {
    setRowToDelete(rowData); // Store the row data to be deleted
    setOpenDeleteDialog(true); // Open the delete confirmation dialog
  };

  // Function to handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (rowToDelete) {
      const ruleId = "5033"; // Static ruleId
      const definitionId = "60037"; // Static definitionId (as per your request)
      const auditType = "MEASURE"; // Static auditType

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
              Authorization: "Basic " + btoa("Administrator:manageaudit"), // Basic auth header
            },
            body: JSON.stringify(requestBody),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete the rule definition");
        }

        // Close the delete confirmation dialog
        setOpenDeleteDialog(false);
        alert("Rule Definition deleted successfully!");
      } catch (error) {
        console.error("Error deleting rule:", error);
        alert("An error occurred while trying to delete the rule.");
      }
    }
  };

  // Function to handle cancel delete
  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false); // Close the dialog without deleting
  };

  // Function to handle opening the modal for adding a definition
  const handleAddDefinition = () => {
    setOpenModal(true);
  };

  // Function to handle closing the add definition modal
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  // Function to handle saving the new definition
  const handleSaveDefinition = async () => {
    const evaluatorId = "7001"; // Static evaluatorId
    const ruleId = "5033"; // Static ruleId (as per your request)
    const auditType = "MEASURE"; // Static auditType
    const definitionLabel = definitionName; // Use the definition name as label for simplicity

    const requestBody = {
      evaluatorId: evaluatorId,
      evaluationQuery: evaluationQuery,
      useQuery: useQuery,
      evaluationOperator: evaluationOperator,
      evaluatedMeasure: evaluationMeasure,
      definitionOperator: definitionOperator,
      ruleId: ruleId, // Set the ruleId to 5032
      auditType: auditType,
      definitionLabel: definitionLabel,
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider.rules_.resources.rule:definition/rule/definition`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + btoa("Administrator:manageaudit"), // Basic auth header
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save the new rule definition");
      }

      alert("Rule Definition saved successfully!");
      setOpenModal(false); // Close modal after saving
    } catch (error) {
      console.error("Error saving rule definition:", error);
      alert("An error occurred while trying to save the rule definition.");
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Card>
          <MDBox p={3} lineHeight={1}>
            {/* "Add Definition" Button inside the DataTable */}
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <MDTypography variant="h5" fontWeight="medium">
                Rule Definitions
              </MDTypography>
              <MDButton variant="contained" color="primary" onClick={handleAddDefinition}>
                Add Definition
              </MDButton>
            </MDBox>
            <DataTable table={dataTableData} canSearch />
          </MDBox>
        </Card>
      </MDBox>

      {/* Modal for adding definition */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Add Rule Definition</DialogTitle>
        <DialogContent>
          <TextField
            label="Definition Name"
            fullWidth
            value={definitionName}
            onChange={(e) => setDefinitionName(e.target.value)}
            margin="normal"
          />
          {/* Use Query dropdown field */}
          <TextField
            label="Use Query"
            variant="outlined"
            fullWidth
            margin="normal"
            select
            value={useQuery}
            onChange={(e) => setUseQuery(e.target.value)}
          >
            <MenuItem value="TRUE">TRUE</MenuItem>
            <MenuItem value="FALSE">FALSE</MenuItem>
          </TextField>
          <TextField
            label="Evaluation Query"
            fullWidth
            value={evaluationQuery}
            onChange={(e) => setEvaluationQuery(e.target.value)}
            margin="normal"
          />
          <TextField
            label="Evaluation Operator"
            fullWidth
            value={evaluationOperator}
            onChange={(e) => setEvaluationOperator(e.target.value)}
            margin="normal"
          />
          <TextField
            label="Evaluation Measure"
            fullWidth
            value={evaluationMeasure}
            onChange={(e) => setEvaluationMeasure(e.target.value)}
            margin="normal"
          />
          <TextField
            label="Definition Operator"
            fullWidth
            value={definitionOperator}
            onChange={(e) => setDefinitionOperator(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveDefinition} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Rule Deletion</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to delete this rule definition?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="primary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default RuleDefinition;
