import React from "react";
import { LowRiskBadge, HighRiskBadge, InfoBadge } from "./Badge"; // Import your badge components
import { Log } from "./Dashboard";

export function RiskExplanation({ log }: { log: Log }) {
  let output = [];

  const ExplanationRow = ({
    badge,
    explanation,
  }: {
    badge: any;
    explanation: string;
  }) => (
    <div className="flex items-center space-x-2 mb-2">
      <div>{badge}</div>
      <div>{explanation}</div>
    </div>
  );

  if (log.log_type === "business_growth") {
    if (
      log.old_yelp_reviews !== undefined &&
      log.new_yelp_reviews !== undefined
    ) {
      if (log.new_yelp_reviews > log.old_yelp_reviews) {
        output.push(
          <ExplanationRow
            key="yelp-increase"
            badge={<LowRiskBadge />}
            explanation={`Yelp reviews increased from ${log.old_yelp_reviews} to ${log.new_yelp_reviews}`}
          />
        );
      }
    }

    if (
      log.old_google_reviews !== undefined &&
      log.new_google_reviews !== undefined
    ) {
      if (log.new_google_reviews > log.old_google_reviews) {
        output.push(
          <ExplanationRow
            key="google-increase"
            badge={<LowRiskBadge />}
            explanation={`Google reviews increased from ${log.old_google_reviews} to ${log.new_google_reviews}`}
          />
        );
      }
    }
  } else if (log.log_type === "org_growth") {
    if (
      log.old_company_size !== undefined &&
      log.new_company_size !== undefined
    ) {
      if (log.new_company_size > log.old_company_size) {
        output.push(
          <ExplanationRow
            key="company-size-increase"
            badge={<LowRiskBadge />}
            explanation={`Company size increased from ${log.old_company_size} to ${log.new_company_size}`}
          />
        );
      } else if (log.new_company_size < log.old_company_size) {
        output.push(
          <ExplanationRow
            key="company-size-decrease"
            badge={<HighRiskBadge />}
            explanation={`Company size decreased from ${log.old_company_size} to ${log.new_company_size}`}
          />
        );
      }
    }
  }
  return <div>{output}</div>;
}

export default RiskExplanation;
