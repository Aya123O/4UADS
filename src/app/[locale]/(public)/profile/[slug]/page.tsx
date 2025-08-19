"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../../../../../Context/LanguageContext";
import Image from "next/image";
import { 
  MapPin, Mail, Phone, Globe, Facebook, Instagram, 
  Twitter, Youtube, ShoppingBag, Briefcase, Star,
  User, CheckCircle, Info, Link, MessageSquare, AlertCircle, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileResponse {
  data: {
    id: number;
    slug: string;
    name: string;
    email: string;
    phone: string;
    address: string | null;
    is_active: number;
    picture: string;
    picture_url: string;
    profile: {
      id: number;
      company_name: {
        ar: string;
        en: string;
      };
      company_type: string;
      company_location: string | null;
      company_email: string;
      company_phone: string;
      company_website: string | null;
      company_facebook: string | null;
      company_whatsapp: string | null;
      company_tiktok: string | null;
      company_youtube: string | null;
      company_twitter: string | null;
      company_instagram: string | null;
      company_description: {
        ar: string | null;
        en: string | null;
      } | null;
      customer_id: number;
      company_logo_url: string;
      company_banner_url: string;
    };
    products: Array<{
      id: number;
      slug: string;
      name: {
        ar: string;
        en: string | null;
      };
      quantity: number;
      phone_number: string;
      whatsapp_number: string | null;
      main_category_id: number;
      sub_category_id: number;
      customer_id: number;
      picture_url: string;
      main_category: {
        id: number;
        slug: string;
        name: {
          ar: string;
          en: string;
        };
        icon_url: string;
      };
      sub_category: {
        id: number;
        slug: string;
        name: {
          ar: string;
          en: string;
        };
        icon_url: string;
      };
    }>;
    services: Array<{
      id: number;
      slug: string;
      name: {
        ar: string;
        en: string | null;
      };
      phone_number: string;
      whatsapp_number: string | null;
      main_category_id: number;
      sub_category_id: number;
      customer_id: number;
      picture_url: string;
      main_category: {
        id: number;
        slug: string;
        name: {
          ar: string;
          en: string;
        };
        icon_url: string;
      };
      sub_category: {
        id: number;
        slug: string;
        name: {
          ar: string;
          en: string;
        };
        icon_url: string;
      };
    }>;
  };
  message: string;
}

export default function ProfilePage({ params }: { params: { slug: string } }) {
  const { Language: lang } = useLanguage();
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    async function fetchProfileData() {
      try {
        const response = await fetch(`https://new.4youad.com/api/customers/${params.slug}`, {
          cache: "no-store",
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }
        
        const data = await response.json();
        setProfileData(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfileData();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 text-blue-600 px-8 py-6 rounded-2xl inline-block max-w-md shadow-sm">
          <p className="font-medium text-lg">
            {lang === "ar" ? "جاري التحميل..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 text-blue-600 px-8 py-6 rounded-2xl inline-block max-w-md shadow-sm">
          <p className="font-medium text-lg">
            {lang === "ar" ? "الملف الشخصي غير موجود" : "Profile not found"}
          </p>
        </div>
      </div>
    );
  }

  const seller = profileData.data;
  const company = seller.profile;
  const products = seller.products || [];
  const services = seller.services || [];

  const isValidUrl = (url: string | null): url is string => {
    if (!url) return false;
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const getCompanyName = () => {
    if (!company?.company_name) return seller?.name || '';
    
    // Handle case where company_name might be a string (if API changes)
    if (typeof company.company_name === 'string') {
      return company.company_name;
    }
    
    // Handle the object case {ar, en}
    if (typeof company.company_name === 'object' && company.company_name !== null) {
      return company.company_name[lang as keyof typeof company.company_name] || seller?.name || '';
    }
    
    return seller?.name || '';
  };

  // Safe company description access
  const getCompanyDescription = () => {
    if (!company?.company_description) return null;
    
    if (typeof company.company_description === 'string') {
      return company.company_description;
    }
    
    if (typeof company.company_description === 'object' && company.company_description !== null) {
      return company.company_description[lang as keyof typeof company.company_description];
    }
    
    return null;
  };

  // Safe name access for products and services
  const getName = (item: { name: { ar: string; en: string | null } | string }) => {
    if (typeof item.name === 'string') {
      return item.name;
    }
    
    if (typeof item.name === 'object' && item.name !== null) {
      return item.name[lang as keyof typeof item.name] || item.name.ar || '';
    }
    
    return '';
  };

  const translations = {
    basicInfo: lang === "ar" ? "المعلومات الأساسية" : "Basic Information",
    companyInfo: lang === "ar" ? "معلومات الشركة" : "Company Information",
    contactInfo: lang === "ar" ? "معلومات التواصل" : "Contact Information",
    socialMedia: lang === "ar" ? "وسائل التواصل الاجتماعي" : "Social Media",
    products: lang === "ar" ? "المنتجات" : "Products",
    services: lang === "ar" ? "الخدمات" : "Services",
    name: lang === "ar" ? "الاسم" : "Name",
    email: lang === "ar" ? "البريد الإلكتروني" : "Email",
    phone: lang === "ar" ? "الهاتف" : "Phone",
    address: lang === "ar" ? "العنوان" : "Address",
    status: lang === "ar" ? "الحالة" : "Status",
    type: lang === "ar" ? "النوع" : "Type",
    location: lang === "ar" ? "الموقع" : "Location",
    website: lang === "ar" ? "الموقع الإلكتروني" : "Website",
    description: lang === "ar" ? "الوصف" : "Description",
    active: lang === "ar" ? "نشط" : "Active",
    inactive: lang === "ar" ? "غير نشط" : "Inactive",
    business: lang === "ar" ? "عمل تجاري" : "Business",
    individual: lang === "ar" ? "فرد" : "Individual",
    verifiedSeller: lang === "ar" ? "بائع معتمد" : "Verified Seller",
    contactSeller: lang === "ar" ? "تواصل مع البائع" : "Contact Seller",
    callNow: lang === "ar" ? "اتصال هاتفي" : "Call Now",
    sendEmail: lang === "ar" ? "إرسال بريد" : "Send Email",
    whatsapp: lang === "ar" ? "واتساب" : "WhatsApp",
    noDescription: lang === "ar" ? "لا يوجد وصف متاح" : "No description available",
    noProducts: lang === "ar" ? "لا توجد منتجات متاحة حالياً" : "No products available currently",
    noServices: lang === "ar" ? "لا توجد خدمات متاحة حالياً" : "No services available currently",
    comingSoon: lang === "ar" ? "سيتم عرض المنتجات هنا قريباً" : "Products will be displayed here soon",
    viewProfile: lang === "ar" ? "عرض الملف الشخصي" : "View Profile",
  
    
    businessHours: lang === "ar" ? "ساعات العمل" : "Business Hours",
    weekdays: lang === "ar" ? "السبت - الخميس" : "Saturday - Thursday",
    friday: lang === "ar" ? "الجمعة" : "Friday",
    quantity: lang === "ar" ? "الكمية" : "Quantity",
    price: lang === "ar" ? "السعر" : "Price",
    category: lang === "ar" ? "الفئة" : "Category",
    subCategory: lang === "ar" ? "الفئة الفرعية" : "Sub Category",
    viewDetails: lang === "ar" ? "عرض التفاصيل" : "View Details",
    inStock: lang === "ar" ? "متوفر" : "In Stock",
    outOfStock: lang === "ar" ? "غير متوفر" : "Out of Stock",
    contactService: lang === "ar" ? "تواصل للخدمة" : "Contact for Service"
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    if (lang === "ar") {
      return phone.split('').reverse().join('');
    }
    return phone;
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Banner Section */}
      <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg mb-8">
        <Image
          src={company.company_banner_url || "/assets/images/default-banner.jpg"}
          alt={`${seller.name} banner`}
          fill
          className="object-cover"
          quality={100}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        
        <div className={`absolute bottom-6 ${lang === "ar" ? "right-6" : "left-6"} flex items-end gap-6`}>
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <Image
              src={seller.picture_url || "/assets/images/default.png"}
              alt={seller.name}
              fill
              className="object-cover"
              quality={100}
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {getCompanyName()}
                </h1>
               
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b mb-8">
        <button
          className={`px-4 py-3 font-medium text-lg ${activeTab === 'products' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('products')}
        >
          {translations.products} ({products.length})
        </button>
        <button
          className={`px-4 py-3 font-medium text-lg ${activeTab === 'services' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('services')}
        >
          {translations.services} ({services.length})
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Business Information */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6 pb-3 border-b flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              {translations.companyInfo}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">{translations.name}</p>
                  <p className="font-medium">{seller.name}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">{translations.type}</p>
                  <p className="font-medium">
                    {company.company_type === "business" ? translations.business : translations.individual}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">{translations.email}</p>
                  <p className="font-medium">{seller.email}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">{translations.phone}</p>
                  <p className="font-medium">{formatPhoneNumber(seller.phone)}</p>
                </div>
              </div>
              
              {seller.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">{translations.address}</p>
                    <p className="font-medium">{seller.address}</p>
                  </div>
                </div>
              )}
              
              {company.company_location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">{translations.location}</p>
                    <p className="font-medium">{company.company_location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Products/Services Section */}
          {activeTab === 'products' ? (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6 pb-3 border-b flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                {translations.products} ({products.length})
              </h2>
              
              {products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative h-48 w-full">
                        <Image
                          src={product.picture_url || "/assets/images/default-product.png"}
                          alt={getName(product)}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2">{getName(product)}</h3>
                        
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-500">{translations.category}:</span>
                          <span className="font-medium">{getName(product.main_category)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-500">{translations.subCategory}:</span>
                          <span className="font-medium">{getName(product.sub_category)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm text-gray-500">{translations.quantity}:</span>
                          <span className={`font-medium ${product.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {product.quantity > 0 ? `${product.quantity} ${translations.inStock}` : translations.outOfStock}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1  bg-green-100 text-green-700 hover:bg-green-200 shadow-md transition-all" asChild>
                            <a href={`tel:${product.phone_number}`}>
                              <Phone className="w-4 h-4" />
                            </a>
                          </Button>
                          {product.whatsapp_number && (
                            <Button size="sm" variant="outline" className="flex-1  bg-green-100 text-green-700 hover:bg-green-200 shadow-md transition-all " asChild>
                              <a href={`https://wa.me/${product.whatsapp_number}`} target="_blank" rel="noopener noreferrer">
                                {translations.whatsapp}
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>{translations.noProducts}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6 pb-3 border-b flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                {translations.services} ({services.length})
              </h2>
              
              {services.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {services.map((service) => (
                    <div key={service.id} className="border rounded-xl overflow-hidden p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative h-40 w-full md:w-48 flex-shrink-0">
                          <Image
                            src={service.picture_url || "/assets/images/default-service.png"}
                            alt={getName(service)}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-2">{getName(service)}</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            <div>
                              <span className="text-sm text-gray-500">{translations.category}:</span>
                              <p className="font-medium">{getName(service.main_category)}</p>
                            </div>
                            
                            <div>
                              <span className="text-sm text-gray-500">{translations.subCategory}:</span>
                              <p className="font-medium">{getName(service.sub_category)}</p>
                            </div>
                            
                            <div>
                              <span className="text-sm text-gray-500">{translations.phone}:</span>
                              <p className="font-medium">{formatPhoneNumber(service.phone_number)}</p>
                            </div>
                            
                            {service.whatsapp_number && (
                              <div>
                                <span className="text-sm text-gray-500">{translations.whatsapp}:</span>
                                <p className="font-medium">{formatPhoneNumber(service.whatsapp_number)}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" asChild className=" bg-green-100 text-green-700 hover:bg-green-200 shadow-md transition-all">
                              <a href={`tel:${service.phone_number}`}>
                                <Phone className="w-4 h-4" />
                                {translations.callNow}
                              </a>
                            </Button>
                            {service.whatsapp_number && (
                              <Button size="sm" variant="outline" asChild className=" bg-green-100 text-green-700 hover:bg-green-200 shadow-md transition-all">
                                <a href={`https://wa.me/${service.whatsapp_number}`} target="_blank" rel="noopener noreferrer">
                                  {translations.whatsapp}
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>{translations.noServices}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {translations.contactInfo}
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">{translations.email}</p>
                  <p className="font-medium">{company.company_email}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">{translations.phone}</p>
                  <p className="font-medium">{formatPhoneNumber(company.company_phone)}</p>
                </div>
              </div>
              
              {isValidUrl(company.company_website) && (
                <div className="flex items-start gap-3">
                  <Link className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">{translations.website}</p>
                    <a 
                      href={company.company_website.startsWith('http') ? company.company_website : `https://${company.company_website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:underline break-all"
                    >
                      {company.company_website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Social Media */}
          {(company.company_facebook || company.company_instagram || 
            company.company_twitter || company.company_youtube || 
            company.company_tiktok || company.company_whatsapp) && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {translations.socialMedia}
              </h3>
              <div className="flex flex-wrap gap-3">
                {isValidUrl(company.company_facebook) && (
                  <Button variant="outline" size="icon" asChild>
                    <a href={company.company_facebook} target="_blank" rel="noopener noreferrer">
                      <Facebook className="w-5 h-5 text-blue-600" />
                    </a>
                  </Button>
                )}
                {isValidUrl(company.company_instagram) && (
                  <Button variant="outline" size="icon" asChild>
                    <a href={company.company_instagram} target="_blank" rel="noopener noreferrer">
                      <Instagram className="w-5 h-5 text-pink-600" />
                    </a>
                  </Button>
                )}
                {isValidUrl(company.company_twitter) && (
                  <Button variant="outline" size="icon" asChild>
                    <a href={company.company_twitter} target="_blank" rel="noopener noreferrer">
                      <Twitter className="w-5 h-5 text-blue-400" />
                    </a>
                  </Button>
                )}
                {isValidUrl(company.company_youtube) && (
                  <Button variant="outline" size="icon" asChild>
                    <a href={company.company_youtube} target="_blank" rel="noopener noreferrer">
                      <Youtube className="w-5 h-5 text-red-600" />
                    </a>
                  </Button>
                )}
                {isValidUrl(company.company_tiktok) && (
                  <Button variant="outline" size="icon" asChild>
                    <a href={company.company_tiktok} target="_blank" rel="noopener noreferrer">
                      <span className="w-5 h-5 text-black font-bold">TT</span>
                    </a>
                  </Button>
                )}
                {company.company_whatsapp && (
                  <Button variant="outline" size="icon" asChild>
                    <a href={`https://wa.me/${company.company_whatsapp}`} target="_blank" rel="noopener noreferrer">
                      <span className="text-green-600 font-bold">WA</span>
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Contact Seller */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              {translations.contactSeller}
            </h3>
            <div className="space-y-3">
              <Button className="w-full bg-green-100 text-green-700 hover:bg-green-200 shadow-md transition-all" asChild>
                <a href={`tel:${seller.phone}`}>
                  <Phone className={`w-5 h-5 ${lang === "ar" ? "ml-2" : "mr-2"}`} />
                  {translations.callNow}
                </a>
              </Button>
              
              <Button variant="outline" className="w-full" asChild>
                <a href={`mailto:${seller.email}`}>
                  <Mail className={`w-5 h-5 ${lang === "ar" ? "ml-2" : "mr-2"}`} />
                  {translations.sendEmail}
                </a>
              </Button>

              {company.company_whatsapp && (
                <Button variant="outline" className="w-full  bg-green-100 text-green-700 hover:bg-green-200 shadow-md transition-all" asChild>
                  <a href={`https://wa.me/${company.company_whatsapp}`} target="_blank" rel="noopener noreferrer">
                    {translations.whatsapp}
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Business Hours */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {translations.businessHours}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>{translations.weekdays}</span>
                <span className="font-medium">8:00 AM - 10:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>{translations.friday}</span>
                <span className="font-medium">10:00 AM - 8:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}