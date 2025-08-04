"use client";

import { useLanguage } from "@/Context/LanguageContext";
import { useState, useEffect, useMemo } from "react";
import { FiFilter, FiX, FiArrowUp, FiArrowDown, FiStar, FiHeart, FiChevronLeft, FiEye, FiShoppingCart, FiChevronRight, FiImage } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

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
}

interface Category {
  id: number;
  slug: string;
  name: {
    ar: string;
    en: string;
  };
  icon_url: string | null;
}

interface CategoryWithProducts {
  category: Category;
  products: Product[];
}

interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

interface ProductsResponse {
  data: PaginatedResponse<Product>;
  message: string;
}

interface HomeProductsResponse {
  data: CategoryWithProducts[];
  message: string;
}

type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc" | "none";

interface FilterOptions {
  minPrice: number | null;
  maxPrice: number | null;
  inStockOnly: boolean;
  discountedOnly: boolean;
}

export default function ProductsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  const [data, setData] = useState<CategoryWithProducts[] | null>(null);
  const [singleCategoryProducts, setSingleCategoryProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { Language } = useLanguage();
  const lang = Language as keyof Product["name"];
  const categorySlug = searchParams?.category_slug;
  const router = useRouter();

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 12
  });

  // Filter and sort state
  const [sortOption, setSortOption] = useState<SortOption>("none");
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    minPrice: null,
    maxPrice: null,
    inStockOnly: false,
    discountedOnly: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  const navigateToProduct = (slug: string) => {
    router.push(`/ad/${slug}`);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (categorySlug) {
        const response = await fetch(
          `https://new.4youad.com/api/products?category_slug=${categorySlug}&page=${pagination.currentPage}&per_page=${pagination.perPage}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const result: ProductsResponse = await response.json();
        setSingleCategoryProducts(result.data.data);
        setPagination({
          currentPage: result.data.current_page,
          totalPages: result.data.last_page,
          totalItems: result.data.total,
          perPage: result.data.per_page
        });
      } else {
        const response = await fetch("https://new.4youad.com/api/homeProducts");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const result: HomeProductsResponse = await response.json();
        setData(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categorySlug, pagination.currentPage, Language]);

  const processedProducts = useMemo(() => {
    if (singleCategoryProducts) {
      return applyFiltersAndSorting(singleCategoryProducts);
    }

    if (!data) return null;

    return data.map(categoryWithProducts => ({
      ...categoryWithProducts,
      products: applyFiltersAndSorting(categoryWithProducts.products)
    }));
  }, [data, singleCategoryProducts, sortOption, filterOptions, Language]);

  function applyFiltersAndSorting(products: Product[]): Product[] {
    let filtered = [...products];
    
    // Apply filters
    if (filterOptions.minPrice !== null) {
      filtered = filtered.filter(p => p.final_price >= filterOptions.minPrice!);
    }
    
    if (filterOptions.maxPrice !== null) {
      filtered = filtered.filter(p => p.final_price <= filterOptions.maxPrice!);
    }
    
    if (filterOptions.inStockOnly) {
      filtered = filtered.filter(p => p.quantity > 0);
    }
    
    if (filterOptions.discountedOnly) {
      filtered = filtered.filter(p => p.discount > 0);
    }

    // Apply sorting
    if (sortOption !== "none") {
      filtered.sort((a, b) => {
        switch (sortOption) {
          case "name-asc":
            return a.name[lang].localeCompare(b.name[lang]);
          case "name-desc":
            return b.name[lang].localeCompare(a.name[lang]);
          case "price-asc":
            return a.final_price - b.final_price;
          case "price-desc":
            return b.final_price - a.final_price;
          default:
            return 0;
        }
      });
    }

    return filtered;
  }

  const resetFilters = () => {
    setFilterOptions({
      minPrice: null,
      maxPrice: null,
      inStockOnly: false,
      discountedOnly: false,
    });
    setSortOption("none");
  };

  const increaseQuantity = () => {
    if (selectedProduct && quantity < selectedProduct.quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWhatsAppClick = (product: Product) => {
    if (typeof window === "undefined") return;
    const productName = product.name[lang];
    const currentUrl = window.location.href;
    const price = product.final_price.toLocaleString();
    const quantityText = selectedProduct ? `\n- ${Language === 'ar' ? 'الكمية' : 'Quantity'}: ${quantity}` : '';
    const totalPrice = selectedProduct ? `\n- ${Language === 'ar' ? 'المجموع' : 'Total'}: ${(quantity * product.final_price).toLocaleString()} ${Language === 'ar' ? 'ر.س' : 'SAR'}` : '';
    
    const message =
      Language === "ar"
        ? `مرحبًا، أنا مهتم بالمنتج التالي:
        
*${productName}*

- السعر: ${price} ${quantityText}${totalPrice}
- الرابط: ${currentUrl}

هل يمكنك مساعدتي في الشراء؟`
        : `Hello, I'm interested in the following product:

*${productName}*

- Price: ${price} ${quantityText}${totalPrice}
- Link: ${currentUrl}

Can you help me with the purchase?`;

    const whatsappNumber = "+966123456789";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const PaginationControls = () => {
    if (!singleCategoryProducts || pagination.totalPages <= 1) return null;

    const visiblePages = () => {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, pagination.currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(pagination.totalPages, start + maxVisible - 1);

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }

      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push('...');
        }
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < pagination.totalPages) {
        if (end < pagination.totalPages - 1) {
          pages.push('...');
        }
        pages.push(pagination.totalPages);
      }

      return pages;
    };

    return (
      <div className="mt-12 flex justify-center">
        <nav className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className={`flex items-center gap-1 ${Language === 'ar' ? 'flex-row-reverse' : ''}`}
          >
            {Language === 'ar' ? (
              <>
                <span>التالي</span>
                <FiChevronLeft />
              </>
            ) : (
              <>
                <FiChevronLeft />
                <span>Previous</span>
              </>
            )}
          </Button>

          {visiblePages().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-3 py-2">...</span>
            ) : (
              <Button
                key={page}
                variant={page === pagination.currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page as number)}
              >
                {page}
              </Button>
            )
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className={`flex items-center gap-1 ${Language === 'ar' ? 'flex-row-reverse' : ''}`}
          >
            {Language === 'ar' ? (
              <>
                <span>السابق</span>
                <FiChevronRight />
              </>
            ) : (
              <>
                <span>Next</span>
                <FiChevronRight />
              </>
            )}
          </Button>
        </nav>
      </div>
    );
  };

  const totalProducts = singleCategoryProducts 
    ? (processedProducts as Product[])?.length || 0
    : (processedProducts as CategoryWithProducts[])?.reduce((acc, curr) => acc + curr.products.length, 0) || 0;

  if (loading) {
    return (
      <div className={`container mx-auto px-4 sm:px-6 lg:px-8 py-12 ${Language === 'ar' ? 'rtl' : 'ltr'}`}>
        <div className="grid grid-cols-1 gap-8">
          {[1, 2, 3].map((category) => (
            <div key={category} className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="h-8 w-48 rounded-full bg-gray-100 animate-pulse"></div>
                <div className="h-6 w-24 rounded-full bg-gray-100 animate-pulse"></div>
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {[1, 2, 3, 4, 5].map((product) => (
                  <div key={product} className="group">
                    <div className="aspect-square w-full rounded-xl bg-gray-100 animate-pulse overflow-hidden"></div>
                    <div className="mt-4 space-y-2">
                      <div className="h-5 w-3/4 rounded-full bg-gray-100 animate-pulse"></div>
                      <div className="h-4 w-1/2 rounded-full bg-gray-100 animate-pulse"></div>
                      <div className="h-10 w-full rounded-lg bg-gray-100 animate-pulse mt-2"></div>
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
      <div className={`container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center ${Language === 'ar' ? 'rtl' : 'ltr'}`}>
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md inline-block max-w-md">
          <h3 className="text-lg font-bold mb-2">
            {Language === 'ar' ? 'حدث خطأ' : 'Error Occurred'}
          </h3>
          <p>{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            variant="destructive"
            className="mt-4"
          >
            {Language === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${Language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Global Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&family=Poppins:wght@300;400;500;600;700&display=swap');
        
        body {
          font-family: ${Language === 'ar' ? "'Tajawal', sans-serif" : "'Poppins', sans-serif"};
          background-color: #f8fafc;
        }
        
        .transition-slow {
          transition: all 0.3s ease;
        }
        
        .shadow-soft {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }
        
        .shadow-hover:hover {
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .transform-hover:hover {
          transform: translateY(-3px);
        }

        .quantity-btn {
          transition: all 0.2s ease;
          user-select: none;
        }
        
        .quantity-btn:active {
          transform: scale(0.95);
        }

        /* Stock Quantity Styles */
        .stock-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
          background-color: #f0fdf4;
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .stock-badge .dot {
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
          background-color: #22c55e;
          margin-right: 0.375rem;
        }

        .rtl .stock-badge .dot {
          margin-right: 0;
          margin-left: 0.375rem;
        }

        /* Image placeholder styles */
        .image-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f3f4f6;
          color: #9ca3af;
        }
      `}</style>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 flex  text-center flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {categorySlug 
                ? (singleCategoryProducts?.[0]?.name[lang] || 
                  (Language === 'ar' ? 'المنتجات' : 'Products'))
                : (Language === 'ar' ? 'المتجر' : 'Shop')}
            </h1>
            <p className="text-gray-600">
              {Language === 'ar' 
                ? 'اكتشف مجموعتنا المتميزة من المنتجات'
                : 'Discover our premium collection of products'}
            </p>
          </div>
          
          {categorySlug && (
            <Button 
              variant="ghost"
              className={`flex items-center gap-1 ${Language === 'ar' ? 'flex-row-reverse' : ''}`}
              onClick={() => window.location.href = "/"}
            >
              {Language === 'ar' ? (
                <>
                  <FiChevronLeft className="ml-1" />
                  <span>العودة إلى المتجر</span>
                </>
              ) : (
                <>
                  <FiChevronRight className="mr-1" />
                  <span>Back to Shop</span>
                </>
              )}
            </Button>
          )}
        </div>

        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-6 flex justify-between items-center">
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 ${Language === 'ar' ? 'flex-row-reverse' : ''}`}
          >
            {showFilters ? (
              <>
                <FiX size={18} />
                <span>{Language === 'ar' ? 'إغلاق الفلاتر' : 'Close Filters'}</span>
              </>
            ) : (
              <>
                <FiFilter size={18} />
                <span>{Language === 'ar' ? 'الفلاتر' : 'Filters'}</span>
              </>
            )}
          </Button>
          <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
            {totalProducts} {Language === 'ar' ? 'منتج' : totalProducts === 1 ? 'product' : 'products'}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Section */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-80 transition-all duration-300`}>
            <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 sticky top-4">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">
                  {Language === 'ar' ? 'تصفية النتائج' : 'Filter Results'}
                </h2>
                <Button 
                  variant="ghost"
                  onClick={resetFilters}
                  className="text-sm font-medium"
                >
                  {Language === 'ar' ? 'إعادة تعيين' : 'Reset'}
                </Button>
              </div>

              <div className="space-y-6">
                {/* Sort Option */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {Language === 'ar' ? 'ترتيب حسب' : 'Sort By'}
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: "none", label: Language === 'ar' ? 'الافتراضي' : 'Default' },
                      { value: "name-asc", label: Language === 'ar' ? 'الاسم (أ-ي)' : 'Name (A-Z)' },
                      { value: "name-desc", label: Language === 'ar' ? 'الاسم (ي-أ)' : 'Name (Z-A)' },
                      { value: "price-asc", label: Language === 'ar' ? 'السعر (منخفض إلى مرتفع)' : 'Price (Low to High)' },
                      { value: "price-desc", label: Language === 'ar' ? 'السعر (مرتفع إلى منخفض)' : 'Price (High to Low)' },
                    ].map((option) => (
                      <div key={option.value} className={`flex items-center gap-2 ${Language === 'ar' ? 'flex-row-reverse' : ''}`}>
                        <input
                          id={`sort-${option.value}`}
                          name="sort"
                          type="radio"
                          checked={sortOption === option.value}
                          onChange={() => setSortOption(option.value as SortOption)}
                          className="h-4 w-4 border-black text-red-600 focus:ring-red-600 cursor-pointer"
                        />
                        <label 
                          htmlFor={`sort-${option.value}`} 
                          className="text-sm text-black cursor-pointer"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div> 
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {Language === 'ar' ? 'نطاق السعر' : 'Price Range'} ({Language === 'ar' ? '' : ''})
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="number"
                        placeholder={Language === 'ar' ? 'الحد الأدنى' : 'Min'}
                        value={filterOptions.minPrice || ''}
                        onChange={(e) => setFilterOptions({
                          ...filterOptions,
                          minPrice: e.target.value ? Number(e.target.value) : null
                        })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                        min="0"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder={Language === 'ar' ? 'الحد الأقصى' : 'Max'}
                        value={filterOptions.maxPrice || ''}
                        onChange={(e) => setFilterOptions({
                          ...filterOptions,
                          maxPrice: e.target.value ? Number(e.target.value) : null
                        })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Availability */}
                <div className="">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {Language === 'ar' ? 'التوفر' : 'Availability'}
                  </label>
                  <div className="space-y-3">
                    <div className={`flex items-center gap-2 ${Language === 'ar' ? 'flex-row-reverse' : ''}`}>
                      <input
                        id="in-stock"
                        type="checkbox"
                        checked={filterOptions.inStockOnly}
                        onChange={(e) => setFilterOptions({
                          ...filterOptions,
                          inStockOnly: e.target.checked
                        })}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                      <label htmlFor="in-stock" className={`text-sm text-gray-700 cursor-pointer ${
                        Language === 'ar' ? 'mr-3' : 'ml-3'
                      }`}>
                        {Language === 'ar' ? 'المنتجات المتوفرة فقط' : 'In Stock Only'}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Discount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {Language === 'ar' ? 'العروض' : 'Discounts'}
                  </label>
                  <div className="space-y-3">
                    <div className={`flex items-center gap-2 ${Language === 'ar' ? 'flex-row-reverse' : ''}`}>
                      <input
                        id="discounted"
                        type="checkbox"
                        checked={filterOptions.discountedOnly}
                        onChange={(e) => setFilterOptions({
                          ...filterOptions,
                          discountedOnly: e.target.checked
                        })}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                      <label htmlFor="discounted" className={`text-sm text-gray-700 cursor-pointer ${
                        Language === 'ar' ? 'mr-3' : 'ml-3'
                      }`}>
                        {Language === 'ar' ? 'المنتجات المخفضة فقط' : 'Discounted Only'}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="flex-1">
            {/* Products Header */}
            <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {categorySlug 
                      ? (Language === 'ar' ? 'جميع المنتجات' : 'All Products')
                      : (Language === 'ar' ? 'كل المنتجات' : 'All Products')}
                  </h2>
                  <p className="text-gray-500 mt-1">
                    {Language === 'ar' 
                      ? `عرض ${totalProducts} منتج${totalProducts !== 1 ? 'ات' : ''}`
                      : `Showing ${totalProducts} product${totalProducts !== 1 ? 's' : ''}`}
                  </p>
                </div>
                <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
                  {totalProducts} {Language === 'ar' ? 'منتج' : totalProducts === 1 ? 'product' : 'products'}
                </div>
              </div>
            </div>
            
            {/* No products message */}
            {totalProducts === 0 && (
              <div className="text-center py-16 bg-white rounded-xl shadow-soft border border-gray-100">
                <div className="mx-auto max-w-md">
                  <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FiX className="text-gray-400 text-3xl" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {Language === 'ar' ? 'لا توجد منتجات متاحة' : 'No products found'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {Language === 'ar' 
                      ? 'لم نتمكن من العثور على أي منتجات تطابق معايير البحث الخاصة بك.'
                      : 'We couldn\'t find any products matching your criteria.'}
                  </p>
                  <Button
                    onClick={resetFilters}
                    variant="default"
                  >
                    {Language === 'ar' ? 'إعادة تعيين الفلاتر' : 'Reset filters'}
                  </Button>
                </div>
              </div>
            )}

            {/* Products Grid */}
            {singleCategoryProducts ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                  {(processedProducts as Product[]).map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      language={lang} 
                      isRTL={Language === 'ar'}
                      onQuickView={() => setSelectedProduct(product)}
                      onWhatsAppClick={() => handleWhatsAppClick(product)}
                      navigateToProduct={navigateToProduct}
                    />
                  ))}
                </div>
                <PaginationControls />
              </>
            ) : (
              <div className="space-y-8">
                {(processedProducts as CategoryWithProducts[]).map((categoryWithProducts) => (
                  <div key={categoryWithProducts.category.id} className="bg-white p-6 rounded-xl shadow-soft border border-gray-100">
                    {/* Category Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {categoryWithProducts.category.name[lang]}
                        </h3>
                        <p className="text-gray-500 mt-1">
                          {categoryWithProducts.products.length} {Language === 'ar' ? 'منتج' : 'products'}
                        </p>
                      </div>
                      <Button 
                        variant="ghost"
                        onClick={() => window.location.href = `?category_slug=${categoryWithProducts.category.slug}`}
                        className={`flex items-center gap-2 ${Language === 'ar' ? 'flex-row-reverse' : ''}`}
                      >
                        {Language === 'ar' ? (
                          <>
                            <span>عرض الكل</span>
                            <FiArrowUp className="transform rotate-90" />
                          </>
                        ) : (
                          <>
                            <span>View All</span>
                            <FiArrowUp className="transform rotate-90" />
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {/* Category Products */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {categoryWithProducts.products.slice(0, 4).map((product) => (
                        <ProductCard 
                          key={product.id} 
                          product={product} 
                          language={lang} 
                          isRTL={Language === 'ar'}
                          onQuickView={() => setSelectedProduct(product)}
                          onWhatsAppClick={() => handleWhatsAppClick(product)}
                          navigateToProduct={navigateToProduct}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Quick View Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedProduct.name[lang]}
                </h3>
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedProduct(null);
                    setQuantity(1);
                  }}
                >
                  <FiX size={24} />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-100 rounded-lg overflow-hidden h-full max-h-[500px] flex items-center">
                  {selectedProduct.picture_url ? (
                    <img
                      src={selectedProduct.picture_url}
                      alt={selectedProduct.name[lang]}
                      className="w-full h-auto object-contain max-h-[500px]"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '';
                        target.parentElement?.classList.add('image-placeholder');
                      }}
                    />
                  ) : (
                    <div className="image-placeholder w-full h-full flex flex-col items-center justify-center">
                      <FiImage size={48} className="text-gray-400 mb-2" />
                      <span className="text-gray-500">{Language === 'ar' ? 'لا توجد صورة' : 'No Image'}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="mb-6">
                    <div className="flex items-center mb-4">
                      <span className={`text-sm font-medium ${selectedProduct.quantity > 0 ? 'text-black-600' : 'text-red-600'}`}>
                        {selectedProduct.quantity > 0 
                          ? (Language === 'ar' ? 'متوفر في المخزن' : 'In Stock')
                          : (Language === 'ar' ? 'غير متوفر' : 'Out of Stock')}
                      </span>
                    </div>
                    
                    {/* Stock Quantity Badge */}
                    <div className="mb-4">
                      <span className="stock-badge">
                        <span className="dot"></span>
                        {selectedProduct.quantity} {Language === 'ar' ? 'متوفر في المخزن' : 'In Stock'}
                      </span>
                    </div>
                    
                    <div className="flex items-baseline gap-4 mb-4">
                      <span className="text-3xl font-bold text-black">
                        {selectedProduct.final_price.toFixed(2)} {Language === 'ar' ? '' : ''}
                      </span>
                      {selectedProduct.discount > 0 && (
                        <>
                          <span className="text-xl text-gray-500 line-through">
                            {selectedProduct.price.toFixed(2)}
                          </span>
                          <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-1 rounded-full">
                            {selectedProduct.discount}% {Language === 'ar' ? 'خصم' : 'OFF'}
                          </span>
                        </>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {Language === 'ar' 
                        ? 'وصف المنتج سيظهر هنا. هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة.'
                        : 'Product description will appear here. This is example text that will be replaced with actual product description.'}
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden w-fit">
                      <Button 
                        variant="outline"
                        size="sm"
                        className="quantity-btn px-4 py-2"
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1}
                      >
                        -
                      </Button>
                      <span className="px-4 py-2 text-center w-16 font-medium">{quantity}</span>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="quantity-btn px-4 py-2"
                        onClick={increaseQuantity}
                        disabled={selectedProduct.quantity <= quantity}
                      >
                        +
                      </Button>
                    </div>
                    
                    <Button 
                      onClick={() => handleWhatsAppClick(selectedProduct)}
                      className={`flex-1 py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 bg-green-100 text-green-700 hover:bg-green-200 shadow-md transition-all  transform-hover`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      {Language === 'ar' ? 'تواصل عبر واتساب' : 'Contact via WhatsApp'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  language: keyof Product["name"];
  isRTL: boolean;
  onQuickView?: () => void;
  onWhatsAppClick?: () => void;
  navigateToProduct: (slug: string) => void;
}

function ProductCard({ product, language, isRTL, onQuickView, onWhatsAppClick, navigateToProduct }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="group relative h-full flex flex-col transition-slow transform-hover">
      <div className="bg-white rounded-xl shadow-soft overflow-hidden border border-gray-100 hover:shadow-hover transition-slow h-full flex flex-col">
        {/* Product Image */}
        <div className="relative overflow-hidden pt-[100%] bg-gray-50">
          {product.picture_url && !imageError ? (
            <img
              src={product.picture_url}
              alt={product.name[language]}
              className="absolute inset-0 w-full h-full object-contain transition-slow group-hover:scale-105"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
              <div className="flex flex-col items-center">
                <FiImage size={48} className="mb-2" />
                <span>{language === 'ar' ? 'لا توجد صورة' : 'No Image'}</span>
              </div>
            </div>
          )}
          
          {/* Discount Badge */}
          {product.discount > 0 && (
            <div className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10`}>
              {product.discount}% {language === 'ar' ? 'خصم' : 'OFF'}
            </div>
          )}
          
          {/* Stock Status Badge */}
          {product.quantity <= 0 && (
            <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} bg-gray-800 text-white text-xs px-3 py-1 rounded-full z-10`}>
              {language === 'ar' ? 'نفذ من المخزن' : 'Sold Out'}
            </div>
          )}
          
          {/* Quick Actions */}
          <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-slow z-10`}>
            <Button 
              variant="ghost"
              size="icon"
              className="bg-white/90 text-gray-700 p-2 rounded-full shadow-md hover:bg-white transition-slow hover:text-red-500 hover:scale-110"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Add to wishlist functionality
              }}
            >
              <FiHeart size={18} />
            </Button>
            <Button 
              variant="ghost"
              size="icon"
              className="bg-white/90 text-gray-700 p-2 rounded-full shadow-md hover:bg-white transition-slow hover:text-primary hover:scale-110"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView?.();
              }}
            >
              <FiEye size={18} />
            </Button>
          </div>
        </div>
        
        {/* Product Info */}
        <div className="p-5 flex-grow flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 leading-snug">
            {product.name[language]}
          </h3>
          
          {/* Price */}
          <div className="mt-auto">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold">
                {product.final_price.toFixed(2)} {language === 'ar' ? '' : ''}
              </span>
              {product.discount > 0 && (
                <span className="text-sm text-gray-500 line-through">
                  {product.price.toFixed(2)}
                </span>
              )}
            </div>
            
            {/* Stock Status and Quantity */}
            <div className="mt-2 flex items-center gap-2">
              {product.quantity > 0 && (
                <span className="stock-badge">
                  <span className="dot"></span>
                  {product.quantity} {language === 'ar' ? 'متوفر' : 'Available'}
                </span>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-4 space-y-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full py-5 bg-red-100 text-red-500 shadow-md hover:bg-red-200 hover:text-red rounded-lg font-medium flex items-center justify-center gap-2 transition-slow"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigateToProduct(product.slug);
              }}
            >
              {language === 'ar' ? 'التفاصيل' : 'Details'}
            </Button>
            
            {/* WhatsApp Button */}
            <Button
              variant={product.quantity > 0 ? "default" : "outline"}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onWhatsAppClick?.();
              }}
              className={`w-full py-3.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-slow ${
                product.quantity > 0 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200 shadow-md transition-all'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {language === 'ar' ? 'أطلب عبر واتساب' : 'Order via WhatsApp'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}