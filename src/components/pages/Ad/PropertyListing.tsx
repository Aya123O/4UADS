// "use client";

// import { useEffect, useState } from "react";
// import { MapPin, Phone, MessageCircle, Star, Share2, Heart, ChevronRight } from "lucide-react";
// import { useParams } from "next/navigation";
// import { useLanguage } from "../../../Context/LanguageContext";
// import Image from "next/image";
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb";
// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   CarouselNext,
//   CarouselPrevious,
// } from "@/components/ui/carousel";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// // import { Rating } from "../../../components/ui/";

// interface Product {
//   id: number;
//   slug: string;
//   name: {
//     ar: string;
//     en: string;
//   };
//   price: number;
//   discount: number;
//   final_price: number;
//   quantity: number;
//   description: {
//     ar: string | null;
//     en: string | null;
//   };
//   category_id: number;
//   picture_url: string;
//   category: {
//     id: number;
//     slug: string;
//     name: {
//       ar: string;
//       en: string;
//     };
//     icon_url: string | null;
//   };
//   customer: {
//     id: number;
//     name: string;
//     phone: string;
//     email: string;
//     address: string | null;
//     picture_url: string;
//   };
//   created_at?: string;
//   views?: number;
// }

// export default function ProductDetails() {
//   const [product, setProduct] = useState<Product | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [showPhoneNumber, setShowPhoneNumber] = useState(false);
//   const { Language } = useLanguage();
//   const { slug } = useParams();

//   useEffect(() => {
//     if (slug && typeof slug === "string") {
//       const fetchProduct = async () => {
//         try {
//           setLoading(true);
//           const response = await fetch(
//             `https://new.4youad.com/api/products/${slug}`
//           );
//           const result = await response.json();
//           if (result.data) {
//             setProduct(result.data);
//           } else {
//             setError("Product not found");
//           }
//         } catch (err) {
//           setError("Failed to fetch product details");
//           console.error("Error fetching product:", err);
//         } finally {
//           setLoading(false);
//         }
//       };

//       fetchProduct();
//     }
//   }, [slug]);

//   const handleShowPhoneNumber = () => {
//     setShowPhoneNumber(true);
//   };

//   const handleWhatsAppClick = () => {
//     if (typeof window === "undefined" || !product) return;

//     const currentUrl = window.location.href;
//     const propertyName = product.name[Language];
//     const message =
//       Language === "ar"
//         ? `مرحبًا، أنا مهتم بالمنتج "${propertyName}". هذا هو الرابط: ${currentUrl}. هل يمكنك تزويدي بمزيد من التفاصيل؟`
//         : `Hello, I'm interested in the product "${propertyName}". Here is the link: ${currentUrl}. Can you provide me with more details?`;

//     let phoneNumber = product.customer.phone;
//     if (!phoneNumber.startsWith("+")) {
//       phoneNumber = `+20${phoneNumber}`;
//     }

//     const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
//       message
//     )}`;
//     window.open(whatsappUrl, "_blank");
//   };

//   const formatDate = (dateString?: string) => {
//     if (!dateString) return "";
//     const date = new Date(dateString);
//     return date.toLocaleDateString(Language === "ar" ? "ar-EG" : "en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };

//   if (loading) {
//     return <ProductDetailsSkeleton />;
//   }

//   if (error) {
//     return (
//       <div className="container mx-auto px-4 py-12 text-center">
//         <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md inline-block">
//           {error}
//         </div>
//       </div>
//     );
//   }

//   if (!product) {
//     return (
//       <div className="container mx-auto px-4 py-12 text-center">
//         <div className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded-md inline-block">
//           {Language === "ar" ? "المنتج غير موجود" : "Product not found"}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-gray-50 min-h-screen" dir={Language === "ar" ? "rtl" : "ltr"}>
//       <div className="container mx-auto px-4 py-8">
//         {/* Breadcrumb */}
//         <Breadcrumb className="mb-6">
//           <BreadcrumbItem>
//             <BreadcrumbLink href="/">{Language === "ar" ? "الرئيسية" : "Home"}</BreadcrumbLink>
//           </BreadcrumbItem>
//           <BreadcrumbSeparator />
//           <BreadcrumbItem>
//             <BreadcrumbLink href={`/ads?category_id=${product.category.slug}`}>
//               {product.category.name[Language]}
//             </BreadcrumbLink>
//           </BreadcrumbItem>
//           <BreadcrumbSeparator />
//           <BreadcrumbItem isCurrentPage>
//             <BreadcrumbLink>{product.name[Language]}</BreadcrumbLink>
//           </BreadcrumbItem>
//         </Breadcrumb>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
//           {/* Image Gallery */}
//           <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//             <Carousel className="w-full">
//               <CarouselContent>
//                 <CarouselItem>
//                   <div className="relative aspect-square">
//                     <Image
//                       src={product.picture_url}
//                       alt={product.name[Language]}
//                       fill
//                       className="object-contain"
//                       priority
//                     />
//                     {product.discount > 0 && (
//                       <Badge variant="destructive" className="absolute top-4 right-4 text-sm font-bold">
//                         {product.discount}% {Language === "ar" ? "خصم" : "OFF"}
//                       </Badge>
//                     )}
//                   </div>
//                 </CarouselItem>
//                 {/* Add more CarouselItems if you have multiple images */}
//               </CarouselContent>
//               <CarouselPrevious className="left-4" />
//               <CarouselNext className="right-4" />
//             </Carousel>
//           </div>

