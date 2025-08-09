"use client";

import React, { useEffect, useState } from 'react';
import { ShoppingCart, X, Plus, Minus, ArrowRight, CreditCard, Package, ChevronRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/Context/LanguageContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Define interfaces for product data
interface ProductSpecification {
  id: number;
  name: {
    ar: string;
    en: string;
  };
  details: {
    id: number;
    name: {
      ar: string;
      en: string;
    };
  }[];
}

interface ProductPrice {
  id: number;
  price: number;
  discount: number;
  final_price: number;
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
}

interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
  specName: string;
  specDetail: string;
  color?: string;
  fullProductData: {
    product: {
      id: number;
      name: {
        ar: string;
        en: string;
      };
      prices: ProductPrice[];
      specifications: string;
      product_specifications: ProductSpecification[];
    };
    selectedPriceId: number;
  };
}

// Language content for the cart page
const cartContent = {
  en: {
    title: "Your Shopping Cart",
    empty: "Your cart is empty",
    continue: "Continue Shopping",
    product: "Product",
    quantity: "Quantity",
    price: "Price",
    total: "Total",
    grandTotal: "Grand Total",
    clear: "Clear Cart",
    checkout: "Proceed to Checkout",
    summary: "Order Summary",
    subtotal: "Subtotal",
    shipping: "Shipping",
    free: "Free",
    items: "items",
    remove: "Remove",
    color: "Color",
    storage: "Storage",
    specs: "Specifications",
    checkoutTitle: "Complete Your Purchase",
    name: "Full Name",
    phone: "Phone Number",
    required: "Required",
    confirmOrder: "Confirm Order",
    cancel: "Cancel",
    orderSuccess: "Order Placed Successfully!",
    orderMessage: "Thank you for your purchase. Your order has been placed.",
    viewOrders: "View My Orders",
    continueShopping: "Continue Shopping"
  },
  ar: {
    title: "سلة التسوق الخاصة بك",
    empty: "سلة التسوق فارغة",
    continue: "مواصلة التسوق",
    product: "المنتج",
    quantity: "الكمية",
    price: "السعر",
    total: "المجموع",
    grandTotal: "المجموع الكلي",
    clear: "إفراغ السلة",
    checkout: "إتمام الطلب",
    summary: "ملخص الطلب",
    subtotal: "المجموع الفرعي",
    shipping: "الشحن",
    free: "مجاني",
    items: "منتجات",
    remove: "إزالة",
    color: "اللون",
    storage: "المساحة",
    specs: "المواصفات",
    checkoutTitle: "أكمل عملية الشراء",
    name: "الاسم بالكامل",
    phone: "رقم الهاتف",
    required: "مطلوب",
    confirmOrder: "تأكيد الطلب",
    cancel: "إلغاء",
    orderSuccess: "تم تقديم الطلب بنجاح!",
    orderMessage: "شكرًا لك على شرائك. تم تقديم طلبك.",
    viewOrders: "عرض طلباتي",
    continueShopping: "مواصلة التسوق"
  }
};

