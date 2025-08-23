import React from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";

const ConfigurationHomePage = () => {
  return (
    <Box sx={{ padding: 3 }}>
      <Card elevation={3} style={{ marginLeft: 250 }}>
        <CardContent>
          <Typography variant="h6" sx={{ backgroundColor: "#1976d2", color: "white", padding: 1 }}>
            Configuration Home Page
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: "bold", marginTop: 2 }}>
            This page serves as the central hub for managing and customizing various settings within
            the system.
          </Typography>
          <Typography variant="body2" sx={{ marginTop: 2, marginLeft: 2 }}>
            From here, you can access and configure key features such as email groups and alert
            templates. The interface is designed to ensure that your alert system is tailored to
            meet the specific needs of your teams and workflows. Additionally, the Configuration
            Home Page offers guidance and help sections to assist you in setting up and optimizing
            these configurations.
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: "bold", marginTop: 3 }}>
            Templates:
          </Typography>
          <Typography variant="body2" sx={{ marginLeft: 2 }}>
            Customize alert email templates tailored for team notifications. The help section on the
            Template Page provides detailed information on the elements you can include in the
            template to ensure teams receive all relevant details regarding the alert.
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: "bold", marginTop: 2 }}>
            Group Configs:
          </Typography>
          <Typography variant="body2" sx={{ marginLeft: 2 }}>
            Create multiple group configs for different types of alerts, allowing you to send
            notifications to specific people based on predefined rules. You can add one or more
            email addresses to a group and easily edit the group later to include additional
            addresses.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ConfigurationHomePage;