//           {/* Product Info */}
//           <div className="space-y-6">
//             <div className="flex justify-between items-start gap-4">
//               <div>
//                 <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
//                   {product.name[Language]}
//                 </h1>
//                 <div className="flex items-center gap-2 mb-4">
//                   <Rating value={4.5} />
//                   <span className="text-sm text-gray-500">
//                     ({Language === "ar" ? "5 تقييمات" : "5 reviews"})
//                   </span>
//                 </div>
//               </div>
//               <div className="flex gap-2">
//                 <Button variant="ghost" size="icon" className="rounded-full">
//                   <Share2 className="w-5 h-5" />
//                 </Button>
//                 <Button variant="ghost" size="icon" className="rounded-full">
//                   <Heart className="w-5 h-5" />
//                 </Button>
//               </div>
//             </div>

//             {/* Price Section */}
//             <div className="bg-gray-50 p-4 rounded-lg">
//               <div className="flex items-center gap-4 mb-2">
//                 <span className="text-3xl font-bold text-primary">
//                   {product.final_price} {Language === "ar" ? "ج.م" : "EGP"}
//                 </span>
//                 {product.discount > 0 && (
//                   <span className="text-lg line-through text-gray-500">
//                     {product.price} {Language === "ar" ? "ج.م" : "EGP"}
//                   </span>
//                 )}
//               </div>
//               {product.quantity > 0 ? (
//                 <div className="text-green-600 font-medium">
//                   {Language === "ar" ? "متوفر في المخزون" : "In Stock"} ({product.quantity})
//                 </div>
//               ) : (
//                 <div className="text-red-600 font-medium">
//                   {Language === "ar" ? "غير متوفر" : "Out of Stock"}
//                 </div>
//               )}
//             </div>

//             {/* Key Features */}
//             <div className="grid grid-cols-2 gap-4">
//               <div className="flex items-center gap-2 text-sm">
//                 <span className="font-medium text-gray-500">
//                   {Language === "ar" ? "الفئة:" : "Category:"}
//                 </span>
//                 <span className="font-medium">{product.category.name[Language]}</span>
//               </div>
//               {product.created_at && (
//                 <div className="flex items-center gap-2 text-sm">
//                   <span className="font-medium text-gray-500">
//                     {Language === "ar" ? "تاريخ النشر:" : "Posted:"}
//                   </span>
//                   <span>{formatDate(product.created_at)}</span>
//                 </div>
//               )}
//               {product.views && (
//                 <div className="flex items-center gap-2 text-sm">
//                   <span className="font-medium text-gray-500">
//                     {Language === "ar" ? "المشاهدات:" : "Views:"}
//                   </span>
//                   <span>{product.views}</span>
//                 </div>
//               )}
//             </div>

//             {/* Action Buttons */}
//             <div className="space-y-3 pt-4">
//               <Button
//                 onClick={handleShowPhoneNumber}
//                 className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md"
//               >
//                 <Phone className={Language === "ar" ? "ml-2" : "mr-2"} size={18} />
//                 {showPhoneNumber
//                   ? product.customer.phone
//                   : Language === "ar"
//                   ? "إظهار رقم الهاتف"
//                   : "Show Phone Number"}
//               </Button>
//               <Button
//                 onClick={handleWhatsAppClick}
//                 className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md"
//               >
//                 <MessageCircle className={Language === "ar" ? "ml-2" : "mr-2"} size={18} />
//                 {Language === "ar" ? "تواصل عبر واتساب" : "Contact via WhatsApp"}
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* Product Details Tabs */}
//         <div className="mt-12">
//           <Tabs defaultValue="description" className="w-full">
//             <TabsList className="grid w-full grid-cols-2 max-w-xs">
//               <TabsTrigger value="description">
//                 {Language === "ar" ? "الوصف" : "Description"}
//               </TabsTrigger>
//               <TabsTrigger value="seller">
//                 {Language === "ar" ? "البائع" : "Seller"}
//               </TabsTrigger>
//             </TabsList>
//             <TabsContent value="description" className="mt-6">
//               {product.description[Language] ? (
//                 <div className="bg-white p-6 rounded-lg shadow-sm">
//                   <h3 className="text-lg font-semibold mb-4">
//                     {Language === "ar" ? "تفاصيل المنتج" : "Product Details"}
//                   </h3>
//                   <p className="text-gray-700 leading-relaxed whitespace-pre-line">
//                     {product.description[Language]}
//                   </p>
//                 </div>
//               ) : (
//                 <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500">
//                   {Language === "ar" ? "لا يوجد وصف متاح" : "No description available"}
//                 </div>
//               )}
//             </TabsContent>
//             <TabsContent value="seller" className="mt-6">
//               <SellerCard product={product} Language={Language} />
//             </TabsContent>
//           </Tabs>
//         </div>

