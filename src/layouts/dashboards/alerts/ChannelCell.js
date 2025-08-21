import React from "react";
import PropTypes from "prop-types";
import ChannelIcon from "./ChannelIcon";

const ChannelCell = ({ value }) => <ChannelIcon channel={value} />;

ChannelCell.propTypes = {
  value: PropTypes.string.isRequired,
};

export default ChannelCell;
