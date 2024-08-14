import React from "react";
import { Separator } from "./ui/separator";
import { Card, CardHeader } from "./ui/card";
import {
  MessageCircleIcon,
  CalendarIcon,
  InfoIcon,
  PlusIcon,
  YoutubeIcon,
  MapIcon,
  LinkedinIcon,
  Star,
} from "lucide-react";
import { Log } from "./Dashboard";
import { LowRiskBadge } from "./Badge";
import RiskExplanation from "./RiskExplanation";

interface LogDetailsProps {
  selectedLog: Log | null;
}

export function LogDetails({ selectedLog }: LogDetailsProps) {
  if (!selectedLog) return null;

  console.log({ selectedLog });
  return (
    <div className="flex-1 p-6">
      <div className="grid gap-6">
        <div className="grid gap-2">
          <div className="text-2xl font-bold">{selectedLog.business_name}</div>
          <div className="flex items-center text-muted-foreground">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <span>{selectedLog.created_at}</span>
          </div>
        </div>
        <RiskExplanation log={selectedLog} />
        <Separator />
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="text-lg font-medium flex items-center text-muted-foreground">
              <InfoIcon className="h-4 w-4 mr-2" />
              Business Summary
            </div>
            <div>{selectedLog.business_summary}</div>
          </div>
          <div className="grid gap-2">
            {selectedLog.yelp_data && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    <h3 className="font-bold">Yelp Data</h3>
                  </div>
                  <div>
                    <p>Name: {selectedLog.yelp_data.name}</p>
                    <p>Address: {selectedLog.yelp_data.address}</p>
                    <p>Rating: {selectedLog.yelp_data.rating}</p>
                    {selectedLog.yelp_data.review_count && (
                      <p>Review Count: {selectedLog.yelp_data.review_count}</p>
                    )}
                  </div>
                </CardHeader>
              </Card>
            )}
            {selectedLog.google_maps_data && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MapIcon className="h-4 w-4" />
                    <h3 className="font-bold">Google Maps Data</h3>
                  </div>
                  <div>
                    <p>
                      Total Ratings:{" "}
                      {selectedLog.google_maps_data.total_ratings}
                    </p>
                    <p>Website: {selectedLog.google_maps_data.website}</p>
                    {selectedLog.google_maps_data.rating && (
                      <p>Rating: {selectedLog.google_maps_data.rating}</p>
                    )}
                    {selectedLog.google_maps_data.address && (
                      <p>Address: {selectedLog.google_maps_data.address}</p>
                    )}
                  </div>
                </CardHeader>
              </Card>
            )}
            {selectedLog.linked_in_data && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <LinkedinIcon className="h-4 w-4" />
                    <h3 className="font-bold">LinkedIn Data</h3>
                  </div>
                  <div>
                    <p>
                      Specialties:{" "}
                      {selectedLog.linked_in_data.specialties.join(", ")}
                    </p>
                    <p>
                      Website: {selectedLog.linked_in_data.website || "N/A"}
                    </p>
                    <p>
                      Vanity Name:{" "}
                      {selectedLog.linked_in_data.vanity_name || "N/A"}
                    </p>
                    <p>
                      Followers: {selectedLog.linked_in_data.followers || "N/A"}
                    </p>
                  </div>
                </CardHeader>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
