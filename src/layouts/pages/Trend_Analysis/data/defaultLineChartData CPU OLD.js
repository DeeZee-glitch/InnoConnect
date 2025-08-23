/**
=========================================================
* Material Dashboard 2 PRO React - v2.2.1
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-pro-react
* Copyright 2024 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

const defaultLineChartData = {
  labels: [],
  datasets: [
    {
      label: "CPU1",
      color: "info",
      data: [],
      borderColor: "#FF0000",
    },
    {
      label: "CPU2",
      color: "info",
      data: [],
      borderColor: "#00FF00",
    },
    {
      label: "CPU3",
      color: "dark",
      data: [],
      borderColor: "#0000FF",
    },
    {
      label: "CPU4",
      color: "primary",
      data: [],
      borderColor: "#FFFF00",
    },
  ],
};
export const transformApiDataToLineChartData = (apiData) => {
  if (!apiData || !Array.isArray(apiData)) {
    console.error("Invalid API data provided:", apiData);
    return defaultLineChartData; // Return the default placeholder
  }

  // Safely process API data
  const groupedData = apiData.reduce((acc, current) => {
    if (!current.timestamp || !current.value) {
      console.warn("Skipping invalid data point:", current);
      return acc; // Skip invalid entries
    }

    try {
      // const timestamp = new Date(current.timestamp).toLocaleString(); // Safely parse the timestamp

      const date = new Date(current.timestamp);
      const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
      // Format the time to 'hh:mm:ss AM/PM'
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const seconds = date.getSeconds().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";

      hours = hours % 12; // Convert to 12-hour format
      hours = hours ? hours : 12; // Handle 0 as 12 for midnight

      const formattedTime = `${hours}:${minutes}:${seconds} ${ampm}`;

      // Combine date and time
      const formattedTimestamp = `${formattedDate}, ${formattedTime}`;

      acc[formattedTimestamp] = (acc[formattedTimestamp] || 0) + current.value; // Aggregate values for the same timestamp
    } catch (error) {
      console.error("Error processing data point:", current, error);
    }

    return acc;
  }, {});

  // Extract labels (timestamps) and data (aggregated values) from the grouped data
  const labels = Object.keys(groupedData); // X-axis timestamps
  const data = Object.values(groupedData); // Y-axis data

  return {
    labels,
    datasets: [
      {
        label: "CPU", // Dataset label
        color: "info",
        data, // Y-axis data
        tension: 0.4, // Smooth line
        pointRadius: 5, // Radius of the data points
        borderWidth: 2, // Line thickness
        backgroundColor: "transparent", // No fill color under the line
        fill: true, // Fill under the line
        borderColor: "rgba(0, 123, 255, 1)", // Line color
      },
    ],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: (tooltipItem) => {
              // Format tooltip to show the exact value
              const timestamp = tooltipItem.label;
              const value = tooltipItem.raw; // Raw value of CPU count for this timestamp
              return `Timestamp: ${timestamp}\ncpu Value: ${value}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true, // Ensure the Y-axis starts at 0
          min: 0,
          max: Math.max(...data, 100), // Hardcode Y-axis to range 0-100
          ticks: {
            stepSize: 10, // Interval of 10 between ticks
          },
        },
        x: {
          ticks: {
            autoSkip: true, // Skip ticks dynamically for better readability
            maxRotation: 45, // Max rotation for labels
            minRotation: 0, // Min rotation for labels
          },
        },
      },
    },
  };
};
export default defaultLineChartData;
