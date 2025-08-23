import React from "react";
import PropTypes from "prop-types";

const TableWidget = ({ data }) => {
  return (
    <div>
      <h3>Table Widget</h3>
      <table>
        <thead>
          <tr>
            {Object.keys(data[0] || {}).map((key) => (
              <th key={key}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {Object.values(row).map((val, idx) => (
                <td key={idx}>{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// PropTypes validation
TableWidget.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired, // data should be an array of objects
};

export default TableWidget;
