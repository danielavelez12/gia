"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "./ui/table";
import { LogDetails } from "./LogDetails";
import { InfoBadge, LowRiskBadge } from "./Badge";

async function summarizeEntity(url: string) {
  try {
    const response = await fetch("http://localhost:8000/new_entity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: url }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error("Error:", error);
  }
}

export interface Log {
  // Basic business information
  business_name: string;
  business_summary: string;
  business_url: string;
  created_at: string;
  log_type: string;
  id?: string; // Optional, as it wasn't visible in the console output

  // Google Maps data
  google_maps_data: {
    total_ratings: number;
    website: string;
    name?: string;
    address?: string;
    phone?: string;
    rating?: number;
    opening_hours?: string[];
  };

  // LinkedIn data
  linked_in_data: {
    specialties: string[];
    website: string | null;
    vanity_name: string | null;
    followers: number | null;
    name?: string;
    description?: string;
    industry?: string;
    company_size?: string | number;
    founded?: number;
    locations?: string[];
  };

  // Yelp data
  yelp_data: {
    address: string;
    name: string;
    rating: number;
    review_count?: number;
    phone?: string;
    categories?: string[];
    price?: string;
    url?: string;
  };

  // Additional properties that might be useful
  timestamp?: string; // If different from created_at
  updated_at?: string;
  status?: string;
  tags?: string[];
  category?: string;
  owner?: string;
  contact_email?: string;
  contact_phone?: string;
  social_media?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };

  // Business growth specific fields
  old_yelp_reviews?: number;
  new_yelp_reviews?: number;
  old_google_reviews?: number;
  new_google_reviews?: number;

  // Org growth specific fields
  old_company_size?: number | string;
  new_company_size?: number | string;
}

const logTypeToLabels = (logType: string) => {
  switch (logType) {
    case "new_entity":
      return {
        label: "New business onboarded",
        badge: <LowRiskBadge />,
      };
    case "org_growth":
      return {
        label: "Organization growth",
        badge: <LowRiskBadge />,
      };
    case "business_growth":
      return {
        label: "Business growth",
        badge: <LowRiskBadge />,
      };
    default:
      return {
        label: "Unknown",
        badge: "Unknown",
      };
  }
};

export function Dashboard() {
  const [selectedLogID, setSelectedLogID] = useState("");
  const [filterOptions, setFilterOptions] = useState({
    timestamp: "",
    message: "",
  });
  const [businessUrl, setBusinessUrl] = useState("");
  const [logs, setLogs] = useState([]);
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    if (dbInitialized) return;
    const initAdmin = async () => {
      await fetch("/api/init");
    };

    initAdmin();
    setDbInitialized(true);
  }, [dbInitialized]);

  useEffect(() => {
    if (!dbInitialized) return;

    const fetchData = async () => {
      try {
        const response = await fetch("/api/logs");
        console.log({ response });
        const data = await response.json();
        console.log({ data });
        if (!data) {
          return;
        }
        setLogs(data);
        console.log(data[0]);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };

    // Fetch data immediately
    fetchData();

    // Set up polling
    const intervalId = setInterval(fetchData, 1000000); // Adjust the interval time as needed

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [dbInitialized]);

  const filteredLogs =
    logs &&
    logs.length > 0 &&
    logs.filter((log: Log) => {
      const { timestamp, message } = filterOptions;
      console.log({ timestamp, message });
      return (
        (!timestamp || log.created_at.includes(timestamp)) &&
        (!message ||
          (log.business_name &&
            log.business_name.toLowerCase().includes(message.toLowerCase())))
      );
    });
  console.log({ filteredLogs });

  const handleLogSelect = (log: Log) => {
    setSelectedLogID(log.id ?? "");
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilterOptions((prevOptions) => ({
      ...prevOptions,
      [field]: value,
    }));
  };

  const handleBusinessUrlChange = (e: any) => {
    setBusinessUrl(e.target.value);
  };

  const submitNewBusiness = async () => {
    console.log({ businessUrl });
    summarizeEntity(businessUrl)
      .then((result) => console.log(result))
      .catch((error) => console.error("Error:", error));
  };

  return (
    <div className="flex h-screen w-full">
      <div className="flex-1 border-r bg-muted/20 p-6">
        <div className="mb-6 grid gap-4">
          <div className="mb-6 flex items-center gap-4">
            <Input
              placeholder="Enter business URL"
              value={businessUrl}
              onChange={handleBusinessUrlChange}
              className="flex-1"
            />
            <Button onClick={submitNewBusiness}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Business
            </Button>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <Label htmlFor="timestamp">Timestamp</Label>
            </div>
            <Input
              id="timestamp"
              placeholder="Filter by timestamp"
              value={filterOptions.timestamp}
              onChange={(e) => handleFilterChange("timestamp", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <MessageCircleIcon className="h-4 w-4" />
              <Label htmlFor="message">Message</Label>
            </div>
            <Input
              id="message"
              placeholder="Filter by message"
              value={filterOptions.message}
              onChange={(e) => handleFilterChange("message", e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Business entity</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs && filteredLogs.length > 0 ? (
                filteredLogs.map((log: Log, index) => (
                  <TableRow
                    key={log.id || index} // Use index as fallback if id is missing
                    onClick={() => handleLogSelect(log)}
                    className={selectedLogID === log.id ? "bg-accent/10" : ""}
                  >
                    <TableCell>{log.created_at}</TableCell>
                    <TableCell>{log.business_name}</TableCell>
                    <TableCell>{logTypeToLabels(log.log_type).label}</TableCell>
                    <TableCell>{logTypeToLabels(log.log_type).badge}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2}>No logs found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex-1 p-6">
        {selectedLogID && filteredLogs ? (
          <div className="flex h-screen w-full">
            <LogDetails
              selectedLog={
                filteredLogs.filter((log: Log) => log.id === selectedLogID)[0]
              }
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <InfoIcon className="h-6 w-6 mr-2" />
            Select a log entry to view details
          </div>
        )}
      </div>
    </div>
  );
}

function CalendarIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

function InfoIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function MessageCircleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

function PlusIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
