"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "@radix-ui/react-select";
import { Card, CardHeader } from "./ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "./ui/table";

interface Log {
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
}

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
        console.log(response);
        const data = await response.json();
        console.log(data);
        setLogs(data);
        console.log(data[0]);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };

    // Fetch data immediately
    fetchData();

    // Set up polling
    const intervalId = setInterval(fetchData, 1000); // Adjust the interval time as needed

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [dbInitialized]);

  const filteredLogs = logs.filter((log: Log) => {
    const { timestamp, message } = filterOptions;
    console.log({ timestamp, message });
    return (
      (!timestamp || log.created_at.includes(timestamp)) &&
      (!message ||
        log.business_name.toLowerCase().includes(message.toLowerCase()))
    );
  });
  console.log({ filteredLogs });

  const handleLogSelect = (log) => {
    setSelectedLogID(log);
  };

  const handleFilterChange = (field, value) => {
    setFilterOptions((prevOptions) => ({
      ...prevOptions,
      [field]: value,
    }));
  };

  const handleBusinessUrlChange = (e) => {
    setBusinessUrl(e.target.value);
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
            <Button>
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
                <TableHead>
                  {/* <CalendarIcon className="h-4 w-4 mr-2" /> */}
                  Timestamp
                </TableHead>
                <TableHead>
                  {/* <MessageCircleIcon className="h-4 w-4 mr-2" /> */}
                  Message
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log: Log, index) => (
                  <TableRow
                    key={log.id || index} // Use index as fallback if id is missing
                    onClick={() => handleLogSelect(log)}
                    className={selectedLogID === log.id ? "bg-accent/10" : ""}
                  >
                    <TableCell>{log.created_at}</TableCell>
                    <TableCell>{log.business_name}</TableCell>
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
        {selectedLogID ? (
          <div className="grid gap-6">
            <div className="grid gap-2">
              <div className="text-2xl font-bold">
                <MessageCircleIcon className="h-6 w-6 mr-2" />
                {selectedLogID.message}
              </div>
              <div className="text-muted-foreground">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {selectedLogID.timestamp}
              </div>
            </div>
            <Separator />
            <div className="grid gap-4">
              <div className="grid gap-2">
                <div className="text-lg font-medium">
                  <InfoIcon className="h-4 w-4 mr-2" />
                  Business Summary
                </div>
                <div>{selectedLogID.business_summary}</div>
              </div>
              <div className="grid gap-2">
                <div className="text-lg font-medium">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Additional Info
                </div>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <YoutubeIcon className="h-4 w-4" />
                      <p>{JSON.stringify(selectedLogID.yelp_data)}</p>
                    </div>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <MapIcon className="h-4 w-4" />
                      <p>{JSON.stringify(selectedLogID.google_maps_data)}</p>
                    </div>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <LinkedinIcon className="h-4 w-4" />
                      <p>{JSON.stringify(selectedLogID.linked_in_data)}</p>
                    </div>
                  </CardHeader>
                </Card>
              </div>
            </div>
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

function BadgeAlertIcon(props) {
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
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}

function CalendarIcon(props) {
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

function InfoIcon(props) {
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

function LinkedinIcon(props) {
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
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function MapIcon(props) {
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
      <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" />
      <path d="M15 5.764v15" />
      <path d="M9 3.236v15" />
    </svg>
  );
}

function MessageCircleIcon(props) {
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

function PlusIcon(props) {
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

function YoutubeIcon(props) {
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
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}
