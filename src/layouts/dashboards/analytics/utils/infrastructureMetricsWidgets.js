import { useState, useEffect } from "react";
import axios from "axios";

// Custom hook to fetch doughnut chart data
const useInfrastructureMetrics = () => {
  const [doughnutChartData1, setDoughnutChartData1] = useState({ labels: [], datasets: [] });
  const [doughnutChartData2, setDoughnutChartData2] = useState({ labels: [], datasets: [] });
  const [doughnutChartData3, setDoughnutChartData3] = useState({ labels: [], datasets: [] });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/systemMetrics/systemMetrics`)
      .then((response) => {
        console.log("API Response:", response.data);

        setDoughnutChartData1(transformApiDataToChartData1(response.data));
        setDoughnutChartData2(transformApiDataToChartData2(response.data));
        setDoughnutChartData3(transformApiDataToChartData3(response.data));
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { doughnutChartData1, doughnutChartData2, doughnutChartData3, loading };
};

// Example transform functions
const transformApiDataToChartData1 = (data) => {
  // Filter CPU-related data
  const cpuData = data.filter((item) => item.name.startsWith("CPU"));
  const cpuValues = cpuData.map((item) => parseInt(item.value)); // Convert values to integers

  // Create chart data
  return {
    labels: cpuData.map((item) => item.name), // ["CPU1", "CPU2", "CPU3", "CPU4"]
    datasets: [
      {
        data: cpuValues,
        backgroundColor: ["#ff6384", "#36a2eb", "#ffcd56", "#4bc0c0"], // Colors for each CPU
      },
    ],
  };
};

const transformApiDataToChartData2 = (data) => {
  // Find the RAM data
  const ramData = data.find((item) => item.name === "RAM");

  if (ramData) {
    const totalRAM = parseInt(ramData.value); // Get RAM value (in KB)
    const usedRAM = totalRAM - 1024; // Subtracting 1MB as an example; adjust based on actual RAM usage calculation

    return {
      labels: ["Used", "Free"],
      datasets: [
        {
          data: [usedRAM, totalRAM - usedRAM], // Calculate used and free RAM
          backgroundColor: ["#ff6384", "#36a2eb"], // Red for used, Blue for free
        },
      ],
    };
  } else {
    return { labels: [], datasets: [] }; // Return empty data if no RAM data is found
  }
};

const transformApiDataToChartData3 = (data) => {
  // Filter data related to files (FD1, FD3, FD4)
  const fileData = data.filter((item) => item.name.startsWith("FD"));
  const fileValues = fileData.map((item) => parseInt(item.value)); // Convert values to integers

  return {
    labels: fileData.map((item) => item.name), // ["FD1", "FD3", "FD4"]
    datasets: [
      {
        data: fileValues,
        backgroundColor: ["#ff6384", "#36a2eb", "#ffcd56"], // Colors for each file descriptor
      },
    ],
  };
};

export default useInfrastructureMetrics;
