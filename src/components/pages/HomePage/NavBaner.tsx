"use client";
import React, { useState, useEffect } from "react";
import { ChevronDown, Menu, X, Home } from "lucide-react";
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

  const renderDesktopCategories = () => (
    <div className="hidden md:flex items-center justify-center gap-1 lg:gap-2 py-2 relative">
      {/* Home Button */}
      <div className="relative group">
        <Button
          variant="ghost"
          className="text-sm font-medium py-1 px-3 whitespace-nowrap transition-all duration-200 ease-in-out rounded-md hover:bg-gray-50"
          onClick={navigateToHome}
        >
          <div className="relative inline-flex items-center gap-1">
            <Home className="h-4 w-4 text-gray-700" />
            <span className="ml-2 text-gray-700">
              {Language === 'ar' ? 'الرئيسية' : 'Home'}
            </span>
          </div>
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
            }, 200);
          }}
        >
          <Button
            variant="ghost"
            className={`text-sm font-medium py-1 px-3 whitespace-nowrap transition-all duration-200 ease-in-out relative rounded-md mx-0
              ${
                activeCategory?.id === category.id
                  ? "bg-red-100 text-red-500 shadow-md hover:bg-red-200 hover:text-red-500 transition-all"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            onClick={() => handleCategoryClick(category)}
          >
            <div className="flex items-center">
              {category.name[Language]}
              {category.sub_categories?.length > 0 && (
                <ChevronDown
                  className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                    activeCategory?.id === category.id 
                      ? "transform rotate-180 text-red" 
                      : "text-gray-500 group-hover:text-gray-700"
                  }`}
                />
              )}
            </div>
          </Button>
        </div>
      ))}
    </div>
  );

  const renderMobileCategories = () => (
    <div className="md:hidden">
      <div className="flex items-center justify-between py-2 px-4 border-b border-gray-200 bg-white">
        <div className="flex items-center">
          <span className="text-lg font-bold text-gray-800">
            4YOU<span className="text-red-600">AD</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={navigateToHome}
            className="p-2 rounded-md hover:bg-gray-50 text-gray-700"
          >
            <Home className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMobileMenu}
            className="p-2 rounded-md hover:bg-gray-50 text-gray-700"
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
        <div className="bg-white shadow-lg border-t border-gray-200">
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {categories.map((category) => (
              <div key={category.id} className="border-b border-gray-200 last:border-b-0">
                <Button
                  variant="ghost"
                  className={`w-full text-right justify-between py-2 px-4 text-sm transition-colors rounded-none ${
                    activeCategory?.id === category.id
                      ? "bg-red-50 text-red-700 font-medium"
                      : "hover:bg-gray-50 text-gray-700 font-normal"
                  }`}
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="flex items-center">
                    <span className={activeCategory?.id === category.id ? "font-medium" : ""}>
                      {category.name[Language]}
                    </span>
                  </div>
                  {category.sub_categories?.length > 0 && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        activeCategory?.id === category.id 
                          ? "transform rotate-180 text-red-700" 
                          : "text-gray-500"
                      }`}
                    />
                  )}
                </Button>
                
                {activeCategory?.id === category.id && category.sub_categories && (
                  <div className="bg-gray-50 px-4 py-1 border-l-2 border-red-600">
                    <div className="flex flex-col space-y-0">
                      {category.sub_categories.map((subcategory) => (
                        <button
                          key={subcategory.id}
                          onClick={() => handleSubcategoryClick(subcategory)}
                          className="text-xs text-gray-700 hover:text-red-700 transition duration-150 ease-in-out py-2 px-3 rounded-md hover:bg-red-100 text-start"
                        >
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
          className="bg-white border-t border-gray-200 shadow-md absolute left-0 right-0 z-40 animate-fadeIn"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => {
            setIsHovering(false);
            setActiveCategory(null);
          }}
        >
          <div className="container mx-auto px-4 py-2">
            <div className="flex flex-wrap gap-1"> {/* Changed from grid to flex with small gap */}
              {activeCategory.sub_categories.map((subcategory) => (
                <button
                  key={subcategory.id}
                  onClick={() => handleSubcategoryClick(subcategory)}
                  className="text-sm text-gray-700 hover:text-red-700 transition duration-150 ease-in-out py-1 px-3 rounded-md hover:bg-red-50 whitespace-nowrap" // Reduced padding
                >
                  {subcategory.name[Language]}
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
              <div className="h-10 bg-gray-100 rounded-md w-full"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav 
      className="w-full bg-white border-b border-gray-200 shadow-sm relative z-40 navigation-container" 
      dir={Language === "ar" ? "rtl" : "ltr"}
    >
      <div className="container mx-auto max-w-7xl px-2 sm:px-4">
        {renderDesktopCategories()}
        {renderMobileCategories()}
      </div>
      {renderDesktopSubcategories()}
    </nav>
  );
}