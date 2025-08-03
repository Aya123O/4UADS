"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Menu, 
  ChevronDown, 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Youtube
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useLanguage } from "@/Context/LanguageContext";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

const BUSINESS_API = "https://new.4youad.com/api/settings/business";
const SOCIAL_API = "https://new.4youad.com/api/settings/social";
const SEARCH_API = "https://new.4youad.com/api/products/search";
const CATEGORIES_API = "https://new.4youad.com/api/categories";
const COUNTRIES_API = "https://new.4youad.com/api/countries";

const content = {
  ar: {
    searchPlaceholder: "ابحث عن سيارات، ماركات، موديلات...",
    phone: "هاتف",
    email: "بريد إلكتروني",
    location: "الموقع",
    categories: "الفئات",
    noResults: "لا توجد نتائج",
    allProducts: "جميع المنتجات",
    allCategories: "جميع الفئات",
    selectCountry: "اختر الدولة",
    selectCity: "اختر المدينة"
  },
  en: {
    searchPlaceholder: "Search for cars, makes, models...",
    phone: "Phone",
    email: "Email",
    location: "Location",
    categories: "Categories",
    noResults: "No results found",
    allProducts: "All Products",
    allCategories: "All Categories",
    selectCountry: "Select Country",
    selectCity: "Select City"
  }
};

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

interface SearchResult {
  id: number;
  name: string;
  slug: string;
  type: 'product' | 'category';
  image_url?: string;
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

export default function Header() {
  const { Language, setLanguage } = useLanguage();
  const currentContent = content[Language];
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const router = useRouter();

  // Color scheme
  const colors = {
    primary: '#E53E3E', // Red
    secondary: '#38A169', // red
    dark: '#1A202C', // Dark gray/black
    light: '#F7FAFC', // Light gray
    accent: '#F6AD55', // Orange for accents
    text: '#2D3748', // Dark text
    textLight: '#718096', // Light text
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [businessResponse, socialResponse, categoriesResponse, countriesResponse] = await Promise.all([
          fetch(BUSINESS_API),
          fetch(SOCIAL_API),
          fetch(CATEGORIES_API),
          fetch(COUNTRIES_API)
        ]);
        
        const businessData = await businessResponse.json();
        setBusinessInfo(businessData.data);
        
        const socialData = await socialResponse.json();
        setSocialLinks(socialData.data || []);
        
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.data);
        
        const countriesData = await countriesResponse.json();
        setCountries(countriesData.data);
        
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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchTerm.trim() === "") {
        setSearchResults([]);
        return;
      }

