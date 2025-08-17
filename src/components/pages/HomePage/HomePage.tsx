"use client";

import React, { useEffect, useState } from 'react';
import CategoriesAndListings from "../../products/CategoriesAndListings";
import AutoImageSlider from "./AutoImageSlider";

interface CategoryWithProducts {
  category: {
    id: number;
    slug: string;
    name: {
      ar: string;
      en: string;
    };
    icon_url: string | null;
  };
  products: {
    id: number;
    slug: string;
    name: {
      ar: string;
      en: string;
    };
    price: number;
    discount: number;
    final_price: number;
    quantity: number;
    picture_url: string;
  }[];
}

export default function HomePage() {
  const [data, setData] = useState<CategoryWithProducts[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://new.4youad.com/api/homeProducts');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden max-w-full">
      <div className="w-full max-w-full">
        <AutoImageSlider />
      </div>
      <div className="max-w-full">
        <CategoriesAndListings 
          data={data ?? []}
          loading={loading}
          error={error}
          showAllCategories={true}
        />
      </div>
    </div>
  );
}