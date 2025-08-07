"use client";

import React, { useState, useEffect } from "react";
import { 
  Phone, 
  Mail, 
  MapPin,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  ChevronDown,
  ShoppingCart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLanguage } from "@/Context/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";

const BUSINESS_API = "https://new.4youad.com/api/settings/business";
const SOCIAL_API = "https://new.4youad.com/api/settings/social";

const content = {
  ar: {
    phone: "هاتف",
    email: "بريد إلكتروني",
    location: "الموقع",
    cart: "عربة التسوق"
  },
  en: {
    phone: "Phone",
    email: "Email",
    location: "Location",
    cart: "Cart"
  }
};

// Cart item type
type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export default function Header() {
  const { Language, setLanguage } = useLanguage();
  const currentContent = content[Language];
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Initialize cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [businessResponse, socialResponse] = await Promise.all([
          fetch(BUSINESS_API),
          fetch(SOCIAL_API)
        ]);
        
        const businessData = await businessResponse.json();
        setBusinessInfo(businessData.data);
        
        const socialData = await socialResponse.json();
        setSocialLinks(socialData.data || []);
        
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

  const toggleLanguageDropdown = () => {
    setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
  };

  const changeLanguage = (newLang: "ar" | "en") => {
    setLanguage(newLang);
    setIsLanguageDropdownOpen(false);
  };

  // Function to add item to cart
  const addToCart = (item: CartItem) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      if (existingItem) {
        return prevItems.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  // Calculate total items in cart
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-red shadow-md' : 'bg-red'}`}
      dir={Language === "ar" ? "rtl" : "ltr"}
    >
      {/* Top Contact Bar - Red */}
      <div className="bg-red-500 text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          {/* Contact Info Section */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 w-full md:w-auto">
            {businessInfo?.business_phone && (
              <a 
                href={`tel:${businessInfo.business_phone}`}
                className="flex items-center gap-1 hover:text-white transition-colors redspace-nowrap"
              >
                <Phone className="h-3 w-3 text-white opacity-80 flex-shrink-0" />
                <span>{businessInfo.business_phone}</span>
              </a>
            )}
            {businessInfo?.business_email && (
              <a 
                href={`mailto:${businessInfo.business_email}`}
                className="flex items-center gap-1 hover:text-white transition-colors redspace-nowrap"
              >
                <Mail className="h-3 w-3 text-white  opacity-80 flex-shrink-0" />
                <span>{businessInfo.business_email}</span>
              </a>
            )}
            {businessInfo?.business_address && (
              <div className="flex items-center gap-1 redspace-nowrap">
                <MapPin className="h-3 w-3 text-white  opacity-80 flex-shrink-0" />
                <span className="md:truncate max-w-[120px] md:max-w-[160px]">
                  {businessInfo.business_address[Language]}
                </span>
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

            {/* Cart Icon */}
            <Link href="/cart" className="relative p-1 group">
              <ShoppingCart className="h-4 w-4 text-white" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-red-500 rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-bold">
                  {cartItemCount}
                </span>
              )}
              <span className="sr-only">{currentContent.cart}</span>
            </Link>

            {/* Language Selector */}
            <div className="relative border-l border-red-400 pl-2 ml-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguageDropdown}
                className="text-white  h flex items-center gap-1 px-1 h-6"
              >
                <Globe className="h-3 w-3" />
                <span className="text-xs">{Language === "ar" ? "العربية" : "English"}</span>
                <ChevronDown className={`h-2.5 w-2.5 transition-transform ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} />
              </Button>
              
              {isLanguageDropdownOpen && (
                 <div className={`absolute ${Language === 'ar' ? 'right-0' : 'left-0'} mt-1 w-24 rounded-md shadow-lg bg-white ring-1 ring-gray-200 z-50`}>
                  <div className="py-1">
                    <button
                      onClick={() => changeLanguage("en")}
                      className={`block w-full text-left px-3 py-2 text-sm ${
                        Language === 'en' 
                          ? 'bg-red-100 text-white-700 font-medium' 
                          : 'text-gray-700 hover:bg-gray-50'
                      } transition-colors duration-150`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => changeLanguage("ar")}
                      className={`block w-full text-left px-3 py-2 text-sm ${
                        Language === 'ar' 
                          ? 'bg-red-500 text-white-700 font-medium' 
                          : 'text-gray-700 hover:bg-gray-50'
                      } transition-colors duration-150`}
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
    </header>
  );
}