/**
=========================================================
* Material Dashboard 2 PRO React - v2.2.1
=========================================================
*/

const defaultLineChartData2 = {
  labels: [],
  datasets: [
    {
      label: "FD1",
      color: "info",
      data: [],
      borderColor: "#FF0000",
    },
    {
      label: "FD2",
      color: "info",
      data: [],
      borderColor: "#00FF00",
    },
    {
      label: "FD3",
      color: "dark",
      data: [],
      borderColor: "#0000FF",
    },
    {
      label: "FD4",
      color: "primary",
      data: [],
      borderColor: "#FFFF00",
    },
    {
      label: "FD5",
      color: "secondary",
      data: [],
      borderColor: "#FFA500",
    },
  ],
};

export const transformApiDataToLineChartData2 = (apiData, metric) => {
  if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
    console.warn("No API data provided, returning default dataset");
    return defaultLineChartData2; // Return the default placeholder
  }

  const groupedData = apiData.reduce((acc, current) => {
    if (!current.timestamp || !current.value) {
      console.warn("Skipping invalid data point:", current);
      return acc;
    }

    try {
      const date = new Date(current.timestamp);
      const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const seconds = date.getSeconds().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";

      hours = hours % 12 || 12; // Convert to 12-hour format

      const formattedTime = `${hours}:${minutes}:${seconds} ${ampm}`;
      const formattedTimestamp = `${formattedDate}, ${formattedTime}`;

      acc[formattedTimestamp] = (acc[formattedTimestamp] || 0) + current.value;
    } catch (error) {
      console.error("Error processing data point:", current, error);
    }

    return acc;
  }, {});

  const labels = Object.keys(groupedData).reverse();
  const data = Object.values(groupedData).reverse();

  return {
    labels,
    datasets: [
      {
        label: "Hard disk", // Dynamic label based on FD metric
        color: "info",
        data,
        tension: 0.4,
        pointRadius: 5,
        borderWidth: 2,
        backgroundColor: "transparent",
        fill: true,
        borderColor: "rgba(0, 123, 255, 1)",
      },
    ],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: (tooltipItem) => {
              const timestamp = tooltipItem.label;
              const value = tooltipItem.raw;
              return `Timestamp: ${timestamp}\nFD Value: ${value}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          min: 0,
          max: Math.max(100, ...data), // Prevent NaN issues
          ticks: { stepSize: 10 },
        },
        x: {
          ticks: { autoSkip: true, maxRotation: 45, minRotation: 0 },
        },
      },
    },
  };
};

export default defaultLineChartData2;
