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

const defaultDoughnutChartData1 = {
  labels: [],
  datasets: {
    label: "Projects",
    backgroundColors: [],
    data: [],
  },
};
// Function to transform API data into chart.js compatible format
/**
 * Transform API data into Chart.js-compatible format
 * @param {Array} apiData - Data fetched from the API
 * @returns {Object} Chart.js data structure
 */
export const transformApiDataToChartData1 = (apiData) => {
  // Filter the data to only include items where the name starts with "CPU"
  const cpuData = apiData.filter((item) => item.name.startsWith("CPU"));

  // Extract CPU names for labels (e.g., CPU1, CPU2)
  const labels = cpuData.map((item) => `${item.name} (${item.value}%)`); // Concatenate '%' to the value

  // Extract the corresponding value for each CPU (e.g., CPU usage percentage)
  const data = cpuData.map((item) => parseInt(item.value, 10)); // Convert the value to integer

  // Generate random colors for each label
  const backgroundColors = cpuData.map(
    () => `#${Math.floor(Math.random() * 16777215).toString(16)}`
  );

  return {
    labels,
    datasets: {
      label: "",
      backgroundColors,
      data,
    },
  };
};
export default defaultDoughnutChartData1;
