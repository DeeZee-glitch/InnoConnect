import React, { useState, useEffect } from "react";
import axios from "axios";

import { getLast7Dates } from "./dateUtils";
import DefaultLineChart from "examples/Charts/LineCharts/DefaultLineChart";

const TransactionByDay = () => {
  // State to hold chart data with dynamic labels (Last 7 days)
  const [defaultLineChartData, setReportsBarChartData] = useState({
    labels: getLast7Dates(), // Setting the last 7 dates as labels
    datasets: [
      {
        label: "Transaction",
        data: [], // Data will be fetched and updated dynamically
        color: "info",
      },
    ],
  });

  // Fetching data from the API and updating the chart
  useEffect(() => {
    const authHeader = `Basic ${btoa(
      `${process.env.REACT_APP_AUTH_USER}:${process.env.REACT_APP_AUTH_PASS}`
    )}`;
    // Fetch data from the API
    axios
      .get(`${process.env.REACT_APP_API_URL}/dashboard/dashboard/transaction`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
      })
      .then((response) => {
        // Parse the API response and update the state
        const apiData = response.data.sample_counts.split(",").map(Number);
        if (apiData) {
          setReportsBarChartData((prevData) => ({
            ...prevData,
            datasets: prevData.datasets.map((dataset) => ({
              ...dataset,
              data: apiData, // Update the data with the fetched values
            })),
          }));
        }
      })
      .catch((error) => {
        console.error("Error fetching transaction data:", error);
      });
  }, []); // Empty dependency array means it only runs once after initial render

  return (
    <DefaultLineChart
      icon={{ component: "account_balance" }}
      title="Transaction"
      height="15.5rem"
      description="Transaction insights"
      chart={defaultLineChartData}
    />
  );
};

export default TransactionByDay;
