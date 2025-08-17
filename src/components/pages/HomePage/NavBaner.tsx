"use client";
import React, { useState, useEffect, useRef } from "react";
import { 
  ChevronDown, 
  Menu, 
  X, 
  Home,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/Context/LanguageContext";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

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

interface SearchResult {
  id: number;
  name: string;
  slug: string;
  type: 'product' | 'category';
  image_url?: string;
}

const SEARCH_API = "https://new.4youad.com/api/products";
const CATEGORIES_API = "https://new.4youad.com/api/categories";
const COUNTRIES_API = "https://new.4youad.com/api/countries";
const BUSINESS_API = "https://new.4youad.com/api/settings/business";

const content = {
  ar: {
    searchPlaceholder: "ابحث عن سيارات، ماركات، موديلات...",
    categories: "الفئات",
    noResults: "لا توجد نتائج",
    allProducts: "جميع المنتجات",
    allCategories: "جميع الفئات",
    selectCountry: "اختر الدولة",
    selectCity: "اختر المدينة",
    selectLocation: "اختر الموقع",
    home: "الرئيسية",
    search: "بحث",
    cars: "سيارات",
    hotels: "فنادق",
    electronics: "الكترونيات"
  },
  en: {
    searchPlaceholder: "Search for cars, makes, models...",
    categories: "Categories",
    noResults: "No results found",
    allProducts: "All Products",
    allCategories: "All Categories",
    selectCountry: "Select Country",
    selectCity: "Select City",
    selectLocation: "Select Location",
    home: "Home",
    search: "Search",
    cars: "Cars",
    hotels: "Hotels",
    electronics: "Electronics",
    clearFilters: "Clear filters"
  }
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
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const currentContent = content[Language];
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mobileCategoriesRef = useRef<HTMLDivElement>(null);
  const [mobileScrollLeft, setMobileScrollLeft] = useState(0);
  const [mobileScrollRight, setMobileScrollRight] = useState(0);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  
  const toggleLocationDropdown = () => {
    setIsLocationDropdownOpen(!isLocationDropdownOpen);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlSearchTerm = params.get('q');
    
    if (urlSearchTerm) {
       setSearchTerm(urlSearchTerm);
       setShowSearchResults(true);
    }
  }, [pathname]);

  const navigateToHome = () => {
    router.push("/");
    setIsMobileMenuOpen(false);
    setActiveCategory(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesResponse, countriesResponse, businessResponse] = await Promise.all([
          fetch(CATEGORIES_API),
          fetch(COUNTRIES_API),
          fetch(BUSINESS_API)
        ]);
        
        const categoriesData = await categoriesResponse.json();
        const defaultCategories = [
          {
            id: 1001,
            slug: "cars",
            name: { ar: "سيارات", en: "Cars" },
            icon_url: null,
            sub_categories: []
          },
          {
            id: 1002,
            slug: "hotels",
            name: { ar: "فنادق", en: "Hotels" },
            icon_url: null,
            sub_categories: []
          },
          {
            id: 1003,
            slug: "electronics",
            name: { ar: "الكترونيات", en: "Electronics" },
            icon_url: null,
            sub_categories: []
          }
        ];
        
        const mergedCategories = [...defaultCategories, ...categoriesData.data];
        setCategories(mergedCategories);
        
        const countriesData = await countriesResponse.json();
        setCountries(countriesData.data);
        
        const businessData = await businessResponse.json();
        setBusinessInfo(businessData.data);
        
        const saudiArabia = countriesData.data.find((c: Country) => c.id === 2);
        if (saudiArabia) {
          setSelectedCountry(saudiArabia);
          const riyadh = saudiArabia.cities.find((city: City) => city.id === 6);
          if (riyadh) {
            setSelectedCity(riyadh);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchTerm.trim() === "") {
        setSearchResults([]);
        return;
      }

      try {
        const searchUrl = new URL(SEARCH_API);
        searchUrl.searchParams.append('search', searchTerm);
        searchUrl.searchParams.append('lang', Language);
        
        if (selectedCountry) {
          searchUrl.searchParams.append('country_id', selectedCountry.id.toString());
        }
        if (selectedCity) {
          searchUrl.searchParams.append('city_id', selectedCity.id.toString());
        }

        const response = await fetch(
          searchUrl.toString(),
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        const transformedResults: SearchResult[] = [];
        
        if (data.data?.categories && Array.isArray(data.data.categories)) {
          data.data.categories.forEach((category: any) => {
            transformedResults.push({
              id: category.id,
              name: category.name[Language] || category.name.en || category.name.ar || 'Unnamed Category',
              slug: category.slug,
              type: 'category',
              image_url: category.icon_url || null
            });
          });
        }
        
        if (data.data?.products && Array.isArray(data.data.products)) {
          data.data.products.forEach((product: any) => {
            transformedResults.push({
              id: product.id,
              name: product.name[Language] || product.name.en || product.name.ar || 'Unnamed Product',
              slug: product.slug,
              type: 'product',
              image_url: product.main_image_url || null
            });
          });
        }

        setSearchResults(transformedResults);
      } catch (error) {
        console.error("Error fetching search results:", error);
        setSearchResults([]);
      }
    };

    const debounceTimer = setTimeout(() => {
      if (searchTerm.trim()) {
        fetchSearchResults();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, Language, selectedCountry, selectedCity]);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollMobileCategories = (direction: 'left' | 'right') => {
    if (mobileCategoriesRef.current) {
      const scrollAmount = 150;
      mobileCategoriesRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      
      setTimeout(() => {
        if (mobileCategoriesRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = mobileCategoriesRef.current;
          setMobileScrollLeft(scrollLeft);
          setMobileScrollRight(scrollWidth - clientWidth - scrollLeft);
        }
      }, 300);
    }
  };

  useEffect(() => {
    if (mobileCategoriesRef.current) {
      const { scrollWidth, clientWidth } = mobileCategoriesRef.current;
      setMobileScrollRight(scrollWidth - clientWidth);
    }
  }, [categories, isMobileMenuOpen]);

  const handleSelectCountry = (country: Country) => {
    setSelectedCountry(country);
    setSelectedCity(null);
    setIsCountryOpen(false);
    
    const params = new URLSearchParams(window.location.search);
    params.set('country_id', country.id.toString());
    params.delete('city_id');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSelectCity = (city: City) => {
    setSelectedCity(city);
    setIsCityOpen(false);
    
    const params = new URLSearchParams(window.location.search);
    if (selectedCountry) {
      params.set('country_id', selectedCountry.id.toString());
    }
    params.set('city_id', city.id.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedCountry(null);
    setSelectedCity(null);
    
    const params = new URLSearchParams();
    router.push(pathname);
  };

  const navigateToProducts = (categorySlug: string) => {
    const params = new URLSearchParams();
    params.append('category_slug', encodeURIComponent(categorySlug));
    
    if (selectedCountry) {
      params.append('country_id', selectedCountry.id.toString());
    }
    if (selectedCity) {
      params.append('city_id', selectedCity.id.toString());
    }
    
    router.push(`/products?${params.toString()}`);
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const params = new URLSearchParams();
      params.append('q', searchTerm.trim());
      
      if (selectedCountry) {
        params.append('country_id', selectedCountry.id.toString());
      }
      if (selectedCity) {
        params.append('city_id', selectedCity.id.toString());
      }
      
      router.push(`/search?${params.toString()}`);
      setShowSearchResults(false);
    }
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
      <div className="relative group">
        <Button
          variant="ghost"
          className="text-sm font-bold py-1 px-3 whitespace-nowrap transition-all duration-200 ease-in-out rounded-md hover:bg-gray-50"
          onClick={navigateToHome}
        >
          <div className="relative inline-flex items-center gap-1">
            <Home className="h-4 w-4 text-gray-700" />
            <span className="ml-2 text-gray-700 font-bold">
              {currentContent.home}
            </span>
          </div>
        </Button>
      </div>
      
      <div 
        ref={scrollContainerRef}
        className="flex-1 flex overflow-x-auto scrollbar-hide gap-1 lg:gap-2 px-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {categories.map((category) => (
          <div 
            key={category.id} 
            className="relative group flex-shrink-0"
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
              className={`text-sm font-bold py-1 px-3 whitespace-nowrap transition-all duration-200 ease-in-out relative rounded-md mx-0
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
    </div>
  );

  const renderMobileCategories = () => (
    <div className="md:hidden">
      <div className="flex items-center justify-between py-2 px-4 border-b border-gray-200 bg-white">
        <div 
          className="flex items-center cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={navigateToHome}
        >
          {businessInfo?.business_logo_url ? (
            <div className="flex items-center gap-2">
              <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-red-200">
                <Image
                  src={businessInfo.business_logo_url}
                  alt={businessInfo.business_name?.[Language] || "4YOUAD"}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              </div>
              <span className="text-lg font-bold text-gray-800">
                4YOU<span className="text-red-600">AD</span>
              </span>
            </div>
          ) : (
            <span className="text-lg font-bold text-gray-800">
              4YOU<span className="text-red-600">AD</span>
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
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
          <div className="overflow-y-visible">
            <div className="p-3 border-b border-gray-200" ref={mobileSearchRef}>
              <form onSubmit={handleSearchSubmit}>
                <div className="relative flex items-center">
                  <Input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowSearchResults(e.target.value.trim().length > 0);
                    }}
                    onFocus={() => setShowSearchResults(searchTerm.trim().length > 0)}
                    placeholder={currentContent.searchPlaceholder}
                    className="w-full pl-10 pr-3 py-2 text-sm rounded-full border-gray-300 focus:ring-2 focus:ring-red-500 shadow-sm"
                  />
                  <button 
                    type="submit"
                    className={`absolute ${Language === 'ar' ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 bg-red-100 text-red-500 hover:bg-red-200 transition-all h-7 w-7 flex items-center justify-center rounded-full shadow-sm`}
                  >
                    <Search className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>

              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute z-[100] left-0 right-0 mt-1 mx-3 bg-white rounded-lg shadow-lg border border-gray-200 max-h-72 overflow-y-auto">
                  <div className="divide-y divide-gray-100">
                    {searchResults.some(r => r.type === 'category') && (
                      <div>
                        <div className="px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-50 uppercase tracking-wider">
                          {currentContent.allCategories}
                        </div>
                        <div className="grid grid-cols-1">
                          {searchResults
                            .filter(r => r.type === 'category')
                            .map((result) => (
                              <Link
                                key={`cat-${result.id}`}
                                href={`/products/${result.slug}`}
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-red-50 transition-colors"
                              >
                                {result.image_url ? (
                                  <div className="w-6 h-6 mr-2 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                    <img 
                                      src={result.image_url} 
                                      alt={result.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 mr-2 flex-shrink-0 bg-gray-100 rounded flex items-center justify-center">
                                    <Search className="h-2.5 w-2.5 text-gray-400" />
                                  </div>
                                )}
                                <span className="truncate">{result.name}</span>
                              </Link>
                            ))}
                        </div>
                      </div>
                    )}

                    {searchResults.some(r => r.type === 'product') && (
                      <div>
                        <div className="px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-50 uppercase tracking-wider">
                          {currentContent.allProducts}
                        </div>
                        <div className="grid grid-cols-1">
                          {searchResults
                            .filter(r => r.type === 'product')
                            .map((result) => (
                              <Link
                                key={`prod-${result.id}`}
                                href={`/product/${result.slug}`}
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-red-50 transition-colors"
                              >
                                {result.image_url ? (
                                  <div className="w-6 h-6 mr-2 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                    <img 
                                      src={result.image_url} 
                                      alt={result.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 mr-2 flex-shrink-0 bg-gray-100 rounded flex items-center justify-center">
                                    <Search className="h-2.5 w-2.5 text-gray-400" />
                                  </div>
                                )}
                                <span className="truncate">{result.name}</span>
                              </Link>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  {/* Country Selector */}
                  <div className="relative flex-1">
                    <Button
                      variant="outline"
                      onClick={() => setIsCountryOpen(!isCountryOpen)}
                      className="flex items-center gap-2 w-full justify-between"
                    >
                      {selectedCountry ? selectedCountry.name[Language] : currentContent.selectCountry}
                      <ChevronDown className={`h-4 w-4 transition-transform ${isCountryOpen ? 'rotate-180' : ''}`} />
                    </Button>
                    
                    {isCountryOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                        {countries.map(country => (
                          <button
                            key={country.id}
                            onClick={() => handleSelectCountry(country)}
                            className={`block w-full text-left px-4 py-2 text-sm ${
                              selectedCountry?.id === country.id 
                                ? 'bg-red-50 text-red-700 font-medium' 
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {country.name[Language]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* City Selector */}
                  <div className="relative flex-1">
                    <Button
                      variant="outline"
                      onClick={() => selectedCountry && setIsCityOpen(!isCityOpen)}
                      disabled={!selectedCountry}
                      className={`flex items-center gap-2 w-full justify-between ${
                        !selectedCountry ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {selectedCity 
                        ? selectedCity.name[Language] 
                        : selectedCountry 
                          ? currentContent.selectCity 
                          : currentContent.selectCity}
                      <ChevronDown className={`h-4 w-4 transition-transform ${isCityOpen ? 'rotate-180' : ''}`} />
                    </Button>
                    
                    {isCityOpen && selectedCountry && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                        {selectedCountry.cities.map(city => (
                          <button
                            key={city.id}
                            onClick={() => handleSelectCity(city)}
                            className={`block w-full text-left px-4 py-2 text-sm ${
                              selectedCity?.id === city.id 
                                ? 'bg-red-50 text-red-700 font-medium' 
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {city.name[Language]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

               
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="relative px-3 py-2 border-b border-gray-200">
        <div className="flex items-center">
          {Language === 'en' && mobileScrollLeft > 0 && (
            <button
              onClick={() => scrollMobileCategories('left')}
              className="p-1 rounded-full bg-white shadow-md text-gray-600 hover:bg-gray-100 mr-1 z-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          {Language === 'ar' && mobileScrollRight > 0 && (
            <button
              onClick={() => scrollMobileCategories('right')}
              className="p-1 rounded-full bg-white shadow-md text-gray-600 hover:bg-gray-100 mr-1 z-0"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          <div 
            ref={mobileCategoriesRef}
            className="flex-1 overflow-x-auto whitespace-nowrap scrollbar-hide"
            style={{ 
              scrollbarWidth: 'none',
              direction: Language === 'ar' ? 'rtl' : 'ltr'
            }}
          >
            {categories.map((category) => (
              <div key={category.id} className={`inline-block ${Language === 'ar' ? 'ml-2 first:ml-0' : 'mr-2 last:mr-0'}`}>
                <Button
                  variant="ghost"
                  className={`text-sm px-3 py-1 rounded-full transition-colors font-bold ${
                    activeCategory?.id === category.id
                      ? "bg-red-50 text-red-700"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="flex items-center">
                    {Language === 'ar' && category.sub_categories?.length > 0 && (
                      <ChevronDown
                        className={`mr-1 h-4 w-4 transition-transform duration-200 ${
                          activeCategory?.id === category.id 
                            ? "transform rotate-180 text-red-700" 
                            : "text-gray-500"
                        }`}
                      />
                    )}
                    <span>{category.name[Language]}</span>
                    {Language !== 'ar' && category.sub_categories?.length > 0 && (
                      <ChevronDown
                        className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                          activeCategory?.id === category.id 
                            ? "transform rotate-180 text-red-700" 
                            : "text-gray-500"
                        }`}
                      />
                    )}
                  </div>
                </Button>
              </div>
            ))}
          </div>

          {Language === 'en' && mobileScrollRight > 0 && (
            <button
              onClick={() => scrollMobileCategories('right')}
              className="p-1 rounded-full bg-white shadow-md text-gray-600 hover:bg-gray-100 ml-1 z-0"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          {Language === 'ar' && mobileScrollLeft > 0 && (
            <button
              onClick={() => scrollMobileCategories('left')}
              className="p-1 rounded-full bg-white shadow-md text-gray-600 hover:bg-gray-100 ml-1 z-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      
      {activeCategory && activeCategory.sub_categories?.length > 0 && (
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap gap-1">
            {activeCategory.sub_categories.map((subcategory) => (
              <button
                key={subcategory.id}
                onClick={() => handleSubcategoryClick(subcategory)}
                className="text-sm px-3 py-1.5 rounded-full bg-white text-gray-700 hover:text-red-700 transition duration-150 ease-in-out hover:bg-red-50 border border-gray-200 font-semibold"
              >
                {subcategory.name[Language]}
              </button>
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
            <div className="flex flex-wrap gap-1">
              {activeCategory.sub_categories.map((subcategory) => (
                <button
                  key={subcategory.id}
                  onClick={() => handleSubcategoryClick(subcategory)}
                  className="text-sm text-gray-700 hover:text-red-700 transition duration-150 ease-in-out py-1 px-3 rounded-md hover:bg-red-50 whitespace-nowrap font-semibold"
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

  const renderSearchAndLocation = () => (
    <div className="hidden md:flex items-center justify-between bg-gray-50 px-4 py-2 border-b border-gray-200">
      <div className="flex items-center">
        <div 
          className="flex-shrink-0 flex items-center gap-3 mr-4 ml-3 cursor-pointer"
          onClick={navigateToHome}
        >
          {businessInfo?.business_logo_url ? (
            <div className="flex items-center gap-3 mr-10">
              <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-red-200">
                <Image
                  src={businessInfo.business_logo_url}
                  alt={businessInfo.business_name?.[Language] || "4YOUAD"}
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                />
              </div>
              <span className="text-lg font-bold text-gray-800 hidden sm:block">
                {businessInfo.business_name?.[Language] || "4YOUAD"}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-red-600 text-white flex items-center justify-center text-xl font-bold">
                4Y
              </div>
              <span className="text-lg font-bold text-gray-800 hidden sm:block">
                {businessInfo?.business_name?.[Language] || "4YOUAD"}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mr-10">
          {/* Country Selector */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCountryOpen(!isCountryOpen)}
              className="text-sm font-semibold"
            >
              <span className="truncate max-w-[100px]">
                {selectedCountry ? selectedCountry.name[Language] : currentContent.selectCountry}
              </span>
              <ChevronDown className={`h-3.5 w-3.5 ml-1 transition-transform ${isCountryOpen ? 'rotate-180' : ''}`} />
            </Button>
            
            {isCountryOpen && (
              <div className="absolute z-10 mt-1 w-40 rounded-md bg-white shadow-lg border border-gray-200 max-h-60 overflow-auto">
                {countries.map((country) => (
                  <button
                    key={country.id}
                    onClick={() => handleSelectCountry(country)}
                    className={`block w-full text-left px-3 py-2 text-sm ${
                      selectedCountry?.id === country.id 
                        ? 'bg-red-50 text-red-700 font-semibold' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {country.name[Language]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* City Selector */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectedCountry && setIsCityOpen(!isCityOpen)}
              disabled={!selectedCountry}
              className={`text-sm font-semibold w-[200px] ${
                !selectedCountry ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span className="truncate max-w-[100px]">
                {selectedCity ? selectedCity.name[Language] : currentContent.selectCity}
              </span>
              <ChevronDown className={`h-3.5 w-3.5 ml-1 transition-transform ${isCityOpen ? 'rotate-180' : ''}`} />
            </Button>
            
            {isCityOpen && selectedCountry && (
              <div className="absolute z-10 mt-1 w-40 rounded-md bg-white shadow-lg border border-gray-200 max-h-60 overflow-auto">
                {selectedCountry.cities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleSelectCity(city)}
                    className={`block w-full text-left px-3 py-2 text-sm ${
                      selectedCity?.id === city.id 
                        ? 'bg-red-50 text-red-700 font-semibold' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {city.name[Language]}
                  </button>
                ))}
              </div>
            )}
          </div>

        
        </div>
      </div>

      <div className="flex-1 max-w-8xl mr-4 relative" ref={searchRef}>
        <form onSubmit={handleSearchSubmit}>
          <div className="relative">
            <Input
              type="search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSearchResults(e.target.value.trim().length > 0);
              }}
              onFocus={() => setShowSearchResults(searchTerm.trim().length > 0)}
              placeholder={currentContent.searchPlaceholder}
              className="w-full pl-12 pr-20 py-2 text-sm rounded-full border-gray-300 focus:ring-2 focus:ring-red-500 shadow-sm hover:border-black-400 transition-colors"
            />
            <button 
              type="submit"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-red-100 text-red-500 hover:bg-red-200 transition-all h-7 w-7 flex items-center justify-center rounded-full shadow-sm"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
            <Button 
              type="submit"
              variant="default" 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-red-100 text-red-500 hover:bg-red-200 transition-all h-6 px-3 text-xs shadow-sm rounded-full"
            >
              {currentContent.search}
            </Button>
          </div>
        </form>

        {showSearchResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-72 overflow-y-auto">
            <div className="divide-y divide-gray-100">
              {searchResults.some(r => r.type === 'category') && (
                <div>
                  <div className="px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-50 uppercase tracking-wider">
                    {currentContent.allCategories}
                  </div>
                  <div className="grid grid-cols-1">
                    {searchResults
                      .filter(r => r.type === 'category')
                      .map((result) => (
                        <Link
                          key={`cat-${result.id}`}
                          href={`/products/${result.slug}`}
                          className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-red-50 transition-colors"
                        >
                          {result.image_url ? (
                            <div className="w-6 h-6 mr-2 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                              <img 
                                src={result.image_url} 
                                alt={result.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-6 h-6 mr-2 flex-shrink-0 bg-gray-100 rounded flex items-center justify-center">
                              <Search className="h-2.5 w-2.5 text-gray-400" />
                            </div>
                          )}
                          <span className="truncate">{result.name}</span>
                        </Link>
                      ))}
                  </div>
                </div>
              )}
              

              {searchResults.some(r => r.type === 'product') && (
                <div>
                  <div className="px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-50 uppercase tracking-wider">
                    {currentContent.allProducts}
                  </div>
                  <div className="grid grid-cols-1">
                    {searchResults
                      .filter(r => r.type === 'product')
                      .map((result) => (
                        <Link
                          key={`prod-${result.id}`}
                          href={`/product/${result.slug}`}
                          className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-red-50 transition-colors"
                        >
                          {result.image_url ? (
                            <div className="w-6 h-6 mr-2 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                              <img 
                                src={result.image_url} 
                                alt={result.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-6 h-6 mr-2 flex-shrink-0 bg-gray-100 rounded flex items-center justify-center">
                              <Search className="h-2.5 w-2.5 text-gray-400" />
                            </div>
                          )}
                          <span className="truncate">{result.name}</span>
                        </Link>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
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
      {renderSearchAndLocation()}
      <div className="container mx-auto max-w-7xl px-2 sm:px-4">
        {renderDesktopCategories()}
        {renderMobileCategories()}
      </div>
      {renderDesktopSubcategories()}
    </nav>
  );
}