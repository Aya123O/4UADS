"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/Context/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import CategoriesAndListings from '../../../../components/products/CategoriesAndListings';

const SEARCH_API = "https://new.4youad.com/api/products/search";
const HOME_PRODUCTS_API = "https://new.4youad.com/api/homeProducts";

const content = {
  ar: {
    searchPlaceholder: "ابحث عن سيارات، ماركات، موديلات...",
    noResults: "لا توجد نتائج",
    allProducts: "جميع المنتجات",
    searchResultsFor: "نتائج البحث عن",
    productsInCategory: "منتجات في فئة",
  },
  en: {
    searchPlaceholder: "Search for cars, makes, models...",
    noResults: "No results found",
    allProducts: "All Products",
    searchResultsFor: "Search results for",
    productsInCategory: "Products in category",
  }
};

interface SearchResult {
  id: string | number;
  name: string;
  slug: string;
  type: 'category' | 'product';
  image_url: string | null;
  category_id?: number;
  price?: number;
  discount?: number;
  final_price?: number;
  quantity?: number;
  description?: {
    ar: string;
    en: string;
  };
  customer?: {
    id: number;
    name: string;
    phone: string;
    email: string;
    picture_url: string;
  };
  created_at?: string;
  views?: number;
}

async function getSearchResults(query: string, lang: string): Promise<SearchResult[]> {
  try {
    // First try the search API
    const searchResponse = await fetch(SEARCH_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        search: query,
        lang: lang
      }),
    });

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      
      const results: SearchResult[] = [];
      
      if (searchData.data?.categories && Array.isArray(searchData.data.categories)) {
        searchData.data.categories.forEach((category: any) => {
          results.push({
            id: category.id,
            name: category.name[lang] || category.name.en || category.name.ar || 'Unnamed Category',
            slug: category.slug,
            type: 'category',
            image_url: category.icon_url || null
          });
        });
      }
      
      if (searchData.data?.products && Array.isArray(searchData.data.products)) {
        searchData.data.products.forEach((product: any) => {
          results.push({
            id: product.id,
            name: product.name[lang] || product.name.en || product.name.ar || 'Unnamed Product',
            slug: product.slug,
            type: 'product',
            image_url: product.main_image_url || null,
            category_id: product.category_id,
            price: product.price,
            discount: product.discount,
            final_price: product.final_price,
            quantity: product.quantity,
            description: product.description,
            customer: product.customer,
            created_at: product.created_at,
            views: product.views
          });
        });
      }

      if (results.length > 0) {
        return results;
      }
    }

    // If search API returns no results, try the homeProducts API
    const homeResponse = await fetch(HOME_PRODUCTS_API);
    if (homeResponse.ok) {
      const homeData = await homeResponse.json();
      const results: SearchResult[] = [];
      const categoryProductsMap: Record<number, any[]> = {};

      if (homeData.data && Array.isArray(homeData.data)) {
        homeData.data.forEach((item: any) => {
          // Add category and its products to the map
          if (item.category) {
            const categoryId = item.category.id;
            const categoryName = item.category.name[lang] || item.category.name.en || item.category.name.ar;
            
            // Store products for this category
            if (item.products && Array.isArray(item.products)) {
              categoryProductsMap[categoryId] = item.products.map((product: any) => ({
                ...product,
                category_id: categoryId
              }));
            }

            // Check if category name matches search query
            if (categoryName.toLowerCase().includes(query.toLowerCase())) {
              results.push({
                id: categoryId,
                name: categoryName,
                slug: item.category.slug,
                type: 'category',
                image_url: item.category.icon_url || null
              });

              // Add all products from this category
              if (categoryProductsMap[categoryId]) {
                categoryProductsMap[categoryId].forEach((product: any) => {
                  results.push({
                    id: product.id,
                    name: product.name[lang] || product.name.en || product.name.ar,
                    slug: product.slug,
                    type: 'product',
                    image_url: product.picture_url || null,
                    category_id: categoryId,
                    price: product.price,
                    discount: product.discount,
                    final_price: product.final_price,
                    quantity: product.quantity,
                    description: product.description,
                    customer: product.customer,
                    created_at: product.created_at,
                    views: product.views
                  });
                });
              }
            }
          }

          // Also add individual products that match the query
          if (item.products && Array.isArray(item.products)) {
            item.products.forEach((product: any) => {
              const productName = product.name[lang] || product.name.en || product.name.ar;
              if (productName.toLowerCase().includes(query.toLowerCase())) {
                results.push({
                  id: product.id,
                  name: productName,
                  slug: product.slug,
                  type: 'product',
                  image_url: product.picture_url || null,
                  category_id: product.category_id,
                  price: product.price,
                  discount: product.discount,
                  final_price: product.final_price,
                  quantity: product.quantity,
                  description: product.description,
                  customer: product.customer,
                  created_at: product.created_at,
                  views: product.views
                });
              }
            });
          }
        });
      }

      return results;
    }

    return [];
  } catch (error) {
    console.error("Error fetching search results:", error);
    return [];
  }
}

