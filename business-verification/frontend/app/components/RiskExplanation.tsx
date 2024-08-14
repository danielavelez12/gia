import React from "react";
import { Log } from "./types"; // Assuming you have a Log type defined
import { LowRiskBadge, HighRiskBadge, InfoBadge } from "./Badge"; // Import your badge components

const RiskExplanation = (log: Log) => {
  let output = [];
  let logBody = log.log;

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

  if (logBody.log_type === "business_growth") {
    if (
      logBody.old_yelp_reviews !== undefined &&
      logBody.new_yelp_reviews !== undefined
    ) {
      if (logBody.new_yelp_reviews > logBody.old_yelp_reviews) {
        output.push(
          <ExplanationRow
            key="yelp-increase"
            badge={<LowRiskBadge />}
            explanation={`Yelp reviews increased from ${logBody.old_yelp_reviews} to ${logBody.new_yelp_reviews}`}
          />
        );
      }
    }

    if (
      logBody.old_google_reviews !== undefined &&
      logBody.new_google_reviews !== undefined
    ) {
      if (logBody.new_google_reviews > logBody.old_google_reviews) {
        output.push(
          <ExplanationRow
            key="google-increase"
            badge={<LowRiskBadge />}
            explanation={`Google reviews increased from ${logBody.old_google_reviews} to ${logBody.new_google_reviews}`}
          />
        );
      }
    }
  } else if (logBody.log_type === "org_growth") {
    if (
      logBody.old_company_size !== undefined &&
      logBody.new_company_size !== undefined
    ) {
      if (logBody.new_company_size > logBody.old_company_size) {
        output.push(
          <ExplanationRow
            key="company-size-increase"
            badge={<LowRiskBadge />}
            explanation={`Company size increased from ${logBody.old_company_size} to ${logBody.new_company_size}`}
          />
        );
      } else if (logBody.new_company_size < logBody.old_company_size) {
        output.push(
          <ExplanationRow
            key="company-size-decrease"
            badge={<HighRiskBadge />}
            explanation={`Company size decreased from ${logBody.old_company_size} to ${logBody.new_company_size}`}
          />
        );
      }
    }
  }
  return <div>{output}</div>;
};

export default RiskExplanation;
