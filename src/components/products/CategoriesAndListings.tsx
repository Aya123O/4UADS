"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../../Context/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

interface Product {
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

interface CategoryWithProducts {
  category: Category;
  products: Product[];
}

interface CategoriesAndListingsProps {
  data?: CategoryWithProducts[] | null;
  products?: Product[] | null;
  loading: boolean;
  error: string | null;
  isSingleCategoryView?: boolean;
  categoryName?: string;
  showAllCategories?: boolean;
  showAllProducts?: boolean;
}

export default function CategoriesAndListings({
  data = null,
  products = null,
  loading = true,
  error = null,
  isSingleCategoryView = false,
  categoryName = "",
  showAllCategories = false,
  showAllProducts = false,
}: CategoriesAndListingsProps) {
  const { Language } = useLanguage();
  const router = useRouter();

  const navigateToProduct = (slug: string) => {
    router.push(`/ad/${slug}`);
  };

  const navigateToCategory = (categorySlug: string, subcategorySlug?: string) => {
    if (subcategorySlug) {
      router.push(`/products?category_slug=${encodeURIComponent(categorySlug)}&subcategory_slug=${encodeURIComponent(subcategorySlug)}`);
    } else {
      router.push(`/products?category_slug=${encodeURIComponent(categorySlug)}`);
    }
  };

  const renderStars = (rating = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-10">
          {[1, 2, 3].map((category) => (
            <div key={category} className="space-y-8">
              <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-56 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
                <Skeleton className="h-8 w-28 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="inline-block bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-600 px-6 py-4 rounded-xl shadow-sm">
          <div className="font-bold text-lg mb-1">⚠️ {Language === "ar" ? "خطأ" : "Error"}</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  if (isSingleCategoryView && products) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12" dir={Language === "ar" ? "rtl" : "ltr"}>
        <section className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
              {categoryName || (Language === "ar" ? "المنتجات" : "Products")}
            </h2>
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
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                onClick={() => navigateToProduct(product.slug)}
              >
                <div className="relative aspect-square overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-100 opacity-30 z-10"></div>
                  <img
                    src={product.picture_url}
                    alt={product.name[Language]}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {product.discount > 0 && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-red-600 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm z-20">
                      {Language === "ar" ? "خصم" : "Sale"} {product.discount}%
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-gray-900 line-clamp-2 text-lg">
                      {product.name[Language]}
                    </h3>
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-xl text-gray-900">
                        {product.final_price} {Language === "ar" ? "ج.م" : "EGP"}
                      </span>
                      {product.discount > 0 && (
                        <span className="text-sm text-gray-500 line-through">
                          {product.price} {Language === "ar" ? "ج.م" : "EGP"}
                        </span>
                      )}
                    </div>
                  </div>

                  {product.rating && (
                    <div className="flex items-center gap-1 mb-4">
                      {renderStars(product.rating)}
                      <span className="text-xs text-gray-500 ml-1">
                        ({product.rating.toFixed(1)})
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">
                      {Language === "ar" ? "الكمية:" : "Qty:"}{" "}
                      <span className="font-medium">{product.quantity}</span>
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-sm h-9 border-red-100 hover:bg-red-50 hover:text-red-600 text-red-500 rounded-lg"
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
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (showAllProducts && data) {
    const allProducts = data.flatMap(categoryWithProducts => categoryWithProducts.products);
    
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12" dir={Language === "ar" ? "rtl" : "ltr"}>
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
              {Language === "ar" ? "جميع المنتجات" : "All Products"}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-orange-400 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {allProducts.map((product, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                onClick={() => navigateToProduct(product.slug)}
              >
                <div className="relative aspect-square overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-100 opacity-30 z-10"></div>
                  <img
                    src={product.picture_url}
                    alt={product.name[Language]}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {product.discount > 0 && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-red-600 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm z-20">
                      {Language === "ar" ? "خصم" : "Sale"} {product.discount}%
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-gray-900 line-clamp-2 text-lg">
                      {product.name[Language]}
                    </h3>
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-xl text-gray-900">
                        {product.final_price} {Language === "ar" ? "ج.م" : "EGP"}
                      </span>
                      {product.discount > 0 && (
                        <span className="text-sm text-gray-500 line-through">
                          {product.price} {Language === "ar" ? "ج.م" : "EGP"}
                        </span>
                      )}
                    </div>
                  </div>

                  {product.rating && (
                    <div className="flex items-center gap-1 mb-4">
                      {renderStars(product.rating)}
                      <span className="text-xs text-gray-500 ml-1">
                        ({product.rating.toFixed(1)})
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">
                      {Language === "ar" ? "الكمية:" : "Qty:"}{" "}
                      <span className="font-medium">{product.quantity}</span>
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-sm h-9 border-red-100 hover:bg-red-50 hover:text-red-600 text-red-500 rounded-lg"
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
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (showAllCategories && data && data.length > 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12" dir={Language === "ar" ? "rtl" : "ltr"}>
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
            {Language === "ar" ? "جميع الفئات والمنتجات" : "All Categories & Products"}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {Language === "ar" 
              ? "استكشف مجموعتنا الكاملة من الفئات والمنتجات المميزة" 
              : "Explore our complete collection of featured categories and products"}
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-red-500 to-orange-400 mx-auto mt-6 rounded-full"></div>
        </div>
        
        {data.map((categoryWithProducts, categoryIndex) => (
          <section key={categoryIndex} className="mb-16 last:mb-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div className="flex items-center gap-4">
                {categoryWithProducts.category.icon_url && (
                  <div className="p-3 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-sm">
                    <img
                      src={categoryWithProducts.category.icon_url}
                      alt={categoryWithProducts.category.name[Language]}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                )}
                <h2 className="text-2xl font-bold text-gray-900">
                  {categoryWithProducts.category.name[Language]}
                </h2>
              </div>
              {categoryWithProducts.category.sub_categories?.length ? (
                <div className="flex flex-wrap gap-2">
                  {categoryWithProducts.category.sub_categories.map((subcategory) => (
                    <Button
                      key={subcategory.id}
                      variant="ghost"
                      className="flex items-center gap-1 text-red-600 hover:text-red-700 font-medium transition-colors group"
                      onClick={() => navigateToCategory(categoryWithProducts.category.slug, subcategory.slug)}
                    >
                      {subcategory.name[Language]}
                      {Language === "ar" ? (
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                      ) : (
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      )}
                    </Button>
                  ))}
                </div>
              ) : (
                <Link href={`/products?category_slug=${categoryWithProducts.category.slug}`} passHref>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-1 text-red-600 hover:text-red-700 font-medium transition-colors group"
                  >
                    {Language === "ar" ? (
                      <>
                        عرض المزيد <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                      </>
                    ) : (
                      <>
                        View More <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {categoryWithProducts.products.map((product, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                  onClick={() => navigateToProduct(product.slug)}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-100 opacity-30 z-10"></div>
                    <img
                      src={product.picture_url}
                      alt={product.name[Language]}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {product.discount > 0 && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-red-600 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm z-20">
                        {Language === "ar" ? "خصم" : "Sale"} {product.discount}%
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-gray-900 line-clamp-2 text-lg">
                        {product.name[Language]}
                      </h3>
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-xl text-gray-900">
                          {product.final_price} {Language === "ar" ? "ج.م" : "EGP"}
                        </span>
                        {product.discount > 0 && (
                          <span className="text-sm text-gray-500 line-through">
                            {product.price} {Language === "ar" ? "ج.م" : "EGP"}
                          </span>
                        )}
                      </div>
                    </div>

                    {product.rating && (
                      <div className="flex items-center gap-1 mb-4">
                        {renderStars(product.rating)}
                        <span className="text-xs text-gray-500 ml-1">
                          ({product.rating.toFixed(1)})
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-500">
                        {Language === "ar" ? "الكمية:" : "Qty:"}{" "}
                        <span className="font-medium">{product.quantity}</span>
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-sm h-9 border-red-100 hover:bg-red-50 hover:text-red-600 text-red-500 rounded-lg"
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
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  if (data && data.length > 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12" dir={Language === "ar" ? "rtl" : "ltr"}>
        {data.map((categoryWithProducts, categoryIndex) => (
          <section key={categoryIndex} className="mb-16 last:mb-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div className="flex items-center gap-4">
                {categoryWithProducts.category.icon_url && (
                  <div className="p-3 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-sm">
                    <img
                      src={categoryWithProducts.category.icon_url}
                      alt={categoryWithProducts.category.name[Language]}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                )}
                <h2 className="text-2xl font-bold text-gray-900">
                  {categoryWithProducts.category.name[Language]}
                </h2>
              </div>
              {categoryWithProducts.category.sub_categories?.length ? (
                <div className="flex flex-wrap gap-2">
                  {categoryWithProducts.category.sub_categories.map((subcategory) => (
                    <Button
                      key={subcategory.id}
                      variant="ghost"
                      className="flex items-center gap-1 text-red-600 hover:text-red-700 font-medium transition-colors group"
                      onClick={() => navigateToCategory(categoryWithProducts.category.slug, subcategory.slug)}
                    >
                      {subcategory.name[Language]}
                      {Language === "ar" ? (
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                      ) : (
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      )}
                    </Button>
                  ))}
                </div>
              ) : (
                <Link href={`/products?category_slug=${categoryWithProducts.category.slug}`} passHref>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-1 text-red-600 hover:text-red-700 font-medium transition-colors group"
                  >
                    {Language === "ar" ? (
                      <>
                        عرض المزيد <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                      </>
                    ) : (
                      <>
                        View More <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {categoryWithProducts.products.map((product, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                  onClick={() => navigateToProduct(product.slug)}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-100 opacity-30 z-10"></div>
                    <img
                      src={product.picture_url}
                      alt={product.name[Language]}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {product.discount > 0 && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-red-600 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm z-20">
                        {Language === "ar" ? "خصم" : "Sale"} {product.discount}%
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-gray-900 line-clamp-2 text-lg">
                        {product.name[Language]}
                      </h3>
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-xl text-gray-900">
                          {product.final_price} {Language === "ar" ? "ج.م" : "EGP"}
                        </span>
                        {product.discount > 0 && (
                          <span className="text-sm text-gray-500 line-through">
                            {product.price} {Language === "ar" ? "ج.م" : "EGP"}
                          </span>
                        )}
                      </div>
                    </div>

                    {product.rating && (
                      <div className="flex items-center gap-1 mb-4">
                        {renderStars(product.rating)}
                        <span className="text-xs text-gray-500 ml-1">
                          ({product.rating.toFixed(1)})
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-500">
                        {Language === "ar" ? "الكمية:" : "Qty:"}{" "}
                        <span className="font-medium">{product.quantity}</span>
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-sm h-9 border-red-100 hover:bg-red-50 hover:text-red-600 text-red-500 rounded-lg"
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
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
      <div className="inline-block bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 text-blue-600 px-8 py-6 rounded-2xl shadow-sm max-w-md">
        <div className="text-4xl mb-3">😕</div>
        <h3 className="text-xl font-bold mb-2">
          {Language === "ar" ? "لا توجد بيانات متاحة" : "No data available"}
        </h3>
        <p className="text-sm text-blue-500">
          {Language === "ar" 
            ? "نعتذر، لا توجد منتجات متاحة حاليًا في هذه الفئة" 
            : "We're sorry, there are currently no products available in this category"}
        </p>
      </div>
    </div>
  );
}