/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from "react";
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState } from "reactflow";
import "reactflow/dist/style.css";
import { Box } from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import { useSnackbar } from "context/snackbarContext";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const getStatusColor = (status) => {
  const colors = {
    200: "#10b981", // Emerald
    400: "#f59e0b", // Amber
    500: "#ef4444", // Red
    default: "#6b7280", // Gray
  };
  return colors[status] || colors.default;
};

const parentNodeWidth = 320;
const childNodeWidth = 200;
const nodeHeight = 110; // Used for both top-level nodes and children
const marginX = 60;
const marginY = 40;

const glossyEffect = {
  background: "linear-gradient(145deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
};

const darkenColor = (hex, amount) => {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);

  r = Math.max(0, r - amount);
  g = Math.max(0, g - amount);
  b = Math.max(0, b - amount);

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

const NodeLabel = ({ node, isParent, onClick, onMouseEnter, onMouseMove, onMouseLeave }) => {
  const statusColor = getStatusColor(node.status);
  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        textAlign: "center",
        cursor: "pointer",
        padding: isParent ? "12px" : "8px",
        width: "100%",
        height: "100%",
      }}
    >
      <div
        style={{
          background: `linear-gradient(145deg, ${statusColor} 0%, ${darkenColor(statusColor, 20)} 100%)`,
          color: "#6b7280",
          padding: isParent ? "10px 20px" : "4px 8px",
          borderRadius: "8px",
          marginBottom: "8px",
          position: "relative",
          ...glossyEffect,
        }}
      >
        <strong>{node.resourceName}</strong>
      </div>
      <div style={{ margin: "4px 0", fontSize: "1em" }}>
        <span style={{ color: "#6b7280", fontWeight: 500 }}>Elapsed: </span>
        <span style={{ color: node.selectedElapsedTime > 1000 ? "#ef4444" : "#10b981" }}>
          {node.selectedElapsedTime}ms
        </span>
      </div>
      <div style={{ fontSize: "1em" }}>
        <span style={{ color: "#6b7280", fontWeight: 500 }}>Status: </span>
        <span
          style={{
            color: getStatusColor(node.status),
            fontWeight: 600,
          }}
        >
          {node.status}
        </span>
      </div>
    </div>
  );
};

