"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CalendarDays,
  MapPin,
  Plane,
  Car,
  Hotel,
  Utensils,
  Camera,
  Users,
  Phone,
  Mail,
  Globe,
  Info,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

// Types
interface Contact {
  email: string;
  phone: string;
  mobile?: string;
}

interface TripOverview {
  tour_name: string;
  dates: string;
  duration: string;
  client_group: string;
  tour_operator: string;
  group_size: number;
  countries_visited: string[];
  languages: string;
  contact: Contact;
}

interface Accommodation {
  name: string;
  type: string;
  description: string;
  room_type: string;
  room_description: string;
  total_rooms: number;
  distance_from_airport: string | null;
}

interface Meals {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  meal_plan: string;
}

interface ActivityDetails {
  flight_number?: string;
  from?: string;
  to?: string;
  departure_time?: string;
  arrival_time?: string;
  travel_time?: string;
  vehicle?: string;
  distance?: string;
  luggage_limit?: string;
}

interface Activity {
  name: string;
  type: string;
  description: string;
  details?: ActivityDetails;
  included: boolean;
}

interface OptionalActivity {
  name: string;
  description: string;
}

interface DayItinerary {
  day: number;
  date: string;
  location: string;
  accommodation: Accommodation | null;
  meals: Meals;
  activities: Activity[];
  optional_activities: OptionalActivity[];
  notes: string | null;
}

interface AccommodationInclusion {
  name: string;
  nights: number;
  location: string;
  room_type: string;
  basis: string;
  property_inclusions?: string[];
  property_exclusions?: string[];
}

interface MealPropertyInclusion {
  property_name: string;
  meal_plan: string;
  meals_included: string[];
  beverages_included: string;
  special_notes?: string;
}

interface TransferInclusion {
  type: string;
  from: string;
  to: string;
  vehicle: string;
  duration?: string;
  notes?: string;
}

interface FlightInclusion {
  airline: string;
  flight_number?: string;
  from: string;
  to: string;
  departure_time?: string;
  arrival_time?: string;
  duration: string;
  baggage?: string;
  notes?: string;
}

interface EmergencyContact {
  name: string;
  phone: string;
  email: string;
  role: string;
  availability?: string;
}

interface VisaRequirement {
  country: string;
  required: boolean;
  process: string;
  notes: string;
}

interface FlightDetail {
  day: number;
  date: string;  // YYYY-MM-DD
  flight_number: string;
  from_airport: string;
  to_airport: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  baggage_limit?: string;
  notes?: string;
}

interface BorderCrossing {
  day: number;
  date: string;  // YYYY-MM-DD
  from_country: string;
  to_country: string;
  border_point: string;
  estimated_time: string;
  procedures: string;
  notes?: string;
}

interface EarlyCheckout {
  day: number;
  date: string;  // YYYY-MM-DD
  property: string;
  checkout_time: string;
  reason: string;
}

interface LateArrival {
  day: number;
  date: string;  // YYYY-MM-DD
  property: string;
  estimated_arrival_time: string;
  reason: string;
}

interface Logistics {
  summary?: string;
  flight_details?: {
    overview?: string;
    arrival?: {
      day: number;
      date: string;  // YYYY-MM-DD
      flight_number: string;
      airport: string;
      arrival_time: string;
      notes?: string;
    };
    internal_flights?: FlightDetail[];
    departure?: {
      day: number;
      date: string;  // YYYY-MM-DD
      flight_number: string;
      airport: string;
      departure_time: string;
      notes?: string;
    };
    important_considerations?: string[];
  };
  transfer_arrangements?: {
    overview?: string;
    airport_transfers?: string;
    inter_lodge_transfers?: string;
    border_crossings?: BorderCrossing[];
    vehicle_types?: string[];
    important_considerations?: string[];
  };
  accommodation_patterns?: {
    overview?: string;
    early_checkouts?: EarlyCheckout[];
    late_arrivals?: LateArrival[];
    full_board_properties?: string[];
    bed_breakfast_properties?: string[];
    important_considerations?: string[];
  };
  meal_plan_overview?: {
    summary?: string;
    full_board_locations?: string[];
    bed_breakfast_locations?: string[];
    special_dining_experiences?: string[];
    beverage_policies?: string;
    important_considerations?: string[];
  };
  timing_considerations?: {
    early_mornings?: string[];
    long_drives?: string[];
    flight_schedules?: string;
    border_crossing_time?: string;
    other_notes?: string[];
  };
  documents_and_preparations?: {
    passports_and_visas?: {
      passport_validity?: string;
      visa_requirements?: VisaRequirement[];
      notes?: string;
    };
    health_requirements?: {
      yellow_fever?: string;
      vaccinations?: string;
      malaria_prophylaxis?: string;
      other_precautions?: string[];
    };
    travel_insurance?: string;
    currency?: {
      recommendations?: string;
      restrictions?: string;
      notes?: string;
    };
    clothing_and_packing?: {
      general_guidance?: string;
      clothing?: string[];
      gear?: string[];
      accessories?: string[];
    };
    electrical_adapters?: string;
    luggage_requirements?: string;
    photography_equipment?: string;
  };
  emergency_contacts?: EmergencyContact[];
}

