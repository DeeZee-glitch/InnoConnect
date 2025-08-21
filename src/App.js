import { useState, useEffect, useMemo } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";

import useAuth from "hooks/useAuth";
import { getToken } from "hooks/keycloakService";
import { jwtDecode } from "jwt-decode";
// Material Dashboard components
import MDBox from "components/MDBox";
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";

// Themes
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";
import themeDark from "assets/theme-dark";
import themeDarkRTL from "assets/theme-dark/theme-rtl";

// RTL plugins
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

// Layouts and Pages
import routes from "routes";
import Monitors from "layouts/pages/monitors";
import MonitorCondition from "layouts/pages/monitorCondition";
import RulDefDataTables from "layouts/ruleDefinition";
import RuleAction from "layouts/pages/ruleActions";

// Router and State Management
import { BrowserRouter as Router } from "react-router-dom";
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "context";

// Images
import brandWhite from "assets/images/logo-ct-sll.png";
import brandDark from "assets/images/logo-ct-sll.png";
import CalendarConfiguration from "layouts/pages/calendarConfiguration";
import RuleEscalation from "layouts/pages/ruleEscalation";

// adding circular progress for loading
import CircularProgress from "@mui/material/CircularProgress"; // Add CircularProgress import
import Backdrop from "@mui/material/Backdrop";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
    hideWatchtowerUI,
    hideSmartLoggerUI,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();
  const { isLogin, loading, token, logout } = useAuth();
  const navigate = useNavigate();

  // Cache for RTL
  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });

    setRtlCache(cacheRtl);
  }, []);

  // Sidenav Mouse Events
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // Change Configurator State
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  // Set Document Direction
  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  // Scroll to Top on Route Change
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  // Filter Routes Based on Roles and UI Visibility
  const filterRoutesByRoleAndVisibility = (routes, userRoles) => {
    return routes
      .filter((route) => {
        // If roles are defined, check if the user has access
        if (route.roles) {
          return route.roles.some((role) => userRoles.includes(role));
        }
        return true; // Include if no roles are defined
      })
      .map((route) => {
        // Skip if this is a divider
        if (route.type === "divider") return route;

        // Hide all Watchtower routes (keys not starting with 'smart-')
        if (hideWatchtowerUI && !route.key?.startsWith("smart-")) {
          return null;
        }

        // Hide Smart Logger routes (keys starting with 'smart-')
        if (hideSmartLoggerUI && route.key?.startsWith("smart-")) {
          return null;
        }

        return {
          ...route,
          // Recursively filter nested routes if they exist
          ...(route.collapse && {
            collapse: filterRoutesByRoleAndVisibility(route.collapse, userRoles),
          }),
        };
      })
      .filter((route) => route !== null); // Remove null routes
  };

  const filteredRoutes = useMemo(() => {
    const token = getToken();
    if (!token) return [];

    try {
      const decodedToken = jwtDecode(token);
      const allowedRoles = ["Finance", "HR", "APIAdmin", "Admin"];
      const userRoles = decodedToken?.realm_access?.roles.filter((role) =>
        allowedRoles.includes(role)
      );

      return filterRoutesByRoleAndVisibility(routes, userRoles);
    } catch (error) {
      console.error("Error decoding token or filtering routes:", error);
      return [];
    }
  }, [token, hideWatchtowerUI, hideSmartLoggerUI]);

  // Route Mapping
  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        return <Route exact path={route.route} element={route.component} key={route.key} />;
      }

      return null;
    });

  // Configurator Button
  const configsButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.25rem"
      height="3.25rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="2rem"
      bottom="2rem"
      zIndex={99}
      color="dark"
      sx={{ cursor: "pointer" }}
      onClick={handleConfiguratorOpen}
    >
      <Icon fontSize="small" color="inherit">
        settings
      </Icon>
    </MDBox>
  );

  // Show loading spinner while authentication is loading
  if (loading) {
    return (
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  return direction === "rtl" ? (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
        <CssBaseline />
        <DashboardNavbar logout={logout} />
        {layout === "dashboard" && (
          <>
            <Sidenav
              color={sidenavColor}
              brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
              brandName="Inno Connect"
              routes={filteredRoutes}
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
            />
            <Configurator />
            {configsButton}
          </>
        )}
        {layout === "vr" && <Configurator />}
        <Routes>
          {getRoutes(filteredRoutes)}
          <Route
            path="/"
            element={
              isLogin ? (
                <Navigate to="/pages/TeamSummary" />
              ) : (
                <Navigate to="/login" state={{ from: pathname }} />
              )
            }
          />
          <Route path="rules/ruleDefinition/:ruleId/:auditType" element={<RulDefDataTables />} />
          <Route path="/rules/ruleActions/:ruleId/:ruleName" element={<RuleAction />}></Route>
          <Route path="/rules/ruleEscalations/:ruleId" element={<RuleEscalation />}></Route>
          <Route path="/monitors/:feedId" element={<Monitors />} />
          <Route path="/monitorConditions/:auditId" element={<MonitorCondition />} />
          <Route path="/monitorCondition/:auditId/:feedId" element={<MonitorCondition />} />
        </Routes>
      </ThemeProvider>
    </CacheProvider>
  ) : (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      {/* <DashboardNavbar logout={logout} /> */}
      {layout === "dashboard" && (
        <>
          <Sidenav
            color={sidenavColor}
            brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
            brandName={<span style={{ fontSize: "20px", fontWeight: "bold" }}>Inno Connect</span>} // Adjust fontSize as needed
            routes={filteredRoutes}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
          />
          <Configurator />
          {configsButton}
        </>
      )}
      {layout === "vr" && <Configurator />}
      <Routes>
        {getRoutes(filteredRoutes)}
        <Route
          path="/"
          element={
            isLogin ? (
              <Navigate to="/TeamSummary" />
            ) : (
              <Navigate to="/login" state={{ from: pathname }} />
            )
          }
        />
        <Route path="rules/ruleDefinition/:ruleId/:auditType" element={<RulDefDataTables />} />
        <Route path="/rules/ruleActions/:ruleId/:ruleName" element={<RuleAction />}></Route>
        <Route path="/rules/ruleEscalations/:ruleId" element={<RuleEscalation />}></Route>
        <Route
          path="/pages/calendarConfiguration/:calendarId"
          element={<CalendarConfiguration />}
        />
        <Route path="/monitors/:feedId" element={<Monitors />} />
        <Route path="/monitorConditions/:auditId" element={<MonitorCondition />} />
        <Route
          path="/monitorCondition/:feedId/:auditId/:auditTypeName"
          element={<MonitorCondition />}
        />
      </Routes>
    </ThemeProvider>
  );
}
