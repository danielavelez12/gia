import React from "react";

const badgeStyles = {
  info: {
    label: "Info",
    style: {
      backgroundColor: "#dbeafe",
      color: "#1e40af",
    },
  },
  low: {
    label: "Low Risk",
    style: {
      backgroundColor: "#dcfce7",
      color: "#166534",
    },
  },
  high: {
    label: "High Risk",
    style: {
      backgroundColor: "#fee2e2",
      color: "#991b1b",
    },
  },
};

const commonStyles = {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: "9999px",
  paddingLeft: "0.625rem",
  paddingRight: "0.625rem",
  paddingTop: "0.125rem",
  paddingBottom: "0.125rem",
  fontSize: "0.75rem",
  fontWeight: "500",
};

export const InfoBadge = () => (
  <span style={{ ...commonStyles, ...badgeStyles.info.style }}>
    {badgeStyles.info.label}
  </span>
);

export const LowRiskBadge = () => (
  <span style={{ ...commonStyles, ...badgeStyles.low.style }}>
    {badgeStyles.low.label}
  </span>
);

export const HighRiskBadge = () => (
  <span style={{ ...commonStyles, ...badgeStyles.high.style }}>
    {badgeStyles.high.label}
  </span>
);
