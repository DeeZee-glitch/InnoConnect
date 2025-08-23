import typography from "assets/theme/base/typography";

// Material Dashboard 2 PRO React base styles
import colors from "assets/theme/base/colors";

function configs(labels, datasets) {
  // Define the color scheme for different CPUs
  const cpuColors = {
    CPU1: { borderColor: "#1976d2" }, // Red for CPU1
    CPU2: { borderColor: "#d32f2f" }, // Green for CPU2
    CPU3: { borderColor: "#00f" }, // Blue for CPU3
    CPU4: { borderColor: "#1b5e20" }, // Yellow for CPU4
  };

  // Define color scheme for different Fixed Disks (FDs)
  const fdColors = {
    FD1: { borderColor: "#800080" }, // Purple for FD1
    FD3: { borderColor: "#008080" }, // Teal for FD3
    FD4: { borderColor: "#ff1493" }, // DeepPink for FD4
  };

  //smartlogger
  const labelColors = {
    "Total Count": { borderColor: "#0000FF" }, // Blue for Total Count
    "Success Count": { borderColor: "#00FF00" }, // Green for Success Count
    "Validation Count": { borderColor: "#ff4500" }, // OrangeRed for Validation Count
    "Error Count": { borderColor: "#FF0000" }, // Red r Error Count
  };

  // Define color scheme for different Tables
  const tbColors = {
    monitor_types: { borderColor: "#800080" }, // Purple
    escalation_instances: { borderColor: "#008080" }, // Teal
    registered_feeds: { borderColor: "#ff1493" }, // DeepPink
    api_metrics: { borderColor: "#ff4500" }, // OrangeRed
    email_groups: { borderColor: "#00ff00" }, // LimeGreen
    monitored_facts: { borderColor: "#0000ff" }, // Blue
    calendar_work_days: { borderColor: "#ff6347" }, // Tomato
    extended_queries: { borderColor: "#ffd700" }, // Gold
    alerts_test1: { borderColor: "#00ced1" }, // DarkTurquoise
    alert_templates: { borderColor: "#ff8c00" }, // DarkOrange
    monitor_rule_definition_logs: { borderColor: "#d3d3d3" }, // LightGray
    sys_metrics: { borderColor: "#ff00ff" }, // Magenta
    action_executors: { borderColor: "#adff2f" }, // GreenYellow
    alerts: { borderColor: "#ff0000" }, // Red
    alerts_test2: { borderColor: "#8a2be2" }, // BlueViolet
    monitored_feeds: { borderColor: "#f0e68c" }, // Khaki
    user_calendars: { borderColor: "#800000" }, // Maroon
    parameters: { borderColor: "#7fff00" }, // Chartreuse
    dummy1: { borderColor: "#ffa500" }, // Orange
    calendar_holidays: { borderColor: "#ff69b4" }, // HotPink
    storage_growth_log: { borderColor: "#2e8b57" }, // SeaGreen
    rule_def_evaluator: { borderColor: "#32cd32" }, // Lime
    rule_actions: { borderColor: "#ff7f50" }, // Coral
    group_config: { borderColor: "#c71585" }, // MediumVioletRed
    rules_definitions: { borderColor: "#da70d6" }, // Orchid
    rule_escalations: { borderColor: "#ff6347" }, // Tomato
    monitor_conditions: { borderColor: "#00008b" }, // DarkBlue
    rule_action_config: { borderColor: "#006400" }, // DarkGreen
    template_lookup: { borderColor: "#ffb6c1" }, // LightPink
    monitor_rules: { borderColor: "#3cb371" }, // MediumSeaGreen
    monitor_rules_logs: { borderColor: "#6495ed" }, // CornflowerBlue
    sms_groups: { borderColor: "#00fa9a" }, // MediumSpringGreen
    alert_config: { borderColor: "#b22222" }, // Firebrick
  };

  // Modify datasets to include the correct colors for each CPU and FD
  const updatedDatasets = datasets.map((dataset) => {
    const label = dataset.label; // Get the label (could be CPU or FD)

    // Check if the label matches a CPU
    if (cpuColors[label]) {
      return {
        ...dataset,
        borderColor: cpuColors[label].borderColor,
        //backgroundColor: cpuColors[label].backgroundColor,
      };
    }

    // Check if the label matches an FD
    if (fdColors[label]) {
      return {
        ...dataset,
        borderColor: fdColors[label].borderColor,
        // backgroundColor: fdColors[label].backgroundColor,
      };
    }

    if (tbColors[label]) {
      return {
        ...dataset,
        borderColor: tbColors[label].borderColor,
        //backgroundColor: cpuColors[label].backgroundColor,
      };
    }
    if (labelColors[label]) {
      return {
        ...dataset,
        borderColor: labelColors[label].borderColor,
      };
    }

    // If no matching color found, return the dataset as is
    return dataset;
  });

  return {
    data: {
      labels,
      datasets: [...updatedDatasets], // Use the updated datasets with colors
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
      scales: {
        y: {
          title: {
            display: true,
            text: "Data Count",
          },
          grid: {
            drawBorder: false,
            display: true,
            drawOnChartArea: true,
            drawTicks: false,
            borderDash: [5, 5],
            color: "#c1c4ce5c",
          },
          ticks: {
            display: true,
            padding: 10,
            color: "#000000",
            font: {
              size: 11,
              family: typography.fontFamily,
              style: "normal",
              lineHeight: 2,
            },
          },
        },
        x: {
          title: {
            display: true,
            text: "Timestamp",
          },
          grid: {
            drawBorder: false,
            display: true,
            drawOnChartArea: true,
            drawTicks: true,
            borderDash: [5, 5],
            color: "#c1c4ce5c",
          },
          ticks: {
            display: true,
            color: "#000000",
            padding: 20,
            font: {
              size: 11,
              family: typography.fontFamily,
              style: "normal",
              lineHeight: 2,
            },
          },
        },
      },
    },
  };
}

export default configs;
