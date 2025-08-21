import { useEffect, useState } from "react";

function LogoPage() {
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    // Retrieve stored data from localStorage
    const storedData = localStorage.getItem("appData");
    if (storedData) {
      setData(JSON.parse(storedData));
    }

    // Show logo for 2 seconds before displaying content
    setTimeout(() => setIsRefreshing(false), 2000);
  }, []);

  useEffect(() => {
    // Store data in localStorage whenever it changes
    if (data) {
      localStorage.setItem("appData", JSON.stringify(data));
    }
  }, [data]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      {isRefreshing ? (
        <img
          src="/logo.png" // Replace with your logo path
          alt="Logo"
          className="w-32 h-32 animate-pulse"
        />
      ) : (
        <div className="p-4 bg-white rounded-lg shadow-lg">
          <h1 className="text-xl font-bold">Welcome Back!</h1>
          <p>Data: {data ? JSON.stringify(data) : "No data available"}</p>
          <button
            onClick={() => setData({ message: "Hello, World!" })}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Save Data
          </button>
        </div>
      )}
    </div>
  );
}

export default LogoPage;
