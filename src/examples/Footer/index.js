/* eslint-disable react/react-in-jsx-scope */
// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 PRO React base styles
import typography from "assets/theme/base/typography";
import { jwtDecode } from "jwt-decode";
import { getToken } from "hooks/keycloakService";

function Footer({ company, links }) {
  const { href, name } = company;
  const { size } = typography;

  // Get token from localStorage or any storage you're using
  const token = getToken();
  if (!token) return [];
  let displayName = "";

  if (token) {
    try {
      const decoded = jwtDecode(token);
      displayName = decoded?.name || decoded?.preferred_username || "";
    } catch (error) {
      console.error("Invalid token", error);
    }
  }

  const renderLinks = () =>
    links.map((link) => (
      <MDBox key={link.name} component="li" px={2} lineHeight={1}>
        <Link href={link.href} target="_blank">
          <MDTypography variant="button" fontWeight="regular" color="text">
            {link.name}
          </MDTypography>
        </Link>
      </MDBox>
    ));

  return (
    <MDBox
      width="100%"
      display="flex"
      flexDirection={{ xs: "column", lg: "row" }}
      justifyContent="space-between"
      alignItems="center"
      px={1.5}
    >
      {/* Left side - Copyright */}
      <MDBox
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexWrap="wrap"
        color="text"
        fontSize={size.sm}
        px={1.5}
      >
        &copy; {new Date().getFullYear()}, All Rights Reserved & Powered by InnovationTeam.
      </MDBox>

      {/* Right side - Username + Links */}
      <MDBox display="flex" alignItems="center" justifyContent="center" flexWrap="wrap">
        {displayName && (
          <MDTypography
            variant="button"
            fontWeight="regular"
            color="text"
            fontSize={size.sm}
            px={1}
          >
            {/* Logged in as <strong>{displayName}</strong> */}
          </MDTypography>
        )}

        <MDBox
          component="ul"
          sx={({ breakpoints }) => ({
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            listStyle: "none",
            mt: 3,
            mb: 0,
            p: 0,

            [breakpoints.up("lg")]: {
              mt: 0,
            },
          })}
        >
          {renderLinks()}
        </MDBox>
      </MDBox>
    </MDBox>
  );
}

// Setting default values for the props of Footer
Footer.defaultProps = {
  company: { href: "https://www.creative-tim.com/", name: "Creative Tim" },
  links: [
    // { href: "https://www.creative-tim.com/presentation1", name: "About Us" },
    // { href: "https://www.creative-tim.com/blog1", name: "Blog" },
    // { href: "https://www.creative-tim.com/license1", name: "License" },
  ],
};

// Typechecking props for the Footer
Footer.propTypes = {
  company: PropTypes.objectOf(PropTypes.string),
  links: PropTypes.arrayOf(PropTypes.object),
};

export default Footer;