//         {/* Similar Products */}
//         <div className="mt-16">
//           <div className="flex justify-between items-center mb-6">
//             <h3 className="text-xl font-semibold">
//               {Language === "ar" ? "منتجات مشابهة" : "Similar Products"}
//             </h3>
//             <Button variant="link" className="text-primary p-0">
//               {Language === "ar" ? "عرض الكل" : "View all"} <ChevronRight className="w-4 h-4" />
//             </Button>
//           </div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//             {/* Placeholder for similar products */}
//             <div className="text-center py-12 text-gray-400">
//               {Language === "ar" ? "سيتم عرض منتجات مشابهة هنا" : "Similar products will be shown here"}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function SellerCard({ product, Language }: { product: Product; Language: string }) {
//   return (
//     <Card className="border-0 shadow-sm">
//       <CardContent className="p-6">
//         <div className="flex flex-col sm:flex-row items-start gap-6">
//           <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md">
//             <Image
//               src={product.customer.picture_url}
//               alt={product.customer.name}
//               fill
//               className="object-cover"
//             />
//           </div>
//           <div className="flex-1">
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//               <div>
//                 <h4 className="font-bold text-lg">{product.customer.name}</h4>
//                 <div className="flex items-center gap-2 mt-2">
//                   <Rating value={4.8} size="sm" />
//                   <span className="text-sm font-medium text-gray-600">
//                     4.8 ({Language === "ar" ? "12 تقييم" : "12 reviews"})
//                   </span>
//                 </div>
//               </div>
//               <div className="flex gap-2">
//                 <Button variant="outline" size="sm" className="gap-2">
//                   <Phone className="w-4 h-4" />
//                   {Language === "ar" ? "اتصل" : "Call"}
//                 </Button>
//                 <Button variant="outline" size="sm" className="gap-2">
//                   <MessageCircle className="w-4 h-4" />
//                   {Language === "ar" ? "رسالة" : "Message"}
//                 </Button>
//               </div>
//             </div>
            
//             {product.customer.address && (
//               <div className="mt-4 flex items-start gap-2 text-gray-600">
//                 <MapPin className="w-5 h-5 mt-0.5 text-gray-400 flex-shrink-0" />
//                 <p>{product.customer.address}</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// function ProductDetailsSkeleton() {
//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
//         {/* Image Gallery Skeleton */}
//         <div className="space-y-4">
//           <Skeleton className="aspect-square w-full rounded-xl" />
//           <div className="grid grid-cols-4 gap-3">
//             {[1, 2, 3, 4].map((i) => (
//               <Skeleton key={i} className="aspect-square rounded-md" />
//             ))}
//           </div>
//         </div>
        
//         {/* Product Info Skeleton */}
//         <div className="space-y-6">
//           <div className="space-y-3">
//             <Skeleton className="h-8 w-3/4" />
//             <Skeleton className="h-6 w-1/2" />
//           </div>
          
//           <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
//             <div className="flex gap-4">
//               <Skeleton className="h-8 w-24" />
//               <Skeleton className="h-8 w-20" />
//             </div>
//             <Skeleton className="h-5 w-32" />
//           </div>
          
//           <div className="grid grid-cols-2 gap-4">
//             <Skeleton className="h-5 w-full" />
//             <Skeleton className="h-5 w-full" />
//             <Skeleton className="h-5 w-full" />
//             <Skeleton className="h-5 w-full" />
//           </div>
          
//           <div className="space-y-3 pt-4">
//             <Skeleton className="h-12 w-full" />
//             <Skeleton className="h-12 w-full" />
//           </div>
//         </div>
//       </div>
      
//       {/* Tabs Skeleton */}
//       <div className="mt-12 space-y-6">
//         <div className="flex gap-4">
//           <Skeleton className="h-10 w-32" />
//           <Skeleton className="h-10 w-32" />
//         </div>
//         <Skeleton className="h-48 w-full" />
//       </div>
      
//       {/* Similar Products Skeleton */}
//       <div className="mt-16 space-y-6">
//         <Skeleton className="h-8 w-48" />
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           {[1, 2, 3, 4].map((i) => (
//             <Skeleton key={i} className="aspect-square rounded-lg" />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }