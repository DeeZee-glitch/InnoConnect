import PropTypes from "prop-types"; // Import PropTypes

function DynamicChart({ chartData }) {
  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: chartData.label,
        data: chartData.values,
        borderColor: "#42A5F5",
        backgroundColor: "rgba(66, 165, 245, 0.4)",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: { enabled: true },
    },
  };

  return <Line data={data} options={options} />;
}

// Define prop types
DynamicChart.propTypes = {
  chartData: PropTypes.shape({
    labels: PropTypes.arrayOf(PropTypes.string).isRequired,
    label: PropTypes.string.isRequired,
    values: PropTypes.arrayOf(PropTypes.number).isRequired,
  }).isRequired,
};

export default DynamicChart;
