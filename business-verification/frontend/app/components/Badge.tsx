import React from "react";

const badgeStyles = {
  info: { label: "Info", color: "bg-blue-100 text-blue-800" },
  low: { label: "Low Risk", color: "bg-green-100 text-green-800" },
  high: { label: "High Risk", color: "bg-red-100 text-red-800" },
};

export const InfoBadge = () => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeStyles.info.color}`}
  >
    {badgeStyles.info.label}
  </span>
);

export const LowRiskBadge = () => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeStyles.low.color}`}
  >
    {badgeStyles.low.label}
  </span>
);

export const HighRiskBadge = () => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeStyles.high.color}`}
  >
    {badgeStyles.high.label}
  </span>
);
