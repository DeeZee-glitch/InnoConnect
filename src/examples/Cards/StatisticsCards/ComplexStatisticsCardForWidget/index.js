/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function ComplexStatisticsCardForWidget({ color, title, count, percentage, icon }) {
  return (
    <Card>
      <MDBox display="flex" justifyContent="space-between" alignItems="center" pt={1} px={2}>
        {/* Icon and Title Section */}
        <MDBox display="flex" alignItems="center">
          {/* Icon */}
          <MDBox
            variant="gradient"
            bgColor={color}
            color={color === "light" ? "dark" : "white"}
            coloredShadow={color}
            borderRadius="xl"
            display="flex"
            justifyContent="center"
            alignItems="center"
            width="4rem"
            height="4rem"
            mt={-3}
            mr={2} // Margin-right to add space between icon and title
          >
            <Icon fontSize="medium" color="inherit">
              {icon}
            </Icon>
          </MDBox>

          {/* Title */}
          <MDTypography variant="h6">{title}</MDTypography>
        </MDBox>

        {/* Count */}
        <MDBox textAlign="right" lineHeight={1.25} pr={3}>
          <MDTypography variant="h4">{count}</MDTypography>
        </MDBox>
      </MDBox>

      <Divider />

      <MDBox pb={2} px={2}>
        <MDTypography component="p" variant="button" color="text" display="flex">
          <MDTypography
            component="span"
            variant="button"
            fontWeight="bold"
            color={percentage.color}
          >
            {percentage.amount}
          </MDTypography>
          &nbsp;{percentage.label}
        </MDTypography>
      </MDBox>
    </Card>
  );
}

// Setting default values for the props of ComplexStatisticsCard
ComplexStatisticsCardForWidget.defaultProps = {
  color: "info",
  percentage: {
    color: "success",
    text: "",
    label: "",
  },
};

// Typechecking props for the ComplexStatisticsCard
ComplexStatisticsCardForWidget.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "light",
    "dark",
  ]),
  title: PropTypes.string.isRequired,
  count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  percentage: PropTypes.shape({
    color: PropTypes.oneOf([
      "primary",
      "secondary",
      "info",
      "success",
      "warning",
      "error",
      "dark",
      "white",
    ]),
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string,
  }),
  icon: PropTypes.node.isRequired,
};

export default ComplexStatisticsCardForWidget;
