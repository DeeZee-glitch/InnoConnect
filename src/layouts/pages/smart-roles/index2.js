/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
import { useEffect, useState } from "react";

// @mui material components
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
// import FormControl from "@mui/material/FormControl";
// import FormControlLabel from "@mui/material/FormControlLabel";
// import FormLabel from "@mui/material/FormLabel";
// import RadioGroup from "@mui/material/RadioGroup";
// import Radio from "@mui/material/Radio";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import EditIcon from "@mui/icons-material/Edit";
import {
  Checkbox,
  Divider,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Snackbar,
  Tooltip,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon, // <-- Add this line
} from "@mui/icons-material";

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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
// import { ArrowRightIcon } from "@mui/x-date-pickers";
// import CloseIcon from "@mui/icons-material/Close";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";

function SmartRoles() {
  const token = getToken();
  const initialFormData = {
    composite: null,
    clientRole: null,
    name: "",
    description: "",
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
  const [searchQuery, setSearchQuery] = useState(null); // For searching users
  const [searchResults, setSearchResults] = useState([]); // Search result list
  const [selectedUser, setSelectedUser] = useState(null); // Selected user for assignment
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // Add state for Delete dialog visibility
  // Adding a state to store users assigned to a role
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [openUsersDialog, setOpenUsersDialog] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  // Fetch users assigned to a role
  const fetchAssignedUsers = async (roleName) => {
    try {
      const response = await fetch(
        // `https://172.20.150.134:9898/admin/realms/SmartLogger/roles/${roleName}/users`, // Update with correct API
        `https://172.20.150.10:8098/smartlogger/roles/getUserByRole/${roleName}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAssignedUsers(data);
      } else {
        showSnackbar("Failed to fetch assigned users.", "error");
      }
    } catch (error) {
      showSnackbar("Error fetching assigned users.", "error");
    }
  };

  // Handle the "View Users" click event
  const handleViewUsersClick = (role) => {
    setCurrentRole(role);
    fetchAssignedUsers(role.name);
    setOpenUsersDialog(true);
  };

  // Close the "View Users" dialog
  const handleCloseUsersDialog = () => {
    setOpenUsersDialog(false);
    setAssignedUsers([]);
    setCurrentRole(null);
  };

  // Fetch user details based on search query
  const handleSearch = async () => {
    if (!searchQuery) return; // Don't send request if searchQuery is empty

    try {
      // Update the URL to use the correct endpoint and query parameter
      const response = await fetch(
        `https://172.20.150.10:8098/smartlogger/roles/users/search?username=${encodeURIComponent(searchQuery)}`,
        {
          method: "GET", // Use GET for search requests
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Bearer token for authentication
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data); // Assuming data is the list of users returned by the API
      } else {
        showSnackbar("Error fetching search results.", "error");
      }
    } catch (error) {
      showSnackbar("Error fetching search results.", "error");
    }
  };

  // excluding the roles
  const excludedRoles = ["offline_access", "uma_authorization", "default-roles-smartlogger"];
  // Filter out default roles
  const filteredRoles = configData.filter((role) => !excludedRoles.includes(role.name));

  // Fetch roles data for the table
  const fetchConfigData = async () => {
    try {
      const response = await fetch("https://172.20.150.10:8098/smartlogger/roles/get", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched roles data:", data); // Log to verify the data structure
        setConfigData(data || []); // Ensure it's always an array
      } else if (response.status === 401) {
        // Handle 401 Unauthorized
        console.error("Unauthorized access - Token might be expired or invalid.");
        showSnackbar("401 Unauthorized: ACCESS DENIED.", "error"); // Show error snackbar
        setConfigData([]); // Reset to empty array on unauthorized error
      } else {
        throw new Error("Failed to fetch roles.");
      }
    } catch (error) {
      console.error("Error:", error.message);
      showSnackbar("Failed to fetch roles. Please try again.", "error"); // Show general error snackbar
      setConfigData([]); // Reset to empty array on general error
    }
  };

  // Fetch roles when the component mounts
  useEffect(() => {
    fetchConfigData();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "searchQuery") {
      setSearchQuery(value);
      fetchUserByQuery(value); // Fetch users as search query is updated
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleAssignUserClick = (role) => {
    setSelectedRole(role);
    setOpenAssignDialog(true);
  };

  const handleAssignDialogClose = () => {
    setOpenAssignDialog(false); // Close the "Assign User" dialog
    setSelectedUser(null); // Optionally clear the selected user state
    setSearchQuery(""); // Optionally clear the search query
    setSearchResults([]); // Optionally clear the search results
  };

  const handleAssignUser = async () => {
    if (!selectedUser || !selectedRole) return;

    // const realmName = "SmartLogger"; // The realm name
    const userId = selectedUser.id; // The selected user's ID
    const roleName = selectedRole.name; // The selected role name to assign

    try {
      const response = await fetch(
        `https://172.20.150.10:8098/smartlogger/roles/${userId}/assign/${roleName}`,
        {
          method: "POST", // POST request to assign the role
          headers: {
            "Content-Type": "application/json", // Request body format
            Authorization: `Bearer ${token}`, // Authorization header with Bearer token
          },
          body: JSON.stringify([
            {
              name: roleName, // Role name wrapped inside an object with "name" property
            },
          ]),
        }
      );

      if (response.ok) {
        showSnackbar("User assigned successfully!", "success");
        // Close the Assign User dialog
        handleAssignDialogClose();
      } else {
        showSnackbar("Error assigning user to role.", "error");
      }
    } catch (error) {
      showSnackbar("Error assigning user to role.", "error");
    }
  };

  const handleUserSelect = (user) => {
    // Only update the selected user and form state without triggering the API call
    setSelectedUser(user);
    setFormData({ ...formData, username: user.username });
    setSearchQuery(user.username); // Optionally set the query to the selected user's username
    setSearchResults([]); // Clear any search results
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    let dataToSend = {};

    dataToSend = {
      name: formData.name,
      description: formData.description,
    };

    // Define the correct API endpoint
    let apiUrl = `https://172.20.150.10:8098/smartlogger/roles/create`;

    let method = isEditMode ? "PUT" : "POST"; // Use PUT if in edit mode, otherwise POST
    if (isEditMode && currentEditRow && currentEditRow.name) {
      apiUrl = `https://172.20.150.10:8098/smartlogger/roles/updateRole/${encodeURIComponent(currentEditRow.name)}`; // Append uniqueId for PATCH requests
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
        showSnackbar(isEditMode ? "Role updated successfully!" : "Role created successfully!");
        setFormData(initialFormData); // Reset the form to its initial state
        setOpenDialog(false); // Close the modal after successful submit
        fetchConfigData(); // Re-fetch the roles data to reflect the latest data
      } else if (response.status === 401) {
        console.error("401 Unauthorized: Invalid AuthToken");
        showSnackbar("401 Unauthorized: ACCESS DENIED", "error");
      } else if (response.status === 500) {
        showSnackbar("Error submitting role.", "error");
      } else {
        showSnackbar(isEditMode ? "Error updating role." : "Error creating role.");
      }
    } catch (error) {
      showSnackbar(isEditMode ? "Error updating role." : "Error submitting role.");
    }

    setIsSubmitting(false);
  };

  const handleEditClick = (row) => {
    if (!row || !row.original) {
      console.error("Row data or original data is undefined.");
      return;
    }

    const rowData = row.original; // This should contain the role info

    // Prepopulate form data for editing
    setFormData({
      name: rowData.name || "",
      description: rowData.description || "",
      clientRole: rowData.clientRole || null,
      composite: rowData.composite || null,
    });

    setIsEditMode(true); // Set edit mode to true
    setCurrentEditRow(rowData); // Store the current row being edited
    setSelectedUser(null);
    setOpenDialog(true); // Open the modal for editing
  };

  const handleDelete = (row) => {
    if (!row.containerId || !row.name) {
      showSnackbar("Invalid entry selected for deletion.", "error");
      return;
    }

    // Set the row to be deleted and show confirmation dialog
    setDeleteRow(row);
    setOpenDeleteDialog(true); // Ensure the delete confirmation dialog is opened
  };

  const handleDeleteConfirm = async () => {
    if (!deleteRow) return;

    // API call for deletion of role
    let apiUrl = `https://172.20.150.10:8098/smartlogger/roles/delete/${deleteRow.name}`;
    try {
      const response = await fetch(apiUrl, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        showSnackbar("Role deleted successfully!", "success");
        fetchConfigData(); // Refresh table data after deletion
      } else {
        showSnackbar("Failed to delete role.", "error");
      }
    } catch (error) {
      showSnackbar("Error deleting role.", "error");
    }

    // Close the dialog and reset state
    setOpenDeleteDialog(false);
    setDeleteRow(null);
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false); // Close dialog without deleting
  };

  const handleDialogOpen = () => {
    setIsEditMode(false); // Reset edit mode
    setCurrentEditRow(null); // Clear the current edit row
    setFormData(initialFormData); // Reset form data
    setSelectedUser(null); // Ensure no user is selected
    setSearchQuery(""); // Clear the search query
    setSearchResults([]); // Clear any previous search results
    setOpenDialog(true); // Open the dialog
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={8} pb={3}>
        <Card>
          {/* Title and Create Button inside Card Header */}
          <MDBox p={3} display="flex" justifyContent="space-between" alignItems="center">
            <MDBox>
              <MDTypography variant="h5" fontWeight="medium">
                View & Manage Roles
              </MDTypography>
              <MDTypography variant="button" color="text">
                Existing Roles: View Roles, Status, Activity & Management
              </MDTypography>
            </MDBox>

            {/* Create User Button */}
            <MDButton
              variant="gradient"
              color="info"
              onClick={handleDialogOpen}
              sx={{ alignSelf: "flex-start" }}
            >
              Create New Role
            </MDButton>
          </MDBox>

          <Divider
            sx={{
              opacity: 1,
              transition: "opacity 0.5s ease", // Smooth transition for opacity
              margin: 0,
            }}
          />

          {/* DataTable */}
          <MDBox p={2} lineHeight={1}>
            <DataTable
              table={{
                columns: [
                  { Header: "Role Name", accessor: "name" },
                  {
                    Header: "Description",
                    accessor: "description",
                    Cell: ({ value }) => <MDBox display="flex">{value === "" ? "-" : value}</MDBox>,
                  },
                  {
                    Header: "Actions",
                    accessor: "actions",
                    Cell: ({ row }) => (
                      <MDBox display="flex">
                        {/* Edit Button */}
                        <Tooltip title="Edit Role">
                          <IconButton
                            color="primary"
                            onClick={() => handleEditClick(row)}
                            disabled={excludedRoles.includes(row.original.name)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>

                        {/* Delete Button */}
                        <Tooltip title="Delete Role">
                          <IconButton
                            color="secondary"
                            onClick={() => handleDelete(row.original)}
                            disabled={excludedRoles.includes(row.original.name)}
                          >
                            <DeleteForeverRoundedIcon />
                          </IconButton>
                        </Tooltip>
                        {/* View Users Button */}
                        <Tooltip title="View Assigned Users">
                          <IconButton
                            color="success"
                            onClick={() => handleViewUsersClick(row.original)}
                            disabled={excludedRoles.includes(row.original.name)}
                          >
                            <PeopleAltIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Assign User to Role">
                          <IconButton
                            color="info"
                            onClick={() => handleAssignUserClick(row.original)}
                            aria-label="Assign User"
                          >
                            <PersonAddIcon />
                          </IconButton>
                        </Tooltip>
                      </MDBox>
                    ),
                  },
                ],
                rows: filteredRoles || [],
              }}
            />
          </MDBox>
        </Card>

        {/* Space between card and footer */}
        <MDBox mt={3} />

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDeleteDialog} onClose={handleDeleteCancel}>
          <DialogTitle>Confirm Role Deletion</DialogTitle>
          <DialogContent>
            <MDTypography variant="h7">
              Are you sure you want to delete the role <strong>{deleteRow?.name}</strong>?
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

        {/* Assigned users dialog box */}
        <Dialog open={openUsersDialog} onClose={handleCloseUsersDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            Users Assigned to <span style={{ color: "green" }}>{currentRole?.name}</span>
          </DialogTitle>
          <DialogContent>
            {assignedUsers.length > 0 ? (
              <MDBox display="flex" flexDirection="column" gap={2}>
                {assignedUsers.map((user) => (
                  <MDBox
                    key={user.id}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                      padding: 2,
                      borderRadius: 2,
                      boxShadow: 2,
                      backgroundColor: "#f9f9f9",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: "#e7f3ff",
                        boxShadow: 6,
                      },
                    }}
                  >
                    <MDBox display="flex" alignItems="center" gap={2}>
                      <AccountCircleIcon sx={{ fontSize: 40, color: "#4caf50" }} />
                      <MDTypography variant="h6" sx={{ fontWeight: "600", color: "#333" }}>
                        {user.username}
                      </MDTypography>
                    </MDBox>
                    <MDTypography variant="body2" sx={{ color: "#666" }}>
                      {user.email || "No email available"}
                    </MDTypography>
                  </MDBox>
                ))}
              </MDBox>
            ) : (
              <MDTypography variant="h6" sx={{ color: "#888", textAlign: "center" }}>
                No users assigned to {currentRole?.name}
              </MDTypography>
            )}
          </DialogContent>
          <DialogActions>
            <MDButton onClick={handleCloseUsersDialog} color="secondary">
              Close
            </MDButton>
          </DialogActions>
        </Dialog>

        {/* Role Form Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>{isEditMode ? `Edit ${formData.name} Role` : `Add Role`}</DialogTitle>
          <DialogContent sx={{ padding: "20px", minWidth: "570px" }}>
            <form style={{ marginTop: "5px" }}>
              <TextField
                label="Role Name"
                variant="outlined"
                fullWidth
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={{ marginBottom: 20 }}
                required
              />
              <TextField
                label="Description"
                variant="outlined"
                fullWidth
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                style={{ marginBottom: 20 }}
              />
            </form>
          </DialogContent>
          <DialogActions>
            <MDButton color="secondary" onClick={handleCloseDialog}>
              Cancel
            </MDButton>
            <MDButton
              color="primary"
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.name}
              variant="gradient"
            >
              {isEditMode ? "Update Role" : "Add Role"}
            </MDButton>
          </DialogActions>
        </Dialog>

        {/* Assign User Dialog */}
        <Dialog open={openAssignDialog} onClose={handleAssignDialogClose}>
          <DialogTitle>
            Assign User to <span style={{ color: "green" }}>{selectedRole?.name}</span>
          </DialogTitle>
          <DialogContent sx={{ padding: "20px", minWidth: "570px" }}>
            <TextField
              label="Search User"
              variant="outlined"
              fullWidth
              name="searchQuery"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch();
              }}
              style={{ marginBottom: 20, marginTop: 5 }}
            />
            {searchResults.length > 0 && (
              <div
                style={{
                  maxHeight: 200,
                  overflowY: "scroll",
                  border: "1px solid #ccc",
                  borderRadius: 8,
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  marginTop: 10,
                  backgroundColor: "#fff",
                }}
              >
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    style={{
                      padding: "4px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      borderBottom: "1px solid #f0f0f0",
                      backgroundColor: "#f9f9f9",
                      borderRadius: 8,
                      transition: "all 0.3s ease-in-out",
                    }}
                    onClick={() => handleUserSelect(user)}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e7f3ff")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f9f9f9")}
                  >
                    <div style={{ marginRight: 10 }}>
                      <AccountCircleIcon
                        style={{
                          width: 40,
                          height: 40,
                          color: "#888",
                        }}
                      />
                    </div>
                    <span style={{ fontWeight: "bold", color: "#333" }}>{user.username}</span>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <MDButton onClick={handleAssignDialogClose} color="secondary">
              Cancel
            </MDButton>
            <MDButton
              variant="contained"
              color="primary"
              onClick={handleAssignUser}
              disabled={!selectedUser || !selectedRole}
            >
              Assign User
            </MDButton>
          </DialogActions>
        </Dialog>

        {/* Footer with space above */}
        <Footer />
      </MDBox>
    </DashboardLayout>
  );
}

export default SmartRoles;