export default function CartPage() {
  const { Language } = useLanguage();
  const content = cartContent[Language];
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [formErrors, setFormErrors] = useState({ name: false, phone: false });
  const isRTL = Language === "ar";
  const router = useRouter();

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    
    // Listen for cart updates from other components
    const handleCartUpdate = () => {
      const updatedCart = localStorage.getItem('cart');
      if (updatedCart) {
        setCartItems(JSON.parse(updatedCart));
      }
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const clearCart = () => {
    localStorage.removeItem('cart');
    setCartItems([]);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedItems = cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (id: number) => {
    const updatedItems = cartItems.filter(item => item.id !== id);
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const subtotal = cartItems.reduce(
    (total, item) => total + (item.price * item.quantity), 
    0
  );
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  const validateForm = () => {
    const errors = {
      name: customerName.trim() === '',
      phone: customerPhone.trim() === ''
    };
    
    setFormErrors(errors);
    return !errors.name && !errors.phone;
  };

  const handleCheckout = () => {
    if (validateForm()) {
      // In a real app, you would send this data to your backend
      const orderData = {
        customerName,
        customerPhone,
        items: cartItems,
        total,
        date: new Date().toISOString()
      };
      
      // Save order to localStorage for demo purposes
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push(orderData);
      localStorage.setItem('orders', JSON.stringify(orders));
      
      // Clear cart
      clearCart();
      
      // Show success
      setIsOrderSuccess(true);
    }
  };

  // Parse JSON specifications
  const parseSpecifications = (specsString: string) => {
    try {
      return JSON.parse(specsString);
    } catch (e) {
      return [];
    }
  };

  return (
    <div 
      className="container mx-auto px-4 py-8"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <ShoppingCart className="w-8 h-8" />
        {content.title}
      </h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 inline-block">
            <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-xl mb-4">{content.empty}</p>
            <Link href="/products">
              <Button variant="default" className="px-6 py-6 text-lg">
                {content.continue}
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">
                    {cartItems.length} {content.items}
                  </h2>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={clearCart}
                    className="flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    {content.clear}
                  </Button>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => {
                  // Parse specifications from product data
                  const productSpecs = parseSpecifications(item.fullProductData.product.specifications);
                  
                  return (
                    <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6">
                      <div className="bg-gray-100 rounded-xl w-24 h-24 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={96}
                          height={96}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium text-lg mb-1">{item.name}</h3>
                            
                            {/* Display selected specification */}
                            <div className="flex flex-wrap gap-2 mb-2">
                              {item.specName && item.specDetail && (
                                <p className="text-gray-600 text-sm">
                                  <span className="font-medium">{item.specName}:</span> {item.specDetail}
                                </p>
                              )}
                            </div>
                            
                            {/* Display all specifications */}
                            {productSpecs.length > 0 && (
                              <div className="mt-3">
                                <h4 className="text-sm font-medium text-gray-700 mb-1">
                                  {content.specs}:
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {productSpecs.map((spec: any, index: number) => (
                                    <div key={index} className="text-gray-600 text-sm">
                                      <span className="font-medium">{spec.key}:</span> {spec.value}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-10 w-10 rounded-none border-r border-gray-200 hover:bg-gray-100"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <div className="h-10 w-12 flex items-center justify-center text-base font-medium">
                              {item.quantity}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-10 w-10 rounded-none border-l border-gray-200 hover:bg-gray-100"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">
                              {(item.price * item.quantity).toLocaleString()} {Language === "ar" ? "ج.م" : "EGP"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {item.price.toLocaleString()} {Language === "ar" ? "ج.م" : "EGP"} × {item.quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-xl font-bold mb-6 pb-4 border-b border-gray-200">
                {content.summary}
              </h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">{content.subtotal}</span>
                  <span className="font-medium">{subtotal.toLocaleString()} {Language === "ar" ? "ج.م" : "EGP"}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">{content.shipping}</span>
                  <span className="font-medium text-green-600">{content.free}</span>
                </div>
                
                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <span className="text-lg font-semibold">{content.grandTotal}</span>
                  <span className="text-xl font-bold text-primary">
                    {total.toLocaleString()} {Language === "ar" ? "ج.م" : "EGP"}
                  </span>
                </div>
              </div>
              
              <Button 
                size="lg" 
                className="w-full py-7 text-base"
                onClick={() => setIsCheckoutModalOpen(true)}
              >
                {content.checkout}
                <ArrowRight className={`${isRTL ? 'mr-3 rotate-180' : 'ml-3'} w-5 h-5`} />
              </Button>
              
              <Link href="/products">
                <Button 
                  variant="outline" 
                  className="w-full mt-3 py-6 text-base"
                >
                  {content.continue}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{content.checkoutTitle}</h3>
                <button 
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="block mb-2">
                    {content.name} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={`w-full ${formErrors.name ? 'border-red-500' : ''}`}
                    placeholder={Language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{content.required}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="phone" className="block mb-2">
                    {content.phone} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className={`w-full ${formErrors.phone ? 'border-red-500' : ''}`}
                    placeholder={Language === 'ar' ? 'أدخل رقم هاتفك' : 'Enter your phone number'}
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-sm mt-1">{content.required}</p>
                  )}
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-medium mb-3">{content.summary}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>{content.subtotal}</span>
                      <span>{subtotal.toLocaleString()} {Language === "ar" ? "ج.م" : "EGP"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{content.shipping}</span>
                      <span className="text-green-600">{content.free}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 font-bold">
                      <span>{content.grandTotal}</span>
                      <span>{total.toLocaleString()} {Language === "ar" ? "ج.م" : "EGP"}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsCheckoutModalOpen(false)}
                  >
                    {content.cancel}
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleCheckout}
                  >
                    {content.confirmOrder}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Order Success Modal */}
      {isOrderSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full text-center p-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">{content.orderSuccess}</h3>
            <p className="text-gray-600 mb-6">{content.orderMessage}</p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsOrderSuccess(false);
                  router.push('/');
                }}
              >
                {content.continueShopping}
              </Button>
              <Button
                onClick={() => {
                  setIsOrderSuccess(false);
                  router.push('/orders');
                }}
              >
                {content.viewOrders}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}