function FlowDiagram({ flowData }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const { showSnackbar } = useSnackbar();

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showSnackbar("Copied to clipboard!", "success");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  const parseJson = (jsonString) => {
    try {
      let parsedData = JSON.parse(jsonString);
      if (typeof parsedData.payload === "string") {
        parsedData.payload = JSON.parse(parsedData.payload);
      }
      return parsedData;
    } catch (e) {
      return jsonString;
    }
  };

  const handleNodeClick = (event, node) => {
    event.stopPropagation();
    setSelectedNode({
      requestPayload: node.requestPayload,
      responsePayload: node.responsePayload,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedNode(null);
  };

  useEffect(() => {
    if (!Array.isArray(flowData) || flowData.length === 0) return;

    // Create a set of all uniqueTransactionIDs for quick lookup
    const uniqueTransactionIDs = new Set(flowData.map((node) => node.uniqueTransactionID));

    // Parents: nodes with parentID "N/A" or null
    const parents = flowData.filter((node) => node.parentID === "N/A" || node.parentID === null);

    // Children: nodes with a parentID that matches some uniqueTransactionID
    const children = flowData.filter(
      (node) =>
        node.parentID !== "N/A" && node.parentID !== null && uniqueTransactionIDs.has(node.parentID)
    );

    // Orphans: nodes with a parentID that doesn’t match any uniqueTransactionID
    const orphans = flowData.filter(
      (node) =>
        node.parentID !== "N/A" &&
        node.parentID !== null &&
        !uniqueTransactionIDs.has(node.parentID)
    );

    // Combine parents and orphans into top-level nodes
    const topLevelNodes = [...parents, ...orphans];

    // Function to get direct children of a node
    const getChildren = (parentId) => children.filter((child) => child.parentID === parentId);

    // Create nodes and edges
    const allNodes = [];
    const allEdges = [];
    const containerWidth =
      document.querySelector(".flow-container")?.clientWidth || window.innerWidth;
    const maxNodesPerRow = Math.floor(containerWidth / (parentNodeWidth + marginX));
    let currentCol = 0;
    let parentNodeY = 50;

    const getElapsedTimeStyle = (elapsedTime) => ({
      borderRadius: "16px",
      padding: "12px",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      ...(elapsedTime > 1000
        ? {
            border: "20px solid #ef4444",
            boxShadow: "0 0 16px 5px rgba(239, 68, 68, 0.25)",
          }
        : {
            border: "2px solid rgba(209, 213, 219, 0.3)",
          }),
    });

    topLevelNodes.forEach((topLevelNode) => {
      const childNodes = getChildren(topLevelNode.uniqueTransactionID);
      const hasChildren = childNodes.length > 0;
      const nodeWidth = hasChildren ? parentNodeWidth : childNodeWidth;
      const nodeHeightValue = hasChildren
        ? childNodes.length * (nodeHeight + marginY) + 165
        : nodeHeight;
      const nodeX = currentCol * (parentNodeWidth + marginX);

      // Create top-level node (parent or orphan)
      allNodes.push({
        id: topLevelNode.uniqueTransactionID,
        data: {
          label: (
            <NodeLabel
              node={topLevelNode}
              isParent={hasChildren}
              onClick={(e) => handleNodeClick(e, topLevelNode)}
              onMouseEnter={(e) => handleMouseEnter(e, topLevelNode)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            />
          ),
        },
        style: {
          ...getElapsedTimeStyle(topLevelNode.selectedElapsedTime),
          width: nodeWidth,
          height: nodeHeightValue,
          backgroundColor: hasChildren ? "rgba(255, 255, 255, 0.55)" : "rgba(255, 255, 255, 1)",
          backdropFilter: hasChildren ? "blur(0px)" : "none",
          border: hasChildren
            ? "3px solid rgba(255, 255, 255, 0.9)"
            : "2px solid rgba(209, 213, 219, 0.3)",
          boxShadow: hasChildren
            ? "0 8px 32px rgba(0, 0, 0, 0.1), inset 2px 2px 4px rgba(255, 255, 255, 0.2), inset -2px -2px 4px rgba(255, 255, 255, 0.1)"
            : "0 4px 6px rgba(0, 0, 0, 0.05)",
          borderLeft: hasChildren ? undefined : `4px solid ${getStatusColor(topLevelNode.status)}`,
        },
        position: { x: nodeX, y: parentNodeY },
        sourcePosition: "right",
        targetPosition: "left",
      });

      // If the top-level node has children, create child nodes
      if (hasChildren) {
        let childNodeY = 180;
        childNodes.forEach((child) => {
          const childNodeX = nodeX + (nodeWidth - childNodeWidth) / 2;
          allNodes.push({
            id: child.uniqueTransactionID,
            data: {
              label: (
                <NodeLabel
                  node={child}
                  onClick={(e) => handleNodeClick(e, child)}
                  onMouseEnter={(e) => handleMouseEnter(e, child)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                />
              ),
            },
            style: {
              ...getElapsedTimeStyle(child.selectedElapsedTime),
              backgroundColor: "rgba(255, 255, 255, 1)",
              borderRadius: "12px",
              width: childNodeWidth,
              height: nodeHeight,
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
              borderLeft: `4px solid ${getStatusColor(child.status)}`,
            },
            position: { x: childNodeX, y: parentNodeY + childNodeY },
            sourcePosition: "bottom",
            targetPosition: "top",
          });
          childNodeY += nodeHeight + marginY;
        });

        // Connect child nodes sequentially
        childNodes.slice(0, -1).forEach((child, index) => {
          allEdges.push({
            id: `edge-${child.uniqueTransactionID}-${childNodes[index + 1].uniqueTransactionID}`,
            source: child.uniqueTransactionID,
            target: childNodes[index + 1].uniqueTransactionID,
            type: "smoothstep",
            animated: childNodes[index + 1].status >= 400,
            style: {
              strokeWidth: 2,
              stroke: getStatusColor(childNodes[index + 1].status),
              opacity: 1.0,
            },
            markerEnd: {
              type: "arrowclosed",
              color: getStatusColor(childNodes[index + 1].status),
            },
          });
        });
      }

      // Update position for the next top-level node
      currentCol = (currentCol + 1) % maxNodesPerRow;
      if (currentCol === 0) parentNodeY += Math.max(nodeHeightValue, nodeHeight) + marginY;
    });

    // Connect top-level nodes sequentially
    topLevelNodes.slice(0, -1).forEach((topLevelNode, index) => {
      allEdges.push({
        id: `edge-${topLevelNode.uniqueTransactionID}-${topLevelNodes[index + 1].uniqueTransactionID}`,
        source: topLevelNode.uniqueTransactionID,
        target: topLevelNodes[index + 1].uniqueTransactionID,
        type: "smoothstep",
        animated: topLevelNodes[index + 1].status >= 400,
        style: {
          strokeWidth: 2,
          stroke: getStatusColor(topLevelNodes[index + 1].status),
          opacity: 0.7,
        },
        markerEnd: {
          type: "arrowclosed",
          color: getStatusColor(topLevelNodes[index + 1].status),
        },
      });
    });

    setNodes(allNodes);
    setEdges(allEdges);
  }, [flowData]);

  const handleMouseEnter = (event, node) => {
    setHoveredNode(node);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = (event) => {
    setTooltipPosition({ x: event.clientX + 10, y: event.clientY + 10 });
  };

  const handleMouseLeave = () => {
    setHoveredNode(null);
  };

  return (
    <div style={{ height: "85vh", width: "100%", position: "relative" }}>
      {hoveredNode && (
        <div
          style={{
            position: "fixed",
            top: tooltipPosition.y + 12,
            left: tooltipPosition.x,
            zIndex: 1000,
            pointerEvents: "none",
            transform: "translateY(-50%)",
            transition: "opacity 0.15s ease, transform 0.15s ease",
            filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.08))",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "16px",
              top: "-6px",
              width: "12px",
              height: "12px",
              transform: "rotate(45deg)",
              background: "#ffffff",
              borderTopLeftRadius: "2px",
            }}
          />
          <div
            style={{
              background: "#ffffff",
              borderRadius: "8px",
              minWidth: "280px",
              position: "relative",
              border: "1px solid rgba(0, 0, 0, 0.05)",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "0",
                top: "0",
                bottom: "0",
                width: "4px",
                background: getStatusColor(hoveredNode.status),
                borderTopLeftRadius: "8px",
                borderBottomLeftRadius: "8px",
              }}
            />
            <div style={{ padding: "16px 20px 20px 24px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "16px",
                }}
              >
                <span
                  style={{
                    fontWeight: 500,
                    fontSize: "0.9rem",
                    color: "#1a1a1a",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Node Details
                </span>
              </div>
              <div style={{ display: "grid", gap: "12px" }}>
                {[
                  ["Parent ID", hoveredNode.parentID],
                  ["Transaction ID", hoveredNode.uniqueTransactionID],
                  ["CorrelationID", hoveredNode.correlationID],
                  ["Host", hoveredNode.host],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 2fr",
                      gap: "12px",
                      alignItems: "baseline",
                    }}
                  >
                    <div
                      style={{
                        color: "#666",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        color: "#1a1a1a",
                        fontSize: "0.8rem",
                        fontWeight: 400,
                        wordBreak: "break-word",
                        lineHeight: 1.4,
                        fontFamily: "'SF Mono', Menlo, monospace",
                      }}
                    >
                      {value || <span style={{ color: "#999" }}>—</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        nodesDraggable={false}
        elementsSelectable={true}
        onNodeClick={(e, node) => handleNodeClick(e, node.data.node)}
      >
        <MiniMap
          nodeColor={(n) => getStatusColor(n.data?.node?.status)}
          maskColor="rgba(255, 255, 255, 0.6)"
        />
        <Controls
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            padding: "4px",
          }}
        />
        <Background
          variant="dots"
          gap={48}
          size={1}
          color="rgba(147, 197, 253, 0.3)"
          style={{
            background: `radial-gradient(
              circle at center,
              rgba(249, 250, 251, 0.95) 0%,
              rgba(229, 231, 235, 0.9) 100%
            )`,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        />
      </ReactFlow>

      {dialogOpen && (
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              overflow: "hidden",
            },
          }}
        >
          <DialogTitle
            sx={{
              py: 3,
              typography: "h6",
              textAlign: "center",
              color: "text.primary",
              position: "relative",
              "&:after": {
                content: '""',
                position: "absolute",
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "80px",
                height: "2px",
                bgcolor: "divider",
              },
            }}
          >
            Transaction Details
          </DialogTitle>

          <DialogContent sx={{ p: 0 }}>
            <Box
              display="flex"
              gap={{ xs: 0, md: 3 }}
              flexDirection={{ xs: "column", md: "row" }}
              sx={{ p: 3 }}
            >
              {["requestPayload", "responsePayload"].map((type, index) => (
                <Box
                  key={type}
                  flex={1}
                  sx={{
                    position: "relative",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    overflow: "hidden",
                    ...(index === 0 && { mb: { xs: 3, md: 0 } }),
                  }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                      p: 2,
                      bgcolor: "rgba(0, 0, 0, 0.02)",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        letterSpacing: 0.5,
                        color: "text.secondary",
                      }}
                    >
                      {type === "requestPayload" ? "Request" : "Response"} Payload
                    </Typography>
                    <IconButton
                      onClick={() => copyToClipboard(selectedNode?.[type])}
                      size="small"
                      sx={{
                        color: "text.secondary",
                        "&:hover": {
                          bgcolor: "rgba(0, 0, 0, 0.05)",
                        },
                      }}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      maxHeight: "60vh",
                      overflow: "auto",
                      "& pre": {
                        m: 0,
                        fontSize: "0.8rem",
                        lineHeight: 1.5,
                        fontFamily: "monospace",
                        color: "text.primary",
                        whiteSpace: "pre-wrap",
                        tabSize: 2,
                      },
                    }}
                  >
                    <pre>{JSON.stringify(parseJson(selectedNode?.[type]), null, 2)}</pre>
                  </Box>
                </Box>
              ))}
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
            <Button
              onClick={handleCloseDialog}
              variant="text"
              sx={{
                px: 3,
                borderRadius: 1,
                color: "text.secondary",
                "&:hover": {
                  bgcolor: "rgba(0, 0, 0, 0.05)",
                },
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}

export default FlowDiagram;
