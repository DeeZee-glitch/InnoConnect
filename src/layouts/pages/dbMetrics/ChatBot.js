import React, { useState } from "react";
import PropTypes from "prop-types"; // Import PropTypes

const ChatBot = ({ pageData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);

  // Toggle chatbox visibility
  const toggleChat = () => setIsOpen(!isOpen);

  // Handle user messages
  const handleUserMessage = (message) => {
    const newMessage = { user: "You", text: message };
    const botReply = getBotReply(message);
    setMessages((prevMessages) => [...prevMessages, newMessage, botReply]);
  };

  const getBotReply = (message) => {
    let reply = "I didn't understand that. Please specify the query in the format `field: value`.";

    // Match the query format (e.g., "status: active")
    const match = message.match(/(.+?):\s*(.+)/);
    if (match) {
      const [_, field, value] = match;
      const filteredAlerts = pageData.filter(
        (alert) => alert[field]?.toLowerCase() === value.toLowerCase()
      );

      if (filteredAlerts.length > 0) {
        reply =
          `Here are the alerts for ${field} "${value}": ` +
          filteredAlerts
            .map(
              (alert, index) =>
                `${index + 1}. Alert ID: ${alert.alertId}, Rule Name: ${alert.ruleName}, Status: ${alert.status}`
            )
            .join(" | "); // Output in one line, separated by " | "
      } else {
        reply = `No alerts found for ${field} "${value}".`;
      }
    } else {
      reply = `Invalid query format. Please use "field: value" (e.g., "status: active").`;
    }

    return { user: "Bot", text: reply };
  };

  return (
    <div>
      {/* Floating Chat Icon */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: "#007bff",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        }}
        onClick={toggleChat}
      >
        <span style={{ color: "#fff", fontSize: "28px" }}>💬</span>
      </div>

      {/* ChatBox */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "80px",
            right: "20px",
            width: "400px",
            height: "600px",
            backgroundColor: "#f0f0f0",
            borderRadius: "15px",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            overflow: "hidden",
          }}
        >
          {/* Chat Header */}
          <div
            style={{
              backgroundColor: "#007bff",
              color: "#fff",
              padding: "10px",
              fontWeight: "bold",
              textAlign: "center",
              fontSize: "16px",
            }}
          >
            ChatBot
          </div>

          {/* Chat Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  alignSelf: msg.user === "You" ? "flex-end" : "flex-start",
                  backgroundColor: msg.user === "You" ? "#dcf8c6" : "#fff",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  maxWidth: "75%",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <strong style={{ fontSize: "12px", color: "#555" }}>{msg.user}</strong>
                <div style={{ fontSize: "14px", color: "#000" }}>{msg.text}</div>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px",
              backgroundColor: "#fff",
              borderTop: "1px solid #ddd",
            }}
          >
            <input
              type="text"
              placeholder="Type a message..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value) {
                  handleUserMessage(e.target.value);
                  e.target.value = "";
                }
              }}
              style={{
                flex: 1,
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "20px",
                outline: "none",
                fontSize: "14px",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Add PropTypes for validation
ChatBot.propTypes = {
  pageData: PropTypes.arrayOf(
    PropTypes.shape({
      alertId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      alertTimestamp: PropTypes.string,
      ruleName: PropTypes.string,
      priority: PropTypes.string,
      channel: PropTypes.string,
      receiver: PropTypes.string,
      description: PropTypes.string,
      status: PropTypes.string,
    })
  ).isRequired,
};

export default ChatBot;
