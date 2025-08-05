"use client";

import { useEffect, useState } from "react";
import { MapPin, Phone, MessageCircle, Star, ChevronLeft, ChevronRight, Share2, Heart, Link, Clock, Eye, Plus, Minus } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "../../Context/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Product {
  id: number;
  slug: string;
  sku: string;
  barcode: string | null;
  name: {
    ar: string;
    en: string;
  };
  prices: {
    id: number;
    price: number;
    discount: number;
    final_price: number;
    product_id: number;
    specification_id: number | null;
    specification_detail_id: number | null;
    specification: {
      id: number;
      name: {
        ar: string;
        en: string;
      };
    } | null;
    specification_detail: {
      id: number;
      name: {
        ar: string;
        en: string;
      };
    } | null;
  }[];
  quantity: number;
  phone_number: string;
  whatsapp_number: string;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  specifications: string;
  complementaries: string;
  attributes: string;
  description: {
    ar: string | null;
    en: string | null;
  };
  main_category_id: number;
  sub_category_id: number;
  customer_id: number;
  country_id: number;
  city_id: number;
  picture_url: string;
  main_category: {
    id: number;
    slug: string;
    name: {
      ar: string;
      en: string;
    };
    icon_url: string | null;
  };
  sub_category: {
    id: number;
    slug: string;
    name: {
      ar: string;
      en: string;
    };
    icon_url: string | null;
  };
  customer: {
    id: number;
    name: string;
    phone: string;
    email: string;
    address: string | null;
    picture: string | null;
    picture_url: string;
  };
  country: {
    id: number;
    name: {
      ar: string;
      en: string;
    };
  };
  city: {
    id: number;
    name: {
      ar: string;
      en: string;
    };
  };
  product_specifications: {
    id: number;
    name: {
      ar: string;
      en: string;
    };
    product_id: number;
    details: {
      id: number;
      name: {
        ar: string;
        en: string;
      };
      specification_id: number;
    }[];
  }[];
  created_at?: string;
  views?: number;
}

interface SimilarProduct {
  id: number;
  name: {
    ar: string;
    en: string;
  };
  prices: {
    final_price: number;
    price: number;
  }[];
  picture_url: string;
  slug: string;
  quantity: number;
}

interface SelectedSpecs {
  [key: string]: {
    specId: number;
    detailId: number;
    value: string;
  };
}

