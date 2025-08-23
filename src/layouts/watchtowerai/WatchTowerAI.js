import React, { useState, useRef, useEffect } from "react";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import CircularProgress from "@mui/material/CircularProgress";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import DefaultLineChart from "examples/Charts/LineCharts/DefaultLineChart";
import { useTheme } from "@mui/material/styles";
import { ErrorMessage } from "formik";
import userLogo from "../../assets/images/team-4.jpg";
import watchTowerLogo from "../../assets/images/Logo.png";

function WatchTowerAI() {
  const [input, setInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [moveInput, setMoveInput] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // New state to track processing status
  const chatEndRef = useRef(null);
  const theme = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(true);

  const handleInputChange = (event) => setInput(event.target.value);

  const typeText = (text, callback) => {
    let currentIndex = -1;
    const typeInterval = setInterval(() => {
      if (currentIndex < text.length) {
        setChatHistory((prev) => {
          const updated = [...prev];
          const lastMessage = updated[updated.length - 1];
          updated[updated.length - 1] = {
            ...lastMessage,
            content: lastMessage.content + (text[currentIndex] || ""),
          };
          return updated;
        });
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        if (callback) callback();
      }
    }, 10); // Adjust typing speed here (milliseconds per character)
  };

  function formatSummaryToHTML(summary) {
    // Escape special characters (&, <, >) outside tags
    summary = summary
      .replace(/&(?!amp;|lt;|gt;)/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Convert **text** to <b>text</b> for bold
    summary = summary.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

    // Convert *text* to <i>text</i> for italics
    summary = summary.replace(/\*(?!\*)(.*?)\*(?!\*)/g, "<i>$1</i>");

    // Convert __text__ to <u>text</u> for underline
    summary = summary.replace(/__(.*?)__/g, "<u>$1</u>");

    // Convert ~~text~~ to <s>text</s> for strikethrough
    summary = summary.replace(/~~(.*?)~~/g, "<s>$1</s>");

    // Handle bullets: lines starting with '-' or '*'
    summary = summary.replace(
      /(?:^|\n)[\-\*]\s(.*?)(?=\n|$)/g,
      (match, p1) => `<li>${p1.trim()}</li>`
    );

    // Wrap bullet points in <ul> tags
    summary = summary.replace(/(<li>.*?<\/li>)/g, "<ul>$1</ul>").replace(/<\/ul>\s*<ul>/g, ""); // Remove consecutive <ul> tags

    // Handle numbering: lines starting with '1.', '2.', etc.
    summary = summary.replace(
      /(?:^|\n)\d+\.\s(.*?)(?=\n|$)/g,
      (match, p1) => `<li>${p1.trim()}</li>`
    );

    // Wrap numbered points in <ol> tags
    summary = summary.replace(/(<li>.*?<\/li>)/g, "<ol>$1</ol>").replace(/<\/ol>\s*<ol>/g, ""); // Remove consecutive <ol> tags

    // Convert [text](url) to hyperlinks <a href="url">text</a>
    summary = summary.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Convert new lines (\n) to <br> for line breaks
    summary = summary.replace(/\n/g, "<br>");

    // Remove consecutive <br> tags and replace with a single <br>
    summary = summary.replace(/(<br>\s*){2,}/g, "<br>");

    return summary;
  }

  const handleSubmit = async () => {
    if (!input.trim() || isProcessing) return; // Prevent submission if already processing

    setIsProcessing(true); // Set processing state to true

    const userInput = { type: "user", content: input };

    const processingResponse = { type: "", content: "" };
    setChatHistory((prev) => [...prev, userInput, processingResponse]);

    setInput("");
    setMoveInput(true);

    try {
      const response = await fetch("https://172.20.150.10:5000/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });

      const result = await response.json();
      console.log(result);

      setChatHistory((prev) => prev.filter((message) => message.content !== "processing"));

      if (result.response) {
        const formattedResponse = formatSummaryToHTML(String(result.response)); // Format the response before updating chat history
        console.log(formattedResponse);
        setChatHistory((prev) => [
          ...prev,
          {
            type: "sender",
            content: "", // Store formatted response
          },
        ]);

        typeText(formattedResponse); // Ensure the formatted text is displayed properly
      } else if (result.result?.columns && result.result?.rows) {
        setShowTable(true);
        setShowChart(false);

        setChatHistory((prev) => [
          ...prev,
          {
            type: "sender",
            content: {
              columns: result.result.columns,
              rows: result.result.rows,
            },
          },
        ]);
        if (result.summary) {
          const formattedSummary = formatSummaryToHTML(result.summary);
          setChatHistory((prev) => [
            ...prev,
            {
              type: "summary",
              content: "",
            },
          ]);
          // Use typeText to render the summary one character at a time
          typeText(formattedSummary, () => {
            console.log(formattedSummary);
          });
        }
      } else if (result.result?.labels && result.result?.datasets) {
        setShowTable(false);
        setShowChart(true);

        const apiData = result.result; // Assuming `result.result` contains the chart data
        console.log("API Data:", apiData); // Log to verify the structure

        // Group data by date and channel
        const transformData = (apiData) => {
          const groupedData = {};
          const uniqueDates = new Set();

          // Extract unique dates and group data by date and channel
          apiData.labels.forEach((timestamp, index) => {
            const date = timestamp.split("T")[0]; // Extract date part
            uniqueDates.add(date);

            const channel = apiData.datasets[index]?.channel || "UNKNOWN";

            if (!groupedData[date]) {
              groupedData[date] = {};
            }

            if (!groupedData[date][channel]) {
              groupedData[date][channel] = 0;
            }

            groupedData[date][channel] += 1;
          });

          const transformedLabels = Array.from(uniqueDates).sort(); // Sorted unique dates

          // Ensure every date has a value for all channels
          const allChannels = Array.from(
            new Set(apiData.datasets.map((ds) => ds.channel || "UNKNOWN"))
          );

          const transformedDatasets = allChannels.map((channel) => ({
            label: channel,
            data: transformedLabels.map((date) => groupedData[date]?.[channel] || 0), // Fill missing values with 0
          }));

          return {
            labels: transformedLabels,
            datasets: transformedDatasets,
          };
        };

        const transformedApiData = transformData(apiData);

        const mappedChartData = {
          labels: transformedApiData.labels,
          datasets: transformedApiData.datasets.map((dataset, index) => ({
            label: dataset.label,
            data: dataset.data, // Aligned data for each label
          })),
        };

        console.log("Mapped Chart Data for Chart:", mappedChartData);

        // Check if there are valid labels and datasets
        if (!mappedChartData.labels.length || !mappedChartData.datasets.length) {
          console.log("No chart data available.");
          return <div>No data available for the chart.</div>;
        }

        // Set the chart data directly in chat history without relying on state
        setChatHistory((prev) =>
          prev.map((message, index) =>
            index === prev.length - 1
              ? {
                  type: "sender",
                  content: (
                    <div
                      style={{
                        width: "800px",
                        maxWidth: "100%",
                        margin: "0 auto",
                        backgroundColor: "white",
                      }}
                    >
                      <DefaultLineChart
                        chart={mappedChartData} // Use mappedChartData directly
                      />
                    </div>
                  ),
                }
              : message
          )
        );
        if (result.summary) {
          const formattedSummary = formatSummaryToHTML(result.summary);
          setChatHistory((prev) => [
            ...prev,
            {
              type: "summary",
              content: "",
            },
          ]);
          // Use typeText to render the summary one character at a time
          typeText(formattedSummary, () => {
            console.log(formattedSummary);
          });
        }
      } else if (
        result.result?.feed_name &&
        result.result?.monitor_system_name &&
        result.result?.rule_name &&
        result.result?.definition_name
      ) {
        setChatHistory((prev) => [
          ...prev,
          {
            type: "sender",
            content: {
              feedName: result.result.feed_name,
              monitorSystemName: result.result.monitor_system_name,
              ruleName: result.result.rule_name,
              definitionName: result.result.definition_name,
            },
          },
        ]);
      } else if (result.result?.error_message && result.result?.response) {
        setChatHistory((prev) => [
          ...prev,
          {
            type: "sender",
            content: {
              errorMessage: result.result.error_message,
              responseMessage: result.result.response,
            },
          },
        ]);
      } else {
        const formattedError = formatSummaryToHTML(result.error || "Something went wrong."); // Format error message
        console.log(result.error);
        setChatHistory((prev) => [
          ...prev,
          { type: "sender", content: "" }, // Store formatted error message
        ]);
        typeText(formattedError);
      }
    } catch (error) {
      console.error("Error fetching data:", error);

      setChatHistory((prev) => prev.filter((message) => message.content !== "processing"));

      setChatHistory((prev) => [
        ...prev,
        {
          type: "sender",
          content: "Please check your database connectivity with the server.",
        },
      ]);
    } finally {
      setIsProcessing(false); // Reset processing state after completion
    }
  };

  const handleStopProcess = async () => {
    try {
      const response = await fetch("https://172.20.150.10:5000/stop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      if (result.response) {
        console.log(result.response);
        setIsProcessing(false);
        setChatHistory((prev) => [
          ...prev,
          { type: "sender", content: "Process stopped successfully." },
        ]);
      } else {
        // Display the error message from the Python backend
        setChatHistory((prev) => [
          ...prev,
          { type: "sender", content: result.error || "Failed to stop process." },
        ]);
      }
    } catch (error) {
      console.error("Error stopping process:", error);
      setChatHistory((prev) => [
        ...prev,
        { type: "sender", content: "Error stopping the process." },
      ]);
    }
  };

  // Scroll to the last message whenever the chat history is updated
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]); // Depend on chatHistory to trigger scroll when it's updated

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: moveInput ? "flex-start" : "center",
          overflowY: "auto",
          height: "80vh",
          width: "80vw",
          padding: "20px",
          position: "relative",
        }}
      >
        {moveInput && (
          <div
            style={{
              width: "100%",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              overflowY: "auto",
              marginBottom: "60px",
            }}
          >
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: chat.type === "user" ? "flex-end" : "flex-start",
                  alignItems: "flex-start",
                  width: "100%",
                  maxWidth: "800px",
                  margin: "10px auto",
                }}
              >
                {/* Logo for sender (AI) */}
                {chat.type === "sender" && (
                  <img
                    src={watchTowerLogo} // Replace with the actual logo path
                    alt="Sender Logo"
                    style={{
                      width: "30px",
                      height: "30px",
                      marginRight: "8px", // Space between logo and message bubble
                      marginLeft: "-40px", // Pull logo slightly left
                      borderRadius: "50%",
                      objectFit: "unset",
                      flexShrink: 0, // Prevents resizing when the message grows
                    }}
                  />
                )}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column", // Ensure the content is displayed properly
                    //alignItems: "flex-start", // Align message content to the left for user and to the right for sender
                    maxWidth: "800px",
                    backgroundColor: chat.type === "user" ? "#d8d9dc" : "",
                    color:
                      chat.type === "user"
                        ? theme.palette.common.black
                        : theme.palette.text.primary,
                    padding:
                      chat.type === "user" ||
                      (chat.type === "sender" && typeof chat.content === "string")
                        ? "10px"
                        : "0px",
                    borderRadius: "10px",
                    //boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    position: "relative", // This ensures the logo is positioned relative to the bubble container
                  }}
                >
                  {chat.content && typeof chat.content === "string" ? (
                    <span
                      style={{
                        fontSize: "14px",
                      }}
                      dangerouslySetInnerHTML={{ __html: chat.content }} // Interpret as HTML
                    />
                  ) : chat.content.columns && chat.content.rows ? (
                    <div
                      style={{
                        width: "100%",
                        maxWidth: "800px",
                        margin: "0 auto",
                        overflowX: "auto",
                        backgroundColor: "white",
                      }}
                    >
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          border: "1px solid black",
                        }}
                      >
                        <thead>
                          <tr>
                            {chat.content.columns.map((column, colIndex) => (
                              <th
                                key={colIndex}
                                style={{
                                  border: "1px solid black",
                                  padding: "4px",
                                  textAlign: "center",
                                  fontWeight: "bold",
                                  fontSize: "12px",
                                }}
                              >
                                {column.replace(/_/g, " ").toUpperCase()}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {chat.content.rows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {row.map((cell, cellIndex) => (
                                <td
                                  key={cellIndex}
                                  style={{
                                    border: "1px solid black",
                                    padding: "4px",
                                    textAlign: "center",
                                    fontSize: "10px",
                                  }}
                                >
                                  {cell !== null ? cell : "N/A"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : chat.content?.feedName &&
                    chat.content?.monitorSystemName &&
                    chat.content?.ruleName &&
                    chat.content?.definitionName ? (
                    <div style={{ fontSize: "14px", lineHeight: "1.5" }}>
                      <p>
                        Here you go, I have set monitor mechanism with this feed name{" "}
                        <strong>{chat.content.feedName}</strong>. Now start pushing the data to this
                        feed via SOAPUI.
                      </p>
                      <br></br>
                      <p>
                        <strong>Feed Name:</strong> {chat.content.feedName}
                      </p>
                      <p>
                        <strong>Monitor System Name:</strong> {chat.content.monitorSystemName}
                      </p>
                      <p>
                        <strong>Rule Name:</strong> {chat.content.ruleName}
                      </p>
                      <p>
                        <strong>Definition Name:</strong> {chat.content.definitionName}
                      </p>
                      <br></br>
                      <p>
                        After you push the data to this feed{" "}
                        <strong>{chat.content.feedName}</strong>, if the rule criteria is violated
                        then you will get notify.
                      </p>
                    </div>
                  ) : chat.content?.errorMessage && chat.content?.responseMessage ? (
                    <div style={{ fontSize: "14px", lineHeight: "1.5" }}>
                      <p>{chat.content.responseMessage} :</p>
                      <p>{chat.content.errorMessage}</p>
                    </div>
                  ) : chat.type === "sender" && chat.content === "chart" ? (
                    <div style={{ width: "100%", padding: "20px" }}>
                      <DefaultLineChart chart={mappedChartData} />
                    </div>
                  ) : (
                    <span style={{ fontSize: "14px" }}>{chat.content}</span>
                  )}
                </div>
                {/* Logo for user */}
                {/* {chat.type === "user" && (
                  <img
                    src={userLogo} // Replace with the actual user logo path
                    alt="User Logo"
                    style={{
                      width: "30px",
                      height: "30px",
                      marginLeft: "8px", // Space between logo and message bubble
                      marginRight: "-40px", // Pull logo slightly right
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                )} */}
              </div>
            ))}

            <div ref={chatEndRef} />
          </div>
        )}

        {!moveInput && (
          <MDBox style={{ marginBottom: "20px" }}>
            <MDTypography>I am WatchTower AI. How can I help you?</MDTypography>
          </MDBox>
        )}

        <MDBox
          style={{
            backgroundColor: "#dbdbdb",
            padding: "10px",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "800px",
            display: "flex",
            alignItems: "center",
            position: moveInput ? "absolute" : "relative",
            bottom: moveInput ? "1px" : "auto",
            left: moveInput ? "56%" : "auto",
            transform: moveInput ? "translateX(-60%)" : "none",
          }}
        >
          <input
            type="text"
            placeholder="Example: Show me the records from monitor rules logs."
            value={input}
            onChange={handleInputChange}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSubmit();
              }
            }}
            style={{
              padding: "10px",
              fontSize: "16px",
              backgroundColor: "transparent",
              border: "none",
              outline: "none",
              flex: 1,
              // opacity: isProcessing ? 0.5 : 1, // Disable input while processing
              // pointerEvents: isProcessing ? "none" : "auto", // Disable interactions while processing
            }}
          />
          <div
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: "black",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              opacity: isProcessing ? 0.5 : 1, // Disable button while processing
              pointerEvents: "auto", // Enable interaction for StopCircleIcon
            }}
            onClick={isProcessing ? handleStopProcess : handleSubmit}
          >
            {isProcessing ? (
              <StopCircleIcon style={{ color: "red" }} />
            ) : (
              <ArrowUpwardIcon style={{ color: "white" }} />
            )}
          </div>
        </MDBox>
      </div>
    </DashboardLayout>
  );
}

export default WatchTowerAI;
