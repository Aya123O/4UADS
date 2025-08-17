"use client";
import React, { useState, useEffect } from "react";
import { useLanguage } from "@/Context/LanguageContext";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ImageIcon, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface Product {
  id: number;
  slug: string;
  name: {
    ar: string;
    en: string | null;
  };
  quantity: number;
  phone_number: string;
  whatsapp_number: string | null;
  country_id: number;
  city_id: number;
  picture_url: string | null;
  price?: number;
  discount?: number;
  final_price?: number;
  rating?: number;
  sub_category_slug?: string;
}

interface Subcategory {
  id: number;
  slug: string;
  name: {
    ar: string;
    en: string;
  };
  parent_id: number;
  icon_url: string | null;
}

interface Category {
  id: number;
  slug: string;
  name: {
    ar: string;
    en: string;
  };
  icon_url: string | null;
  sub_categories?: Subcategory[];
}

interface Country {
  id: number;
  name: {
    ar: string;
    en: string;
  };
  cities: City[];
}

interface City {
  id: number;
  name: {
    ar: string;
    en: string;
  };
  country_id: number;
}
interface CategoriesAndListingsProps {
  data: any[]; 
  loading: boolean;
  error: string | null;
  showAllCategories: boolean;
}
const PRODUCTS_API = "https://new.4youad.com/api/products";

export default function CategoriesAndListings(_props: CategoriesAndListingsProps) 
{
  const { Language } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState<string>("");
  const [categoryIcon, setCategoryIcon] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchProducts = async (pageNumber = 1, append = false) => {
    try {
      if (pageNumber === 1) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);
      
      // Get current URL params
      const countryId = searchParams.get('country_id');
      const cityId = searchParams.get('city_id');
      const categorySlug = searchParams.get('category_slug');
      const subcategorySlug = searchParams.get('subcategory_slug');
      
      let apiUrl = PRODUCTS_API;
      const params = new URLSearchParams();
      
      if (countryId) params.append('country_id', countryId);
      if (cityId) params.append('city_id', cityId);
      if (categorySlug) params.append('category_slug', categorySlug);
      if (subcategorySlug) params.append('subcategory_slug', subcategorySlug);
      params.append('page', pageNumber.toString());
      
      apiUrl += `?${params.toString()}`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const newProducts = data.data?.data || [];

      if (append) {
        setProducts(prev => [...prev, ...newProducts]);
      } else {
        setProducts(newProducts);
      }

      // Check if there are more products
      setHasMore(newProducts.length >= 10); 

      // Set category name if available
      if (data.data?.category_name) {
        setCategoryName(data.data.category_name[Language] || data.data.category_name.ar || "");
      }
      if (data.data?.category_icon) {
        setCategoryIcon(data.data.category_icon);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again later.");
      setProducts([]);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchProducts(1);
  }, [searchParams, Language]);

  const loadMoreProducts = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, true);
  };

  const navigateToProduct = (slug: string) => {
    router.push(`/ad/${slug}`);
  };

  const renderStars = (rating = 0) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const [imageError, setImageError] = useState(false);
    const hasImage = product.picture_url && !imageError;

    return (
      <div 
        className="group bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 relative flex flex-col h-full"
        onClick={() => navigateToProduct(product.slug)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigateToProduct(product.slug)}
        aria-label={product.name[Language] || 'Product'}
      >
        <div className="relative aspect-square overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-100 opacity-30 z-10"></div>
          {hasImage ? (
            <img
              src={product.picture_url ?? undefined}
              alt={product.name[Language] ?? product.name.ar ?? "Product"}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <div className="flex flex-col sm:flex-row sm:justify-between items-start mb-3 gap-2 sm:gap-0">
            <h3 className="font-bold text-gray-900 line-clamp-2 text-lg flex-grow">
              {product.name[Language] || product.name.ar || 'Unnamed Product'}
            </h3>
          </div>

          {product.rating && (
            <div className="flex items-center mb-2">
              {renderStars(product.rating)}
              <span className="text-sm text-gray-500 ml-1">
                ({product.rating.toFixed(1)})
              </span>
            </div>
          )}

          {product.final_price && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-red-600">
                ${product.final_price.toFixed(2)}
              </span>
              {product.discount && product.discount > 0 && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.price?.toFixed(2)}
                </span>
              )}
            </div>
          )}

          <div className="mt-auto pt-2 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              className="text-sm h-9 border-red-100 bg-red-500 hover:bg-red-500 hover:text-white text-white rounded-lg w-1/2 mx-auto"
              onClick={(e) => {
                e.stopPropagation();
                navigateToProduct(product.slug);
              }}
            >
              {Language === "ar" ? "التفاصيل" : "Details"}
            </Button>
          </div>
        </div>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br from-gray-100 to-black transition-opacity duration-300 pointer-events-none"></div>
      </div>
    );
  };

  const renderLocationFilter = () => {
    const countryId = searchParams.get('country_id');
    const cityId = searchParams.get('city_id');
    
    if (!countryId && !cityId) return null;

    return null;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-10">
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <Skeleton className="h-10 w-56 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
              <Skeleton className="h-8 w-28 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4].map((product) => (
                <div key={product} className="space-y-4 group">
                  <Skeleton className="h-60 w-full rounded-2xl bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 group-hover:opacity-90 transition-opacity" />
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-3/4 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
                    <Skeleton className="h-5 w-1/2 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
                    <Skeleton className="h-4 w-full rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="inline-block bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg">
          {error}
          <Button 
            variant="ghost" 
            className="ml-2 text-red-600"
            onClick={() => window.location.reload()}
          >
            {Language === "ar" ? "إعادة المحاولة" : "Try Again"}
          </Button>
        </div>
      </div>
    );
  }

  const countryId = searchParams.get('country_id');
  const cityId = searchParams.get('city_id');
  const categorySlug = searchParams.get('category_slug');

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="inline-block bg-gray-50 border border-gray-200 text-gray-700 px-8 py-8 rounded-lg max-w-md">
          <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold mb-2">
            {Language === "ar" ? "لا توجد منتجات متاحة" : "No products available"}
          </h3>
          <p className="text-gray-500 mb-4">
            {countryId || cityId
              ? Language === "ar"
                ? "لا توجد منتجات متاحة حاليًا في الموقع المحدد."
                : "No products available in the selected location."
              : Language === "ar"
                ? "لا توجد منتجات متاحة حاليًا."
                : "No products available currently."}
          </p>
          {(countryId || cityId) && (
            <Button 
              variant="outline" 
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.delete('country_id');
                params.delete('city_id');
                router.push(`/?${params.toString()}`);
              }}
            >
              {Language === "ar" ? "إزالة الفلتر" : "Remove filter"}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12" dir={Language === "ar" ? "rtl" : "ltr"}>
      {renderLocationFilter()}

      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          {categoryIcon && (
            <div className="p-3 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-sm">
              <img
                src={categoryIcon}
                alt={categoryName}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.style.display = 'none';
                }}
              />
            </div>
          )}
          <h2 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
            {categoryName || (Language === "ar" ? "المنتجات" : "Products")}
          </h2>
        </div>
        {categorySlug && (
          <Link
            href="/products"
            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors group"
          >
            {Language === "ar" ? (
              <>
                رجوع <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </>
            ) : (
              <>
                Go Back <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-10 text-center">
          <Button
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 px-8 py-4 text-lg"
            onClick={loadMoreProducts}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <span>{Language === "ar" ? "جاري التحميل..." : "Loading..."}</span>
            ) : (
              <span>{Language === "ar" ? "عرض المزيد" : "View More"}</span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}