import React, { useState } from "react";
import PropTypes from "prop-types";
import { FilterList } from "@mui/icons-material";
import MDBox from "components/MDBox";
import FilterDropdown from "./FilterDropdown";

// import EmailIcon from "@mui/icons-material/Email";
// import PagerDutyLogo from "../../../../assets/images/pagerduty.png";
// import OpsgenieLogo from "../../../../assets/images/opsgenie.png";
// import SlackLogo from "../../../../assets/images/slack.png";
// import SmsLogo from "../../../../assets/images/sms.png";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

const TopBar = ({ onSearchChange, onStatusChange }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedPriority, setSelectedPriority] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearchChange(value);
  };

  const handleStatusChange = (selectedStatuses) => {
    setSelectedStatus(selectedStatuses);
    onStatusChange(selectedStatuses);
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const handleMenuOpen = (label) => {
    setActiveMenu(label); // Set active menu to highlight it
  };

  const handleMenuClose = () => {
    setActiveMenu(null); // Reset the active menu when closed
  };

  return (
    <MDBox
      display="flex"
      // mb={2}
      style={{ backgroundColor: "#E3E6EA", padding: "5px", borderRadius: "10px" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          border: isFocused ? "2px solid #1976d2" : "none",
          borderRadius: "10px",
          padding: "6px",
          //width: "700px",
          //transition: "width 0.3s ease", // Smooth transition for text input resizing
          flex: 2, // Allow this container to shrink and grow
        }}
      >
        <FilterList style={{ marginRight: "10px", fontSize: "35px" }} />
        <input
          type="text"
          placeholder="Filter by keyword..."
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{
            padding: "1px",
            fontSize: "14px",
            backgroundColor: "transparent",
            border: "none",
            outline: "none",
            width: "100%", // Ensure the input takes the available space
            // flex: 1,
            // transition: "flex 0.3s ease", // Smooth transition for input resizing
          }}
        />
      </div>
      <MDBox display="flex" gap="15px" style={{ overflow: "hidden" }}>
        {/* <FilterDropdown
          label={
            selectedStatus.length > 0
              ? selectedStatus.length === 1
                ? selectedStatus[0] // Show only the selected status if there's just one
                : `${selectedStatus[0]} (+${selectedStatus.length - 1})` // Show the first selected status and count of additional selections
              : "Status" // Default label
          }
          menuItems={[
            { label: "ACTIVE", icon: <CheckIcon color="success" /> },
            { label: "INACTIVE", icon: <CloseIcon color="error" /> },
          ]}
          selectedItems={selectedStatus}
          onSelectionChange={handleStatusChange}
          isActive={activeMenu === "Status"}
          onMenuOpen={handleMenuOpen}
          onMenuClose={handleMenuClose}
          style={{
            flex: "1 1 auto", // Allow it to shrink
            whiteSpace: "nowrap", // Prevent wrapping
            overflow: "hidden", // Hide overflow
            textOverflow: "ellipsis", // Indicate overflow
          }}
        /> */}
      </MDBox>
    </MDBox>
  );
};

TopBar.propTypes = {
  onSearchChange: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onPriorityChange: PropTypes.func.isRequired,
  onChannelChange: PropTypes.func.isRequired,
};

export default TopBar;
