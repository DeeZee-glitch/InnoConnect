import React, { useState, useEffect } from "react";
// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Import react-grid-layout
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

function Widgets() {
  const initialLayout = [
    { i: "resources", x: 0, y: 0, w: 4, h: 2 },
    { i: "documentation", x: 0, y: 2, w: 4, h: 2 },
    { i: "gettingStarted", x: 0, y: 4, w: 4, h: 2 },
    { i: "platformStatus", x: 0, y: 6, w: 4, h: 1 },
    { i: "monitoring", x: 0, y: 7, w: 4, h: 1 },
    { i: "errorReporting", x: 0, y: 8, w: 4, h: 1 },
  ];

  const [layout, setLayout] = useState(() => {
    // Get the layout from localStorage or use the initial layout
    const savedLayout = localStorage.getItem("dashboardLayout");
    return savedLayout ? JSON.parse(savedLayout) : initialLayout;
  });
  const [gridWidth, setGridWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setGridWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleAddWidget = () => {
    const newWidgetId = `widget-${layout.length}`;
    const newWidget = { i: newWidgetId, x: 0, y: Infinity, w: 4, h: 2 }; // Add new widget at the bottom
    const updatedLayout = [...layout, newWidget];
    setLayout(updatedLayout);
    localStorage.setItem("dashboardLayout", JSON.stringify(updatedLayout)); // Save updated layout to localStorage
  };

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
    localStorage.setItem("dashboardLayout", JSON.stringify(newLayout)); // Save updated layout to localStorage
  };

  return (
    <DashboardLayout style={{ width: "100%", padding: "0", margin: "0" }}>
      <DashboardNavbar />
      <div style={{ padding: "0", margin: "0" }}>
        <div style={{ textAlign: "right", padding: "10px" }}>
          <button
            onClick={handleAddWidget}
            style={{
              backgroundColor: "#14629F",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            +
          </button>
        </div>
        <GridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={150}
          width={gridWidth}
          onLayoutChange={handleLayoutChange}
        >
          {layout.map((item) => (
            <div key={item.i} style={widgetStyle}>
              <h3>Widget {item.i}</h3>
              <p>This is a dynamically added widget.</p>
            </div>
          ))}
        </GridLayout>
      </div>
      <Footer />
    </DashboardLayout>
  );
}

// Widget styling
const widgetStyle = {
  backgroundColor: "#fff",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
  padding: "20px",
  height: "100%",
  overflow: "auto",
};

export default Widgets;
