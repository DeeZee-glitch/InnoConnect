import AnalyticsIcon from "@mui/icons-material/Analytics";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import { jwtDecode } from "jwt-decode";
import keycloak from "hooks/keycloakInstance";
import Icon from "@mui/material/Icon";

// Watchtower Components
import WatchtowerAI from "./layouts/watchtowerai/WatchTowerAI";
import Analytics from "layouts/dashboards/analytics";
import BusinessMonitoring from "layouts/dashboards/businessmonitoring";
import Overview from "layouts/pages/overview";
import Trend_Analysis from "layouts/pages/Trend_Analysis";
import Alerts from "layouts/dashboards/alerts";
import Feeds from "layouts/pages/feeds";
import DataTables from "layouts/rules";
import Templates from "layouts/pages/templates";
import GroupConfig from "layouts/pages/groupconfig";
import Calendar from "layouts/pages/calendar";
import Parameters from "layouts/pages/parameters";
import ResourceSearch from "layouts/pages/resource-config";
import AvTimerIcon from "@mui/icons-material/AvTimer";

// Smart Logger Components
import SmartAnalytics from "layouts/pages/smart-analytics";
import SmartLog from "layouts/pages/smartLog";
import SmartConfig from "layouts/pages/smart-config";
import ElasticConfig from "layouts/pages/smart-elasticsearch-config";
import SmartRoles from "layouts/pages/smart-roles";
import TeamSummary from "layouts/pages/TeamSummary";

let decodedToken = null;
try {
  if (!token) {
    throw new Error("Token is missing or invalid. Using default empty token.");
  }
  decodedToken = jwtDecode(token);
} catch (error) {
  console.error("Error decoding token:", error.message);
  decodedToken = {};
}

const allowedRoles = ["Finance", "HR", "APIAdmin", "Admin"];
const userRoles =
  decodedToken?.realm_access?.roles?.filter((role) => allowedRoles.includes(role)) || [];

const routes = [
  // ==================== SMART LOGGER ROUTES ====================
  // {
  //   type: "collapse",
  //   name: "Smart Analytics",
  //   key: "smart-analytics",
  //   route: "/smart-analytics",
  //   component: <SmartAnalytics keycloak={keycloak} />,
  //   roles: ["Admin", "HR", "APIAdmin", "Finance"],
  //   noCollapse: true,
  //   icon: <Icon fontSize="medium">analytics</Icon>,
  // },
  {
    type: "collapse",
    name: "Role Management",
    key: "smart-roles",
    route: "/smart-roles",
    component: <SmartRoles />,
    roles: ["Admin", "HR", "APIAdmin", "Finance"],
    noCollapse: true,
    icon: <Icon fontSize="medium">people</Icon>,
  },
  // {
  //   type: "collapse",
  //   name: "API Configuration", // Corrected
  //   key: "smart-config",
  //   route: "/smart-config",
  //   component: <SmartConfig />,
  //   roles: ["APIAdmin", "Admin"],
  //   noCollapse: true,
  //   icon: <Icon fontSize="medium">settings</Icon>,
  // },
  // {
  //   type: "collapse",
  //   name: "Datasources",
  //   key: "smart-elasticsearch-config",
  //   route: "/smart-elasticsearch-config",
  //   component: <ElasticConfig />,
  //   roles: ["APIAdmin", "Admin"],
  //   noCollapse: true,
  //   icon: <Icon fontSize="medium">storage</Icon>,
  // },
  {
    type: "collapse",
    name: "Team Summary",
    key: "TeamSummary",
    route: "/TeamSummary",
    component: <TeamSummary />,
    roles: ["APIAdmin", "Admin"],
    noCollapse: true,
    icon: <Icon fontSize="medium">admin_panel_settings</Icon>,
  },
  // ==================== WATCHTOWER ROUTES ====================
  { type: "divider", key: "divider-1" },
  {
    type: "collapse",
    name: "Watchtower",
    key: "watchtower",
    icon: <AvTimerIcon fontSize="large" />,
    collapse: [
      {
        type: "collapse",
        name: "Dashboard",
        key: "dashboard",
        route: "Dashboard",
        icon: <Icon fontSize="medium">dashboard</Icon>,
        component: <Analytics />,
        noCollapse: true,
      },
      {
        type: "collapse",
        name: "Business Monitoring",
        key: "business_monitoring",
        route: "Business-Monitoring",
        icon: <Icon fontSize="medium">business</Icon>,
        component: <BusinessMonitoring />,
        noCollapse: true,
      },
      {
        type: "collapse",
        name: "Infrastructure Metrics",
        key: "infrastructure_metrics",
        route: "Infrastructure-Metrics",
        icon: <Icon fontSize="medium">addchart</Icon>,
        component: <Overview />,
        noCollapse: true,
      },
      {
        type: "collapse",
        name: "Trend Analysis",
        key: "trend_analysis",
        route: "Trend-Analysis",
        icon: <Icon fontSize="medium">equalizerRounded</Icon>,
        component: <Trend_Analysis />,
        noCollapse: true,
      },
      {
        type: "collapse",
        name: "Alerts",
        key: "alerts",
        route: "Alerts",
        icon: <Icon fontSize="medium">notificationsactive</Icon>,
        component: <Alerts />,
        noCollapse: true,
      },
      {
        type: "collapse",
        name: "Watchtower AI",
        key: "watchtower_ai",
        route: "Watchtower-AI",
        icon: <Icon fontSize="medium">engineering</Icon>,
        component: <WatchtowerAI />,
        noCollapse: true,
      },
      {
        type: "collapse",
        name: "Feeds",
        key: "feeds",
        icon: <Icon fontSize="medium">ballot</Icon>,
        route: "feeds",
        component: <Feeds />,
        noCollapse: true,
      },
      {
        type: "collapse",
        name: "Rules",
        key: "rules",
        icon: <Icon fontSize="medium">rule</Icon>,
        route: "rules",
        component: <DataTables />,
        noCollapse: true,
      },
      {
        type: "collapse",
        name: "Configurations",
        key: "configurations",
        icon: <Icon fontSize="medium">settings</Icon>,
        collapse: [
          {
            name: "Templates",
            key: "templates",
            route: "templates",
            component: <Templates />,
          },
          {
            name: "GroupConfig",
            key: "group_config",
            route: "groupconfig",
            component: <GroupConfig />,
          },
          {
            name: "User Calendar",
            key: "user_calendar",
            route: "calendar",
            component: <Calendar />,
          },
          {
            type: "collapse",
            name: "Parameters",
            key: "parameters",
            icon: <Icon fontSize="medium">tune</Icon>,
            route: "parameters",
            component: <Parameters />,
          },
          {
            type: "collapse",
            name: "Resources",
            key: "resources",
            icon: <Icon fontSize="medium">tune</Icon>,
            route: "Resources",
            component: <ResourceSearch />,
          },
        ],
      },
    ],
  },
];

export default routes;
