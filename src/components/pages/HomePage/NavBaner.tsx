"use client";
import React, { useState, useEffect } from "react";
import { ChevronDown, Menu, X, Home, Car, ShoppingCart, Wrench, GasPump, Calendar, Star, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/Context/LanguageContext";
import { usePathname, useRouter } from "next/navigation";

interface Category {
  id: number;
  slug: string;
  name: {
    ar: string;
    en: string;
  };
  icon_url: string | null;
  sub_categories: Subcategory[];
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

const defaultIcons: Record<string, React.ReactNode> = {
  'cars': <Car className="w-5 h-5" />,
  'parts': <Wrench className="w-5 h-5" />,
  'accessories': <ShoppingCart className="w-5 h-5" />,
  'services': <GasPump className="w-5 h-5" />,
  'new': <Star className="w-5 h-5" />,
  'used': <TrendingUp className="w-5 h-5" />,
  'warranty': <Shield className="w-5 h-5" />,
  'events': <Calendar className="w-5 h-5" />
};

export default function NavBanner() {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { Language } = useLanguage();
  const [isHovering, setIsHovering] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://new.4youad.com/api/categories");
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        
        const uniqueCategories = data.data.filter(
          (category: Category, index: number, self: Category[]) =>
            index === self.findIndex((c) => c.id === category.id)
        );
        
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  const navigateToProducts = (categorySlug: string) => {
    router.push(`/products?category_slug=${encodeURIComponent(categorySlug)}`);
    setIsMobileMenuOpen(false);
    setActiveCategory(null);
  };

  const navigateToHome = () => {
    router.push("/");
    setIsMobileMenuOpen(false);
    setActiveCategory(null);
  };

  const handleCategoryClick = (category: Category) => {
    if (category.sub_categories?.length > 0) {
      setActiveCategory(activeCategory?.id === category.id ? null : category);
    } else {
      navigateToProducts(category.slug);
    }
  };

  const handleSubcategoryClick = (subcategory: Subcategory) => {
    navigateToProducts(subcategory.slug);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setActiveCategory(null);
  };

  const closeAllMenus = () => {
    setIsMobileMenuOpen(false);
    setActiveCategory(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.navigation-container')) {
        closeAllMenus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    closeAllMenus();
  }, [pathname]);

  const getCategoryIcon = (slug: string) => {
    const key = slug.toLowerCase().split('-')[0];
    return defaultIcons[key] || <Car className="w-5 h-5" />;
  };

  const renderDesktopCategories = () => (
    <div className="hidden md:flex items-center justify-center gap-1 lg:gap-2 py-3 relative">
      {/* Enhanced Home Button */}
      <div className="relative group mr-2">
        <Button
          variant="ghost"
          className="text-sm lg:text-base font-medium py-2 px-3 lg:px-4 whitespace-nowrap transition-all duration-300 ease-in-out rounded-xl group bg-gradient-to-br from-green-50 to-white hover:from-green-100 hover:to-white border border-green-100 hover:border-green-300 shadow-sm"
          onClick={navigateToHome}
        >
          <div className="relative inline-flex items-center">
            <Home className="h-4 w-4 text-green-600 transition-all group-hover:scale-110 group-hover:text-green-700" />
            <span className="ml-2 font-medium text-gray-800 group-hover:text-green-700">
              {Language === 'ar' ? 'الرئيسية' : 'Home'}
            </span>
          </div>
          <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-green-600 transition-all duration-300 group-hover:w-4/5 rounded-full"></span>
        </Button>
      </div>
      
      {categories.map((category) => (
        <div 
          key={category.id} 
          className="relative group"
          onMouseEnter={() => {
            if (category.sub_categories?.length > 0) {
              setActiveCategory(category);
              setIsHovering(true);
            }
          }}
          onMouseLeave={() => {
            setIsHovering(false);
            setTimeout(() => {
              if (!isHovering) {
                setActiveCategory(null);
              }
            }, 300);
          }}
        >
          <Button
            variant="ghost"
            className={`text-sm lg:text-base font-medium py-2 px-3 lg:px-4 whitespace-nowrap transition-all duration-300 ease-in-out relative rounded-xl border shadow-sm
              ${
                activeCategory?.id === category.id
                  ? "text-white bg-gradient-to-br from-red-600 to-red-700 border-red-700 hover:from-red-700 hover:to-red-800"
                  : "text-gray-800 hover:text-white bg-gradient-to-br from-gray-50 to-white hover:from-gray-800 hover:to-black border-gray-200 hover:border-gray-800"
              }`}
            onClick={() => handleCategoryClick(category)}
          >
            <div className="flex items-center">
              {category.icon_url ? (
                <img 
                  src={category.icon_url} 
                  alt={category.name[Language]} 
                  className="w-4 h-4 mr-2 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/default-car-icon.svg';
                  }}
                />
              ) : (
                <span className={`w-5 h-5 mr-2 flex items-center justify-center rounded-full text-xs font-bold ${
                  activeCategory?.id === category.id 
                    ? "bg-white text-red-600" 
                    : "bg-green-100 text-green-700"
                }`}>
                  {getCategoryIcon(category.slug)}
                </span>
              )}
              {category.name[Language]}
              {category.sub_categories?.length > 0 && (
                <ChevronDown
                  className={`ml-1 h-4 w-4 transition-transform duration-300 ${
                    activeCategory?.id === category.id 
                      ? "transform rotate-180 text-white" 
                      : "text-gray-500 group-hover:text-white"
                  }`}
                />
              )}
            </div>
            {activeCategory?.id !== category.id && (
              <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-green-600 transition-all duration-300 group-hover:w-4/5 rounded-full"></span>
            )}
          </Button>
        </div>
      ))}
    </div>
  );

  const renderMobileCategories = () => (
    <div className="md:hidden">
      <div className="flex items-center justify-between py-3 px-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
        <div className="flex items-center">
          <span className="text-lg font-bold text-gray-800 bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
            4YOU<span className="text-red-600">AD</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={navigateToHome}
            className="p-2 rounded-lg hover:bg-green-100 hover:text-green-700 transition-colors"
          >
            <Home className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="bg-white shadow-xl border-t border-gray-200">
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {categories.map((category) => (
              <div key={category.id} className="border-b border-gray-200 last:border-b-0">
                <Button
                  variant="ghost"
                  className={`w-full text-right justify-between py-4 px-6 text-base transition-colors rounded-none ${
                    activeCategory?.id === category.id
                      ? "bg-red-50 text-red-700 font-medium"
                      : "hover:bg-green-50 text-gray-800 font-normal"
                  }`}
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="flex items-center">
                    {category.icon_url ? (
                      <img 
                        src={category.icon_url} 
                        alt={category.name[Language]} 
                        className="w-5 h-5 mr-3 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = '/default-car-icon.svg';
                        }}
                      />
                    ) : (
                      <span className={`w-5 h-5 mr-3 flex items-center justify-center rounded-full text-xs font-bold ${
                        activeCategory?.id === category.id 
                          ? "bg-red-100 text-red-700" 
                          : "bg-green-100 text-green-700"
                      }`}>
                        {getCategoryIcon(category.slug)}
                      </span>
                    )}
                    <span className={activeCategory?.id === category.id ? "font-medium" : ""}>
                      {category.name[Language]}
                    </span>
                  </div>
                  {category.sub_categories?.length > 0 && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-300 ${
                        activeCategory?.id === category.id 
                          ? "transform rotate-180 text-red-700" 
                          : "text-gray-500"
                      }`}
                    />
                  )}
                </Button>
                
                {activeCategory?.id === category.id && category.sub_categories && (
                  <div className="bg-gradient-to-r from-green-50 to-white px-6 py-3 border-l-4 border-red-600">
                    <div className="grid grid-cols-1 gap-2">
                      {category.sub_categories.map((subcategory) => (
                        <button
                          key={subcategory.id}
                          onClick={() => handleSubcategoryClick(subcategory)}
                          className="text-sm text-gray-700 hover:text-green-700 transition duration-150 ease-in-out p-3 rounded-lg hover:bg-green-50 text-start flex items-center border border-gray-200 bg-white hover:border-green-300 shadow-xs"
                        >
                          {subcategory.icon_url ? (
                            <img 
                              src={subcategory.icon_url} 
                              alt={subcategory.name[Language]} 
                              className="w-5 h-5 mr-3 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = '/default-car-icon.svg';
                              }}
                            />
                          ) : (
                            <span className="w-5 h-5 mr-3 flex items-center justify-center bg-green-100 text-green-700 rounded-full text-xs font-bold">
                              {getCategoryIcon(subcategory.slug)}
                            </span>
                          )}
                          <span className="font-medium">{subcategory.name[Language]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderDesktopSubcategories = () => (
    <div className="hidden md:block">
      {activeCategory && activeCategory.sub_categories.length > 0 && (
        <div
          className="bg-white border-t border-gray-200 shadow-2xl absolute left-0 right-0 z-40 animate-fadeIn"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => {
            setIsHovering(false);
            setActiveCategory(null);
          }}
        >
          <div className="container mx-auto px-6 py-5">
            <div className="flex items-center mb-4 px-2">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white mr-3">
                  {getCategoryIcon(activeCategory.slug)}
                </span>
                {activeCategory.name[Language]}
              </h3>
              <span className="text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-800 px-3 py-1 rounded-full ml-3">
                {activeCategory.sub_categories.length} {Language === 'ar' ? 'أقسام' : 'categories'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {activeCategory.sub_categories.map((subcategory) => (
                <button
                  key={subcategory.id}
                  onClick={() => handleSubcategoryClick(subcategory)}
                  className="group flex flex-col items-center text-sm font-medium text-gray-700 hover:text-white transition duration-200 ease-in-out p-3 rounded-xl bg-gradient-to-b from-white to-gray-50 hover:from-gray-800 hover:to-black border border-gray-200 hover:border-gray-700 shadow-sm hover:shadow-md"
                >
                  <div className="w-16 h-16 mb-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-gray-700 group-hover:to-gray-800 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                    {subcategory.icon_url ? (
                      <img 
                        src={subcategory.icon_url} 
                        alt={subcategory.name[Language]} 
                        className="w-10 h-10 object-contain transition-transform group-hover:scale-110 group-hover:brightness-0 group-hover:invert"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = '/default-car-icon.svg';
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-800 rounded-lg flex items-center justify-center text-white text-xl font-bold group-hover:from-red-600 group-hover:to-red-800">
                        {getCategoryIcon(subcategory.slug)}
                      </div>
                    )}
                  </div>
                  <span className="text-center font-medium group-hover:font-semibold group-hover:text-white">
                    {subcategory.name[Language]}
                  </span>
                  <span className="text-xs text-green-600 group-hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-1 flex items-center">
                    {Language === 'ar' ? 'تصفح' : 'Browse'}
                    <ChevronDown className={`h-3 w-3 ml-1 ${Language === 'ar' ? 'rotate-180' : ''}`} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <nav className="w-full bg-white border-b border-gray-200 shadow-sm relative z-40" dir={Language === "ar" ? "rtl" : "ltr"}>
        <div className="container mx-auto max-w-7xl py-3 px-4">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-12 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-xl w-full"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav 
      className="w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm relative z-40 navigation-container" 
      dir={Language === "ar" ? "rtl" : "ltr"}
    >
      <div className="container mx-auto max-w-7xl">
        {renderDesktopCategories()}
        {renderMobileCategories()}
      </div>
      {renderDesktopSubcategories()}
    </nav>
  );
}