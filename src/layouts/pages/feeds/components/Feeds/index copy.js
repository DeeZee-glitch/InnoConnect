import React, { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import { IconButton, Snackbar, Tooltip } from "@mui/material";
import { Link } from "react-router-dom";

import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import MDButton from "components/MDButton";
import zIndex from "@mui/material/styles/zIndex";

function Feeds({ setFeedId }) {
  const [feedName, setFeedName] = useState("");
  const [feedIsActive, setFeedIsActive] = useState("TRUE");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true); // State to control visibility

  const fetchData = async () => {
    const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    try {
      const response = await fetch("http://172.20.150.134:5555/feed/feed", {
        headers: {
          Authorization: basicAuth,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const handleReset = () => {
    setFeedName("");
    setFeedIsActive("TRUE");
  };

  const handleSave = async () => {
    if (!feedName || !feedIsActive) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    const basicAuth = "Basic " + btoa("Administrator:manageaudit");
    const apiUrl = "http://172.20.150.134:5555/feed/feed";

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: basicAuth,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedName,
          feedIsActive,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Use a regular expression to extract the number from the message field
        const message = result.message;
        const idMatch = message.match(/\d+/g); // Regular expression to find all numbers
        const idMatchInt = idMatch ? parseInt(idMatch.join(""), 10) : null; // Join and convert to integer
        if (idMatchInt) {
          setFeedId(idMatchInt);
          console.log("feed id: ", idMatchInt);
        } else {
          console.error("Feed ID not found in the message.");
        }
        alert(result.message || "Feed added successfully!");
        setIsVisible(false); // Make the component's content invisible
      } else {
        const error = await response.json();
        alert(error.message || "Failed to add the feed. Please try again.");
      }
    } catch (error) {
      console.error("Error saving feed:", error);
      alert("An error occurred while saving the feed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Conditional rendering based on isVisible */}
      {isVisible && (
        <MDBox
          p={3}
          sx={{
            border: "1px solid #ccc", // Fine border
            borderRadius: "8px", // Rounded corners (optional)
            //backgroundColor: "#f5f5f5", // Light grey background
            display: "inline-block", // Shrink-wrap the content
          }}
        >
          <TextField
            label="Feed Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={feedName}
            onChange={(e) => setFeedName(e.target.value)}
          />
          <TextField
            label="Active"
            variant="outlined"
            fullWidth
            margin="normal"
            InputProps={{
              style: { padding: "12px 10px" },
            }}
            select
            value={feedIsActive}
            onChange={(e) => setFeedIsActive(e.target.value)}
          >
            <MenuItem value="TRUE">TRUE</MenuItem>
            <MenuItem value="FALSE">FALSE</MenuItem>
          </TextField>
          <MDBox display="flex" justifyContent="center">
            <MDButton onClick={handleSave} variant="contained" color="info" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </MDButton>
            <MDButton onClick={handleReset} variant="outlined" color="secondary">
              Reset
            </MDButton>
          </MDBox>
        </MDBox>
      )}
    </>
  );
}

export default Feeds;
