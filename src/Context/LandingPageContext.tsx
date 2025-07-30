"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import axios from "axios";

// Define the types for the product, subcategory, and category
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

interface Subcategory {
  name: string;
  slug: string;
  products: Product[];
}

interface Category {
  name: string;
  children: Subcategory[];
}

// Define the context type that now includes both categories and allCategories arrays
interface LandingPageData {
  categories: Category[];
  allCategories: Category[];
  heroSectionImages: string[];
}

interface LandingPageContextType {
  data: LandingPageData | null;
  loading: boolean;
  error: string | null;
  fetchLandingPageData?: (country: any, city: any) => void;
}

// Create the context with a default value of undefined
const LandingPageContext = createContext<LandingPageContextType | undefined>(
  undefined
);

// Define the props type for the provider
interface LandingPageProviderProps {
  children: ReactNode;
}

// Create a provider component
export const LandingPageProvider: React.FC<LandingPageProviderProps> = ({
  children,
}) => {
  const [data, setData] = useState<LandingPageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch the landing page data
  const fetchLandingPageData = async (country: any, city: any) => {
    try {
      setLoading(true);

      const response = await axios.get(
        "https://dashboard.4youad.com/api/landing-page" +
          `?country=${country ?? ""}&city=${city ?? ""}`
      );
      setData({
        categories: response.data.categories,
        allCategories: response.data.allCategories,
        heroSectionImages: response.data.heroSectionImages,
      });
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when the component mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      fetchLandingPageData(
        localStorage.getItem("country") ?? "",
        localStorage.getItem("location")
      );
    }
  }, []);

  return (
    <LandingPageContext.Provider
      value={{ data, loading, error, fetchLandingPageData }}
    >
      {children}
    </LandingPageContext.Provider>
  );
};

// Custom hook for using the LandingPageContext
export const useLandingPage = (): LandingPageContextType => {
  const context = useContext(LandingPageContext);
  if (!context) {
    throw new Error("useLandingPage must be used within a LandingPageProvider");
  }
  return context;
};
