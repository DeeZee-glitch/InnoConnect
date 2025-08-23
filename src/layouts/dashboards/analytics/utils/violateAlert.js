import React, { useEffect, useState } from "react";
import axios from "axios";
import { Grid } from "@mui/material";
import MDBox from "components/MDBox"; // Make sure this is your component
import MDTypography from "components/MDTypography"; // Make sure this is your component
import MiniStatisticsCard from "examples/Cards/StatisticsCards/MiniStatisticsCard";

const ViolateAlert = () => {
  const [violatedRules, setViolatedRules] = useState([]);

  useEffect(() => {
    const authHeader = `Basic ${btoa(
      `${process.env.REACT_APP_AUTH_USER}:${process.env.REACT_APP_AUTH_PASS}`
    )}`;
    axios
      .get(
        `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider:ui/rule/all`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
        }
      )
      .then((response) => {
        const rules = response.data?.auditorRules || [];
        const filteredRules = rules.filter(
          (rule) => String(rule.isViolated).trim().toUpperCase() === "TRUE"
        );
        setViolatedRules(filteredRules);
      })
      .catch((error) => {
        console.error("Error fetching violation data:", error);
      });
  }, []);

  return (
    <MDBox mt={1.5}>
      <Grid container spacing={3}>
        {violatedRules.length > 0 ? (
          violatedRules.map((rule, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <MDBox mb={3}>
                <MiniStatisticsCard
                  title={{ text: `Alert - ${rule.ruleName}` }}
                  icon={{
                    color: "primary", // Red color for violation
                    component: "warning",
                  }}
                  direction="left"
                  sx={{
                    backgroundColor: "rgba(255, 0, 0, 0.1)", // Light red background
                    border: "2px solid red", // Red border
                  }}
                />
                {/* You can add more detailed description or additional info here */}
              </MDBox>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <MDBox mb={3}>
              <MDTypography variant="body2" color="primary"></MDTypography>
            </MDBox>
          </Grid>
        )}
      </Grid>
    </MDBox>
  );
};

export default ViolateAlert;
