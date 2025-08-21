import React, { useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import Box from "@mui/material/Box";

const TestDatePicker = () => {
  const [startDate, setStartDate] = useState(null);

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      bgcolor="#f5f5f5"
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="From Date"
          value={startDate}
          onChange={(newValue) => setStartDate(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <InputAdornment position="end" style={{ display: "flex" }}>
                    {params.InputProps?.endAdornment}
                    <IconButton
                      onClick={() => setStartDate(null)}
                      aria-label="Clear start date"
                      style={{
                        padding: "5px",
                      }}
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                width: "300px", // Set a fixed width
                "& .MuiInputAdornment-root": {
                  visibility: "visible !important",
                  zIndex: 1, // Ensure it's above other components
                },
              }}
            />
          )}
        />
      </LocalizationProvider>
    </Box>
  );
};

export default TestDatePicker;
