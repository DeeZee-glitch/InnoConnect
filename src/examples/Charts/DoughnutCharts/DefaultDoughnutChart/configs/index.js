/* eslint-disable no-dupe-keys */
// Material Dashboard 2 PRO React base styles
import colors from "assets/theme/base/colors";

const { gradients, dark } = colors;

function configs(labels, datasets, cutout = 60) {
  // Define your custom colors (replace with your desired colors)
  const customColors = [
    "#1E88E5", // Example color 1 (Blue)
    "#4CAF50", // Example color 2 (Green)
    "#673AB7", // Example color 3 (violet)
    "#455A64", // Example color 4 (Yellow)
    "#ff1493", // Example color 5 (Purple)
    // Add more colors if needed
  ];

  //smart logger
  const labelColors = {
    "Successful Requests": "#4CAF50", // Green for Successful Requests
    "Failed Requests": "#FF0000", // Red for Failed Requests
    "Validation Requests": "#FFA500", // Orange for Validation Requests
  };
  // If datasets.backgroundColors exists, use it, otherwise fallback to custom colors
  // const backgroundColors = datasets.backgroundColors || customColors;
  const backgroundColors = labels.map((label, index) => {
    // Use label-specific colors if available
    if (labelColors[label]) {
      return labelColors[label];
    }
    // Otherwise, use custom colors from the customColors array, wrapping around if necessary
    return customColors[index % customColors.length]; // Wrap around if more labels than colors
  });

  return {
    data: {
      labels,
      datasets: [
        {
          label: datasets.label,
          weight: 9,
          cutout,
          tension: 0.9,
          pointRadius: 2,
          borderWidth: 2,
          backgroundColor: backgroundColors, // Use custom colors for the donut chart
          fill: false,
          data: datasets.data,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "bottom", // Set position to bottom
          align: "end", // Align legend to the right
          labels: {
            padding: 10, // Padding between legend items
            usePointStyle: true, // Use a point style for legend items
            boxWidth: 10, // Set box width for the point style
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
    },
  };
}

export default configs;
