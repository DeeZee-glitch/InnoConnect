import React from "react";

const ChatbotWebUI = () => {
  return (
    <div
      style={{
        marginLeft: "260px", // Match sidebar width
        width: "calc(100% - marginLeft)", // Subtract sidebar width
        height: "100vh",
        position: "relative",
        boxSizing: "border-box",
        // Responsive styles
        "@media (max-width: 768px)": {
          marginLeft: "0",
          width: "100%",
        },
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        <iframe
          src="http://localhost:3000"
          title="Open WebUI Chatbot"
          style={{
            flex: 1,
            width: "100%",
            border: "none",
            borderRadius: "20px",
            overflow: "hidden",
          }}
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

export default ChatbotWebUI;
