import React from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import PropTypes from "prop-types";
import MDTypography from "components/MDTypography";

const FilterMenu = ({ menu, onClose, applyFilter, clearFilter }) => (
  <Menu
    anchorEl={menu}
    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
    transformOrigin={{ vertical: "top", horizontal: "left" }}
    open={Boolean(menu)}
    onClose={onClose}
    keepMounted
  >
    <MenuItem onClick={() => applyFilter("status", "Active")}>Status: ACTIVE</MenuItem>
    <MenuItem onClick={() => applyFilter("status", "Inactive")}>Status: INACTIVE</MenuItem>
    {/* <MenuItem onClick={() => applyFilter("status", "CANCEL")}>Status: CANCEL</MenuItem>
    <MenuItem onClick={() => applyFilter("channel", "EMAIL")}>Channel: EMAIL</MenuItem>
    <MenuItem onClick={() => applyFilter("channel", "SMS")}>Channel: SMS</MenuItem>
    <MenuItem onClick={() => applyFilter("channel", "OPSGENIE")}>Channel: OPSGENIE</MenuItem>
    <MenuItem onClick={() => applyFilter("channel", "PAGERDUTY")}>Channel: PAGERDUTY</MenuItem>
    <MenuItem onClick={() => applyFilter("channel", "SLACK")}>Channel: SLACK</MenuItem>
    <MenuItem onClick={() => applyFilter("priority", "NORMAL")}>Priority: NORMAL</MenuItem>
    <MenuItem onClick={() => applyFilter("priority", "ESCLATION")}>Priority: ESCLATION</MenuItem> */}
    <Divider sx={{ margin: "0.5rem 0" }} />
    <MenuItem onClick={clearFilter}>
      <MDTypography variant="button" color="error" fontWeight="regular">
        Remove Filter
      </MDTypography>
    </MenuItem>
  </Menu>
);

FilterMenu.propTypes = {
  menu: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  applyFilter: PropTypes.func.isRequired,
  clearFilter: PropTypes.func.isRequired,
};

export default FilterMenu;
