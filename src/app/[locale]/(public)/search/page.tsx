"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/Context/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

const content = {
  ar: {
    searchPlaceholder: "ابحث عن سيارات، ماركات، موديلات...",
    noResults: "لا توجد نتائج",
    allProducts: "جميع المنتجات",
    searchResultsFor: "نتائج البحث عن",
    productsInCategory: "منتجات في فئة",
    price: "السعر",
    discount: "خصم",
    finalPrice: "السعر النهائي",
    viewDetails: "عرض التفاصيل",
    uncategorized: "غير مصنف"
  },
  en: {
    searchPlaceholder: "Search for cars, makes, models...",
    noResults: "No results found",
    allProducts: "All Products",
    searchResultsFor: "Search results for",
    productsInCategory: "Products in category",
    price: "Price",
    discount: "Discount",
    finalPrice: "Final Price",
    viewDetails: "View Details",
    uncategorized: "Uncategorized"
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
}

async function fetchSearchResults(query: string, lang: string, countryId?: string, cityId?: string): Promise<SearchResult[]> {
  try {
    const searchUrl = new URL("https://new.4youad.com/api/products");
    searchUrl.searchParams.append('search', query);
    searchUrl.searchParams.append('lang', lang);

    if (countryId) {
      searchUrl.searchParams.append('country_id', countryId);
    }
    if (cityId) {
      searchUrl.searchParams.append('city_id', cityId);
    }

    const response = await fetch(searchUrl.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    const results: SearchResult[] = [];
    
    if (data.data?.categories) {
      data.data.categories.forEach((category: any) => {
        results.push({
          id: category.id,
          name: category.name[lang] || category.name.en || category.name.ar || 'Unnamed Category',
          slug: category.slug,
          type: 'category',
          image_url: category.icon_url || null
        });
      });
    }
    
    // Handle products
    if (data.data?.products) {
      data.data.products.forEach((product: any) => {
        results.push({
          id: product.id,
          name: product.name[lang] || product.name.en || product.name.ar || 'Unnamed Product',
          slug: product.slug,
          type: 'product',
          image_url: product.main_image_url || null,
          category_id: product.category_id,
          price: product.price,
          discount: product.discount,
          final_price: product.final_price
        });
      });
    }

    return results;
  } catch (error) {
    console.error("Error fetching search results:", error);
    return [];
  }
}

export default function SearchPage() {
  const { Language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentContent = content[Language];
  
const query = decodeURIComponent(searchParams.get('q') || '');  const countryId = searchParams.get('country_id') || undefined;
  const cityId = searchParams.get('city_id') || undefined;
  
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
  const [searchInput, setSearchInput] = React.useState(query);

  React.useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const results = await fetchSearchResults(query, Language, countryId, cityId);
        setSearchResults(results);
      } catch (error) {
        console.error("Failed to fetch search results:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (query.trim()) {
      fetchResults();
    } else {
      setSearchResults([]);
      setIsLoading(false);
    }
  }, [query, Language, countryId, cityId]);

  // Group results by category
  const groupedResults = React.useMemo(() => {
    const categories = searchResults.filter(r => r.type === 'category');
    const products = searchResults.filter(r => r.type === 'product');
    
    const categoryMap: Record<number, { category: SearchResult, products: SearchResult[] }> = {};
    
    // Add all categories to the map
    categories.forEach(category => {
      categoryMap[Number(category.id)] = {
        category,
        products: []
      };
    });
    
    // Add products to their categories
    products.forEach(product => {
      if (product.category_id && categoryMap[product.category_id]) {
        categoryMap[product.category_id]?.products.push(product);
      } else {
        if (!categoryMap[0]) {
          categoryMap[0] = {
            category: {
              id: 0,
              name: currentContent.uncategorized,
              slug: 'uncategorized',
              type: 'category',
              image_url: null
            },
            products: []
          };
        }
        categoryMap[0].products.push(product);
      }
    });
    
    return Object.values(categoryMap);
  }, [searchResults, currentContent.uncategorized]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      const params = new URLSearchParams();
      params.append('q', searchInput.trim());
      
      if (countryId) {
        params.append('country_id', countryId);
      }
      if (cityId) {
        params.append('city_id', cityId);
      }
      
      router.push(`/search?${params.toString()}`);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8" dir={Language === "ar" ? "rtl" : "ltr"}>
       
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
     
      <h1 className="text-2xl font-bold mb-6">
        {currentContent.searchResultsFor}: <span className="text-blue-600">"{query}"</span>
      </h1>

      {searchResults.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">{currentContent.noResults}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedResults.map((group) => (
            <div key={group.category.id} className="space-y-4">
              <h2 className="text-xl font-semibold">
                {group.category.id === 0 
                  ? currentContent.allProducts 
                  : `${currentContent.productsInCategory}: ${group.category.name}`}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.products.map((product) => (
                  <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="p-0">
                      <div className="aspect-square relative">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover rounded-t-lg"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <Search className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-lg mb-2">{product.name}</h3>
                      <div className="space-y-1">
                        {product.price && (
                          <p className="text-sm">
                            {currentContent.price}: <span className="font-medium">{product.price}</span>
                          </p>
                        )}
                        {product.discount && (
                          <p className="text-sm">
                            {currentContent.discount}: <span className="font-medium">{product.discount}%</span>
                          </p>
                        )}
                        {product.final_price && (
                          <p className="text-sm">
                            {currentContent.finalPrice}: <span className="font-medium text-red-600">{product.final_price}</span>
                          </p>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Link 
                        href={`/product/${product.slug}`}
                        className="w-full"
                      >
                        <Button variant="outline" className="w-full">
                          {currentContent.viewDetails}
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}