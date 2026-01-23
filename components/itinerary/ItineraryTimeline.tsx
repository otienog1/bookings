"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Plane,
  Car,
  Hotel,
  Camera,
  Users,
  Utensils,
  MapPin,
} from "lucide-react";

// Types (simplified for timeline)
interface Activity {
  name: string;
  type: string;
  description: string;
}

interface DayItinerary {
  day: number;
  date: string;
  location: string;
  accommodation: {
    name: string;
    type: string;
  } | null;
  meals: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  activities: Activity[];
}

interface ItineraryTimelineProps {
  days: DayItinerary[];
  compact?: boolean;
}

// Get icon for activity type
const getActivityIcon = (type: string) => {
  const iconClass = "h-3 w-3";
  switch (type.toLowerCase()) {
    case "flight":
      return <Plane className={iconClass} />;
    case "drive":
    case "transfer":
      return <Car className={iconClass} />;
    case "game viewing":
      return <Camera className={iconClass} />;
    case "cultural experience":
    case "cultural":
      return <Users className={iconClass} />;
    case "dining":
      return <Utensils className={iconClass} />;
    default:
      return <MapPin className={iconClass} />;
  }
};

// Format date
const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

export const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({
  days,
  compact = false,
}) => {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

      {/* Days */}
      <div className="space-y-4">
        {days.map((day, idx) => (
          <div key={day.day} className="relative pl-10">
            {/* Timeline dot */}
            <div className="absolute left-2.5 top-1.5 h-3 w-3 rounded-full bg-primary border-2 border-background" />

            {/* Day content */}
            <div
              className={`${
                compact ? "pb-2" : "pb-4"
              } border-b border-border last:border-0`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">Day {day.day}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(day.date)}
                  </span>
                </div>
                <div className="flex gap-1">
                  {day.meals.breakfast && (
                    <span className="text-[10px] px-1 bg-muted rounded">B</span>
                  )}
                  {day.meals.lunch && (
                    <span className="text-[10px] px-1 bg-muted rounded">L</span>
                  )}
                  {day.meals.dinner && (
                    <span className="text-[10px] px-1 bg-muted rounded">D</span>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-1 text-sm mb-1">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span>{day.location}</span>
              </div>

              {/* Accommodation */}
              {day.accommodation && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <Hotel className="h-3 w-3" />
                  <span>{day.accommodation.name}</span>
                </div>
              )}

              {/* Activities (compact mode shows fewer) */}
              {!compact && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {day.activities.slice(0, 4).map((activity, aIdx) => (
                    <Badge
                      key={aIdx}
                      variant="outline"
                      className="text-[10px] py-0 px-1.5 gap-1"
                    >
                      {getActivityIcon(activity.type)}
                      <span className="truncate max-w-[100px]">
                        {activity.name}
                      </span>
                    </Badge>
                  ))}
                  {day.activities.length > 4 && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] py-0 px-1.5"
                    >
                      +{day.activities.length - 4}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItineraryTimeline;
