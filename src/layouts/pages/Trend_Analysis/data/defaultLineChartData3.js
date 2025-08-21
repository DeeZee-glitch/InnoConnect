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

const defaultLineChartData3 = {
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
    // {
    //   label: "CPU3",
    //   color: "dark",
    //   data: [],
    //   borderColor: "#0000FF",
    // },
    // {
    //   label: "CPU4",
    //   color: "primary",
    //   data: [],
    //   borderColor: "#FFFF00",
    // },
  ],
};
export const transformApiDataToLineChartData3 = (apiData) => {
  if (!apiData || !Array.isArray(apiData)) {
    console.error("Invalid API data provided:", apiData);
    return defaultLineChartData3; // Return default placeholder
  }

  // Process API data safely
  const groupedData = apiData.reduce((acc, current) => {
    if (!current.latestUpdatedTimestamp || !current.used) {
      console.warn("Skipping invalid data point:", current);
      return acc; // Skip invalid entries
    }

    try {
      const latestUpdatedTimestamp = new Date(current.latestUpdatedTimestamp); // Parse timestamp
      // Format timestamp
      const formattedTimestamp = `${latestUpdatedTimestamp.getDate().toString().padStart(2, "0")}-${(latestUpdatedTimestamp.getMonth() + 1).toString().padStart(2, "0")}-${latestUpdatedTimestamp.getFullYear()}, ${latestUpdatedTimestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}`;

      // Ensure 'used' is a number
      const usedValue = parseInt(current.used, 10);

      // Aggregate values for the same timestamp
      acc[formattedTimestamp] = (acc[formattedTimestamp] || 0) + usedValue;
    } catch (error) {
      console.error("Error processing data point:", current, error);
    }

    return acc;
  }, {});

  // Extract labels (timestamps) and data (aggregated values)
  const labels = Object.keys(groupedData).reverse(); // X-axis timestamps
  const data = Object.values(groupedData).reverse(); // Y-axis storage used values

  return {
    labels,
    datasets: [
      {
        label: "Table Storage Used",
        color: "info",
        data, // Y-axis data
        tension: 0.4, // Smooth line
        pointRadius: 5, // Data point radius
        borderWidth: 2, // Line thickness
        backgroundColor: "transparent", // No fill color under the line
        fill: true,
        borderColor: "rgba(255, 0, 0, 1)", // Line color
      },
    ],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: (tooltipItem) => {
              // Format tooltip correctly
              const timestamp = tooltipItem.label;
              const value = tooltipItem.raw; // Corrected reference
              return `Timestamp: ${timestamp}\nStorage Used: ${value}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true, // Ensure Y-axis starts at 0
          min: 0,
          max: Math.max(100, ...data), // Prevent NaN issues
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

export default defaultLineChartData3;
