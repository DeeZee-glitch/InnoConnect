import React, { useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ClearIcon from "@mui/icons-material/Clear";
import PropTypes from "prop-types";
import SearchIcon from "@mui/icons-material/Search";

const FilterDropdown = ({
  label,
  menuItems,
  selectedItems,
  onSelectionChange,
  isActive,
  onMenuOpen,
  onMenuClose,
  isChannelMenu, // New prop to differentiate the channel menu
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [checkboxState, setCheckboxState] = useState(
    menuItems.reduce((acc, item) => ({ ...acc, [item]: selectedItems.includes(item) }), {})
  );

  const [searchQuery, setSearchQuery] = useState("");

  const handleDropdownClick = (event) => {
    setAnchorEl(event.currentTarget);
    onMenuOpen(label); // Notify the parent that this menu is open
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
    onMenuClose();
  };

  const handleCheckboxToggle = (key) => {
    setCheckboxState((prevState) => {
      const newState = { ...prevState, [key]: !prevState[key] };
      const selectedItems = Object.keys(newState).filter((item) => newState[item]);
      onSelectionChange(selectedItems); // Pass the selected items to parent
      return newState;
    });
  };

  const clearCheckboxes = () => {
    setCheckboxState(menuItems.reduce((acc, item) => ({ ...acc, [item]: false }), {}));
    onSelectionChange([]); // Clear selected items in parent
  };

  const isAnySelected = Object.values(checkboxState).some((val) => val);

  // Filter menu items based on the search query
  const filteredMenuItems = isChannelMenu
    ? menuItems.filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : menuItems;

  return (
    <div style={{ position: "relative", cursor: "pointer" }}>
      <MDBox
        display="flex"
        alignItems="center"
        style={{
          padding: "5px 10px",
          borderRadius: "4px",
          cursor: "pointer",
          backgroundColor: isActive ? "#d4d6d8" : "transparent",
        }}
        onClick={handleDropdownClick}
        sx={{
          "&:hover": {
            backgroundColor: "#d4d6d8",
          },
        }}
      >
        <span style={{ fontSize: "14px", color: "#8F9193" }}>{label}</span>
        <KeyboardArrowDownIcon
          style={{
            fontSize: "20px",
            marginLeft: "8px",
            color: "#8F9193",
          }}
        />
      </MDBox>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleDropdownClose}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: 300,
            position: "absolute",
            righ: "0", // Position the dropdown to open from the right edge of the status box
            marginTop: "5px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden", // Hide the default scrollbar
          },
        }}
        anchorOrigin={{
          vertical: "bottom", // Align menu to the top of the anchor element
          horizontal: "right", // Align menu to the left of the anchor element
        }}
        transformOrigin={{
          vertical: "top", // The top of the menu aligns with the top of the anchor
          horizontal: "right", // The right side of the menu aligns with the left of the anchor
        }}
      >
        {isChannelMenu && (
          <div style={{ padding: "8px", display: "flex", alignItems: "center" }}>
            <div style={{ position: "relative", width: "100%" }}>
              {/* Input Field with Icon Inside */}
              <input
                type="text"
                placeholder="Search"
                style={{
                  width: "100%", // Make input field take full width
                  padding: "8px 10px 8px 30px", // Padding to make space for the icon inside
                  fontSize: "14px", // Text size
                  border: "2px solid #1976d2", // Border around the input
                  borderRadius: "4px", // Rounded corners for the input
                  boxShadow: "0px 0px 8px rgba(25, 118, 210, 0.3)",
                  outline: "none", // Remove outline on focus
                }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} // Handle search input
              />

              {/* Search Icon inside the Input Field */}
              <div
                style={{
                  position: "absolute",
                  left: "10px", // Position icon inside left side of the input field
                  top: "50%", // Move the icon vertically center
                  transform: "translateY(-40%)", // Vertically center the icon
                  fontSize: "18px", // Size of the icon
                  color: "#8F9193", // Icon color
                }}
              >
                <SearchIcon />
              </div>
            </div>
          </div>
        )}

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden", // Hide horizontal scrollbar
            maxHeight: "250px", // Define the scrollable height for items
            paddingRight: "10px", // Adding padding to make space for the invisible scrollbar
          }}
        >
          {filteredMenuItems.map(({ label, icon, color, image }, item) => {
            const sharedStyle = {
              marginRight: "8px", // Consistent spacing from the checkbox
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            };

            return (
              <MenuItem
                key={item}
                onClick={() => handleCheckboxToggle(label)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "4px 12px",
                  fontSize: "14px",
                }}
              >
                <Checkbox
                  checked={selectedItems.includes(label)}
                  style={{
                    padding: "4px", // Reduce checkbox padding
                    transform: "scale(0.8)", // Scale down checkbox size
                    marginRight: "6px", // Add space after the checkbox
                  }}
                />
                {/* Dot, Icon, or Image */}
                {color && (
                  <div
                    style={{
                      ...sharedStyle,
                      width: "10px", // Dot size
                      height: "10px",
                      backgroundColor: color,
                      borderRadius: "100%", // Circle shape
                    }}
                  />
                )}
                {image && (
                  <img
                    src={image}
                    alt={`${label} Logo`}
                    style={{
                      ...sharedStyle,
                      width: "20px", // Image size
                      height: "20px",
                    }}
                  />
                )}
                {icon && (
                  <div
                    style={{
                      ...sharedStyle,
                      color: "#DB4437",
                      fontSize: "20px", // Icon size
                    }}
                  >
                    {icon}
                  </div>
                )}
                <span style={{ flexGrow: 1 }}>{label}</span>
              </MenuItem>
            );
          })}
        </div>
        <div
          style={{
            borderTop: "1px solid #ccc", // Separator line
            backgroundColor: "white", // Matches the dropdown background
            padding: "4px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <MDButton
            variant="text"
            color="secondary"
            onClick={clearCheckboxes}
            style={{
              fontWeight: isAnySelected ? "bold" : "normal",
            }}
          >
            <ClearIcon style={{ marginRight: "5px" }} />
            Clear
          </MDButton>
        </div>
      </Menu>
    </div>
  );
};

FilterDropdown.propTypes = {
  label: PropTypes.string.isRequired,
  menuItems: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedItems: PropTypes.arrayOf(PropTypes.string),
  onSelectionChange: PropTypes.func.isRequired,
  isActive: PropTypes.bool.isRequired,
  onMenuOpen: PropTypes.func.isRequired,
  onMenuClose: PropTypes.func.isRequired,
  isChannelMenu: PropTypes.func.isRequired,
};

export default FilterDropdown;
