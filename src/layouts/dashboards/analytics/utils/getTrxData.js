// utils/getTrxData.js

const getTrxData = async () => {
  try {
    const authHeader = `Basic ${btoa(
      `${process.env.REACT_APP_AUTH_USER}:${process.env.REACT_APP_AUTH_PASS}`
    )}`;
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider:ui/getTrxMetrics`,
      {
        method: "GET",
        headers: {
          Authorization: authHeader, // Encoding credentials
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const apiResponse = await response.json();

    // Format the data
    const formattedTrxData = apiResponse.trxMetrics.map((item) => ({
      dbName: item.dbName,
      totalTrx: parseInt(item.totalTrx),
      commitedTrx: parseInt(item.commitedTrx),
      rollBackTrx: parseInt(item.rollBackTrx),
      tps: parseFloat(item.tps),
    }));

    return formattedTrxData; // Return the formatted transaction data
  } catch (error) {
    console.error("Failed to fetch transaction data:", error);
    throw error; // Rethrow the error for handling in the component
  }
};

// Function to fetch data and update the chart data
export const fetchTrxDataAndSetChartData = async (setTrxData, setChart2Data) => {
  try {
    const formattedTrxData = await getTrxData(); // Fetch data using the utility function

    setTrxData(formattedTrxData); // Update transaction data

    // Prepare the chart data for transactions
    setChart2Data({
      labels: formattedTrxData.map((item) => item.dbName),
      datasets: [
        {
          label: "Committed Transactions",
          data: formattedTrxData.map((item) => item.commitedTrx),
          backgroundColor: "rgba(0, 128, 0, 0.8)", // Green for committed transactions
        },
        {
          label: "Rolled Back Transactions",
          data: formattedTrxData.map((item) => item.rollBackTrx),
          backgroundColor: "rgba(255, 69, 0, 0.8)", // Red for rolled back transactions
        },
        {
          label: "Total Transactions",
          data: formattedTrxData.map((item) => item.totalTrx),
          backgroundColor: "rgba(75, 192, 192, 0.6)", // Light blue for total transactions
        },
      ],
    });
  } catch (error) {
    console.error("Error fetching transaction data:", error);
  }
};

export default getTrxData;
