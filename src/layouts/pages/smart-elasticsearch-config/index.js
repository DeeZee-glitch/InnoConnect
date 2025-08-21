/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
import { useEffect, useState } from "react";

// @mui material components
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import EditIcon from "@mui/icons-material/Edit";
import { Checkbox, IconButton, InputLabel, MenuItem, Select, Snackbar, Grid } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";

// Material Dashboard 2 PRO React components
import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import { getToken } from "hooks/keycloakService";
import { useSnackbar } from "context/snackbarContext";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";

function ElasticConfig() {
  const token = getToken();
  const initialFormData = {
    connectionName: "", // Connection Name
    connectionType: "", // Default to empty
    host: "", // Server Name
    port: null, // Server Port
    clusterURL: "",
    authorizationType: "", // Default authentication type
    userName: "", // Username for BasicAuth
    password: "", // Password for BasicAuth
    apiKey: null, // API Key for ApiKey Auth
    kafkaBrokers: "", // Kafka Brokers
    consumerGroupId: "", // Consumer Group ID
    securityProtocol: "", // Security Protocol
    certificate: "", // SSL Certificate Path
    saslUsername: "", // SASL Username
    saslPassword: "", // SASL Password
    databaseName: "", // Database Name
    certificatePath: "", //for kafka
    databaseType: "", //database type
    tableName: "",
    topic: "",
    dataset: "",
    fields: [
      {
        identifier: "",
        field: "RequestTime",
        datatype: "",
        contentType: "",
        path: "",
        keyStatus: "Mandatory",
      },
      {
        identifier: "",
        field: "ResponseTime",
        datatype: "",
        contentType: "",
        path: "",
        keyStatus: "Mandatory",
      },
      {
        identifier: "",
        field: "Host",
        datatype: "",
        contentType: "",
        path: "",
        keyStatus: "Mandatory",
      },
      {
        identifier: "",
        field: "Status",
        datatype: "",
        contentType: "",
        path: "",
        keyStatus: "Mandatory",
      },
      {
        identifier: "",
        field: "TransactionID",
        datatype: "",
        contentType: "",
        path: "",
        keyStatus: "Mandatory",
      },
      {
        identifier: "",
        field: "RequestPayload",
        datatype: "",
        contentType: "",
        path: "",
        keyStatus: "Mandatory",
      },
      {
        identifier: "",
        field: "ResponsePayload",
        datatype: "",
        contentType: "",
        path: "",
        keyStatus: "Mandatory",
      },
      {
        identifier: "",
        field: "ResourcePath",
        datatype: "",
        contentType: "",
        path: "",
        keyStatus: "Mandatory",
      },
    ],
    patterns: {
      RequestTime: "",
      ResponseTime: "",
    },
  };

  const { showSnackbar } = useSnackbar();
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false); // Dialog visibility
  const [configData, setConfigData] = useState([]); // Default as an empty array
  const [isEditMode, setIsEditMode] = useState(false); // To track if in edit mode
  const [currentEditRow, setCurrentEditRow] = useState(null); // To store data of the row being edited
  const [openDeleteSnackbar, setOpenDeleteSnackbar] = useState(false);
  const [deleteRow, setDeleteRow] = useState(null); // Store row to be deleted
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [fields, setFields] = useState([{ identifier: "" }]);
  const [openPatternDialog, setOpenPatternDialog] = useState(false);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(null);
  const [pattern, setPattern] = useState("");

  //json featuere import
  const [openJsonDialog, setOpenJsonDialog] = useState(false);
  const [jsonInput, setJsonInput] = useState("");

  //json payload dialog open
  const handleOpenJsonDialog = () => {
    setOpenJsonDialog(true);
  };

  //json payload dialog close
  const handleCloseJsonDialog = () => {
    setOpenJsonDialog(false);
    setJsonInput("");
  };

  const handleImportJson = (jsonString) => {
    try {
      const jsonData = JSON.parse(jsonString);

      if (!Array.isArray(jsonData)) {
        throw new Error("JSON must be an array of objects.");
      }

      const updatedFields = formData.fields.map((field, index) => {
        const importedField = jsonData[index];
        if (
          !importedField ||
          !importedField.identifier ||
          !importedField.contentType ||
          !importedField.path
        ) {
          throw new Error(`Invalid JSON structure at index ${index}.`);
        }
        return {
          ...field,
          identifier: importedField.identifier,
          contentType: importedField.contentType,
          path: importedField.path,
        };
      });

      setFormData({
        ...formData,
        fields: updatedFields,
      });

      showSnackbar("JSON data imported successfully!", "success");
    } catch (error) {
      console.error("Error importing JSON:", error);
      showSnackbar(`Error importing JSON: ${error.message}`, "error");
    }
  };

  // Fetch configuration data for the table
  const fetchConfigData = async () => {
    try {
      const response = await fetch("https://172.20.150.10:8098/smartlogger/connection/getAll", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched config data:", data); // Log to verify the data structure
        setConfigData(data || []); // Ensure it's always an array
      } else {
        throw new Error("Failed to fetch configuration data.");
      }
    } catch (error) {
      console.error("Error fetching config data:", error);
      setConfigData([]); // Reset to empty array on error
    }
  };

  // Fetch configuration data when the component mounts
  useEffect(() => {
    fetchConfigData();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear error message when the user starts typing
    setFormErrors((prevErrors) => {
      // Clear specific error for the field that was changed
      const updatedErrors = { ...prevErrors, [name]: "" };

      // Handle nested field errors for 'fields' array
      if (name.startsWith("fields")) {
        const fieldIndex = parseInt(name.split("[")[1].split("]")[0], 10); // Get the index
        const fieldName = name.split(".").slice(-1)[0]; // Get the field name (e.g., 'field', 'identifier')
        updatedErrors.fields[fieldIndex] = updatedErrors.fields[fieldIndex] || {};
        updatedErrors.fields[fieldIndex][fieldName] = "";
      } else {
        // Clear the error for the top-level field
        updatedErrors[name] = "";
      }

      return updatedErrors;
    });

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const [formErrors, setFormErrors] = useState({
    connectionName: "",
    kafkaBrokers: "",
    topic: "",
    consumerGroupId: "",
    securityProtocol: "",
    databaseType: "",
    tableName: "",
    host: "",
    port: "",
    databaseName: "",
    userName: "",
    password: "",
    clusterURL: "",
    dataset: "",
    authorizationType: "",
    fields: [], // Array of errors for fields
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Initialize errors object
    let errors = {
      connectionName: "",
      kafkaBrokers: "",
      topic: "",
      consumerGroupId: "",
      securityProtocol: "",
      databaseType: "",
      tableName: "",
      host: "",
      port: "",
      databaseName: "",
      userName: "",
      password: "",
      clusterURL: "",
      dataset: "",
      authorizationType: "",
      fields: [], // Array of errors for fields
    };

    let formIsValid = true;

    // Common validations for all connection types
    if (!formData.connectionName) {
      errors.connectionName = "Connection Name is required";
      formIsValid = false;
    }

    // Validate based on connectionType
    if (formData.connectionType === "elasticsearch") {
      if (!formData.clusterURL) {
        errors.clusterURL = "Cluster URL is required";
        formIsValid = false;
      }
      if (!formData.authorizationType) {
        showSnackbar("Authorization Type Required", "error");
        formIsValid = false;
      }
      if (!formData.dataset) {
        errors.dataset = "Index is required";
        formIsValid = false;
      }
    } else if (formData.connectionType === "kafka") {
      if (!formData.kafkaBrokers) {
        errors.kafkaBrokers = "Kafka Brokers are required";
        formIsValid = false;
      }
      if (!formData.topic) {
        errors.topic = "Topic is required";
        formIsValid = false;
      }
      if (!formData.consumerGroupId) {
        errors.consumerGroupId = "Consumer Group ID is required";
        formIsValid = false;
      }
      if (!formData.securityProtocol) {
        errors.securityProtocol = "Security Protocol is required";
        formIsValid = false;
      }
    } else if (formData.connectionType === "database") {
      if (!formData.host) {
        errors.host = "Host is required";
        formIsValid = false;
      }
      if (!formData.port) {
        errors.port = "Port is required";
        formIsValid = false;
      }
      if (!formData.databaseName) {
        errors.databaseName = "Database Name is required";
        formIsValid = false;
      }
      if (!formData.tableName) {
        errors.tableName = "Table Name is required";
        formIsValid = false;
      }
      if (!formData.databaseType) {
        errors.databaseType = "Database Type is required";
        formIsValid = false;
      }
    } else if (formData.connectionType === "wmapigateway") {
      if (!formData.clusterURL) {
        errors.clusterURL = "Cluster URL is required";
        formIsValid = false;
      }
      if (!formData.dataset) {
        errors.dataset = "Index is required";
        formIsValid = false;
      }
    }

    // Validate authorizationType-specific fields
    if (formData.authorizationType === "BasicAuth") {
      if (!formData.userName) {
        errors.userName = "Username is required for BasicAuth";
        formIsValid = false;
      }
      if (!formData.password) {
        errors.password = "Password is required for BasicAuth";
        formIsValid = false;
      }
    } else if (formData.authorizationType === "apiKey") {
      if (!formData.apiKey) {
        errors.apiKey = "API Key is required for ApiKey Auth";
        formIsValid = false;
      }
    } else if (formData.authorizationType === "NONE") {
      // No validation required for userName, password, or apiKey
    }

    // Validate fields array for each connection type
    const fieldErrors = formData.fields.map((field, index) => {
      let fieldError = {};

      // Skip path validation if connectionType is "database"
      if (!field.field) {
        fieldError.field = "Field is required";
        formIsValid = false;
      }
      if (!field.identifier) {
        fieldError.identifier = "Identifier is required";
        formIsValid = false;
      }
      if (formData.connectionType !== "database" && !field.path) {
        // Add condition to check for "database"
        fieldError.path = "Path is required";
        formIsValid = false;
      }

      return fieldError;
    });

    errors.fields = fieldErrors;

    // Set form errors
    setFormErrors(errors);

    // If form is not valid, stop submission
    if (!formIsValid) {
      return;
    }

    // If form is valid, proceed with submission
    setIsSubmitting(true);

    // Function to determine datatype based on connectionType
    const getDataType = (connectionType) => {
      switch (connectionType) {
        case "elasticsearch":
          return "Mapping";
        case "kafka":
          return "Topic";
        case "database":
          return "Column";
        case "wmapigateway":
          return "Mapping";
        default:
          return "string";
      }
    };

    // Extract patterns from fields
    const patterns = formData.fields
      .filter((field) => field.pattern) // Only include fields with a pattern
      .reduce((acc, field) => {
        acc[field.field] = field.pattern; // Map field name to pattern
        return acc;
      }, {});

    // Prepare dataToSend
    let dataToSend = {
      ...formData,
      patterns, // Include patterns in dataToSend
      fields: formData.fields.map((field) => {
        const { pattern, ...rest } = field; // Remove pattern from fields
        return {
          ...rest,
          datatype: getDataType(formData.connectionType), // Set datatype based on connectionType
        };
      }),
    };

    // Remove unnecessary fields based on connectionType
    if (formData.connectionType === "elasticsearch") {
      dataToSend = {
        connectionName: formData.connectionName,
        connectionType: formData.connectionType,
        dataset: formData.dataset,
        clusterURL: formData.clusterURL,
        authorizationType: formData.authorizationType,
        userName: formData.userName,
        password: formData.password,
        apiKey: formData.apiKey,
        certificatePath: formData.certificatePath ? String(formData.certificatePath) : "",
        ...(formData.certificate && { certificate: formData.certificate }),
        fields: dataToSend.fields, // Include fields with dynamic datatype
        patterns, // Include patterns
      };
    } else if (formData.connectionType === "kafka") {
      dataToSend = {
        connectionName: formData.connectionName,
        connectionType: formData.connectionType,
        topic: formData.topic,
        kafkaBrokers: formData.kafkaBrokers
          ? String(formData.kafkaBrokers)
              .split(",")
              .map((broker) => broker.trim())
          : [],
        consumerGroupId: formData.consumerGroupId,
        securityProtocol: formData.securityProtocol,
        userName: formData.saslUsername,
        password: formData.saslPassword,
        certificatePath: formData.certificatePath ? String(formData.certificatePath) : "",
        ...(formData.certificate && { certificate: formData.certificate }),
        fields: dataToSend.fields, // Include fields with dynamic datatype
        patterns, // Include patterns
      };
    } else if (formData.connectionType === "database") {
      dataToSend = {
        connectionName: formData.connectionName,
        connectionType: formData.connectionType,
        tableName: formData.tableName,
        host: formData.host,
        port: formData.port,
        userName: formData.userName,
        password: formData.password,
        databaseName: formData.databaseName,
        databaseType: formData.databaseType,
        certificate: formData.certificate ? String(formData.certificate) : "",
        fields: dataToSend.fields, // Include fields with dynamic datatype
        patterns, // Include patterns
      };
    } else if (formData.connectionType === "wmapigateway") {
      dataToSend = {
        connectionName: formData.connectionName,
        connectionType: formData.connectionType,
        dataset: formData.dataset,
        clusterURL: formData.clusterURL,
        authorizationType: formData.authorizationType,
        userName: formData.userName,
        password: formData.password,
        apiKey: formData.apiKey,
        certificatePath: formData.certificatePath ? String(formData.certificatePath) : "",
        ...(formData.certificate && { certificate: formData.certificate }),
        fields: dataToSend.fields, // Include fields with dynamic datatype
        patterns, // Include patterns
      };
    }

    // Define the correct API endpoint based on the connectionType
    let apiUrl = "";
    if (formData.connectionType === "elasticsearch") {
      apiUrl = "https://172.20.150.10:8098/smartlogger/connection/elasticsearch";
    } else if (formData.connectionType === "kafka") {
      apiUrl = "https://172.20.150.10:8098/smartlogger/connection/kafka";
    } else if (formData.connectionType === "database") {
      apiUrl = "https://172.20.150.10:8098/smartlogger/connection/database";
    } else if (formData.connectionType === "wmapigateway") {
      apiUrl = "https://172.20.150.10:8098/smartlogger/connection/gateway";
    }

    // Add the uniqueId for PATCH request (if it's in edit mode)
    let method = isEditMode ? "PATCH" : "POST"; // Use PATCH if in edit mode, otherwise POST
    if (isEditMode && currentEditRow && currentEditRow.uniqueId) {
      apiUrl = `${apiUrl}/${currentEditRow.uniqueId}`; // Append uniqueId for PATCH requests
    }

    // Send the request to the appropriate API endpoint
    try {
      const response = await fetch(apiUrl, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        showSnackbar(
          isEditMode ? "Config updated successfully!" : "Config submitted successfully!"
        );
        setFormData(initialFormData); // Reset the form to its initial state
        setOpenDialog(false); // Close the modal after successful submit
        fetchConfigData(); // Re-fetch the configuration data to reflect the latest data
      } else if (response.status === 401) {
        console.error("401 Unauthorized: Invalid AuthToken");
        showSnackbar("401 Unauthorized: ACCESS DENIED", "error");
      } else if (response.status === 500) {
        console.error("Error submitting config");
        showSnackbar("Error submitting config.", "error");
      } else {
        showSnackbar(isEditMode ? "Error updating config." : "Error submitting config.");
      }
    } catch (error) {
      showSnackbar(isEditMode ? "Error updating config." : "Error submitting config.");
    }

    setIsSubmitting(false);
  };

  const handleFieldChange = (e, index, fieldName) => {
    const updatedFields = [...formData.fields];
    updatedFields[index][fieldName] = e.target.value;

    // Clear the error for the specific field
    setFormErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      updatedErrors.fields[index] = updatedErrors.fields[index] || {};
      updatedErrors.fields[index][fieldName] = ""; // Clear the error
      return updatedErrors;
    });

    // Update the form data
    setFormData({
      ...formData,
      fields: updatedFields,
    });
  };

  const handleEditClick = (row) => {
    // Log the row to see its structure
    console.log("Row data:", row);
    console.log("Row original:", row.original); // Check if `original` contains the data

    if (!row || !row.original) {
      console.error("Row data or original data is undefined.");
      return;
    }

    const rowData = row.original; // This should contain the connection info

    // Prepopulate form data for editing
    setFormData({
      connectionName: rowData.connectionName || "",
      connectionType: rowData.connectionType || "",
      clusterURL: rowData.details?.clusterURL || "",
      host: rowData.details?.host || "",
      port: rowData.details?.port || null,
      authorizationType: rowData.details?.authorizationType || "",
      userName: rowData.details?.userName || "",
      password: rowData.details?.password || "",
      apiKey: rowData.details?.apiKey || "",
      kafkaBrokers: rowData.details?.kafkaBrokers || "", // You can add more logic for Kafka-specific connections here
      consumerGroupId: rowData.details?.consumerGroupId || "",
      securityProtocol: rowData.details?.securityProtocol || "",
      certificate: rowData.details?.certificate || "",
      certificatePath: rowData.details?.certificatePath || "",
      saslUsername: rowData.details?.userName || "",
      saslPassword: rowData.details?.password || "",
      databaseName: rowData.details?.databaseName || "", // Add logic for database type connections here
      databaseType: rowData.details?.databaseType || "",
      fields: rowData.details?.fields || [],
      topic: rowData.details?.topic || "",
      dataset: rowData.details?.dataset || "",
      tableName: rowData.details?.tableName || "",
    });

    if (rowData.details?.patterns) {
      const updatedFields = rowData.details.fields.map((field, index) => ({
        ...field,
        pattern: rowData.details.patterns[field.field] || "", // Load the pattern for each field
      }));
      setFormData((prevFormData) => ({
        ...prevFormData,
        fields: updatedFields,
      }));
    }

    setIsEditMode(true); // Set edit mode to true
    setCurrentEditRow(rowData); // Store the current row being edited
    setOpenDialog(true); // Open the modal for editing
  };

  const handleDelete = (row) => {
    if (!row.uniqueId || !row.connectionType) {
      showSnackbar("Invalid entry selected for deletion.", "error");
      return;
    }

    setDeleteRow(row);
    setOpenDeleteDialog(true); // Open the delete confirmation dialog
  };

  //delete config data handler
  const handleDeleteConfirm = async () => {
    if (!deleteRow) return;

    let apiUrl = "";
    if (deleteRow.connectionType === "elasticsearch") {
      apiUrl = `https://172.20.150.10:8098/smartlogger/connection/elasticsearch/${deleteRow.uniqueId}`;
    } else if (deleteRow.connectionType === "kafka") {
      apiUrl = `https://172.20.150.10:8098/smartlogger/connection/kafka/${deleteRow.uniqueId}`;
    } else if (deleteRow.connectionType === "database") {
      apiUrl = `https://172.20.150.10:8098/smartlogger/connection/database/${deleteRow.uniqueId}`;
    } else if (deleteRow.connectionType === "wmapigateway") {
      apiUrl = `https://172.20.150.10:8098/smartlogger/connection/elasticsearch/${deleteRow.uniqueId}`;
    } else {
      showSnackbar("Unknown connection type.", "error");
      return;
    }

    try {
      const response = await fetch(apiUrl, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        showSnackbar("Configuration deleted successfully!", "success");
        fetchConfigData(); // Refresh table data after deletion
      } else if (response.status === 401) {
        console.error("401 Unauthorized: Invalid AuthToken");
        showSnackbar("401 Unauthorized: ACCESS DENIED", "error");
      } else if (response.status === 500) {
        console.error("Server error while deleting config.");
        showSnackbar("Error deleting configuration.", "error");
      } else {
        showSnackbar("Failed to delete configuration.", "error");
      }
    } catch (error) {
      console.error("Error deleting config:", error);
      showSnackbar("Error deleting configuration.", "error");
    }

    setOpenDeleteDialog(false); // Close dialog after deletion
    setDeleteRow(null);
  };

  //data dialog open
  const handleDialogOpen = () => {
    setIsEditMode(false); // Reset edit mode
    setCurrentEditRow(null); // Clear the current edit row
    setFormData({ ...initialFormData, connectionType: "" }); // Set connectionType to empty
    setOpenDialog(true); // Open the dialog
  };

  //data dialog close
  const handleDialogClose = () => {
    setIsEditMode(false); // Reset edit mode
    setCurrentEditRow(null); // Clear the current edit row
    setFormData(initialFormData); // Reset form to initial state
    setFormErrors({
      // Reset form errors
      connectionName: "",
      kafkaBrokers: "",
      topic: "",
      consumerGroupId: "",
      securityProtocol: "",
      databaseType: "",
      tableName: "",
      host: "",
      port: "",
      databaseName: "",
      userName: "",
      password: "",
      clusterURL: "",
      dataset: "",
      authorizationType: "",
      fields: [], // Resetting errors for fields
    });
    setOpenDialog(false); // Close the dialog
  };

  //cancel deletion dialog
  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false); // Close dialog without deleting
  };

  //ssl selected or not
  const [isSslSelected, setIsSslSelected] = useState(false);

  const getHostValue = (row) => {
    const kafkaBrokers = (row.details?.kafkaBrokers || []).join(", ");
    const clusterURL = row.details?.clusterURL || "";

    const host = row.details?.host || "";
    const port = row.details?.port ? `:${row.details.port}` : "";

    // Combine host and port
    const hostWithPort = host + port;

    // Concatenate all values (Kafka Brokers, Cluster URL, and Host with Port)
    return [kafkaBrokers, clusterURL, hostWithPort].filter(Boolean).join(", ");
  };

  const handleIdentifierChange = (event, index) => {
    const updatedFields = [...formData.fields]; // Clone the fields from formData
    updatedFields[index].identifier = event.target.value; // Update the specific identifier field
    setFormData({
      ...formData, // Spread the existing formData
      fields: updatedFields, // Set the updated fields array
    });
  };

  const handleContentTypeChange = (e, index) => {
    const updatedFields = [...formData.fields];
    updatedFields[index].contentType = e.target.value;

    // If contentType is date open the pattern dialog
    if (e.target.value === "date") {
      setCurrentFieldIndex(index); // Store the index of the field being edited
      setPattern(formData.fields[index].pattern || "yyyy-MM-dd'T'HH:mm:ss.SSS");
      setOpenPatternDialog(true); // Open the pattern dialog
    }

    setFormData({ ...formData, fields: updatedFields });
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <MDBox mb={3} display="flex" justifyContent="space-between" alignItems="center">
          <MDBox>
            <MDTypography variant="h5" fontWeight="medium">
              Datasource Connections
            </MDTypography>
            <MDTypography variant="button" color="text">
              Existing Datasource Connections: View & Manage Configuration
            </MDTypography>
          </MDBox>

          {/* Create Config Button */}
          <MDButton
            variant="gradient"
            color="info"
            onClick={handleDialogOpen}
            sx={{ alignSelf: "flex-start" }}
          >
            Create New Datasource
          </MDButton>
        </MDBox>

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDeleteDialog} onClose={handleDeleteCancel}>
          <DialogTitle>Confirm Datasource Deletion</DialogTitle>
          <DialogContent>
            <MDTypography variant="h7">
              Are you sure you want to delete the Datasource{" "}
              <strong>{deleteRow?.connectionName}</strong>?
            </MDTypography>
          </DialogContent>
          <DialogActions>
            <MDButton onClick={handleDeleteCancel} color="secondary">
              Cancel
            </MDButton>
            <MDButton onClick={handleDeleteConfirm} color="error">
              Yes, Delete
            </MDButton>
          </DialogActions>
        </Dialog>

        <Dialog open={openPatternDialog} onClose={() => setOpenPatternDialog(false)}>
          <DialogTitle>Enter Pattern</DialogTitle>
          <DialogContent sx={{ padding: "20px", minWidth: "400px" }}>
            <TextField
              label="Pattern"
              variant="outlined"
              fullWidth
              value={pattern || "yyyy-MM-dd'T'HH:mm:ss.SSS"}
              onChange={(e) => setPattern(e.target.value)}
              style={{ marginBottom: 10, marginTop: 5 }}
            />
          </DialogContent>
          <DialogActions>
            <MDButton color="secondary" onClick={() => setOpenPatternDialog(false)}>
              Cancel
            </MDButton>
            <MDButton
              color="primary"
              onClick={() => {
                if (currentFieldIndex !== null) {
                  const updatedFields = [...formData.fields];
                  updatedFields[currentFieldIndex].pattern = pattern; // Save the pattern
                  setFormData({ ...formData, fields: updatedFields });
                }
                setOpenPatternDialog(false);
                setPattern("");
              }}
            >
              Save
            </MDButton>
          </DialogActions>
        </Dialog>

        <Card>
          <MDBox p={3} lineHeight={1}>
            {/* Pass the fetched configData to the DataTable */}
            <DataTable
              table={{
                columns: [
                  { Header: "Datasource Name", accessor: "connectionName" },
                  { Header: "Datasource Type", accessor: "connectionType" },
                  {
                    Header: "Host",
                    accessor: "host",
                    Cell: ({ row }) => getHostValue(row.original),
                  },
                  {
                    Header: "Actions",
                    accessor: "actions",
                    Cell: ({ row }) => (
                      <MDBox display="flex">
                        {/* Edit Button */}
                        <Tooltip title="Edit Data">
                          <IconButton color="primary" onClick={() => handleEditClick(row)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>

                        {/* Delete Button */}
                        <Tooltip title="Delete Data">
                          <IconButton color="secondary" onClick={() => handleDelete(row.original)}>
                            <DeleteForeverRoundedIcon />
                          </IconButton>
                        </Tooltip>
                      </MDBox>
                    ),
                  },
                ],
                rows: configData || [],
              }}
            />
          </MDBox>
        </Card>
      </MDBox>
      {/* Dialog (Popup Form) */}
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        sx={{
          "& .MuiDialog-paper": {
            width: "80%", // Adjust this value as per your need
            maxWidth: "900px", // Maximum width of the dialog
            minWidth: "700px", // Minimum width of the dialog
          },
        }}
      >
        <DialogTitle>
          {isEditMode
            ? `Edit ${formData.connectionName} Configuration`
            : `Add ${formData.connectionType || "Datasource"} Configuration`}
        </DialogTitle>

        <DialogContent sx={{ padding: "20px", minWidth: "570px" }}>
          <form onSubmit={handleSubmit} style={{ marginTop: "5px" }}>
            {/* Connection Type */}
            <FormControl fullWidth style={{ marginBottom: 20 }} required>
              <InputLabel
                style={{
                  paddingTop: "1px", // Increase top padding for label
                  paddingBottom: "8px", // Increase bottom padding for label
                }}
              >
                Select Datasource Type
              </InputLabel>
              <Select
                value={formData.connectionType}
                onChange={handleChange}
                label="Select Datasource Type"
                name="connectionType"
                sx={{
                  fontSize: "1rem",
                  height: "3rem",
                }}
              >
                <MenuItem value="kafka">Kafka</MenuItem>
                <MenuItem value="database">Database</MenuItem>
                <MenuItem value="elasticsearch">Elastic Search</MenuItem>
                <MenuItem value="wmapigateway">WM API Gateway</MenuItem>
              </Select>
            </FormControl>

            {/* ElasticSearch Fields */}
            {formData.connectionType === "elasticsearch" && (
              <>
                <TextField
                  label="Cluster URL (comma-separated if multiple nodes)"
                  variant="outlined"
                  fullWidth
                  name="clusterURL"
                  value={formData.clusterURL}
                  onChange={handleChange}
                  style={{ marginBottom: 20 }}
                  required
                  error={Boolean(formErrors.clusterURL)}
                  helperText={formErrors.clusterURL}
                />

                {/* Connection Name */}
                <TextField
                  label="Datasource Name"
                  variant="outlined"
                  fullWidth
                  name="connectionName"
                  value={formData.connectionName}
                  onChange={handleChange}
                  style={{ marginBottom: 20 }}
                  required
                  error={Boolean(formErrors.connectionName)} // Show error if field has an error
                  helperText={formErrors.connectionName} // Show error message under field
                />
                {/* Dataset Name */}
                <TextField
                  label="Index"
                  variant="outlined"
                  fullWidth
                  name="dataset"
                  value={formData.dataset}
                  onChange={handleChange}
                  style={{ marginBottom: 20 }}
                  required
                  error={Boolean(formErrors.dataset)}
                  helperText={formErrors.dataset}
                />

                {/* SSL Certificate Radio Button */}
                <FormControlLabel
                  control={<Checkbox />}
                  label="Use SSL"
                  name="certificatePath"
                  checked={isSslSelected}
                  onChange={(e) => {
                    setIsSslSelected(e.target.checked);
                    // Clear SSL file if unchecked
                    if (!e.target.checked) {
                      setFormData({ ...formData, certificatePath: null });
                    }
                  }}
                />

                {/* Conditionally render the file input for SSL certificate if selected */}
                {isSslSelected && (
                  <MDBox
                    sx={{
                      backgroundColor: "#f4f7fa",
                      padding: 2,
                      borderRadius: 2,
                      marginBottom: 2,
                    }}
                  >
                    <input
                      type="file"
                      name="certificatePath"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setFormData({ ...formData, certificatePath: file });
                      }}
                      style={{ marginBottom: 20 }}
                    />
                    {/* Display filename if available */}
                    {formData.certificatePath && (
                      <MDTypography variant="body2" sx={{ marginTop: 1, color: "#2c6c8c" }}>
                        {formData.certificatePath.name}
                      </MDTypography>
                    )}
                    {/* Remove Attachment Button */}
                    {formData.certificatePath && (
                      <MDButton
                        variant="contained"
                        color="error"
                        onClick={() => setFormData({ ...formData, certificatePath: null })}
                        sx={{
                          marginTop: 1,
                          backgroundColor: "#f44336",
                          ":hover": { backgroundColor: "#d32f2f" },
                          fontSize: "0.75rem", // Smaller text size
                          padding: "1px 1px", // Reduced padding for a smaller button
                        }}
                      >
                        Remove
                      </MDButton>
                    )}
                  </MDBox>
                )}

                {/* Authentication Type */}
                <FormControl fullWidth style={{ marginBottom: 20 }} required>
                  <FormLabel component="legend">Authorization Type</FormLabel>
                  <RadioGroup
                    name="authorizationType"
                    value={formData.authorizationType}
                    onChange={handleChange}
                    row
                    error={Boolean(formErrors.authorizationType)}
                    helperText={formErrors.authorizationType}
                  >
                    <FormControlLabel
                      value="BasicAuth"
                      control={<Radio />}
                      label="Basic Authentication"
                    />
                    <FormControlLabel value="apiKey" control={<Radio />} label="API Key" />
                    <FormControlLabel value="NONE" control={<Radio />} label="None" />
                  </RadioGroup>
                </FormControl>

                {/* Authentication Fields */}
                {formData.authorizationType === "BasicAuth" && (
                  <>
                    <TextField
                      label="Username"
                      variant="outlined"
                      fullWidth
                      name="userName"
                      value={formData.userName}
                      onChange={handleChange}
                      style={{ marginBottom: 20 }}
                      required
                      error={Boolean(formErrors.userName)}
                      helperText={formErrors.userName}
                    />
                    <TextField
                      label="Password"
                      variant="outlined"
                      fullWidth
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      style={{ marginBottom: 20 }}
                      type="password"
                      required
                      error={Boolean(formErrors.password)}
                      helperText={formErrors.password}
                    />
                  </>
                )}

                {formData.authorizationType === "apiKey" && (
                  <TextField
                    label="API Key"
                    variant="outlined"
                    fullWidth
                    name="apiKey"
                    value={formData.apiKey}
                    onChange={handleChange}
                    style={{ marginBottom: 20 }}
                    required
                    error={Boolean(formErrors.apiKey)}
                    helperText={formErrors.apiKey}
                  />
                )}
                {/* Render Fields from FormData */}
                <MDBox
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  style={{ marginBottom: 10 }}
                >
                  <h3>Pre-Defined API Keys</h3>
                  <MDButton
                    variant="gradient"
                    color="info"
                    onClick={handleOpenJsonDialog}
                    sx={{
                      fontSize: "0.75rem", // Smaller font size
                      padding: "4px 8px", // Smaller padding
                      minWidth: "auto", // Allow the button to shrink to fit its content
                    }}
                  >
                    Import Keys
                  </MDButton>
                </MDBox>

                <Dialog open={openJsonDialog} onClose={handleCloseJsonDialog}>
                  <DialogTitle>Import JSON Data</DialogTitle>
                  <DialogContent>
                    <MDTypography variant="body2" gutterBottom>
                      Upload a JSON file or paste JSON data below:
                    </MDTypography>

                    {/* File Upload */}
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setJsonInput(event.target.result);
                          };
                          reader.readAsText(file);
                        }
                      }}
                      style={{ marginBottom: 20 }}
                    />

                    {/* TextArea for JSON Input */}
                    <TextField
                      label="Paste JSON Data"
                      variant="outlined"
                      fullWidth
                      multiline
                      rows={6}
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                    />
                  </DialogContent>
                  <DialogActions>
                    <MDButton onClick={handleCloseJsonDialog} color="secondary">
                      Cancel
                    </MDButton>
                    <MDButton
                      onClick={() => {
                        handleImportJson(jsonInput);
                        handleCloseJsonDialog();
                      }}
                      color="primary"
                    >
                      Import
                    </MDButton>
                  </DialogActions>
                </Dialog>
                {formData.fields.map((field, index) => (
                  <Grid container spacing={2} key={index} style={{ marginBottom: 10 }}>
                    <Grid item xs={2}>
                      <TextField
                        label="Mapping"
                        variant="outlined"
                        fullWidth
                        name={`fields[${index}].field`} // Using the index in the name attribute
                        value={field.field}
                        required
                        disabled
                      />
                    </Grid>

                    <Grid item xs={4}>
                      <TextField
                        label="Identifier"
                        variant="outlined"
                        fullWidth
                        name={`fields[${index}].identifier`} // Using the index in the name attribute
                        value={formData.fields[index].identifier}
                        onChange={(e) => handleFieldChange(e, index, "identifier")}
                        required
                        error={Boolean(formErrors.fields[index]?.identifier)}
                        helperText={formErrors.fields[index]?.identifier}
                      />
                    </Grid>

                    <Grid item xs={2}>
                      <FormControl fullWidth style={{ marginBottom: 10 }}>
                        <InputLabel>Content Type</InputLabel>
                        <Select
                          value={field.contentType}
                          onChange={(e) => handleContentTypeChange(e, index)}
                          label="Content Type"
                          name={`fields[${index}].contentType`}
                          sx={{
                            fontSize: "1rem",
                            height: "2.75rem",
                          }}
                        >
                          <MenuItem value="Value">Value</MenuItem>
                          <MenuItem value="JSON">JSON</MenuItem>
                          <MenuItem value="XML">XML</MenuItem>
                          {/* Date and epoch restricted only for Request and Response Time */}
                          {(field.field === "RequestTime" || field.field === "ResponseTime") && (
                            <>
                              <MenuItem value="date">Date</MenuItem>
                              <MenuItem value="epoch">Epoch</MenuItem>
                            </>
                          )}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={4}>
                      <TextField
                        label="Path"
                        variant="outlined"
                        fullWidth
                        name={`fields[${index}].path`} // Using the index in the name attribute
                        value={field.path}
                        onChange={(e) => handleFieldChange(e, index, "path")}
                        required
                        error={Boolean(formErrors.fields[index]?.path)}
                        helperText={formErrors.fields[index]?.path}
                      />
                    </Grid>
                  </Grid>
                ))}
              </>
            )}

            {/* wmapigateway Fields */}
            {formData.connectionType === "wmapigateway" && (
              <>
                <TextField
                  label="Cluster URL (comma-separated if multiple nodes)"
                  variant="outlined"
                  fullWidth
                  name="clusterURL"
                  value={formData.clusterURL}
                  onChange={handleChange}
                  style={{ marginBottom: 20 }}
                  required
                  error={Boolean(formErrors.clusterURL)}
                  helperText={formErrors.clusterURL}
                />

                {/* Connection Name */}
                <TextField
                  label="Datasource Name"
                  variant="outlined"
                  fullWidth
                  name="connectionName"
                  value={formData.connectionName}
                  onChange={handleChange}
                  style={{ marginBottom: 20 }}
                  required
                  error={Boolean(formErrors.connectionName)}
                  helperText={formErrors.connectionName}
                />
                {/* Dataset Name */}
                <TextField
                  label="Index"
                  variant="outlined"
                  fullWidth
                  name="dataset"
                  value={formData.dataset}
                  onChange={handleChange}
                  style={{ marginBottom: 20 }}
                  required
                  error={Boolean(formErrors.dataset)}
                  helperText={formErrors.dataset}
                />

                {/* SSL Certificate Radio Button */}
                <FormControlLabel
                  control={<Checkbox />}
                  label="Use SSL"
                  name="certificatePath"
                  checked={isSslSelected}
                  onChange={(e) => {
                    setIsSslSelected(e.target.checked);
                    // Clear SSL file if unchecked
                    if (!e.target.checked) {
                      setFormData({ ...formData, certificatePath: null });
                    }
                  }}
                />

                {/* Conditionally render the file input for SSL certificate if selected */}
                {isSslSelected && (
                  <MDBox
                    sx={{
                      backgroundColor: "#f4f7fa",
                      padding: 2,
                      borderRadius: 2,
                      marginBottom: 2,
                    }}
                  >
                    <input
                      type="file"
                      name="certificatePath"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setFormData({ ...formData, certificatePath: file });
                      }}
                      style={{ marginBottom: 20 }}
                    />
                    {/* Display filename if available */}
                    {formData.certificatePath && (
                      <MDTypography variant="body2" sx={{ marginTop: 1, color: "#2c6c8c" }}>
                        {formData.certificatePath.name}
                      </MDTypography>
                    )}
                    {/* Remove Attachment Button */}
                    {formData.certificatePath && (
                      <MDButton
                        variant="contained"
                        color="error"
                        onClick={() => setFormData({ ...formData, certificatePath: null })}
                        sx={{
                          marginTop: 1,
                          backgroundColor: "#f44336",
                          ":hover": { backgroundColor: "#d32f2f" },
                          fontSize: "0.75rem", // Smaller text size
                          padding: "1px 1px", // Reduced padding for a smaller button
                        }}
                      >
                        Remove
                      </MDButton>
                    )}
                  </MDBox>
                )}
                {/* Render Fields from FormData */}
                <MDBox
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  style={{ marginBottom: 10 }}
                >
                  <h3>Pre-Defined API Keys</h3>
                  <MDButton
                    variant="gradient"
                    color="info"
                    onClick={handleOpenJsonDialog}
                    sx={{
                      fontSize: "0.75rem", // Smaller font size
                      padding: "4px 8px", // Smaller padding
                      minWidth: "auto", // Allow the button to shrink to fit its content
                    }}
                  >
                    Import Keys
                  </MDButton>
                </MDBox>

                <Dialog open={openJsonDialog} onClose={handleCloseJsonDialog}>
                  <DialogTitle>Import JSON Data</DialogTitle>
                  <DialogContent>
                    <MDTypography variant="body2" gutterBottom>
                      Upload a JSON file or paste JSON data below:
                    </MDTypography>

                    {/* File Upload */}
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setJsonInput(event.target.result);
                          };
                          reader.readAsText(file);
                        }
                      }}
                      style={{ marginBottom: 20 }}
                    />

                    {/* TextArea for JSON Input */}
                    <TextField
                      label="Paste JSON Data"
                      variant="outlined"
                      fullWidth
                      multiline
                      rows={6}
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                    />
                  </DialogContent>
                  <DialogActions>
                    <MDButton onClick={handleCloseJsonDialog} color="secondary">
                      Cancel
                    </MDButton>
                    <MDButton
                      onClick={() => {
                        handleImportJson(jsonInput);
                        handleCloseJsonDialog();
                      }}
                      color="primary"
                    >
                      Import
                    </MDButton>
                  </DialogActions>
                </Dialog>
                {formData.fields.map((field, index) => (
                  <Grid container spacing={2} key={index} style={{ marginBottom: 10 }}>
                    <Grid item xs={2}>
                      <TextField
                        label="Mapping"
                        variant="outlined"
                        fullWidth
                        name={`fields[${index}].field`} // Using the index in the name attribute
                        value={field.field}
                        required
                        disabled
                      />
                    </Grid>

                    <Grid item xs={4}>
                      <TextField
                        label="Identifier"
                        variant="outlined"
                        fullWidth
                        name={`fields[${index}].identifier`} // Using the index in the name attribute
                        value={formData.fields[index].identifier}
                        onChange={(e) => handleFieldChange(e, index, "identifier")}
                        required
                        error={Boolean(formErrors.fields[index]?.identifier)}
                        helperText={formErrors.fields[index]?.identifier}
                      />
                    </Grid>

                    <Grid item xs={2}>
                      <FormControl fullWidth style={{ marginBottom: 10 }}>
                        <InputLabel>Content Type</InputLabel>
                        <Select
                          value={field.contentType}
                          onChange={(e) => handleContentTypeChange(e, index)}
                          label="Content Type"
                          name={`fields[${index}].contentType`}
                          sx={{
                            fontSize: "1rem",
                            height: "2.75rem",
                          }}
                        >
                          <MenuItem value="Value">Value</MenuItem>
                          <MenuItem value="JSON">JSON</MenuItem>
                          <MenuItem value="XML">XML</MenuItem>
                          {/* Date and epoch restricted only for Request and Response Time */}
                          {(field.field === "RequestTime" || field.field === "ResponseTime") && (
                            <>
                              <MenuItem value="date">Date</MenuItem>
                              <MenuItem value="epoch">Epoch</MenuItem>
                            </>
                          )}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={4}>
                      <TextField
                        label="Path"
                        variant="outlined"
                        fullWidth
                        name={`fields[${index}].path`} // Using the index in the name attribute
                        value={field.path}
                        onChange={(e) => handleFieldChange(e, index, "path")}
                        required
                        error={Boolean(formErrors.fields[index]?.path)}
                        helperText={formErrors.fields[index]?.path}
                      />
                    </Grid>
                  </Grid>
                ))}
              </>
            )}

            {/* Kafka Fields */}
            {formData.connectionType === "kafka" && (
              <>
                <TextField
                  label="Kafka Brokers"
                  variant="outlined"
                  fullWidth
                  name="kafkaBrokers"
                  value={formData.kafkaBrokers}
                  onChange={handleChange}
                  style={{ marginBottom: 20 }}
                  required
                  error={Boolean(formErrors.kafkaBrokers)}
                  helperText={formErrors.kafkaBrokers}
                />
                {/* Connection Name */}
                <TextField
                  label="Datasource Name"
                  variant="outlined"
                  fullWidth
                  name="connectionName"
                  value={formData.connectionName}
                  onChange={handleChange}
                  style={{ marginBottom: 20 }}
                  required
                  error={Boolean(formErrors.connectionName)}
                  helperText={formErrors.connectionName}
                />
                {/* Topic Name */}
                <TextField
                  label="Topic"
                  variant="outlined"
                  fullWidth
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  style={{ marginBottom: 20 }}
                  required
                  error={Boolean(formErrors.topic)}
                  helperText={formErrors.topic}
                />
                <TextField
                  label="Consumer Group ID"
                  variant="outlined"
                  fullWidth
                  name="consumerGroupId"
                  value={formData.consumerGroupId}
                  onChange={handleChange}
                  style={{ marginBottom: 20 }}
                  required
                  error={Boolean(formErrors.consumerGroupId)}
                  helperText={formErrors.consumerGroupId}
                />
                <FormControl fullWidth style={{ marginBottom: 20 }} required>
                  <InputLabel>Security Protocol</InputLabel>
                  <Select
                    value={formData.securityProtocol}
                    onChange={handleChange}
                    label="Security Protocol"
                    name="securityProtocol"
                    sx={{
                      fontSize: "1rem",
                      height: "3rem",
                    }}
                    error={Boolean(formErrors.securityProtocol)}
                    helperText={formErrors.securityProtocol}
                  >
                    <MenuItem value="PLAINTEXT">PLAINTEXT</MenuItem>
                    <MenuItem value="SSL">SSL</MenuItem>
                    <MenuItem value="SASL_PLAINTEXT">SASL_PLAINTEXT</MenuItem>
                    <MenuItem value="SASL_SSL">SASL_SSL</MenuItem>
                  </Select>
                </FormControl>

                {/* Show SASL fields if security protocol requires authentication */}
                {(formData.securityProtocol === "SASL_PLAINTEXT" ||
                  formData.securityProtocol === "SASL_SSL") && (
                  <>
                    <TextField
                      label="SASL Username"
                      variant="outlined"
                      fullWidth
                      name="saslUsername"
                      value={formData.saslUsername}
                      onChange={handleChange}
                      style={{ marginBottom: 20 }}
                    />
                    <TextField
                      label="SASL Password"
                      variant="outlined"
                      fullWidth
                      name="saslPassword"
                      value={formData.saslPassword}
                      onChange={handleChange}
                      style={{ marginBottom: 20 }}
                      type="password"
                    />
                  </>
                )}

                {/* Show SSL certificate file upload only for SSL or SASL_SSL */}
                {(formData.securityProtocol === "SSL" ||
                  formData.securityProtocol === "SASL_SSL") && (
                  <MDBox
                    sx={{
                      backgroundColor: "#f4f7fa",
                      padding: 2,
                      borderRadius: 2,
                      marginBottom: 2,
                    }}
                  >
                    <input
                      type="file"
                      name="certificatePath"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setFormData({ ...formData, certificatePath: file });
                      }}
                      style={{ marginBottom: 20 }}
                    />
                    {/* Display filename if available */}
                    {formData.certificatePath && (
                      <MDTypography variant="body2" sx={{ marginTop: 1, color: "#2c6c8c" }}>
                        {formData.certificatePath.name}
                      </MDTypography>
                    )}
                    {/* Remove Attachment Button */}
                    {formData.certificatePath && (
                      <MDButton
                        variant="contained"
                        color="error"
                        onClick={() => setFormData({ ...formData, certificatePath: null })}
                        sx={{
                          marginTop: 1,
                          backgroundColor: "#f44336",
                          ":hover": { backgroundColor: "#d32f2f" },
                          fontSize: "0.75rem",
                          padding: "1px 1px",
                        }}
                      >
                        Remove
                      </MDButton>
                    )}
                  </MDBox>
                )}
                {/* Render Fields from FormData */}
                <MDBox
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  style={{ marginBottom: 10 }}
                >
                  <h3>Pre-Defined API Keys</h3>
                  <MDButton
                    variant="gradient"
                    color="info"
                    onClick={handleOpenJsonDialog}
                    sx={{
                      fontSize: "0.75rem", // Smaller font size
                      padding: "4px 8px", // Smaller padding
                      minWidth: "auto", // Allow the button to shrink to fit its content
                    }}
                  >
                    Import Keys
                  </MDButton>
                </MDBox>

                <Dialog open={openJsonDialog} onClose={handleCloseJsonDialog}>
                  <DialogTitle>Import JSON Data</DialogTitle>
                  <DialogContent>
                    <MDTypography variant="body2" gutterBottom>
                      Upload a JSON file or paste JSON data below:
                    </MDTypography>

                    {/* File Upload */}
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setJsonInput(event.target.result);
                          };
                          reader.readAsText(file);
                        }
                      }}
                      style={{ marginBottom: 20 }}
                    />

                    {/* TextArea for JSON Input */}
                    <TextField
                      label="Paste JSON Data"
                      variant="outlined"
                      fullWidth
                      multiline
                      rows={6}
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                    />
                  </DialogContent>
                  <DialogActions>
                    <MDButton onClick={handleCloseJsonDialog} color="secondary">
                      Cancel
                    </MDButton>
                    <MDButton
                      onClick={() => {
                        handleImportJson(jsonInput);
                        handleCloseJsonDialog();
                      }}
                      color="primary"
                    >
                      Import
                    </MDButton>
                  </DialogActions>
                </Dialog>
                {formData.fields.map((field, index) => (
                  <Grid container spacing={2} key={index} style={{ marginBottom: 10 }}>
                    <Grid item xs={2}>
                      <TextField
                        label="Topic"
                        variant="outlined"
                        fullWidth
                        name={`fields[${index}].field`} // Using the index in the name attribute
                        value={field.field}
                        required
                        disabled
                      />
                    </Grid>

                    <Grid item xs={4}>
                      <TextField
                        label="Identifier"
                        variant="outlined"
                        fullWidth
                        name={`fields[${index}].identifier`} // Using the index in the name attribute
                        value={formData.fields[index].identifier}
                        onChange={(e) => handleFieldChange(e, index, "identifier")}
                        required
                        error={Boolean(formErrors.fields[index]?.identifier)}
                        helperText={formErrors.fields[index]?.identifier}
                      />
                    </Grid>

                    <Grid item xs={2}>
                      <FormControl fullWidth style={{ marginBottom: 10 }}>
                        <InputLabel>Content Type</InputLabel>
                        <Select
                          value={field.contentType}
                          onChange={(e) => handleContentTypeChange(e, index)}
                          label="Content Type"
                          name={`fields[${index}].contentType`}
                          sx={{
                            fontSize: "1rem",
                            height: "2.75rem",
                          }}
                        >
                          <MenuItem value="Value">Value</MenuItem>
                          <MenuItem value="JSON">JSON</MenuItem>
                          <MenuItem value="XML">XML</MenuItem>
                          {/* Date and epoch restricted only for Request and Response Time */}
                          {(field.field === "RequestTime" || field.field === "ResponseTime") && (
                            <>
                              <MenuItem value="date">Date</MenuItem>
                              <MenuItem value="epoch">Epoch</MenuItem>
                            </>
                          )}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={4}>
                      <TextField
                        label="Path"
                        variant="outlined"
                        fullWidth
                        name={`fields[${index}].path`} // Using the index in the name attribute
                        value={field.path}
                        onChange={(e) => handleFieldChange(e, index, "path")}
                        required
                        error={Boolean(formErrors.fields[index]?.path)}
                        helperText={formErrors.fields[index]?.path}
                      />
                    </Grid>
                  </Grid>
                ))}
              </>
            )}

            {/* Database Fields */}
            {formData.connectionType === "database" && (
              <>
                {/* Connection Name */}
                <TextField
                  label="Datasource Name"
                  variant="outlined"
                  fullWidth
                  name="connectionName"
                  value={formData.connectionName}
                  onChange={handleChange}
                  style={{ marginBottom: 20 }}
                  required
                  error={Boolean(formErrors.connectionName)}
                  helperText={formErrors.connectionName}
                />
                <FormControl fullWidth style={{ marginBottom: 20 }} required>
                  <InputLabel
                    style={{
                      paddingBottom: "8px", // Increase bottom padding for label
                    }}
                  >
                    Database Type
                  </InputLabel>
                  <Select
                    value={formData.databaseType}
                    onChange={handleChange}
                    label="Database Type"
                    name="databaseType"
                    sx={{
                      fontSize: "1rem",
                      height: "2.75rem",
                    }}
                    error={Boolean(formErrors.databaseType)}
                    helperText={formErrors.databaseType}
                  >
                    <MenuItem value="postgressql">Postgres SQL</MenuItem>
                    <MenuItem value="oraclesql">Oracle SQL</MenuItem>
                    <MenuItem value="mysql">My Sql</MenuItem>
                    <MenuItem value="mssql">MS SQL Server</MenuItem>
                  </Select>
                </FormControl>
                {/* Table Name */}
                <TextField
                  label="Table"
                  variant="outlined"
                  fullWidth
                  name="tableName"
                  value={formData.tableName}
                  onChange={handleChange}
                  style={{ marginBottom: 20 }}
                  required
                  error={Boolean(formErrors.tableName)}
                  helperText={formErrors.tableName}
                />
                <TextField
                  label="Host"
                  variant="outlined"
                  fullWidth
                  name="host"
                  value={formData.host}
                  onChange={handleChange}
                  style={{ marginBottom: 20 }}
                  required
                  error={Boolean(formErrors.host)}
                  helperText={formErrors.host}
                />
                <TextField
                  label="Port"
                  variant="outlined"
                  fullWidth
                  name="port"
                  value={formData.port}
                  onChange={handleChange}
                  style={{ marginBottom: 20 }}
                  required
                  error={Boolean(formErrors.port)}
                  helperText={formErrors.port}
                />
                <TextField
                  label="Database Name"
                  variant="outlined"
                  fullWidth
                  name="databaseName"
                  value={formData.databaseName}
                  onChange={handleChange}
                  style={{ marginBottom: 20 }}
                  required
                  error={Boolean(formErrors.databaseName)}
                  helperText={formErrors.databaseName}
                />
                <TextField
                  label="Username"
                  variant="outlined"
                  fullWidth
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  style={{ marginBottom: 20 }}
                  required
                  error={Boolean(formErrors.userName)}
                  helperText={formErrors.userName}
                />
                <TextField
                  label="Password"
                  variant="outlined"
                  fullWidth
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ marginBottom: 20 }}
                  type="password"
                  required
                  error={Boolean(formErrors.password)}
                  helperText={formErrors.password}
                />
                {/* SSL Certificate Radio Button */}
                <FormControlLabel
                  control={<Checkbox />}
                  label="Use SSL"
                  name="certificate"
                  checked={isSslSelected}
                  onChange={(e) => {
                    setIsSslSelected(e.target.checked);
                    // Clear SSL file if unchecked
                    if (!e.target.checked) {
                      setFormData({ ...formData, certificate: null });
                    }
                  }}
                />

                {/* Conditionally render the file input for SSL certificate if selected */}
                {isSslSelected && (
                  <MDBox
                    sx={{
                      backgroundColor: "#f4f7fa",
                      padding: 2,
                      borderRadius: 2,
                      marginBottom: 2,
                    }}
                  >
                    <input
                      type="file"
                      name="certificate"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setFormData({ ...formData, certificate: file });
                      }}
                      style={{ marginBottom: 20 }}
                    />
                    {/* Display filename if available */}
                    {formData.certificate && (
                      <MDTypography variant="body2" sx={{ marginTop: 1, color: "#2c6c8c" }}>
                        {formData.certificate.name}
                      </MDTypography>
                    )}
                    {/* Remove Attachment Button */}
                    {formData.certificate && (
                      <MDButton
                        variant="contained"
                        color="error"
                        onClick={() => setFormData({ ...formData, certificate: null })}
                        sx={{
                          marginTop: 1,
                          backgroundColor: "#f44336",
                          ":hover": { backgroundColor: "#d32f2f" },
                          fontSize: "0.75rem", // Smaller text size
                          padding: "1px 1px", // Reduced padding for a smaller button
                        }}
                      >
                        Remove
                      </MDButton>
                    )}
                  </MDBox>
                )}
                {/* Render Fields from FormData */}
                <MDBox
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  style={{ marginBottom: 10 }}
                >
                  <h3>Pre-Defined API Keys</h3>
                  <MDButton
                    variant="gradient"
                    color="info"
                    onClick={handleOpenJsonDialog}
                    sx={{
                      fontSize: "0.75rem", // Smaller font size
                      padding: "4px 8px", // Smaller padding
                      minWidth: "auto", // Allow the button to shrink to fit its content
                    }}
                  >
                    Import Keys
                  </MDButton>
                </MDBox>

                <Dialog open={openJsonDialog} onClose={handleCloseJsonDialog}>
                  <DialogTitle>Import JSON Data</DialogTitle>
                  <DialogContent>
                    <MDTypography variant="body2" gutterBottom>
                      Upload a JSON file or paste JSON data below:
                    </MDTypography>

                    {/* File Upload */}
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setJsonInput(event.target.result);
                          };
                          reader.readAsText(file);
                        }
                      }}
                      style={{ marginBottom: 20 }}
                    />

                    {/* TextArea for JSON Input */}
                    <TextField
                      label="Paste JSON Data"
                      variant="outlined"
                      fullWidth
                      multiline
                      rows={6}
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                    />
                  </DialogContent>
                  <DialogActions>
                    <MDButton onClick={handleCloseJsonDialog} color="secondary">
                      Cancel
                    </MDButton>
                    <MDButton
                      onClick={() => {
                        handleImportJson(jsonInput);
                        handleCloseJsonDialog();
                      }}
                      color="primary"
                    >
                      Import
                    </MDButton>
                  </DialogActions>
                </Dialog>
                {formData.fields.map((field, index) => (
                  <Grid container spacing={2} key={index} style={{ marginBottom: 10 }}>
                    <Grid item xs={4}>
                      <TextField
                        label="Mapping"
                        variant="outlined"
                        fullWidth
                        name={`fields[${index}].field`} // Using the index in the name attribute
                        value={field.field}
                        required
                        disabled
                      />
                    </Grid>

                    <Grid item xs={4}>
                      <TextField
                        label="Column"
                        variant="outlined"
                        fullWidth
                        name={`fields[${index}].identifier`} // Using the index in the name attribute
                        value={formData.fields[index].identifier}
                        onChange={(e) => handleFieldChange(e, index, "identifier")}
                        required
                        error={Boolean(formErrors.fields[index]?.identifier)}
                        helperText={formErrors.fields[index]?.identifier}
                      />
                    </Grid>

                    <Grid item xs={4}>
                      <FormControl fullWidth style={{ marginBottom: 10 }}>
                        <InputLabel>Content Type</InputLabel>
                        <Select
                          value={field.contentType}
                          onChange={(e) => handleContentTypeChange(e, index)}
                          label="Content Type"
                          name={`fields[${index}].contentType`}
                          sx={{
                            fontSize: "1rem",
                            height: "2.75rem",
                          }}
                        >
                          <MenuItem value="Value">Value</MenuItem>
                          <MenuItem value="JSON">JSON</MenuItem>
                          <MenuItem value="XML">XML</MenuItem>
                          {/* Date and epoch restricted only for Request and Response Time */}
                          {(field.field === "RequestTime" || field.field === "ResponseTime") && (
                            <>
                              <MenuItem value="date">Date</MenuItem>
                              <MenuItem value="epoch">Epoch</MenuItem>
                            </>
                          )}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* <Grid item xs={4}>
                      <TextField
                        label="Query"
                        variant="outlined"
                        fullWidth
                        name={`fields[${index}].path`} // Using the index in the name attribute
                        value={field.path}
                        onChange={(e) => handleFieldChange(e, index, "path")}
                        required
                        error={Boolean(formErrors.fields[index]?.path)}
                        helperText={formErrors.fields[index]?.path}
                      />
                    </Grid> */}
                  </Grid>
                ))}
              </>
            )}
          </form>
        </DialogContent>
        <DialogActions>
          <MDButton color="secondary" onClick={handleDialogClose}>
            Cancel
          </MDButton>
          <MDButton
            color="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.connectionType} // Disable if connection type is empty
            variant="gradient"
          >
            {isEditMode ? "Update Config" : "Submit Config"}
          </MDButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default ElasticConfig;