interface DailyBreakdownSummary {
  day: number;
  date: string;
  title: string;
  summary: string;
  highlights: string[];
  distance_traveled?: string;
  accommodation_type?: string;
  meals_included?: string;
}

interface ItineraryData {
  trip_overview: TripOverview;
  logistics?: Logistics;
  daily_breakdown_summary?: DailyBreakdownSummary[];
  daily_itinerary?: DayItinerary[];
  inclusions: {
    accommodation: AccommodationInclusion[] | string;
    meals: {
      properties: MealPropertyInclusion[];
      general_notes?: string;
      special_experiences: string[];
    };
    transportation: {
      vehicles: {
        description: string;
        features: string[];
      };
      transfers: TransferInclusion[];
    };
    flights: FlightInclusion[];
    activities: string[];
    services: string[];
  };
  exclusions: string[];
  important_information: {
    luggage?: { light_aircraft: string; excess_storage: string };
    health?: {
      malaria: string;
      yellow_fever: string;
      water: string;
      insurance: string;
      flying_doctors: string;
    };
    tipping_guidelines?: {
      porters: string;
      waiters: string;
      driver_guide: string;
    };
    currency?: {
      kenya: string;
      tanzania: string;
      south_africa: string;
      notes: string;
    };
    climate?: { east_africa: string; south_africa: string };
    electricity?: { voltage: string; plugs: string; lodges: string };
    photography?: string;
    communications?: string;
  };
}

interface ItineraryDisplayProps {
  data: ItineraryData;
}

// Activity type icons
const getActivityIcon = (type: string) => {
  const iconClass = "h-4 w-4";
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
    case "cultural/historical tour":
      return <Users className={iconClass} />;
    case "dining":
      return <Utensils className={iconClass} />;
    default:
      return <MapPin className={iconClass} />;
  }
};

// Format date for display
const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

