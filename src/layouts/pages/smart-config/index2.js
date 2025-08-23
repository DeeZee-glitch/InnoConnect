/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
import { useEffect, useState } from "react";

// @mui material components
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Check from "@mui/icons-material/Check";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import EditIcon from "@mui/icons-material/Edit";
import Tooltip from "@mui/material/Tooltip";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Edit } from "@mui/icons-material";
import InputAdornment from "@mui/material/InputAdornment";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
// Material Dashboard 2 PRO React components
import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { ContentCopy } from "@mui/icons-material";

// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import { getToken } from "hooks/keycloakService";
import { useSnackbar } from "context/snackbarContext";
import { set } from "date-fns";
import { identifier } from "stylis";
function SmartConfig() {
  const { showSnackbar } = useSnackbar();
  const token = getToken();
  const initialFormData = {
    apiName: "",
    resourcePath: "",
    connectionName: "",
    roleNames: [],
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
        field: "CorrelationID",
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
    ],
  };

  const [deleteConfirmation, setDeleteConfirmation] = useState({
    open: false,
    index: null,
  });
  const [formData, setFormData] = useState(initialFormData);
  const [apiList, setApiList] = useState([]); // List of available APIs for the dropdown
  const [configData, setConfigData] = useState([]); // Table data
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [inputContent, setInputContent] = useState(""); // Editable input (JSON or XML)
  const [parsedContent, setParsedContent] = useState({}); // Parsed data
  const [isJson, setIsJson] = useState(true); // Determine if the input is JSON
  const [roleNames, setRoles] = useState([]); // Initialize roles state
  const [copiedRow, setCopiedRow] = useState({});
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch(
          "http://172.20.150.10:8099/smartlogger/roles/get",
          // "https://172.20.150.10:9899/admin/realms/SmartLogger/roles",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const roleNames = data.map((role) => ({ id: role.id, name: role.name })); // Extract only 'id' and 'name'
        setRoles(roleNames);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    if (token) {
      fetchRoles();
    }
  }, [token]);

  // Parse input as JSON or XML
  useEffect(() => {
    try {
      // Try parsing as JSON
      const jsonParsed = JSON.parse(inputContent);
      setParsedContent(flattenJson(jsonParsed)); // Use the updated flattenJson function
      setIsJson(true);
    } catch {
      try {
        // Try parsing as XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(inputContent, "application/xml");
        if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
          throw new Error("Invalid XML");
        }
        setParsedContent(flattenXml(xmlDoc.documentElement)); // Keep the existing XML logic
        setIsJson(false);
      } catch {
        setParsedContent({});
      }
    }
  }, [inputContent]);

  const flattenJson = (obj, parentKey = "", result = {}) => {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = parentKey ? `${parentKey}.${key}` : key;

        if (typeof obj[key] === "object" && obj[key] !== null) {
          if (Array.isArray(obj[key])) {
            // Handle arrays by iterating through each item
            obj[key].forEach((item, index) => {
              const arrayKey = `${newKey}[${index}]`; // Create a unique key for each array item
              if (typeof item === "object" && item !== null) {
                // Recursively flatten nested objects within the array
                flattenJson(item, arrayKey, result);
              } else {
                // Primitive value in the array
                result[arrayKey] = item;
              }
            });
          } else {
            // Recursively flatten nested objects
            flattenJson(obj[key], newKey, result);
          }
        } else {
          // Primitive value (string, number, boolean)
          result[newKey] = obj[key];
        }
      }
    }
    return result;
  };

  const copyToClipboard = (key, text, formData, setFormData) => {
    return navigator.clipboard
      .writeText(text)
      .then(() => {
        // Find matching API key (case-sensitive)
        const matchedIndex = formData.fields.findIndex((apiKey) => apiKey.identifier === key);
        if (matchedIndex !== -1) {
          const updatedApiKeys = [...formData.fields];
          updatedApiKeys[matchedIndex] = {
            ...updatedApiKeys[matchedIndex],
            path: typeof text === "string" ? text : JSON.stringify(text),
          };
          setFormData((prev) => ({
            ...prev,
            fields: updatedApiKeys,
          }));
        } else {
          // Create a new field entry if the key doesn't exist
          const newField = {
            identifier: key,
            datatype: "",
            contentType: "",
            path: typeof text === "string" ? text : JSON.stringify(text),
            keyStatus: "Custom",
          };
          setFormData((prev) => ({
            ...prev,
            fields: [...prev.fields, newField],
          }));
        }
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };
  const [isEditMode, setIsEditMode] = useState(false); // To track if in edit mode
  const [currentEditRow, setCurrentEditRow] = useState(null); // To store data of the row being edited
  // const { token } = useAuth();
  const handleApiKeyChange = (e, index, field) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      fields: prevFormData.fields.map((key, i) =>
        i === index ? { ...key, [field]: e.target.value } : key
      ),
    }));
  };
  const getDatatypeForConnection = (connectionType) => {
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
        return "";
    }
  };

  const addApiKey = () => {
    setFormData({
      ...formData,
      fields: [
        ...formData.fields,
        {
          identifier: "",
          datatype: getDatatypeForConnection(formData.connectionType),
          contentType: "",
          keyStatus: "Custom",
          path: "",
        },
      ],
    });
  };

  // Remove an API key
  const handleDeleteClick = (index) => {
    setDeleteConfirmation({ open: true, index });
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation({ open: false, index: null });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation.index !== null) {
      const updatedKeys = formData.fields.filter((_, i) => i !== deleteConfirmation.index);
      setFormData({ ...formData, fields: updatedKeys });
    }
    setDeleteConfirmation({ open: false, index: null });
  };

  // Fetch the API list on component mount
  useEffect(() => {
    const fetchApiList = async () => {
      try {
        const response = await fetch("https://172.20.150.10:8098/smartlogger/connection/getAll", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          console.error("401 Unauthorized: Invalid AuthToken");
          showSnackbar("401 Unauthorized:ACCESS DENIED.", "error");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch connection names.");
        }

        const data = await response.json();
        setApiList(data);
      } catch (error) {
        showSnackbar("Failed to fetch connection names. Please try again.", "error");
      }
    };

    fetchApiList();
  }, [token]);

  // Fetch configuration data for the table
  const fetchConfigData = async () => {
    try {
      const response = await fetch("https://172.20.150.10:8098/smartlogger/config/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        // Handle unauthorized access
        showSnackbar("401 Unauthorized:ACCESS DENIED.", "error");
        return; // Exit the function early
      }

      if (!response.ok) {
        // Generic error handling for non-200 responses
        throw new Error(`Failed to fetch configuration data: ${response.status}`);
      }

      const data = await response.json();
      setConfigData(data || []); // Set the raw data directly to the table
    } catch (error) {
      console.error("Error fetching configuration data:", error);
      showSnackbar("Failed to fetch configuration data: " + error.message, "error");
    }
  };

  // Fetch initial config data on component mount
  useEffect(() => {
    fetchConfigData();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRoleChange = (event) => {
    setFormData({
      ...formData,
      roleNames: Array.isArray(event.target.value) ? event.target.value : [], // ✅ Ensure it's an array
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const dataToSend = {
      apiName: formData.apiName,
      resourcePath: formData.resourcePath,
      connectionName: formData.connectionName,
      dataset: formData.dataset,
      status: formData.status,

      roleNames: formData.roleNames,
      fields: formData.fields,
      // ...(isEditMode && { id: currentEditRow?.id}),
    };
    const endpoint = isEditMode
      ? `https://172.20.150.10:8098/smartlogger/config/${currentEditRow?.uniqueId}`
      : "https://172.20.150.10:8098/smartlogger/config/save";

    try {
      // const username = "Administrator";
      // const password = "manageaudit";
      // const encodedCredentials = btoa(`${username}:${password}`);

      const response = await fetch(endpoint, {
        method: isEditMode ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      console.log("Payload being sent:", dataToSend); // Debugging

      if (response.ok) {
        showSnackbar(
          isEditMode ? "Config updated successfully!" : "Config submitted successfully!",
          "success"
        );
        setFormData(initialFormData);
        setOpenDialog(false); // Close the modal

        fetchConfigData(); // Refresh the data
      } else if (response.status === 401) {
        console.error("401 Unauthorized: Invalid AuthToken");
        showSnackbar("401 Unauthorized:ACCESS DENIED", "error");
      } else {
        const errorDetails = await response.text();
        console.error("API Error Response:", errorDetails); // Detailed error logging
        showSnackbar("Error submitting configuration data.", "error");
      }
    } catch (error) {
      console.error("Error:", error); // Detailed error logging
      showSnackbar("Error submitting config: ", "error");
    } finally {
      setIsSubmitting(false);
      setIsEditMode(false); // Reset edit mode after submission
    }
  };

  const getFieldLabel = (connectionType) => {
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
        return "Field";
    }
  };

  const getDatasetLabel = () => {
    switch (formData.connectionType) {
      case "elasticsearch":
        return "Index";
      case "kafka":
        return "Topic";
      case "database":
        return "Table";
      case "wmapigateway":
        return "Index";
      default:
        return "Dataset";
    }
  };

  const handleEditClick = (row) => {
    console.log("Row Data in handleEditClick:", row); // Debugging - Check if row contains id

    setIsEditMode(true); // Open edit mode
    setCurrentEditRow(row); // Store row data
    const connection = apiList.find((api) => api.connectionName === row.connectionName);

    setFormData({
      apiName: row.apiName || "",
      resourcePath: row.resourcePath || "",
      connectionName: row.connectionName || "",
      connectionType: connection ? connection.connectionType : "", // Derived connectionType

      dataset: row.dataset || "",
      status: row.status, // Keep status as boolean (true/false)
      roleNames: Array.isArray(row.roleNames) ? row.roleNames : [],
      fields: Array.isArray(row.fields)
        ? row.fields.map((key) => ({
            identifier: key.identifier || "",
            field: key.field || "",
            datatype: key.datatype || "",
            contentType: key.contentType || "",
            path: key.path || "",
            keyStatus: key.keyStatus || "",
          }))
        : typeof row.fields === "string"
          ? JSON.parse(row.fields).map((key) => ({
              identifier: key.identifier || "",
              field: key.field || "",
              datatype: key.datatype || "",
              contentType: key.contentType || "",
              path: key.path || "",
              keyStatus: key.keyStatus || "",
            }))
          : initialFormData.fields,
    });

    setOpenDialog(true); // Open the modal
  };

  const handleConnectionNameChange = (e) => {
    const selectedName = e.target.value;

    // Find the connection object based on the selected connection name.
    const connection = apiList.find((api) => api.connectionName === selectedName);
    const connectionType = connection ? connection.connectionType : "";

    // Extract fields from the details object of the selected connection
    const fields = connection?.details?.fields || [];

    // Determine the dataset value based on the connection type
    let dataset = "";
    if (connectionType === "database") {
      dataset = connection?.details?.tableName || "";
    } else if (connectionType === "kafka") {
      dataset = connection?.details?.topic || "";
    } else if (connectionType === "elasticsearch") {
      dataset = connection?.details?.dataset || "";
    } else if (connectionType === "wmapigateway") {
      dataset = connection?.details?.dataset || "";
    }

    // Update each field's datatype dynamically based on connection type.
    const updatedFields = fields.map((field) => ({
      identifier: field.identifier || "",
      field: field.field || "",
      datatype: getDatatypeForConnection(connectionType),
      contentType: field.contentType || "",
      path: field.path || "",
      keyStatus: field.keyStatus || "",
    }));

    setFormData({
      ...formData,
      connectionName: selectedName,
      connectionType,
      dataset, // Populate the dataset value
      fields: updatedFields,
    });
  };

  const handleDialogOpen = () => {
    setIsEditMode(false); // Reset edit mode
    setCurrentEditRow(null); // Clear the current edit row
    setFormData(initialFormData); // Reset the form data to its initial state
    setOpenDialog(true); // Open the dialog
  };
  const handleDialogClose = () => {
    setIsEditMode(false); // Reset edit mode
    setCurrentEditRow(null); // Clear the current edit row
    setFormData(initialFormData); // Reset the form data
    setOpenDialog(false); // Close the dialog
    setInputContent("");
  };

  const getPathLabel = (connectionType) => {
    switch (connectionType) {
      case "database":
        return "Query";
      default:
        return "Path";
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <MDBox mb={3} display="flex" justifyContent="space-between" alignItems="center">
          <MDBox>
            <MDTypography variant="h5" fontWeight="medium">
              API Configuration
            </MDTypography>
            <MDTypography variant="button" color="text">
              Existing API Configurations: View & Manage Configuration
            </MDTypography>
          </MDBox>

          {/* Create API Button */}
          <MDButton
            variant="gradient"
            color="info"
            onClick={handleDialogOpen}
            sx={{ alignSelf: "flex-start" }}
          >
            Create New API Config
          </MDButton>
        </MDBox>

        <Card>
          <MDBox p={3} lineHeight={1}>
            {/* Pass the fetched configData to the DataTable */}
            <DataTable
              table={{
                columns: [
                  { Header: "API Name", accessor: "apiName" },
                  { Header: "Resource Path", accessor: "resourcePath" },
                  { Header: "Datasource Name", accessor: "connectionName" },
                  {
                    Header: "Role",
                    accessor: "roleNames",
                    Cell: ({ cell: { value } }) =>
                      Array.isArray(value) ? value.join(", ") : value,
                  },
                  {
                    Header: "Status",
                    accessor: "status",
                    // Custom sort function: "enabled" is treated as 1 and "disabled" as 0.
                    sortType: (rowA, rowB, columnId) => {
                      const statusA = rowA.values[columnId] === "enabled" ? 1 : 0;
                      const statusB = rowB.values[columnId] === "enabled" ? 1 : 0;
                      return statusA - statusB;
                    },
                    Cell: ({ row }) => {
                      const isEnabled = row.original.status === "enabled";
                      return (
                        <Tooltip title={isEnabled ? "Disable" : "Enable"}>
                          <IconButton
                            onClick={() => handleEditClick(row.original)}
                            sx={{
                              fontSize: 32,
                              color: isEnabled ? "green" : "red",
                              transition: "all 0.3s ease-in-out",
                              "&:hover": {
                                transform: "scale(1.2)",
                                color: isEnabled ? "#388e3c" : "#d32f2f",
                              },
                            }}
                          >
                            {isEnabled ? (
                              <ToggleOnIcon fontSize="large" />
                            ) : (
                              <ToggleOffIcon fontSize="large" />
                            )}
                          </IconButton>
                        </Tooltip>
                      );
                    },
                  },

                  {
                    Header: "Edit Data",
                    accessor: "edit",
                    Cell: ({ row }) => (
                      <Tooltip title="Edit Data">
                        <IconButton color="primary" onClick={() => handleEditClick(row.original)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    ),
                  },
                ],
                rows: configData, // Dynamically populate the rows with the fetched data
              }}
            />
          </MDBox>
        </Card>
      </MDBox>

      {/* Dialog (Popup Form) */}
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="xl" fullWidth>
        <DialogTitle>{isEditMode ? "Edit API Configuration" : "Add API Configuration"}</DialogTitle>
        <DialogContent>
          <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
            {/* Left: Form */}
            <div style={{ flex: 2 }}>
              <form onSubmit={handleSubmit}>
                <TextField
                  label="Datasource Name"
                  variant="outlined"
                  select
                  fullWidth
                  name="connectionName"
                  value={formData.connectionName}
                  onChange={handleConnectionNameChange} // use the custom handler below
                  SelectProps={{ native: true }}
                  required
                  style={{ marginBottom: 20 }}
                  InputLabelProps={{ shrink: true }}
                >
                  <option value="">Select Datasource Name</option>
                  {apiList.map((api) => (
                    <option key={api.uniqueId} value={api.connectionName}>
                      {api.connectionName}
                    </option>
                  ))}
                </TextField>

                {/* User-input API Name */}

                <TextField
                  label={getDatasetLabel()}
                  variant="outlined"
                  fullWidth
                  name="dataset" // or use a static key like "dataset" if preferred
                  value={formData.dataset}
                  onChange={(e) => setFormData({ ...formData, dataset: e.target.value })}
                  style={{ marginBottom: 20 }}
                  required
                />

                <TextField
                  label="Status"
                  variant="outlined"
                  fullWidth
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={{ marginBottom: 20 }}
                  required
                  select
                  SelectProps={{ native: true }}
                >
                  {[
                    { label: "Disabled", value: "disabled" },
                    { label: "Enabled", value: "enabled" },
                  ].map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </TextField>

                <TextField
                  label="API Name"
                  variant="outlined"
                  fullWidth
                  name="apiName"
                  value={formData.apiName}
                  onChange={handleChange}
                  style={{ marginBottom: 20 }}
                  required
                />
                <TextField
                  label="Resource Path"
                  variant="outlined"
                  fullWidth
                  name="resourcePath"
                  value={formData.resourcePath}
                  onChange={handleChange}
                  style={{ marginBottom: 20 }}
                  required
                />

                <FormControl variant="outlined" fullWidth style={{ marginBottom: 20 }}>
                  <InputLabel id="role-names-label">Role Names</InputLabel>
                  <Select
                    labelId="role-names-label"
                    label="Role Names"
                    multiple
                    style={{ minHeight: "36px", padding: "10px" }}
                    value={Array.isArray(formData.roleNames) ? formData.roleNames : []}
                    onChange={handleRoleChange}
                    renderValue={(selected) => (Array.isArray(selected) ? selected.join(", ") : "")}
                  >
                    {roleNames.map((role) => (
                      <MenuItem key={role.id} value={role.name}>
                        {role.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* API Keys Section */}
                <div style={{ marginBottom: 0 }}>
                  <h3>API Keys</h3>
                  {formData.fields.map((field, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "10px",
                      }}
                    >
                      <TextField
                        label={getFieldLabel(formData.connectionType)}
                        variant="outlined"
                        name={getFieldLabel(formData.connectionType)}
                        value={field.field}
                        onChange={(e) => handleApiKeyChange(e, index, "field")}
                        style={{ flex: 2, padding: 2 }}
                        required
                        disabled={index < 8}
                      />

                      <TextField
                        label="identifier"
                        variant="outlined"
                        name={`identifier-${index}`}
                        value={field.identifier || ""}
                        onChange={(e) => handleApiKeyChange(e, index, "identifier")}
                        style={{ flex: 1 }}
                        required
                      />

                      <TextField
                        label="contentType"
                        variant="outlined"
                        value={field.contentType}
                        onChange={(e) => handleApiKeyChange(e, index, "contentType")}
                        select
                        SelectProps={{ native: true }}
                        style={{ flex: 1 }} // Added flex property for consistent width
                        fullWidth // Optionally, add fullWidth if needed
                      >
                        <option value=""></option>
                        <option value="Value">Value</option>
                        <option value="JSON">JSON</option>
                        <option value="XML">XML</option>
                        <option value="date">Date</option>
                        <option value="epoc">Epoc</option>
                      </TextField>

                      {/* <TextField
                        label="keyStatus"
                        variant="outlined"
                        name={`path-${index}`}
                        value={key.keyStatus}
                        onChange={(e) => handleApiKeyChange(e, index, "keyStatus")}
                        style={{ flex: 2 }}
                        required
                      /> */}

                      <TextField
                        label={getPathLabel(formData.connectionType)} // Dynamically set the label
                        variant="outlined"
                        name={`path-${index}`}
                        value={field.path}
                        onChange={(e) => handleApiKeyChange(e, index, "path")}
                        style={{ flex: 2 }}
                        required
                        // Embed the delete icon inside the TextField itself as an end adornment
                        InputProps={{
                          endAdornment:
                            index >= 8 ? (
                              <InputAdornment position="end">
                                <IconButton onClick={() => handleDeleteClick(index)} edge="end">
                                  <DeleteIcon />
                                </IconButton>
                              </InputAdornment>
                            ) : null,
                        }}
                      />
                    </div>
                  ))}

                  {/* <TextField
                        label="Condition"
                        variant="outlined"
                        name={`condition-${index}`}
                        value={key.condition || ""}
                        onChange={(e) => handleApiKeyChange(e, index, "condition")}
                        style={{ flex: 1 }}
                      /> */}

                  <MDButton variant="outlined" color="primary" onClick={addApiKey}>
                    Add Custom Keys
                  </MDButton>
                </div>

                {/* Submit Button */}
                <DialogActions>
                  <MDButton
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : isEditMode ? "Save Changes" : "Submit"}
                  </MDButton>
                  <MDButton variant="outlined" color="secondary" onClick={handleDialogClose}>
                    Cancel
                  </MDButton>
                </DialogActions>
              </form>
            </div>

            <div style={{ flex: 1, position: "relative" }}>
              {/* Title Section with Edit Button */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <h3 style={{ margin: 0 }}>JSON/XML Editor</h3>

                {Object.keys(parsedContent).length > 0 && (
                  <IconButton
                    aria-label="edit"
                    onClick={() => setParsedContent({})}
                    size="small"
                    style={{
                      marginLeft: "8px",
                      backgroundColor: "#f5f5f5",
                      "&:hover": {
                        backgroundColor: "#eeeeee",
                      },
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                )}
              </div>

              <div style={{ position: "relative" }}>
                {/* Textarea (always present but can be hidden behind) */}
                <textarea
                  style={{
                    width: "100%",
                    height: "700px",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontFamily: "monospace",
                    position: "relative",
                    zIndex: 1,
                    transition: "opacity 0.2s",
                    opacity: Object.keys(parsedContent).length > 0 ? 0 : 1,
                  }}
                  placeholder="Paste your JSON or XML here..."
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  spellCheck="false"
                  autoCorrect="off"
                  autoCapitalize="off"
                />

                {/* Parsed content overlay */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: "10px",
                    backgroundColor: "white",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    overflowY: "auto",
                    opacity: Object.keys(parsedContent).length > 0 ? 1 : 0,
                    pointerEvents: Object.keys(parsedContent).length > 0 ? "auto" : "none",
                    transition: "opacity 0.2s",
                    zIndex: 2,
                  }}
                >
                  {Object.keys(parsedContent).length > 0 ? (
                    Object.entries(parsedContent).map(([key, value], index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "5px 0",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        <span style={{ flex: 1 }}>
                          <b>{key}</b>: {typeof value === "object" ? JSON.stringify(value) : value}
                        </span>
                        <IconButton
                          onClick={() => {
                            const textToCopy =
                              typeof value === "object" ? JSON.stringify(value) : value;
                            copyToClipboard(key, textToCopy, formData, setFormData).then(() => {
                              // Update only the clicked row to show the tick
                              setCopiedRow((prev) => ({ ...prev, [key]: true }));
                              // Reset after 2 seconds
                              setTimeout(() => {
                                setCopiedRow((prev) => ({ ...prev, [key]: false }));
                              }, 2000);
                            });
                          }}
                          style={{ padding: "4px", marginLeft: "8px" }}
                        >
                          {copiedRow[key] ? (
                            <Check fontSize="small" />
                          ) : (
                            <ContentCopy fontSize="small" />
                          )}
                        </IconButton>

                        {copiedRow[key] && (
                          <MDTypography variant="caption" style={{ marginLeft: 4 }}>
                            Copied!
                          </MDTypography>
                        )}
                      </div>
                    ))
                  ) : (
                    <div
                      style={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span style={{ color: "#999" }}>
                        Paste valid JSON/XML to view and copy values
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={deleteConfirmation.open}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Delete API Key?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this API key path? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleCancelDelete}>Cancel</MDButton>
          <MDButton onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </MDButton>
        </DialogActions>
      </Dialog>
      <Footer />
    </DashboardLayout>
  );
}

export default SmartConfig;