interface SearchPageProps {
  searchParams: {
    q: string;
  };
}

interface CategoryMapItem {
  category: {
    id: number;
    slug: string;
    name: { en: string; ar: string };
    icon_url: string | null;
  };
  products: any[];
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const { Language } = useLanguage();
  const currentContent = content[Language];
  const query = searchParams.q || '';
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
  const [categoryProductsData, setCategoryProductsData] = React.useState<any[]>([]);

  React.useEffect(() => {
    async function fetchResults() {
      setIsLoading(true);
      const results = await getSearchResults(query, Language);
      setSearchResults(results);
      
      // Transform results into the format expected by CategoriesAndListings
      const categories = results.filter(r => r.type === 'category');
      const products = results.filter(r => r.type === 'product');
      
      // Group products by category
      const categoryMap: Record<number, CategoryMapItem> = {};
      categories.forEach(category => {
        const categoryId = Number(category.id);
        categoryMap[categoryId] = {
          category: {
            id: categoryId,
            slug: category.slug,
            name: { en: category.name, ar: category.name },
            icon_url: category.image_url
          },
          products: []
        };
      });
      
      // Add products to their categories
      products.forEach(product => {
        const categoryId = product.category_id;
        if (categoryId && categoryMap[categoryId]) {
          // Safely access the category and push the product
          const categoryItem = categoryMap[categoryId];
          if (categoryItem) {
            categoryItem.products.push({
              id: product.id,
              slug: product.slug,
              name: { en: product.name, ar: product.name },
              price: product.price,
              discount: product.discount,
              final_price: product.final_price,
              quantity: product.quantity,
              picture_url: product.image_url,
              description: product.description,
              customer: product.customer,
              created_at: product.created_at,
              views: product.views
            });
          }
        }
      });
      
      // Also include products without categories
      const uncategorizedProducts = products.filter(
        product => !product.category_id || !categoryMap[product.category_id]
      ).map(product => ({
        id: product.id,
        slug: product.slug,
        name: { en: product.name, ar: product.name },
        price: product.price,
        discount: product.discount,
        final_price: product.final_price,
        quantity: product.quantity,
        picture_url: product.image_url,
        description: product.description,
        customer: product.customer,
        created_at: product.created_at,
        views: product.views
      }));
      
      // Create the final data structure
      const finalData = Object.values(categoryMap);
      if (uncategorizedProducts.length > 0) {
        finalData.push({
          category: {
            id: 0,
            slug: 'uncategorized',
            name: { en: '', ar: '' },
            icon_url: null
          },
          products: uncategorizedProducts
        });
      }
      
      setCategoryProductsData(finalData);
      setIsLoading(false);
    }
    
    fetchResults();
  }, [query, Language]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8" dir={Language === "ar" ? "rtl" : "ltr"}>
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Skeleton className="w-full h-12 rounded-full" />
            <Skeleton className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 rounded-full" />
            <Skeleton className="absolute right-1 top-1/2 transform -translate-y-1/2 w-20 h-8 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <Skeleton className="aspect-square w-full" />
              <div className="p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir={Language === "ar" ? "rtl" : "ltr"}>
      <div className="max-w-2xl mx-auto mb-8">
        {/* Search input removed as it wasn't functional in the original code */}
      </div>

      <h1 className="text-2xl font-bold mb-6">
        {currentContent.searchResultsFor}: <span className="text-blue-600">"{query}"</span>
      </h1>

      {searchResults.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">{currentContent.noResults}</p>
        </div>
      ) : (
        <CategoriesAndListings 
          data={categoryProductsData}
          loading={isLoading}
          error={null}
          showAllCategories={true}
        />
      )}
    </div>
  );
}