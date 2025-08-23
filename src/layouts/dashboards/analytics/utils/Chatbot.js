import React, { useState } from "react";
import { IconButton, Box, TextField, Button, Paper, Typography } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages([...messages, userMessage]);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = { sender: "bot", text: "I'm still learning. How else can I help?" };
      setMessages([...messages, userMessage, botResponse]);
    }, 1000);

    setInput("");
  };

  return (
    <>
      {/* Floating Chat Icon */}
      {!open && (
        <IconButton
          onClick={() => setOpen(true)}
          sx={{
            position: "fixed",
            bottom: 33,
            right: 88,
            width: "50px", // Increased button size
            height: "50px", // Increased button size
            backgroundColor: "#f7f7f7",
            color: "white",
            "&:hover": { backgroundColor: "#0d4c7b" },
          }}
        >
          <ChatIcon />
        </IconButton>
      )}

      {/* Chatbot UI */}
      {open && (
        <Paper
          elevation={3}
          sx={{
            position: "fixed",
            bottom: 85,
            right: 20,
            width: 300,
            height: 400,
            display: "flex",
            flexDirection: "column",
            borderRadius: 2,
          }}
        >
          {/* Chat Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#14629F",
              color: "white",
              padding: "10px",
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
            }}
          >
            <Typography variant="subtitle1" style={{ color: "white" }}>
              Watchtower Chatbot
            </Typography>
            <IconButton onClick={() => setOpen(false)} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Chat Messages */}
          <Box sx={{ flex: 1, overflowY: "auto", padding: "10px" }}>
            {messages.map((msg, index) => (
              <Typography
                key={index}
                sx={{
                  textAlign: msg.sender === "user" ? "right" : "left",
                  backgroundColor: msg.sender === "user" ? "#e0f7fa" : "#f1f1f1",
                  padding: "8px",
                  borderRadius: "10px",
                  marginBottom: "5px",
                  display: "inline-block",
                }}
              >
                {msg.text}
              </Typography>
            ))}
          </Box>

          {/* Chat Input */}
          <Box sx={{ display: "flex", padding: "10px", borderTop: "1px solid #ddd" }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button
              onClick={handleSendMessage}
              sx={{ marginLeft: "5px" }}
              style={{ color: "white" }}
              variant="contained"
            >
              Send
            </Button>
          </Box>
        </Paper>
      )}
    </>
  );
};

export default Chatbot;
