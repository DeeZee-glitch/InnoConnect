/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import { IconButton, Snackbar, Tooltip, Typography } from "@mui/material";
import { Link } from "react-router-dom";

import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import MDButton from "components/MDButton";

function Feeds({ allFormData, setAllFormData }) {
  const handleChange = (event) => {
    const { name, value } = event.target;
    setAllFormData((prevData) => ({
      ...prevData,
      feed: {
        ...prevData.feed,
        [name]: value,
      },
    }));
    console.log("name: ", name, "value: ", value);
  };

  const handleMonitorChange = (event) => {
    const { name, value } = event.target;
    setAllFormData((prevData) => ({
      ...prevData,
      monitor: {
        ...prevData.monitor,
        [name]: value,
      },
    }));
  };

  const handleMonitorConditionChange = (event) => {
    const { name, value } = event.target;
    setAllFormData((prevData) => ({
      ...prevData,
      monitorCondition: {
        ...prevData.monitorCondition,
        [name]: value,
      },
    }));
  };

  useEffect(() => {
    console.log("data: ", allFormData);
  }, [allFormData]);

  return (
    <>
      <MDBox>
        {" "}
        <Typography variant="subtitle1" align="left">
          Feed
        </Typography>
        <TextField
          label="Feed Name"
          name="feedName"
          variant="outlined"
          margin="dense"
          value={allFormData.feed?.feedName || ""} // Ensure safe access
          onChange={handleChange}
          fullWidth
          required // Indicates this field is mandatory
          error={!allFormData.feed?.feedName} // Shows an error state if the field is empty
          helperText={!allFormData.feed?.feedName ? "Monitor Name is required" : ""} // Helper text for validation feedback
        />
        <TextField
          label="Active"
          name="feedIsActive"
          variant="outlined"
          margin="dense"
          InputProps={{
            style: { padding: "12px 10px", textAlign: "left" },
          }}
          fullWidth
          select
          value={allFormData.feed?.feedIsActive || ""} // Ensure safe access
          onChange={handleChange}
        >
          <MenuItem value="TRUE">TRUE</MenuItem>
          <MenuItem value="FALSE">FALSE</MenuItem>
        </TextField>
      </MDBox>

      <MDBox sx={{ marginTop: 3 }}>
        <Typography variant="subtitle1" align="left">
          Monitor
        </Typography>
        <TextField
          label="Monitor Name"
          name="auditSystemName"
          value={allFormData.monitor?.auditSystemName || ""}
          onChange={handleMonitorChange}
          margin="dense"
          fullWidth
          required // Indicates this field is mandatory
          error={!allFormData.monitor?.auditSystemName} // Shows an error state if the field is empty
          helperText={!allFormData.monitor?.auditSystemName ? "Monitor Name is required" : ""} // Helper text for validation feedback
        />
        <TextField
          label="Monitor Description"
          name="auditDescription"
          value={allFormData.monitor?.auditDescription || ""}
          onChange={handleMonitorChange}
          margin="dense"
          fullWidth
        />
        <TextField
          label="Measure"
          name="measure"
          margin="normal"
          InputProps={{
            style: { padding: "12px 10px", textAlign: "left" },
          }}
          select
          value={allFormData.monitor?.measure || ""}
          onChange={handleMonitorChange}
          fullWidth
        >
          <MenuItem value="TRANSACTION">TRANSACTION</MenuItem>
          <MenuItem value="IDENTITY">IDENTITY</MenuItem>
          <MenuItem value="VALUE">VALUE</MenuItem>
        </TextField>

        <TextField
          label="Measure Field Path"
          name="measureFieldPath"
          margin="dense"
          value={allFormData.monitor?.measureFieldPath || ""}
          onChange={handleMonitorChange}
          fullWidth
          required // Indicates this field is mandatory
          error={!allFormData.monitor?.measureFieldPath} // Shows an error state if the field is empty
          helperText={
            !allFormData.monitor?.measureFieldPath ? "Measure Field Path is required" : ""
          } // Helper text for validation feedback
        />
        <TextField
          label="Identity Field Path"
          name="identifyFieldPath"
          margin="dense"
          value={allFormData.monitor?.identifyFieldPath || ""}
          onChange={handleMonitorChange}
          fullWidth
        />

        <TextField
          label="Chrono Field Path"
          name="chronoFieldPath"
          margin="dense"
          value={allFormData.monitor?.chronoFieldPath}
          onChange={handleMonitorChange}
          fullWidth
        />

        <TextField
          label="Chrono Field Format"
          name="chronoFieldFormat"
          margin="dense"
          value={allFormData.monitor?.chronoFieldFormat}
          onChange={handleMonitorChange}
          fullWidth
        />
      </MDBox>

      <MDBox sx={{ marginTop: 3 }}>
        <Typography variant="subtitle1" align="left">
          Monitor Condition
        </Typography>
        <TextField
          label="Feed Path Name"
          name="feedPathName"
          variant="outlined"
          value={allFormData.monitorCondition?.feedPathName || ""}
          onChange={handleMonitorConditionChange}
          margin="dense"
          fullWidth
        />
        <TextField
          select
          label="Condition Operator"
          name="condtionOperator"
          variant="outlined"
          value={allFormData.monitorCondition?.condtionOperator || ""}
          onChange={handleMonitorConditionChange}
          margin="dense"
          InputProps={{
            style: { padding: "12px 10px", textAlign: "left" },
          }}
          fullWidth
        >
          <MenuItem value="="> = </MenuItem>
          <MenuItem value="&#x3C;"> &#x3C; </MenuItem>
          <MenuItem value="&#x3C;="> &#x3C;= </MenuItem>
          <MenuItem value="&#x3E;="> &#x3E;=</MenuItem>
          <MenuItem value="&#x3E;">&#x3E;</MenuItem>
          <MenuItem value="!="> !=</MenuItem>
          <MenuItem value="IN"> IN</MenuItem>
        </TextField>
        <TextField
          variant="outlined"
          label="Comparator"
          name="comparator"
          value={allFormData.monitorCondition?.comparator || ""}
          //defaultValue={editingRow.comparator}
          onChange={handleMonitorConditionChange}
          margin="dense"
          fullWidth
        />
        <TextField
          select
          label="Group Operator"
          name="groupOperator"
          value={allFormData.monitorCondition?.groupOperator || ""}
          //defaultValue={editingRow.groupOperator}
          onChange={handleMonitorConditionChange}
          InputProps={{
            style: { padding: "12px 10px", textAlign: "left" },
          }}
          margin="dense"
          fullWidth
        >
          <MenuItem value="AND">AND</MenuItem>
          <MenuItem value="OR">OR</MenuItem>
          <MenuItem value="NOT">NOT</MenuItem>
        </TextField>
      </MDBox>
    </>
  );
}

export default Feeds;
