import { useState, useEffect } from "react";
import axios from "axios";

// Custom hook to fetch home page statistics
const useHomePageStats = () => {
  const [counts, setCounts] = useState({
    totalFeedCount: 0,
    totalActiveFeedCount: 0,
    totalActiveMonitors: 0,
    totalMonitors: 0,
    totalRules: 0,
    totalActiveRules: 0,
    totalAlerts: 0,
  });

  useEffect(() => {
    const authHeader = `Basic ${btoa(
      `${process.env.REACT_APP_AUTH_USER}:${process.env.REACT_APP_AUTH_PASS}`
    )}`;
    axios
      .get(`${process.env.REACT_APP_API_URL}/dashboard/dashboard/homePageStats`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
      })
      .then((response) => {
        setCounts(response.data); // Update counts with the fetched data
      })
      .catch((error) => {
        console.error("Error fetching data:", error); // Log error for debugging
      });
  }, []); // Empty dependency array means this will run only once when the component mounts

  return counts;
};

export default useHomePageStats;