export default function ProductDetails() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [similarProducts, setSimilarProducts] = useState<SimilarProduct[]>([]);
  const [similarLoading, setSimilarLoading] = useState(true);
  const [quantities, setQuantities] = useState<{[key: number]: number}>({});
  const [selectedSpecs, setSelectedSpecs] = useState<SelectedSpecs>({});
  const { Language } = useLanguage();
  const { slug } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (slug && typeof slug === "string") {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const response = await fetch(
            `https://new.4youad.com/api/products/${slug}`
          );
          const result = await response.json();
          if (result.data) {
            setProduct(result.data);
            
            // Initialize quantities for each price
            const initialQuantities: {[key: number]: number} = {};
            result.data.prices.forEach((price: any) => {
              initialQuantities[price.id] = 1;
            });
            setQuantities(initialQuantities);
            
            // Initialize selected specs with first option for each specification
            const initialSpecs: SelectedSpecs = {};
            result.data.product_specifications.forEach((spec: any) => {
              if (spec.details.length > 0) {
                initialSpecs[spec.id] = {
                  specId: spec.id,
                  detailId: spec.details[0].id,
                  value: spec.details[0].name[Language]
                };
              }
            });
            setSelectedSpecs(initialSpecs);
            
            fetchSimilarProducts(result.data.main_category_id, result.data.sub_category_id);
          } else {
            setError("Product not found");
          }
        } catch (err) {
          setError("Failed to fetch product details");
          console.error("Error fetching product:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchProduct();
    }
  }, [slug, Language]);

  const fetchSimilarProducts = async (mainCategoryId: number, subCategoryId: number) => {
    try {
      setSimilarLoading(true);
      const response = await fetch(
        `https://new.4youad.com/api/products?main_category_id=${mainCategoryId}&sub_category_id=${subCategoryId}&limit=4`
      );
      const result = await response.json();
      if (result.data) {
        const filtered = result.data.filter((p: any) => p.slug !== slug);
        setSimilarProducts(filtered);
      }
    } catch (err) {
      console.error("Error fetching similar products:", err);
    } finally {
      setSimilarLoading(false);
    }
  };

  const handleShowPhoneNumber = () => {
    setShowPhoneNumber(true);
  };

  const handleSpecChange = (specId: number, detailId: number, value: string) => {
    if (!product) return;

    const newSpecs = {
      ...selectedSpecs,
      [specId]: {
        specId,
        detailId,
        value
      }
    };
    setSelectedSpecs(newSpecs);
  };

  const handleWhatsAppClick = (priceId: number) => {
    if (typeof window === "undefined" || !product) return;

    // Safely get price
    const price = product.prices.find(p => p.id === priceId);
    if (!price) {
      console.error("Price not found for id:", priceId);
      return;
    }

    const currentUrl = window.location.href;
    const propertyName = product.name[Language];
    const quantity = quantities[priceId] || 1;
    const totalPrice = (quantity * price.final_price).toLocaleString();
    const unitPrice = price.final_price.toLocaleString();
    
    // Format selected specifications for the message
    const specsText = Object.values(selectedSpecs)
      .map(spec => {
        const specName = product.product_specifications
          .find(s => s.id === spec.specId)?.name[Language] || '';
        return `- ${specName}: ${spec.value}`;
      })
      .join('\n');
    
    const message =
      Language === "ar"
        ? `مرحبًا، أنا مهتم بشراء المنتج التالي:
        
*${propertyName}*

${specsText}

- الكمية: ${quantity}
- السعر للوحدة: ${unitPrice} ج.م
- السعر الإجمالي: ${totalPrice} ج.م
- الرابط: ${currentUrl}

هل يمكنك تأكيد الطلب؟`
        : `Hello, I'm interested in purchasing the following product:

*${propertyName}*

${specsText}

- Quantity: ${quantity}
- Unit Price: ${unitPrice} EGP
- Total Price: ${totalPrice} EGP
- Link: ${currentUrl}

Can you confirm the order?`;

    let phoneNumber = product.whatsapp_number || product.phone_number;
    if (!phoneNumber) {
      console.error("No phone number available");
      return;
    }
    
    if (!phoneNumber.startsWith("+")) {
      phoneNumber = `+20${phoneNumber}`;
    }

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  const increaseQuantity = (priceId: number) => {
    if (!product) return;
    const currentQty = quantities[priceId] ?? 1;
    if (currentQty < product.quantity) {
      setQuantities({
        ...quantities,
        [priceId]: currentQty + 1
      });
    }
  };

  const decreaseQuantity = (priceId: number) => {
    const currentQty = quantities[priceId] ?? 1;
    if (currentQty > 1) {
      setQuantities({
        ...quantities,
        [priceId]: currentQty - 1
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(Language === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStars = (rating = 4.5) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  // Parse JSON strings from API
  const parsedSpecifications = product ? JSON.parse(product.specifications || '[]') : [];
  const parsedComplementaries = product ? JSON.parse(product.complementaries || '[]') : [];
  const parsedAttributes = product ? JSON.parse(product.attributes || '[]') : [];

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery Skeleton */}
          <div className="space-y-6">
            <Skeleton className="aspect-square w-full rounded-3xl" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          </div>
          
          {/* Product Info Skeleton */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4 rounded-lg" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-32 rounded-lg" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
              
              <div className="space-y-3">
                <Skeleton className="h-6 w-full rounded-md" />
                <Skeleton className="h-6 w-2/3 rounded-md" />
              </div>
            </div>
            
            <div className="space-y-4">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-600 px-8 py-6 rounded-2xl inline-block max-w-md shadow-sm">
          <p className="font-medium text-lg">{error}</p>
          <Button 
            variant="ghost" 
            className="mt-4 text-red-600 hover:bg-red-100"
            onClick={() => router.push("/")}
          >
            {Language === "ar" ? "العودة إلى الصفحة الرئيسية" : "Back to Home"}
          </Button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 text-red-600 px-8 py-6 rounded-2xl inline-block max-w-md shadow-sm">
          <p className="font-medium text-lg">
            {Language === "ar" ? "المنتج غير موجود" : "Product not found"}
          </p>
          <Button 
            variant="ghost" 
            className="mt-4 text-red-600 hover:bg-blue-100"
            onClick={() => router.push("/ads")}
          >
            {Language === "ar" ? "تصفح المنتجات الأخرى" : "Browse other products"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-12"
      dir={Language === "ar" ? "rtl" : "ltr"}
    >
      {/* Breadcrumb */}
      <nav className="flex items-center mb-8">
        <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
          <li className="inline-flex items-center">
            <a 
              href="/" 
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary transition-colors"
            >
              {Language === "ar" ? "الرئيسية" : "Home"}
            </a>
          </li>
          <li>
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400 rtl:rotate-180" />
              <a 
                href={`/products?main_category_id=${product.main_category.slug}`} 
                className="text-sm font-medium text-gray-500 hover:text-primary transition-colors"
              >
                {product.main_category.name[Language]}
              </a>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400 rtl:rotate-180" />
              <a 
                href={`/products?sub_category_id=${product.sub_category.slug}`} 
                className="text-sm font-medium text-red hover:text-red transition-colors"
              >
                {product.sub_category.name[Language]}
              </a>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400 rtl:rotate-180" />
              <span className="text-sm font-medium text-black">
                {product.name[Language]}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-6">
          <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl overflow-hidden shadow-lg">
            <Image
              src={product.picture_url}
              alt={product.name[Language]}
              fill
              className="object-cover transition-all duration-500 hover:scale-105"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              quality={100}
            />
            
            {/* Floating badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.prices.some(p => p.discount > 0) && (
                <div className="bg-gradient-to-r from-red-600 to-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                  {Math.max(...product.prices.map(p => p.discount))}% {Language === "ar" ? "خصم" : "OFF"}
                </div>
              )}
              <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                <Eye className="w-4 h-4 mr-1" />
                {product.views || 0} {Language === "ar" ? "مشاهدات" : "views"}
              </Badge>
            </div>
            
            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white transition-all hover:scale-110"
            >
              <Heart 
                className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500 animate-heartbeat' : 'text-gray-600'}`} 
              />
            </button>
            
            {/* Floating share button */}
            <button className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white transition-all hover:scale-110">
              <Share2 className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          
          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${activeImage === i ? 'border-primary shadow-md' : 'border-transparent hover:border-gray-200'}`}
              >
                <div className="relative w-full h-full">
                  {i === 0 ? (
                    <Image
                      src={product.picture_url}
                      alt={product.name[Language]}
                      fill
                      className="object-cover"
                      quality={100}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">+{i}</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-8">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
                {product.name[Language]}
              </h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {renderStars()}
                </div>
                
                <span className="text-sm text-gray-500 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatDate(product.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Product Specifications with Radio Buttons */}
          {product.product_specifications.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">
                {Language === "ar" ? "مواصفات المنتج" : "Product Specifications"}
              </h4>
              <div className="space-y-6">
                {product.product_specifications.map((spec) => (
                  <div key={spec.id} className="space-y-3">
                    <h5 className="text-sm font-medium text-gray-700">
                      {spec.name[Language]}
                    </h5>
                    <RadioGroup 
                      value={selectedSpecs[spec.id]?.detailId.toString() || ''}
                      onValueChange={(value) => {
                        const detail = spec.details.find(d => d.id.toString() === value);
                        if (detail) {
                          handleSpecChange(spec.id, detail.id, detail.name[Language]);
                        }
                      }}
                      className="grid grid-cols-3 gap-3"
                    >
                      {spec.details.map((detail) => (
                        <div key={detail.id}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem 
                              value={detail.id.toString()} 
                              id={`${spec.id}-${detail.id}`}
                              className="peer hidden"
                            />
                            <Label
                              htmlFor={`${spec.id}-${detail.id}`}
                              className={`
                                flex flex-1 items-center justify-center 
                                rounded-lg border-2 p-3 text-sm font-medium 
                                cursor-pointer transition-all duration-200
                                border-gray-200 hover:border-red-400
                                bg-white hover:bg-red-50
                                text-gray-700 hover:text-red-700
                                peer-data-[state=checked]:border-red-500
                                peer-data-[state=checked]:bg-red-50
                                peer-data-[state=checked]:text-red-700
                                peer-data-[state=checked]:shadow-sm
                                peer-data-[state=checked]:shadow-red-100
                                active:scale-[0.98]
                              `}
                            >
                              {detail.name[Language]}
                            </Label>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price variants displayed as coupon-like list */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">
              {Language === "ar" ? "خيارات الشراء" : "Purchase Options"}
            </h4>
            
            <ul className="space-y-4">
              {product.prices.map((price) => {
                // Get specification name and detail for this price
                const specName = price.specification?.name[Language] || '';
                const specDetail = price.specification_detail?.name[Language] || '';
                
                return (
                  <li key={price.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {specName && specDetail ? `${specName}: ${specDetail}` : Language === "ar" ? "الخيار الأساسي" : "Base Option"}
                        </h4>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-lg font-bold text-primary">
                            {price.final_price.toLocaleString()} {Language === "ar" ? "ج.م" : "EGP"}
                          </span>
                          {price.discount > 0 && (
                            <>
                              <span className="text-sm text-gray-500 line-through">
                                {price.price.toLocaleString()} {Language === "ar" ? "ج.م" : "EGP"}
                              </span>
                              <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full">
                                {price.discount}% {Language === "ar" ? "خصم" : "OFF"}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-4">
                          <h5 className="text-sm text-gray-600">
                            {Language === "ar" ? "الكمية" : "Quantity"}
                          </h5>
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => decreaseQuantity(price.id)}
                              disabled={(quantities[price.id] ?? 1) <= 1}
                              className="h-10 w-10 rounded-none border-r border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <div className="h-10 w-12 flex items-center justify-center text-base font-medium">
                              {quantities[price.id] || 1}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => increaseQuantity(price.id)}
                              disabled={product.quantity <= (quantities[price.id] ?? 1)}
                              className="h-10 w-10 rounded-none border-l border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => handleWhatsAppClick(price.id)}
                          className="h-10 bg-green-100 text-green-700 hover:bg-green-200 shadow-sm transition-all"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          {Language === "ar" ? "اطلب عبر واتساب" : "Order via WhatsApp"}
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Key product details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded-xl">
              <p className="text-sm text-gray-500">{Language === "ar" ? "رقم SKU" : "SKU"}</p>
              <p className="font-medium">{product.sku}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <p className="text-sm text-gray-500">{Language === "ar" ? "الباركود" : "Barcode"}</p>
              <p className="font-medium">{product.barcode || "N/A"}</p>
            </div>
          </div>

          {/* Location with map link */}
          {product.address && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-black-100">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-black-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {Language === "ar" ? "الموقع" : "Location"}
                  </p>
                  <p className="font-medium">{product.address}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {product.city.name[Language]}, {product.country.name[Language]}
                  </p>
                  {product.latitude && product.longitude && (
                    <a 
                      href={`https://maps.google.com/?q=${product.latitude},${product.longitude}`} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-sm text-black-600 hover:underline"
                    >
                      {Language === "ar" ? "عرض على الخريطة" : "View on map"}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tabs for specifications and attributes */}
          <Tabs defaultValue="specs" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100">
              <TabsTrigger value="specs">
                {Language === "ar" ? "المواصفات" : "Specifications"}
              </TabsTrigger>
              <TabsTrigger value="attributes">
                {Language === "ar" ? "الخصائص" : "Attributes"}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="specs" className="mt-4">
              {parsedSpecifications.length > 0 ? (
                <div className="space-y-3">
                  {parsedSpecifications.map((spec: any, index: number) => (
                    <div key={index} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-gray-500">{spec.key}</span>
                      <span className="font-medium">{spec.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  {Language === "ar" ? "لا توجد مواصفات متاحة" : "No specifications available"}
                </p>
              )}
            </TabsContent>
            
            <TabsContent value="attributes" className="mt-4">
              {parsedAttributes.length > 0 ? (
                <div className="space-y-3">
                  {parsedAttributes.map((attr: any, index: number) => (
                    <div key={index} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-gray-500">{attr.key}</span>
                      <span className="font-medium">{attr.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  {Language === "ar" ? "لا توجد خصائص متاحة" : "No attributes available"}
                </p>
              )}
            </TabsContent>
          </Tabs>

          {/* Complementary Items with chips */}
          {parsedComplementaries.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">
                {Language === "ar" ? "الاكسسوارات المكملة" : "Complementary Items"}
              </h4>
              <div className="flex flex-wrap gap-2">
                {parsedComplementaries.map((item: string, index: number) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="px-3 py-1 text-sm bg-blue-50 border-blue-100 text-blue-600"
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Contact Buttons */}
          <div className="space-y-4 sticky bottom-4 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleShowPhoneNumber}
                className="flex-1 h-14 bg-red-100 text-red-500 shadow-md hover:bg-red-200 transition-all"
              >
                <Phone className={`${Language === "ar" ? "ml-3" : "mr-3"} text-red-500`} size={20} />
                {showPhoneNumber
                  ? product.phone_number
                  : Language === "ar"
                  ? "إظهار رقم الهاتف"
                  : "Show Phone Number"}
              </Button>

              {product.prices.length > 0 && (
                <Button
                  onClick={() => {
                    const firstPriceId = product.prices[0]?.id;
                    if (typeof firstPriceId === "number") {
                      handleWhatsAppClick(firstPriceId);
                    }
                  }}
                  className="flex-1 h-14 bg-green-100 text-green-700 hover:bg-green-200 shadow-md transition-all"
                >
                  <MessageCircle className={`${Language === "ar" ? "ml-3" : "mr-3"} text-green-700`} size={20} />
                  {Language === "ar" ? "إرسال الطلب عبر واتساب" : "Order via WhatsApp"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-16">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full justify-start bg-transparent p-0 border-b border-gray-200 rounded-none">
            <TabsTrigger 
              value="details" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              {Language === "ar" ? "تفاصيل المنتج" : "Product Details"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-gray-100 shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <h4 className="font-semibold text-lg">
                    {Language === "ar" ? "معلومات المنتج" : "Product Info"}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">{Language === "ar" ? "الفئة الرئيسية" : "Main Category"}</span>
                      <span className="font-medium">{product.main_category?.name?.[Language] || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{Language === "ar" ? "الفئة الفرعية" : "Sub Category"}</span>
                      <span className="font-medium">{product.sub_category?.name?.[Language] || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{Language === "ar" ? "البلد" : "Country"}</span>
                      <span className="font-medium">{product.country?.name?.[Language] || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{Language === "ar" ? "المدينة" : "City"}</span>
                      <span className="font-medium">{product.city?.name?.[Language] || "N/A"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-gray-100 shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <h4 className="font-semibold text-lg">
                    {Language === "ar" ? "المعرفات" : "Identifiers"}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">SKU</span>
                      <span className="font-medium">{product.sku || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">{Language === "ar" ? "الباركود" : "Barcode"}</span>
                      <span className="font-medium">{product.barcode || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">{Language === "ar" ? "الرابط" : "Slug"}</span>
                      <span className="font-medium">{product.slug || "N/A"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Seller Information */}
      <div className="mt-16">
        <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
          <span className="w-4 h-8 bg-gradient-to-r from-black to-white rounded-full mr-3"></span>
          {Language === "ar" ? "معلومات البائع" : "Seller Information"}
        </h3>
        
        <Card className="border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-64 flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-100 p-6 bg-gradient-to-b from-gray-50 to-white">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg mx-auto">
                  <Image
                    src={product.customer.picture_url}
                    alt={product.customer.name}
                    fill
                    className="object-cover"
                    quality={100}
                  />
                </div>
              </div>
              
              <div className="flex-1 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-sm font-medium text-gray-500 mb-2">
                      {Language === "ar" ? "معلومات الاتصال" : "Contact Info"}
                    </h5>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{product.customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{product.customer.email}</span>
                      </div>
                      {product.customer.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <span className="font-medium">{product.customer.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="flex flex-wrap gap-3">
                  {product.prices.length > 0 && (
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2 bg-green-100 text-green-700 hover:bg-green-200 shadow-md transition-all"
                      onClick={() => {
                        const firstPriceId = product.prices[0]?.id;
                        if (typeof firstPriceId === "number") {
                          handleWhatsAppClick(firstPriceId);
                        }
                      }}
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Similar Products */}
      <div className="mt-20">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="w-4 h-8 bg-gradient-to-r from-red to-black-500 rounded-full mr-3"></span>
            {Language === "ar" ? "منتجات مشابهة" : "Similar Products"}
          </h3>
          {similarProducts.length > 0 && (
            <a 
              href={`/ads?main_category_id=${product.main_category.slug}&sub_category_id=${product.sub_category.slug}`} 
              className="text-red hover:text-primary/80 flex items-center gap-1 text-sm font-medium"
            >
              {Language === "ar" ? "عرض الكل" : "View all"}
              <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
            </a>
          )}
        </div>
        
        {similarLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <Card key={item} className="border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="relative aspect-square bg-gray-100">
                    <Skeleton className="w-full h-full" />
                  </div>
                  <div className="p-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="mt-4 flex justify-between items-center">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : similarProducts.length > 0 ? (
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
            navigation={{
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            }}
            pagination={{
              clickable: true,
              el: ".swiper-pagination",
            }}
            className="relative"
          >
            {similarProducts.map((item) => (
              <SwiperSlide key={item.id}>
                <Card 
                  className="border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => router.push(`/products/${item.slug}`)}
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-square bg-gray-100">
                      <Image
                        src={item.picture_url}
                        alt={item.name[Language]}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        quality={100}
                      />
                      <Badge variant="secondary" className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm">
                        <Eye className="w-4 h-4 mr-1" />
                        {Math.floor(Math.random() * 100)} {Language === "ar" ? "مشاهدات" : "views"}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 mb-1 line-clamp-1">
                        {item.name[Language]}
                      </h4>
                      <div className="flex items-center gap-1 mb-3">
                        {renderStars()}
                        <span className="text-xs text-gray-500">(5)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-lg font-bold text-primary">
                            {item.prices[0]?.final_price.toLocaleString()} {Language === "ar" ? "ج.م" : "EGP"}
                          </p>
                          {item.prices[0] && item.prices[0].price > item.prices[0].final_price && (
                            <p className="text-sm text-gray-500 line-through">
                              {item.prices[0].price.toLocaleString()} {Language === "ar" ? "ج.م" : "EGP"}
                            </p>
                          )}
                        </div>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="rounded-full border-gray-200 hover:bg-gray-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/products/${item.slug}`);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </SwiperSlide>
            ))}

            {/* Custom navigation arrows */}
            <div className="swiper-button-prev !-left-2 !-mt-6 rtl:rotate-180 !text-primary hover:!text-primary/80 !hidden sm:!flex" />
            <div className="swiper-button-next !-right-2 !-mt-6 rtl:rotate-180 !text-primary hover:!text-primary/80 !hidden sm:!flex" />
            
            {/* Custom pagination */}
            <div className="swiper-pagination !relative !mt-6 !bottom-0" />
          </Swiper>
        ) : (
          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <p className="text-gray-500">
              {Language === "ar" ? "لا توجد منتجات مشابهة متاحة حالياً" : "No similar products available at the moment"}
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => router.push("/ads")}
            >
              {Language === "ar" ? "تصفح جميع المنتجات" : "Browse all products"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}