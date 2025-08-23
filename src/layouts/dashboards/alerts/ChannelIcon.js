import React from "react";
import EmailIcon from "@mui/icons-material/Email";
import Icon from "@mui/material/Icon";
import PropTypes from "prop-types";

import PagerDutyLogo from "../../../assets/images/pagerdutyGreen.png";
import OpsgenieLogo from "../../../assets/images/opsgenie.png";
import SlackLogo from "../../../assets/images/slack.png";
import SmsLogo from "../../../assets/images/sms.png";
import TeamsLogo from "../../../assets/images/TeamsIcon.jpg";

const ChannelIcon = ({ channel }) => {
  const wrapperStyle = { fontSize: "2rem", display: "inline-flex", alignItems: "center" };

  switch (channel) {
    case "EMAIL":
      return (
        <div style={wrapperStyle} title="EMAIL">
          <EmailIcon sx={{ fontSize: "2rem", color: "#DB4437" }} />
        </div>
      );
    case "SMS":
      return (
        <div style={wrapperStyle} title="SMS">
          <img src={SmsLogo} alt="Sms Logo" style={{ width: "30px", height: "30px" }} />
        </div>
      );
    case "OPSGENIE":
      return (
        <div style={wrapperStyle} title="OPSGENIE">
          <img src={OpsgenieLogo} alt="Opsgenie Logo" style={{ width: "30px", height: "30px" }} />
        </div>
      );
    case "PAGERDUTY":
      return (
        <div style={wrapperStyle} title="PAGERDUTY">
          <img src={PagerDutyLogo} alt="PagerDuty Logo" style={{ width: "30px", height: "30px" }} />
        </div>
      );
    case "SLACK":
      return (
        <div style={wrapperStyle} title="SLACK">
          <img src={SlackLogo} alt="Slack Logo" style={{ width: "30px", height: "30px" }} />
        </div>
      );
    case "TEAMS":
      return (
        <div style={wrapperStyle} title="TEAMS">
          <img src={TeamsLogo} alt="Teams Logo" style={{ width: "30px", height: "30px" }} />
        </div>
      );
    default:
      return (
        <div style={wrapperStyle}>
          <Icon>help_outline</Icon>
        </div>
      );
  }
};

ChannelIcon.propTypes = {
  channel: PropTypes.string.isRequired,
};

export default ChannelIcon;
