/**
 * TypeScript type definitions for Safari Itinerary data structures
 */

export interface Contact {
  email: string;
  phone: string;
  mobile?: string;
}

export interface TripOverview {
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

export interface EmergencyContact {
  name: string;
  phone: string;
  email: string;
  role: string;
  availability?: string;
}

export interface VisaRequirement {
  country: string;
  required: boolean;
  process: string;
  notes: string;
}

export interface FlightDetail {
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

export interface BorderCrossing {
  day: number;
  date: string;  // YYYY-MM-DD
  from_country: string;
  to_country: string;
  border_point: string;
  estimated_time: string;
  procedures: string;
  notes?: string;
}

export interface EarlyCheckout {
  day: number;
  date: string;  // YYYY-MM-DD
  property: string;
  checkout_time: string;
  reason: string;
}

export interface LateArrival {
  day: number;
  date: string;  // YYYY-MM-DD
  property: string;
  estimated_arrival_time: string;
  reason: string;
}

export interface Logistics {
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

export interface DailyBreakdownSummary {
  day: number;
  date: string;
  title: string;
  summary: string;
  highlights: string[];
  distance_traveled?: string;
  accommodation_type?: string;
  meals_included?: string;
}

export interface Accommodation {
  name: string;
  type: string;
  description: string;
  room_type: string;
  room_description: string;
  total_rooms: number;
  distance_from_airport: string | null;
}

export interface Meals {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  meal_plan: string;
}

export interface ActivityDetails {
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

export interface Activity {
  name: string;
  type: string;
  description: string;
  details?: ActivityDetails;
  included: boolean;
}

export interface OptionalActivity {
  name: string;
  description: string;
}

export interface DayItinerary {
  day: number;
  date: string;
  location: string;
  accommodation: Accommodation | null;
  meals: Meals;
  activities: Activity[];
  optional_activities: OptionalActivity[];
  notes: string | null;
}

export interface AccommodationInclusion {
  name: string;
  nights: number;
  location: string;
  room_type: string;
  basis: string;
  property_inclusions?: string[];
  property_exclusions?: string[];
}

export interface MealPropertyInclusion {
  property_name: string;
  meal_plan: string;
  meals_included: string[];
  beverages_included: string;
  special_notes?: string;
}

export interface TransferInclusion {
  type: string;
  from: string;
  to: string;
  vehicle: string;
  duration?: string;
  notes?: string;
}

export interface FlightInclusion {
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

export interface Inclusions {
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
}

export interface ImportantInformation {
  luggage?: {
    light_aircraft: string;
    excess_storage: string;
  };
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
  climate?: {
    east_africa: string;
    south_africa: string;
  };
  electricity?: {
    voltage: string;
    plugs: string;
    lodges: string;
  };
  photography?: string;
  communications?: string;
}

export interface ItineraryMetadata {
  scraped_at: string;
  version: string;
  source_url: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ItineraryData {
  _id?: string;
  trip_overview: TripOverview;
  logistics?: Logistics;
  daily_breakdown_summary?: DailyBreakdownSummary[];
  daily_itinerary: DayItinerary[];
  inclusions: Inclusions;
  exclusions: string[];
  important_information: ImportantInformation;
  _metadata?: ItineraryMetadata;
}

export interface ItinerarySummary {
  _id: string;
  tour_name: string;
  client_group: string;
  dates: string;
  duration: string;
  days: number;
  countries: string[];
  scraped_at: string;
}

export interface PaginationInfo {
  total: number;
  page: number;
  per_page: number;
  pages: number;
}
