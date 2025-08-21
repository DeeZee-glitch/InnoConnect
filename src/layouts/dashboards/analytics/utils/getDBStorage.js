// utils/getDBStorage.js

const getDBStorage = async () => {
  try {
    const authHeader = `Basic ${btoa(
      `${process.env.REACT_APP_AUTH_USER}:${process.env.REACT_APP_AUTH_PASS}`
    )}`;
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/restv2/BInRestInterface.restful.provider:ui/getDBStorage`,
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

    // Process and format the data
    const formattedData = apiResponse.dbStorageUsage.map((item) => ({
      dbName: item.dbName,
      total: parseFloat(item.total), // Total in KB
      used: parseFloat(item.used), // Used in KB
      free: parseFloat(item.free), // Free in KB
    }));

    return formattedData; // Return the formatted data
  } catch (error) {
    console.error("Failed to fetch storage data:", error);
    throw error; // Rethrow the error for handling in the component
  }
};

// Function to fetch data and update the chart data
export const fetchStorageDataAndSetChartData = async (setStorageData, setChartData) => {
  try {
    const formattedData = await getDBStorage(); // Fetch data using the utility function

    setStorageData(formattedData); // Update storage data

    // Prepare the chart data
    setChartData({
      labels: formattedData.map((item) => item.dbName),
      datasets: [
        {
          label: "Used Storage (KB)",
          data: formattedData.map((item) => item.used),
          backgroundColor: "rgba(19, 134, 228, 0.94)",
        },
        {
          label: "Free Storage (KB)",
          data: formattedData.map((item) => item.free),
          backgroundColor: "rgba(65, 66, 66, 0.6)",
        },
        {
          label: "Total Storage (KB)",
          data: formattedData.map((item) => item.total),
          backgroundColor: "rgba(183, 193, 193, 0.6)",
        },
      ],
    });
  } catch (error) {
    console.error("Error fetching storage data:", error);
  }
};

export default getDBStorage;
