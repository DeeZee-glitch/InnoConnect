const defaultLineChartData = {
  labels: [],
  datasets: [
    {
      label: "CPU1",
      color: "info",
      data: [],
      borderColor: "rgba(75, 192, 192, 1)",
      tension: 0.4,
    },
    {
      label: "CPU2",
      color: "dark",
      data: [],
      borderColor: "rgba(75, 75, 192, 1)",
      tension: 0.4,
    },
    {
      label: "CPU3",
      color: "primary",
      data: [],
      borderColor: "rgba(192, 75, 75, 1)",
      tension: 0.4,
    },
    {
      label: "CPU4",
      color: "success",
      data: [],
      borderColor: "rgba(75, 192, 75, 1)",
      tension: 0.4,
    },
  ],
};

// Function to transform API data to line chart data
export const transformApiDataToLineChartData = (apiData) => {
  if (!apiData || apiData.length === 0) {
    console.warn("Empty API Data provided. Returning default chart data.");
    return defaultLineChartData;
  }

  try {
    // Sort data by timestamp for consistent x-axis
    const sortedData = apiData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Extract unique timestamps for x-axis labels
    const labels = Array.from(
      new Set(sortedData.map((item) => new Date(item.timestamp).toLocaleString()))
    );

    // Initialize datasets for CPU metrics
    const datasets = {
      CPU1: Array(labels.length).fill(null),
      CPU2: Array(labels.length).fill(null),
      CPU3: Array(labels.length).fill(null),
      CPU4: Array(labels.length).fill(null),
    };

    // Populate datasets with values
    sortedData.forEach((item) => {
      const timestampIndex = labels.indexOf(new Date(item.timestamp).toLocaleString());
      if (timestampIndex !== -1 && datasets[item.name]) {
        datasets[item.name][timestampIndex] = parseFloat(item.value); // Ensure numeric values
      }
    });

    // Construct datasets for the chart
    const chartDatasets = Object.keys(datasets).map((key, index) => ({
      label: key,
      data: datasets[key],
      borderColor: defaultLineChartData.datasets[index].borderColor,
      tension: 0.4,
      pointRadius: 5,
      borderWidth: 2,
      fill: false,
    }));

    return {
      labels,
      datasets: chartDatasets,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: (tooltipItem) => {
                const value = tooltipItem.raw;
                return `Value: ${value}`;
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Timestamp",
            },
          },
          y: {
            title: {
              display: true,
              text: "CPU Value",
            },
            beginAtZero: true,
          },
        },
      },
    };
  } catch (error) {
    console.error("Error transforming data:", error);
    return defaultLineChartData;
  }
};

// Function to fetch and transform data for the line chart
export const getLineChartData = (apiData) => {
  if (!apiData) {
    console.error("No API data provided to getLineChartData");
    return defaultLineChartData;
  }
  return transformApiDataToLineChartData(apiData);
};

export default defaultLineChartData;
