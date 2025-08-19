"use client";
import React, { useState, useEffect } from "react";
import { useLanguage } from "@/Context/LanguageContext";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ImageIcon, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: number;
  slug: string;
  flag: string;
  name: {
    ar: string;
    en: string | null;
  };
  quantity: number;
  phone_number: string;
  whatsapp_number: string | null;
  country_id: number;
  city_id: number | null;
  picture_url: string | null;
}

interface Category {
  id: number;
  slug: string;
  name: {
    ar: string;
    en: string | null;
  };
  icon_url: string | null;
}

interface CategoryWithProducts {
  category: Category;
  products: Product[];
}
interface CategoriesAndListingsProps {
  data: any[]; 
  loading: boolean;
  error: string | null;
  showAllCategories: boolean;
}

const HOME_PRODUCTS_API = "https://new.4youad.com/api/homeProducts";

export default function CategoriesAndListings(_props: CategoriesAndListingsProps ) {
  const { Language } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [categoryProducts, setCategoryProducts] = useState<CategoryWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const countryId = searchParams.get('country_id');
      const cityId = searchParams.get('city_id');
      const categorySlug = searchParams.get('category_slug');
      const subcategorySlug = searchParams.get('subcategory_slug');
      
      let apiUrl = HOME_PRODUCTS_API;
      const params = new URLSearchParams();
      
      if (countryId) params.append('country_id', countryId);
      if (cityId) params.append('city_id', cityId);
      if (categorySlug) params.append('category_slug', categorySlug);
      if (subcategorySlug) params.append('subcategory_slug', subcategorySlug);
      
      apiUrl += `?${params.toString()}`;

      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      let newCategories = data.data || [];

      // Strict filtering logic
      newCategories = newCategories.map((category: CategoryWithProducts) => ({
        ...category,
        products: category.products.filter(product => {
          const countryMatch = !countryId || product.country_id === parseInt(countryId);
          const cityMatch = !cityId || product.city_id === parseInt(cityId) || product.city_id === null;
          return countryMatch && cityMatch;
        })
      })).filter((category: CategoryWithProducts) => category.products.length > 0);

      setCategoryProducts(newCategories);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again later.");
      setCategoryProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchParams, Language]);

  const navigateToProduct = (slug: string) => {
    router.push(`/ad/${slug}`);
  };

  const navigateToCategory = (slug: string) => {
    const params = new URLSearchParams();
    params.append('category_slug', slug);
    
    // Preserve location filters
    const countryId = searchParams.get('country_id');
    const cityId = searchParams.get('city_id');
    if (countryId) params.append('country_id', countryId);
    if (cityId) params.append('city_id', cityId);
    
    router.push(`/products?${params.toString()}`);
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
        {/* Flag Badge */}
        {product.flag && (
           <div className="absolute top-2 left-2 z-20">
              <span className={`px-8 py-1 text-xs font-bold rounded-md ${
                product.flag === "P" 
                  ? "bg-red-500 text-white shadow-lg shadow-red-200 px-3" 
                  : "bg-green-100 text-green-500 shadow-lg shadow-green-200 px-3"
              }`}>
                {product.flag === "P" 
                  ? (Language === "ar" ? "منتج" : "Product") 
                  : (Language === "ar" ? "خدمة" : "Service")}
              </span>
            </div>
        )}

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
      </div>
    );
  };

  const renderLocationFilterBadge = () => {
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
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4].map((product) => (
                <div key={product} className="space-y-4 group">
                  <Skeleton className="h-60 w-full rounded-2xl bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 group-hover:opacity-90 transition-opacity" />
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-3/4 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
                    <Skeleton className="h-5 w-1/2 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
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

  if (categoryProducts.length === 0) {
    const countryId = searchParams.get('country_id');
    const cityId = searchParams.get('city_id');
    
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
      {renderLocationFilterBadge()}

      <div className="space-y-12">
        {categoryProducts.map((categoryWithProducts) => (
          <div key={categoryWithProducts.category.id} className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                {categoryWithProducts.category.icon_url && (
                  <div className="p-3 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-sm">
                    <img
                      src={categoryWithProducts.category.icon_url}
                      alt={categoryWithProducts.category.name[Language] || categoryWithProducts.category.name.ar || ""}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <h2 className="text-2xl font-bold text-gray-900">
                  {categoryWithProducts.category.name[Language] || categoryWithProducts.category.name.ar}
                </h2>
              </div>
              <Button
                variant="ghost"
                className="text-red-600 hover:text-red-700"
                onClick={() => navigateToCategory(categoryWithProducts.category.slug)}
              >
                {Language === "ar" ? "عرض المزيد" : "View More"}
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {categoryWithProducts.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}