      try {
        const response = await fetch(SEARCH_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            search: searchTerm,
            lang: Language
          })
        });

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
  }, [searchTerm, Language]);

  const toggleLanguageDropdown = () => {
    setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
    setIsCountryDropdownOpen(false);
    setIsCityDropdownOpen(false);
  };

  const toggleCountryDropdown = () => {
    setIsCountryDropdownOpen(!isCountryDropdownOpen);
    setIsLanguageDropdownOpen(false);
    setIsCityDropdownOpen(false);
  };

  const toggleCityDropdown = () => {
    if (selectedCountry) {
      setIsCityDropdownOpen(!isCityDropdownOpen);
      setIsLanguageDropdownOpen(false);
      setIsCountryDropdownOpen(false);
    }
  };

  const changeLanguage = (newLang: "ar" | "en") => {
    setLanguage(newLang);
    setIsLanguageDropdownOpen(false);
  };

  const handleSelectCountry = (country: Country) => {
    setSelectedCountry(country);
    setSelectedCity(null);
    setIsCountryDropdownOpen(false);
  };

  const handleSelectCity = (city: City) => {
    setSelectedCity(city);
    setIsCityDropdownOpen(false);
  };

  const handleCategoryHover = (category: Category | null) => {
    if (category && category.sub_categories && category.sub_categories.length > 0) {
      setActiveCategory(category);
      setIsHovering(true);
    }
  };

  const handleCategoryLeave = () => {
    setIsHovering(false);
    setTimeout(() => {
      if (!isHovering) {
        setActiveCategory(null);
      }
    }, 300);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
      setShowSearchResults(false);
    }
  };

  // New function to handle search icon click
  const handleSearchIconClick = () => {
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
      setShowSearchResults(false);
    }
  };

  const renderDesktopSubcategories = () => (
    <div className="hidden md:block">
      {activeCategory && activeCategory.sub_categories && activeCategory.sub_categories.length > 0 && (
        <div
          className="bg-white border-t border-gray-200 shadow-lg absolute left-0 right-0 z-40"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={handleCategoryLeave}
        >
          <div className="container mx-auto px-4 py-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {activeCategory.sub_categories.map((subcategory) => (
                <Link
                  key={subcategory.id}
                  href={`/products/${subcategory.slug}`}
                  className="group flex flex-col items-center text-sm font-medium text-gray-600 hover:text-red transition duration-150 ease-in-out p-2 rounded-md hover:bg-gray-50"
                >
                  {subcategory.icon_url ? (
                    <div className="w-10 h-10 mb-1.5 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img 
                        src={subcategory.icon_url} 
                        alt={subcategory.name[Language]} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 mb-1.5 rounded-full bg-gray-100 flex items-center justify-center">
                      <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                    </div>
                  )}
                  <span className="text-center text-xs">{subcategory.name[Language]}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-white'}`}
      dir={Language === "ar" ? "rtl" : "ltr"}
    >
      {/* Top Contact Bar - Red */}
      <div className="bg-gradient-to-r from-red-700 to-red-600 text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex items-center flex-wrap justify-center gap-x-4 gap-y-1">
            {businessInfo?.business_phone && (
              <a 
                href={`tel:${businessInfo.business_phone}`}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <Phone className="h-3 w-3 text-white opacity-80" />
                <span>{businessInfo.business_phone}</span>
              </a>
            )}
            {businessInfo?.business_email && (
              <a 
                href={`mailto:${businessInfo.business_email}`}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <Mail className="h-3 w-3 text-white opacity-80" />
                <span>{businessInfo.business_email}</span>
              </a>
            )}
            {businessInfo?.business_address && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-white opacity-80" />
                <span className="truncate max-w-[160px]">{businessInfo.business_address[Language]}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              {socialLinks.map((link) => (
                <a 
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:opacity-80 transition-opacity"
                  aria-label={link.platform}
                >
                  {link.platform === 'facebook' ? (
                    <Facebook className="h-3.5 w-3.5" />
                  ) : link.platform === 'instagram' ? (
                    <Instagram className="h-3.5 w-3.5" />
                  ) : link.platform === 'twitter' ? (
                    <Twitter className="h-3.5 w-3.5" />
                  ) : (
                    <Youtube className="h-3.5 w-3.5" />
                  )}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-1 border-l border-red-400 pl-2 ml-1">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleCountryDropdown}
                  className="text-white hover:bg-red-500 hover:text-white flex items-center gap-1 px-1 h-6"
                >
                  <span className="text-xs truncate max-w-[70px]">
                    {selectedCountry ? selectedCountry.name[Language] : currentContent.selectCountry}
                  </span>
                  <ChevronDown className={`h-2.5 w-2.5 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
                </Button>
                
                {isCountryDropdownOpen && (
                  <div className={`absolute ${Language === 'ar' ? 'right-0' : 'left-0'} mt-1 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 max-h-60 overflow-auto`}>
                    <div className="py-1">
                      {countries.map((country) => (
                        <button
                          key={country.id}
                          onClick={() => handleSelectCountry(country)}
                          className={`block w-full text-left px-2 py-1.5 text-xs ${
                            selectedCountry?.id === country.id 
                              ? 'bg-red-50 text-red-700' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {country.name[Language]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleCityDropdown}
                  disabled={!selectedCountry}
                  className={`text-white hover:bg-red-500 hover:text-white flex items-center gap-1 px-1 h-6 ${
                    !selectedCountry ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span className="text-xs truncate max-w-[70px]">
                    {selectedCity ? selectedCity.name[Language] : currentContent.selectCity}
                  </span>
                  <ChevronDown className={`h-2.5 w-2.5 transition-transform ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
                </Button>
                
                {isCityDropdownOpen && selectedCountry && selectedCountry.cities && (
                  <div className={`absolute ${Language === 'ar' ? 'right-0' : 'left-0'} mt-1 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 max-h-60 overflow-auto`}>
                    <div className="py-1">
                      {selectedCountry.cities.map((city) => (
                        <button
                          key={city.id}
                          onClick={() => handleSelectCity(city)}
                          className={`block w-full text-left px-2 py-1.5 text-xs ${
                            selectedCity?.id === city.id 
                              ? 'bg-red-50 text-red-700' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {city.name[Language]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="relative border-l border-red-400 pl-2 ml-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguageDropdown}
                className="text-white hover:bg-red-500 hover:text-white flex items-center gap-1 px-1 h-6"
              >
                <Globe className="h-3 w-3" />
                <span className="text-xs">{Language === "ar" ? "العربية" : "English"}</span>
                <ChevronDown className={`h-2.5 w-2.5 transition-transform ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} />
              </Button>
              
              {isLanguageDropdownOpen && (
                <div className={`absolute ${Language === 'ar' ? 'right-0' : 'left-0'} mt-1 w-24 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50`}>
                  <div className="py-1">
                    <button
                      onClick={() => changeLanguage("en")}
                      className={`block w-full text-left px-2 py-1.5 text-xs ${Language === 'en' ? 'bg-red-50 text-red-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => changeLanguage("ar")}
                      className={`block w-full text-left px-2 py-1.5 text-xs ${Language === 'ar' ? 'bg-red-50 text-red-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      العربية
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-3 gap-4">
           <Link href="/" className="flex-shrink-0 flex items-center gap-3">
  {loading ? (
    <div className="flex items-center gap-3">
      <Skeleton className="h-12 w-12 rounded-full" />
      <Skeleton className="h-5 w-32 rounded" />
    </div>
  ) : businessInfo?.business_logo_url ? (
    <div className="flex items-center gap-3">
      <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-red-500 transition-all duration-300 hover:scale-105">
        <Image
          src={businessInfo.business_logo_url}
          alt={businessInfo.business_name?.[Language] || "4YOUAD"}
          width={48}
          height={48}
          className="object-cover w-full h-full"
          priority
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
</Link>

            <div className="flex-1 max-w-2xl mx-3 relative">
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
        onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
        placeholder={currentContent.searchPlaceholder}
        className="w-full pl-12 pr-20 py-2 text-xs rounded-full border-gray-300 focus:ring-2 focus:ring-red-500 shadow-sm hover:border-black-400 transition-colors"
      />
      <button 
        type="button"
        onClick={handleSearchIconClick}
        className="absolute left-1 top-1/2 transform -translate-y-1/2  bg-red-100 text-red-500  hover:bg-red-200 transition-all h-7 w-7 flex items-center justify-center rounded-full  shadow-sm "
      >
        <Search className="h-3.5 w-3.5" />
      </button>
      <Button 
        type="submit"
        variant="default" 
        className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-red-100 text-red-500  hover:bg-red-200 transition-all h-6 px-3 text-xs shadow-sm rounded-full"
      >
        {Language === 'ar' ? 'بحث' : 'Search'}
      </Button>
    </div>
  </form>

              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-72 overflow-y-auto transition-all duration-150 ease-in-out">
                  <div className="divide-y divide-gray-100">
                    {searchResults.some(r => r.type === 'category') && (
                      <div>
                        <div className="px-3 py-1.5 text-[11px] font-medium text-gray-500 bg-gray-50 uppercase tracking-wider">
                          {currentContent.allCategories}
                        </div>
                        <div className="grid grid-cols-1">
                          {searchResults
                            .filter(r => r.type === 'category')
                            .map((result) => (
                              <Link
                                key={`cat-${result.id}`}
                                href={`/products/${result.slug}`}
                                className="flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-red-50 transition-colors"
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
                        <div className="px-3 py-1.5 text-[11px] font-medium text-gray-500 bg-gray-50 uppercase tracking-wider">
                          {currentContent.allProducts}
                        </div>
                        <div className="grid grid-cols-1">
                          {searchResults
                            .filter(r => r.type === 'product')
                            .map((result) => (
                              <Link
                                key={`prod-${result.id}`}
                                href={`/product/${result.slug}`}
                                className="flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-red-50 transition-colors"
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
        </div>
      </div>     
    </header>
  );
}