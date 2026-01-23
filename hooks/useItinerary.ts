"use client";

import { useState, useCallback } from "react";
import { getEnvironment } from "@/config/environment";

const { apiBaseUrl } = getEnvironment();

interface ItinerarySummary {
  _id: string;
  tour_name: string;
  client_group: string;
  dates: string;
  duration: string;
  days: number;
  countries: string[];
  scraped_at: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

interface UseItineraryReturn {
  // State
  itineraries: ItinerarySummary[];
  currentItinerary: any | null;
  pagination: PaginationInfo | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchItineraries: (page?: number, search?: string) => Promise<void>;
  fetchItinerary: (id: string) => Promise<void>;
  scrapeItinerary: (url: string) => Promise<{ document_id: string } | null>;
  deleteItinerary: (id: string) => Promise<boolean>;
  searchItineraries: (query: string, type?: string) => Promise<void>;
  clearError: () => void;
}

export function useItinerary(): UseItineraryReturn {
  const [itineraries, setItineraries] = useState<ItinerarySummary[]>([]);
  const [currentItinerary, setCurrentItinerary] = useState<any | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const fetchItineraries = useCallback(
    async (page: number = 1, search?: string) => {
      setLoading(true);
      setError(null);

      try {
        let url = `${apiBaseUrl}/api/itinerary/list?page=${page}&per_page=20`;
        if (search) {
          url += `&search=${encodeURIComponent(search)}`;
        }

        const response = await fetch(url, {
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch itineraries");
        }

        const data = await response.json();

        if (data.success) {
          setItineraries(data.data.items);
          setPagination(data.data.pagination);
        } else {
          throw new Error(data.error || "Failed to fetch itineraries");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchItinerary = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/itinerary/${id}`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch itinerary");
      }

      const data = await response.json();

      if (data.success) {
        setCurrentItinerary(data.data);
      } else {
        throw new Error(data.error || "Failed to fetch itinerary");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const scrapeItinerary = useCallback(
    async (url: string): Promise<{ document_id: string } | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiBaseUrl}/api/scraper/scrape`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ url, headless: true }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Scraping failed");
        }

        const data = await response.json();

        if (data.success) {
          return data.data;
        } else {
          throw new Error(data.error || "Scraping failed");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteItinerary = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/itinerary/${id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete itinerary");
      }

      const data = await response.json();

      if (data.success) {
        // Remove from local state
        setItineraries((prev) => prev.filter((i) => i._id !== id));
        return true;
      } else {
        throw new Error(data.error || "Failed to delete itinerary");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchItineraries = useCallback(
    async (query: string, type: string = "all") => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${apiBaseUrl}/api/itinerary/search?q=${encodeURIComponent(
            query
          )}&type=${type}`,
          {
            headers: getAuthHeaders(),
          }
        );

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data = await response.json();

        if (data.success) {
          setItineraries(data.data.items);
          setPagination(null); // Search doesn't paginate
        } else {
          throw new Error(data.error || "Search failed");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    itineraries,
    currentItinerary,
    pagination,
    loading,
    error,
    fetchItineraries,
    fetchItinerary,
    scrapeItinerary,
    deleteItinerary,
    searchItineraries,
    clearError,
  };
}

export default useItinerary;