// Day Card Component
const DayCard: React.FC<{ day: DayItinerary }> = ({ day }) => {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
              {day.day}
            </div>
            <div>
              <CardTitle className="text-lg">{day.location}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {formatDate(day.date)}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            {day.meals.breakfast && (
              <Badge variant="outline" className="text-xs">
                B
              </Badge>
            )}
            {day.meals.lunch && (
              <Badge variant="outline" className="text-xs">
                L
              </Badge>
            )}
            {day.meals.dinner && (
              <Badge variant="outline" className="text-xs">
                D
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Accommodation */}
        {day.accommodation && (
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Hotel className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{day.accommodation.name}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {day.accommodation.type} • {day.accommodation.room_type}
            </p>
          </div>
        )}

        {/* Activities */}
        <div className="space-y-2">
          {day.activities.map((activity, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/30 transition-colors"
            >
              <div className="mt-0.5 text-muted-foreground">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{activity.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {activity.description}
                </p>
                {activity.details && (
                  <div className="mt-2 text-xs text-muted-foreground space-y-1">
                    {activity.details.flight_number && (
                      <div className="flex items-center gap-1">
                        <Plane className="h-3 w-3" />
                        <span>{activity.details.flight_number}</span>
                      </div>
                    )}
                    {activity.details.from && activity.details.to && (
                      <div>
                        {activity.details.from} → {activity.details.to}
                      </div>
                    )}
                    {(activity.details.departure_time ||
                      activity.details.arrival_time) && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {activity.details.departure_time &&
                            `Dep: ${activity.details.departure_time}`}
                          {activity.details.departure_time &&
                            activity.details.arrival_time &&
                            " • "}
                          {activity.details.arrival_time &&
                            `Arr: ${activity.details.arrival_time}`}
                        </span>
                      </div>
                    )}
                    {activity.details.travel_time && (
                      <div>Duration: {activity.details.travel_time}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Optional Activities */}
        {day.optional_activities.length > 0 && (
          <div className="border-t pt-3">
            <p className="text-sm font-medium mb-2">Optional Activities</p>
            <div className="flex flex-wrap gap-2">
              {day.optional_activities.map((opt, idx) => (
                <Badge key={idx} variant="outline">
                  {opt.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {day.notes && (
          <div className="text-sm text-muted-foreground italic border-t pt-3">
            <Info className="h-3 w-3 inline mr-1" />
            {day.notes}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Overview Tab
const OverviewTab: React.FC<{ overview: TripOverview }> = ({ overview }) => {
  return (
    <div className="space-y-6">
      {/* Tour Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Tour Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="font-medium">{overview.duration}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Travel Dates</p>
            <p className="font-medium">{overview.dates}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Group Size</p>
            <p className="font-medium">{overview.group_size} travelers</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Languages</p>
            <p className="font-medium">{overview.languages}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-sm text-muted-foreground">Countries Visited</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {overview.countries_visited.map((country, idx) => (
                <Badge key={idx} variant="secondary">
                  {country}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <a
              href={`mailto:${overview.contact.email}`}
              className="text-primary hover:underline"
            >
              {overview.contact.email}
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <a
              href={`tel:${overview.contact.phone}`}
              className="hover:underline"
            >
              {overview.contact.phone}
            </a>
          </div>
          {overview.contact.mobile && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a
                href={`tel:${overview.contact.mobile}`}
                className="hover:underline"
              >
                {overview.contact.mobile}
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Inclusions/Exclusions Tab
const InclusionsTab: React.FC<{
  inclusions: ItineraryData["inclusions"];
  exclusions: string[];
}> = ({ inclusions, exclusions }) => {
  return (
    <div className="space-y-6">
      {/* Inclusions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Included
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="accommodation">
              <AccordionTrigger>Accommodation</AccordionTrigger>
              <AccordionContent>
                {typeof inclusions.accommodation === 'string' ? (
                  <p>{inclusions.accommodation}</p>
                ) : (
                  <div className="space-y-4">
                    {inclusions.accommodation.map((acc, idx) => (
                      <div key={idx} className="border rounded-lg p-4 bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{acc.name}</h4>
                          <Badge variant="secondary">{acc.nights} night{acc.nights !== 1 ? 's' : ''}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                          <div>
                            <span className="text-muted-foreground">Location:</span> {acc.location}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Room:</span> {acc.room_type}
                          </div>
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Basis:</span> {acc.basis}
                          </div>
                        </div>
                        {acc.property_inclusions && acc.property_inclusions.length > 0 && (
                          <div className="mb-2">
                            <p className="text-sm font-medium text-green-600 mb-1">Included:</p>
                            <div className="flex flex-wrap gap-1">
                              {acc.property_inclusions.map((item, i) => (
                                <Badge key={i} variant="outline" className="text-xs text-green-600 border-green-200">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {acc.property_exclusions && acc.property_exclusions.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-red-600 mb-1">Not Included:</p>
                            <div className="flex flex-wrap gap-1">
                              {acc.property_exclusions.map((item, i) => (
                                <Badge key={i} variant="outline" className="text-xs text-red-600 border-red-200">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="meals">
              <AccordionTrigger>Meals</AccordionTrigger>
              <AccordionContent className="space-y-4">
                {inclusions.meals.properties && inclusions.meals.properties.length > 0 ? (
                  <>
                    {inclusions.meals.properties.map((property, idx) => (
                      <div key={idx} className="border rounded-lg p-4 bg-muted/30">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Utensils className="h-4 w-4" />
                            {property.property_name}
                          </h4>
                          <Badge variant="secondary">{property.meal_plan}</Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          {property.meals_included && property.meals_included.length > 0 && (
                            <div>
                              <span className="font-medium text-muted-foreground">Meals: </span>
                              <span>{property.meals_included.join(', ')}</span>
                            </div>
                          )}
                          {property.beverages_included && (
                            <div>
                              <span className="font-medium text-muted-foreground">Beverages: </span>
                              <span>{property.beverages_included}</span>
                            </div>
                          )}
                          {property.special_notes && (
                            <div className="mt-2 pt-2 border-t text-xs text-muted-foreground italic">
                              {property.special_notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No meal information available</p>
                )}

                {inclusions.meals.general_notes && (
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      General Notes
                    </h4>
                    <p className="text-sm">{inclusions.meals.general_notes}</p>
                  </div>
                )}

                {inclusions.meals.special_experiences && inclusions.meals.special_experiences.length > 0 && (
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Utensils className="h-4 w-4" />
                      Special Dining Experiences
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {inclusions.meals.special_experiences.map((experience, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {experience}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="transport">
              <AccordionTrigger>Transportation</AccordionTrigger>
              <AccordionContent className="space-y-4">
                {inclusions.transportation.vehicles && (
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      Vehicles
                    </h4>
                    <p className="text-sm mb-3">{inclusions.transportation.vehicles.description}</p>
                    {inclusions.transportation.vehicles.features && inclusions.transportation.vehicles.features.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {inclusions.transportation.vehicles.features.map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {inclusions.transportation.transfers && inclusions.transportation.transfers.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      Transfers
                    </h4>
                    {inclusions.transportation.transfers.map((transfer, idx) => (
                      <div key={idx} className="border rounded-lg p-4 bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary" className="text-xs">{transfer.type}</Badge>
                          {transfer.duration && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {transfer.duration}
                            </span>
                          )}
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <span className="font-medium text-muted-foreground min-w-[60px]">From:</span>
                            <span>{transfer.from}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="font-medium text-muted-foreground min-w-[60px]">To:</span>
                            <span>{transfer.to}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="font-medium text-muted-foreground min-w-[60px]">Vehicle:</span>
                            <span>{transfer.vehicle}</span>
                          </div>
                          {transfer.notes && (
                            <div className="mt-2 pt-2 border-t text-xs text-muted-foreground italic">
                              {transfer.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="flights">
              <AccordionTrigger>Flights</AccordionTrigger>
              <AccordionContent className="space-y-3">
                {inclusions.flights && inclusions.flights.length > 0 ? (
                  inclusions.flights.map((flight, idx) => (
                    <div key={idx} className="border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Plane className="h-4 w-4" />
                          <span className="font-semibold">{flight.airline}</span>
                        </div>
                        {flight.flight_number && (
                          <Badge variant="secondary" className="text-xs">{flight.flight_number}</Badge>
                        )}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="font-medium text-muted-foreground min-w-[80px]">From:</span>
                          <span>{flight.from}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-medium text-muted-foreground min-w-[80px]">To:</span>
                          <span>{flight.to}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-medium text-muted-foreground min-w-[80px]">Duration:</span>
                          <span>{flight.duration}</span>
                        </div>
                        {(flight.departure_time || flight.arrival_time) && (
                          <div className="flex items-start gap-2">
                            <span className="font-medium text-muted-foreground min-w-[80px]">Times:</span>
                            <span>
                              {flight.departure_time && `Departs ${flight.departure_time}`}
                              {flight.departure_time && flight.arrival_time && ' • '}
                              {flight.arrival_time && `Arrives ${flight.arrival_time}`}
                            </span>
                          </div>
                        )}
                        {flight.baggage && (
                          <div className="flex items-start gap-2">
                            <span className="font-medium text-muted-foreground min-w-[80px]">Baggage:</span>
                            <span>{flight.baggage}</span>
                          </div>
                        )}
                        {flight.notes && (
                          <div className="mt-2 pt-2 border-t text-xs text-muted-foreground italic">
                            {flight.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No flights included</p>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="activities">
              <AccordionTrigger>Activities</AccordionTrigger>
              <AccordionContent className="space-y-3">
                {inclusions.activities && inclusions.activities.length > 0 ? (
                  inclusions.activities.map((activity, idx) => (
                    <div key={idx} className="border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-start gap-3">
                        <Camera className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No activities included</p>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="services">
              <AccordionTrigger>Services</AccordionTrigger>
              <AccordionContent className="space-y-3">
                {inclusions.services && inclusions.services.length > 0 ? (
                  inclusions.services.map((service, idx) => (
                    <div key={idx} className="border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{service}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No services included</p>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Exclusions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            Not Included
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {exclusions.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

// Important Info Tab
const ImportantInfoTab: React.FC<{
  info: ItineraryData["important_information"];
}> = ({ info }) => {
  return (
    <div className="space-y-4">
      {info.health && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Health & Safety</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Malaria:</strong> {info.health.malaria}
            </p>
            <p>
              <strong>Yellow Fever:</strong> {info.health.yellow_fever}
            </p>
            <p>
              <strong>Water:</strong> {info.health.water}
            </p>
            <p>
              <strong>Insurance:</strong> {info.health.insurance}
            </p>
            <p>
              <strong>Flying Doctors:</strong> {info.health.flying_doctors}
            </p>
          </CardContent>
        </Card>
      )}

      {info.luggage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Luggage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Light Aircraft:</strong> {info.luggage.light_aircraft}
            </p>
            <p>
              <strong>Excess Storage:</strong> {info.luggage.excess_storage}
            </p>
          </CardContent>
        </Card>
      )}

      {info.tipping_guidelines && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tipping Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Porters:</strong> {info.tipping_guidelines.porters}
            </p>
            <p>
              <strong>Waiters:</strong> {info.tipping_guidelines.waiters}
            </p>
            <p>
              <strong>Driver/Guide:</strong> {info.tipping_guidelines.driver_guide}
            </p>
          </CardContent>
        </Card>
      )}

      {info.currency && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Currency</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Kenya:</strong> {info.currency.kenya}
            </p>
            <p>
              <strong>Tanzania:</strong> {info.currency.tanzania}
            </p>
            <p>
              <strong>South Africa:</strong> {info.currency.south_africa}
            </p>
            <p className="text-muted-foreground">{info.currency.notes}</p>
          </CardContent>
        </Card>
      )}

      {info.climate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Climate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>East Africa:</strong> {info.climate.east_africa}
            </p>
            <p>
              <strong>South Africa:</strong> {info.climate.south_africa}
            </p>
          </CardContent>
        </Card>
      )}

      {info.electricity && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Electricity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Voltage:</strong> {info.electricity.voltage}
            </p>
            <p>
              <strong>Plugs:</strong> {info.electricity.plugs}
            </p>
            <p>
              <strong>Lodges:</strong> {info.electricity.lodges}
            </p>
          </CardContent>
        </Card>
      )}

      {info.photography && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Photography</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{info.photography}</CardContent>
        </Card>
      )}

      {info.communications && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Communications</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{info.communications}</CardContent>
        </Card>
      )}
    </div>
  );
};

// Main Component
export const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState("itinerary");

  // Debug logging
  console.log('ItineraryDisplay received data:', data);
  console.log('Has daily_itinerary in data:', !!data?.daily_itinerary);
  console.log('daily_itinerary length:', data?.daily_itinerary?.length);
  console.log('daily_itinerary content:', data?.daily_itinerary);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{data.trip_overview.tour_name}</h1>
        <p className="text-muted-foreground">
          {data.trip_overview.client_group} • {data.trip_overview.tour_operator}
        </p>
        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          <span>{data.trip_overview.dates}</span>
          <span>•</span>
          <span>{data.trip_overview.duration}</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inclusions">Inclusions</TabsTrigger>
          <TabsTrigger value="info">Info</TabsTrigger>
        </TabsList>

        <TabsContent value="itinerary" className="mt-4">
          <ScrollArea className="h-[600px] pr-4">
            {data.daily_itinerary && data.daily_itinerary.length > 0 ? (
              data.daily_itinerary.map((day) => (
                <DayCard key={day.day} day={day} />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="mb-4">
                  <Info className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">Daily itinerary data not available</p>
                </div>
                <p className="text-sm">
                  This itinerary was scraped with an older version that didn't include detailed daily information.
                </p>
                <p className="text-sm mt-2">
                  Please re-scrape this itinerary to get the full daily itinerary details.
                </p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab overview={data.trip_overview} />
        </TabsContent>

        <TabsContent value="inclusions" className="mt-4">
          <InclusionsTab
            inclusions={data.inclusions}
            exclusions={data.exclusions}
          />
        </TabsContent>

        <TabsContent value="info" className="mt-4">
          <ScrollArea className="h-[600px] pr-4">
            <ImportantInfoTab info={data.important_information} />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ItineraryDisplay;
