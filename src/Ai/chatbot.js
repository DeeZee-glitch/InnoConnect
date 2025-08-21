import { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  List,
  ListItem,
  Avatar,
  IconButton,
  styled,
  useTheme,
  Typography,
  Tooltip,
  GlobalStyles,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/DeleteRounded";
import StopIcon from "@mui/icons-material/Stop";

const ChatContainer = styled(Box)({
  maxWidth: "78%",
  margin: "auto",
  marginLeft: "320px",
  marginTop: "20px",
  height: "95vh",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "#1e1e1e", // Dark grey background
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
  overflow: "hidden",
  color: "#ffffff", // White text
});

const Header = styled(Box)({
  padding: "12px",
  backgroundColor: "#2a2a2a", // Slightly lighter dark grey
  color: "white",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: "1rem",
  fontWeight: "bold",
  borderBottom: "1px solid #3a3a3a",
  transition: "background-color 0.3s ease",
  "&:hover": {
    backgroundColor: "#333333", // Hover effect
  },
});

const MessagesContainer = styled(List)({
  flexGrow: 1,
  overflowY: "auto",
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  scrollbarWidth: "thin",
  scrollbarColor: "#4a4a4a transparent", // Custom scrollbar
  "&::-webkit-scrollbar": {
    width: "8px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#4a4a4a",
    borderRadius: "4px",
  },
});

const InputContainer = styled(Box)({
  padding: "12px",
  backgroundColor: "#2a2a2a", // Darker input container
  borderTop: "1px solid #3a3a3a",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  transition: "background-color 0.3s ease",
  "&:hover": {
    backgroundColor: "#333333", // Hover effect
  },
});

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [abortController, setAbortController] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const theme = useTheme();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const savedMessages = JSON.parse(localStorage.getItem("chatMessages"));
    if (savedMessages) setMessages(savedMessages);
  }, []);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isRequesting) return;

    // Add user message to the chat
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput("");

    // Add a placeholder for the assistant's response
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    const controller = new AbortController();
    setAbortController(controller);
    setIsRequesting(true);

    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulatedContent += chunk;

        // Update the last assistant message with the accumulated content
        setMessages((prev) => {
          const updatedMessages = [...prev];
          updatedMessages[updatedMessages.length - 1].content = accumulatedContent;
          return updatedMessages;
        });
      }
    } catch (error) {
      if (error.name === "AbortError") {
        setMessages((prev) => prev.slice(0, -1));
      } else {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: "Error: Could not connect to the assistant." },
        ]);
      }
    } finally {
      setIsRequesting(false);
      setAbortController(null);
    }
  };

  const handleTerminate = () => {
    if (abortController) abortController.abort();
  };

  const clearMessages = () => {
    setMessages([]);
    localStorage.removeItem("chatMessages");
  };

  return (
    <ChatContainer>
      <GlobalStyles
        styles={{
          "@keyframes fadeIn": {
            "0%": { opacity: 0, transform: "translateY(10px)" },
            "100%": { opacity: 1, transform: "translateY(0)" },
          },
        }}
      />
      <Header>
        <span>SmartBot</span>
        <Tooltip title="Clear Chat">
          <IconButton onClick={clearMessages} sx={{ color: "blue" }}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Header>
      <MessagesContainer>
        {messages.map((msg, i) => (
          <ListItem
            key={i}
            sx={{
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "70%",
              minWidth: "100px",
              animation: "fadeIn 0.3s ease-in-out forwards",
              padding: 0,
            }}
          >
            {msg.role === "assistant" && <Avatar sx={{ bgcolor: "#4a4a4a", mr: 1 }}>AI</Avatar>}
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: msg.role === "user" ? "#3a3a3a" : "#4a4a4a", // Subtle grey tones
                width: "100%",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.02)" },
              }}
            >
              <Typography variant="body2" sx={{ wordBreak: "break-word", color: "#ffffff" }}>
                {msg.content}
              </Typography>
            </Box>
          </ListItem>
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      <InputContainer>
        <TextField
          fullWidth
          variant="outlined"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about logs, APIs, or configurations..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "20px",
              backgroundColor: "#3a3a3a",
              "& fieldset": { borderColor: "#4a4a4a" },
              "&:hover fieldset": { borderColor: "#5a5a5a" },
              "&.Mui-focused fieldset": { borderColor: "#6a6a6a" },
            },
            "& .MuiInputBase-input": {
              color: "#ffffff",
            },
          }}
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={!input.trim() || isRequesting}
          sx={{
            bgcolor: "#4a4a4a",
            color: "white",
            "&:hover": { bgcolor: "#5a5a5a" },
          }}
        >
          <SendIcon />
        </IconButton>
        {isRequesting && (
          <Tooltip title="Stop request">
            <IconButton color="error" onClick={handleTerminate} sx={{ ml: 1 }}>
              <StopIcon />
            </IconButton>
          </Tooltip>
        )}
      </InputContainer>
    </ChatContainer>
  );
}
