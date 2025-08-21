import { useState, useEffect } from "react";
import useAuth from "hooks/useAuth";
import LogoutConfirmationDialog from "./LogoutConfirmationDialog";

// react-router components
import { useLocation } from "react-router-dom";

// prop-types
import PropTypes from "prop-types";

// @mui/material components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import Breadcrumbs from "examples/Breadcrumbs";
import { jwtDecode } from "jwt-decode";

// Custom styles
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarDesktopMenu,
} from "examples/Navbars/DashboardNavbar/styles";

// Context
import {
  useMaterialUIController,
  setTransparentNavbar,
  setMiniSidenav,
  setOpenConfigurator,
} from "context";
import { getToken } from "hooks/keycloakService";
import { Tooltip } from "@mui/material";

function DashboardNavbar({ absolute, light, isMini }) {
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, openConfigurator, darkMode } = controller;
  const [anchorEl, setAnchorEl] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { logout } = useAuth();

  const route = useLocation().pathname.split("/").slice(1);

  useEffect(() => {
    // Set navbar type
    setNavbarType(fixedNavbar ? "sticky" : "static");

    const handleTransparentNavbar = () => {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    };

    window.addEventListener("scroll", handleTransparentNavbar);
    handleTransparentNavbar();

    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const iconsStyle = ({ palette: { dark, white, text }, functions: { rgba } }) => ({
    color: () => {
      let colorValue = light || darkMode ? white.main : dark.main;

      if (transparentNavbar && !light) {
        colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
      }

      return colorValue;
    },
  });

  // Get token from localStorage or any storage you're using
  const token = getToken();
  if (!token) return [];
  let displayName = "";

  if (token) {
    try {
      const decoded = jwtDecode(token);
      displayName = decoded?.name || decoded?.preferred_username || "";
    } catch (error) {
      console.error("Invalid token", error);
    }
  }

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) => navbar(theme, { transparentNavbar, absolute, light, darkMode })}
    >
      <Toolbar sx={(theme) => navbarContainer(theme)}>
        <MDBox color="inherit" mb={{ xs: 1, md: 0 }} sx={(theme) => navbarRow(theme, { isMini })}>
          <IconButton
            sx={{ ...navbarDesktopMenu, marginRight: "16px" }}
            onClick={handleMiniSidenav}
            size="small"
            disableRipple
          >
            <Icon fontSize="medium" sx={iconsStyle}>
              {miniSidenav ? "menu_open" : "menu"}
            </Icon>
          </IconButton>
          <Breadcrumbs icon="home" title={route[route.length - 1]} route={route} light={light} />
        </MDBox>

        {!isMini && (
          <MDBox sx={(theme) => navbarRow(theme, { isMini })}>
            <MDBox color={light ? "white" : "inherit"}>
              {/* Profile Icon */}
              <Tooltip title="Profile">
                <IconButton
                  size="large"
                  disableRipple
                  color="inherit"
                  sx={{
                    ...navbarIconButton,
                    fontSize: "2rem",
                    padding: "0px",
                    width: "60px",
                    height: "60px",
                  }}
                  onClick={handleMenuOpen}
                  aria-label="User profile"
                >
                  <Icon sx={iconsStyle}>account_circle</Icon>
                </IconButton>
              </Tooltip>

              {/* Profile Dropdown Menu */}
              <Menu
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                sx={{ mt: 1 }}
              >
                {/* User Name Display */}
                {displayName && (
                  <MenuItem
                    sx={{
                      opacity: 1,
                      fontWeight: "bold",
                      cursor: "default", // Shows default cursor instead of pointer
                      "&:hover": {
                        backgroundColor: "transparent", // Removes hover effect
                      },
                    }}
                  >
                    <Icon sx={{ mr: 1 }}>person</Icon>
                    {displayName}
                  </MenuItem>
                )}
                <MenuItem disabled divider sx={{ paddingY: 0 }} />

                {/* Logout Option */}
                <MenuItem
                  onClick={() => {
                    setLogoutDialogOpen(true);
                    handleMenuClose();
                  }}
                >
                  <Icon sx={{ mr: 1 }}>logout</Icon>
                  Logout
                </MenuItem>
              </Menu>

              {/* Logout Confirmation Dialog */}
              <LogoutConfirmationDialog
                open={logoutDialogOpen}
                onClose={() => setLogoutDialogOpen(false)}
                onConfirm={logout}
              />
            </MDBox>
          </MDBox>
        )}
      </Toolbar>
    </AppBar>
  );
}

DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;
