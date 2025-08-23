import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/systemMetrics/systemMetrics`;

export const fetchInfrastructureMetrics = async () => {
  try {
    const [response1, response2, response3] = await Promise.all([
      axios.get(API_URL),
      axios.get(API_URL),
      axios.get(API_URL),
    ]);

    return {
      doughnutChartData1: transformApiDataToChartData1(response1.data),
      doughnutChartData2: transformApiDataToChartData2(response2.data),
      doughnutChartData3: transformApiDataToChartData3(response3.data),
    };
  } catch (error) {
    console.error("Error fetching infrastructure metrics:", error);
    return { doughnutChartData1: null, doughnutChartData2: null, doughnutChartData3: null };
  }
};
