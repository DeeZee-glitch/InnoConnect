import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import MDButton from "components/MDButton";

const Popup = ({ open, title, content, onClose, actions }) => {
  const [troubleshootResponse, setTroubleshootResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const contentRef = useRef(null); // Ref for auto-scrolling

  // Try parsing the content to get the status
  let parsedContent = {};
  try {
    parsedContent = typeof content === "string" ? JSON.parse(content) : content;
  } catch (e) {
    console.error("Error parsing content:", e);
    parsedContent = {};
  }

  useEffect(() => {
    // Auto-scroll to the bottom when troubleshootResponse updates
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [troubleshootResponse]);

  const handleTroubleshoot = async () => {
    setLoading(true);
    setTroubleshootResponse("Analyzing error...");

    try {
      let errorContent;

      // Parse content if it's a string
      if (typeof content === "string") {
        try {
          errorContent = JSON.parse(content);
        } catch (parseError) {
          errorContent = { payload: { message: content } };
        }
      } else {
        errorContent = content;
      }

      // Construct the error payload for the API
      const errorPayload = {
        payload: {
          message:
            errorContent.payload?.message || errorContent.message || "Unknown error occurred",
        },
      };

      const response = await axios.post("http://localhost:8000/api/troubleshoot", {
        errorText: errorPayload,
      });

      // Format the response into bullet points on separate lines.
      const formattedResponse = response.data.response
        .split("•")
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
        .map((item) => "• " + item)
        .join("\n");

      setTroubleshootResponse(formattedResponse);
    } catch (error) {
      setTroubleshootResponse(
        "Error fetching troubleshooting response. " + (error.response?.data?.error || "")
      );
      console.error("Troubleshoot error:", error);
    }

    setLoading(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: "20px",
          background: "linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))",
          backdropFilter: "blur(12px) saturate(120%)",
          WebkitBackdropFilter: "blur(12px) saturate(120%)",
          border: "1.5px solid rgba(255, 255, 255, 0.5)",
          boxShadow: `0 12px 32px rgba(0, 0, 0, 0.1),
                      inset 2px 2px 4px rgba(255, 255, 255, 0.8),
                      inset -2px -2px 4px rgba(255, 255, 255, 0.4)`,
          minHeight: "60vh",
          minWidth: "50vw",
          overflow: "hidden",
          position: "relative",
          "&:before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(45deg, rgba(179, 229, 252, 0.1), rgba(225, 190, 231, 0.15))",
            pointerEvents: "none",
            zIndex: 0,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: "1.8rem",
          textAlign: "center",
          pt: 3,
          pb: 2,
          position: "relative",
          zIndex: 1,
          background: "rgba(255, 255, 255, 0.4)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
        }}
      >
        {title}
      </DialogTitle>

      <DialogContent
        dividers
        ref={contentRef} // Attach ref here for auto-scrolling
        sx={{
          position: "relative",
          zIndex: 1,
          background: "transparent",
          border: "none",
          pt: 3,
          pb: 3,
          maxHeight: "70vh", // Limit content height to allow scrolling
          overflowY: "auto", // Enable vertical scrolling when content overflows
        }}
      >
        <Typography
          variant="body1"
          sx={{
            whiteSpace: "pre-wrap",
            textAlign: "left",
            lineHeight: 1.6,
            color: "text.secondary",
            fontSize: "1.1rem",
          }}
        >
          {content}
        </Typography>

        {troubleshootResponse && (
          <Typography
            variant="body2"
            sx={{
              mt: 2,
              p: 2,
              background: "#f5f5f5",
              borderRadius: "8px",
              fontStyle: "italic",
              color: "#333",
              whiteSpace: "pre-wrap", // Preserves newlines for bullet formatting
            }}
          >
            {troubleshootResponse}
          </Typography>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          justifyContent: "center",
          pt: 2,
          pb: 3,
          position: "relative",
          zIndex: 1,
          background: "rgba(255, 255, 255, 0.4)",
          borderTop: "1px solid rgba(0, 0, 0, 0.05)",
        }}
      >
        {actions}
        {/* Render the Troubleshoot button only if status is "error" in payload */}
        {parsedContent.payload?.status === "error" && (
          <MDButton
            variant="gradient"
            color="error"
            size="large"
            onClick={handleTroubleshoot}
            disabled={loading}
            sx={{
              textTransform: "none",
              borderRadius: "12px",
              px: 4,
              py: 1.5,
              fontSize: "1rem",
              fontWeight: 500,
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              },
            }}
          >
            {loading ? "Troubleshooting..." : "Troubleshoot Error"}
          </MDButton>
        )}
        <MDButton
          variant="gradient"
          color="info"
          size="large"
          onClick={onClose}
          sx={{
            textTransform: "none",
            borderRadius: "12px",
            px: 4,
            py: 1.5,
            fontSize: "1rem",
            fontWeight: 500,
            transition: "all 0.2s ease",
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            },
          }}
        >
          Close
        </MDButton>
      </DialogActions>
    </Dialog>
  );
};

export default Popup;
