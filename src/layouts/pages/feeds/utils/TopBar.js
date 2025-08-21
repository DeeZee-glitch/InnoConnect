import React, { useState } from "react";
import PropTypes from "prop-types";
import { Check, Close, FilterList } from "@mui/icons-material";
import MDBox from "components/MDBox";
import FilterDropdown from "./FilterDropdown";

const TopBar = ({ onSearchChange, onStatusChange }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearchChange(value); // Pass the search query to the parent component
  };

  const handleStatusChange = (selectedStatuses) => {
    setSelectedStatus(selectedStatuses);
    onStatusChange(selectedStatuses); // Pass the selected status to the parent component
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
      style={{ backgroundColor: "#E3E6EA", padding: "5px", borderRadius: "10px" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          border: isFocused ? "2px solid #1976d2" : "none",
          borderRadius: "10px",
          padding: "6px",
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
          }}
        />
      </div>
      <MDBox display="flex" gap="15px" style={{ overflow: "hidden" }}>
        <FilterDropdown
          label={
            selectedStatus.length > 0
              ? selectedStatus.length === 1
                ? selectedStatus[0]
                : `${selectedStatus[0]} (+${selectedStatus.length - 1})`
              : "Status"
          }
          menuItems={[
            {
              label: "ACTIVE",
              icon: <Check style={{ color: "green" }} />,
            },
            {
              label: "INACTIVE",
              icon: <Close />,
            },
          ]}
          selectedItems={selectedStatus}
          onSelectionChange={handleStatusChange}
          isActive={activeMenu === "Status"}
          onMenuOpen={handleMenuOpen}
          onMenuClose={handleMenuClose}
          style={{
            flex: "1 1 auto",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        />
      </MDBox>
    </MDBox>
  );
};

TopBar.propTypes = {
  onSearchChange: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
};

export default TopBar;
