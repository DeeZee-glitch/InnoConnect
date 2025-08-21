import React, { useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ClearIcon from "@mui/icons-material/Clear";
import PropTypes from "prop-types"; // Import PropTypes

const StatusDropdown = ({ label, menuItems }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [checkboxState, setCheckboxState] = useState(
    menuItems.reduce((acc, item) => ({ ...acc, [item]: false }), {})
  );

  const handleDropdownClick = (event) => setAnchorEl(event.currentTarget);
  const handleDropdownClose = () => setAnchorEl(null);

  const handleCheckboxToggle = (key) => {
    setCheckboxState((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  const clearCheckboxes = () => {
    setCheckboxState(menuItems.reduce((acc, item) => ({ ...acc, [item]: false }), {}));
  };

  const isAnySelected = Object.values(checkboxState).some((val) => val);

  return (
    <div style={{ position: "relative", cursor: "pointer" }}>
      <MDBox
        display="flex"
        alignItems="center"
        style={{
          padding: "5px 10px",
          borderRadius: "4px",
          cursor: "pointer",
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
          },
        }}
      >
        {menuItems.map((item) => (
          <MenuItem
            key={item}
            onClick={() => handleCheckboxToggle(item)}
            style={{
              padding: "5px 20px",
              fontSize: "14px",
            }}
          >
            <Checkbox checked={checkboxState[item]} />
            {item}
          </MenuItem>
        ))}
        <div
          style={{
            padding: "10px",
            borderTop: "1px solid #ccc",
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

// PropTypes validation
StatusDropdown.propTypes = {
  label: PropTypes.string.isRequired,
  menuItems: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default StatusDropdown;
