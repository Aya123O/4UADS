"use client";

import React, { useEffect, useState } from 'react';
import { ShoppingCart, X, Plus, Minus, ArrowRight, CheckCircle, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/Context/LanguageContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

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
  specification_id: number | null;
  specification_detail_id: number | null;
  whatsappNumber?: string;
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

interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  whatsappNumber: string;
  status: 'pending' | 'completed' | 'cancelled';
}

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
    address: "Address",
    notes: "Delivery Notes",
    required: "Required",
    confirmOrder: "Confirm Order",
    cancel: "Cancel",
    orderSuccess: "Order Placed Successfully!",
    orderMessage: "Thank you for your purchase. Your order has been placed.",
    viewOrder: "View Order Details",
    continueShopping: "Continue Shopping",
    orderError: "Failed to place order. Please try again.",
    invalidPhone: "Please enter a valid Egyptian phone number",
    orderDetails: "Order Details",
    orderDate: "Order Date",
    orderStatus: "Status",
    orderTotal: "Order Total",
    pending: "Pending",
    completed: "Completed",
    cancelled: "Cancelled",
    openWhatsApp: "Open WhatsApp"
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
    address: "العنوان",
    notes: "ملاحظات التوصيل",
    required: "مطلوب",
    confirmOrder: "تأكيد الطلب",
    cancel: "إلغاء",
    orderSuccess: "تم تقديم الطلب بنجاح!",
    orderMessage: "شكرًا لك على شرائك. تم تقديم طلبك.",
    viewOrder: "عرض تفاصيل الطلب",
    continueShopping: "مواصلة التسوق",
    orderError: "فشل في تقديم الطلب. يرجى المحاولة مرة أخرى.",
    invalidPhone: "الرجاء إدخال رقم هاتف مصري صحيح",
    orderDetails: "تفاصيل الطلب",
    orderDate: "تاريخ الطلب",
    orderStatus: "الحالة",
    orderTotal: "إجمالي الطلب",
    pending: "قيد الانتظار",
    completed: "مكتمل",
    cancelled: "ملغى",
    openWhatsApp: "فتح واتساب"
  }
};

export default function CartPage() {
  const { Language } = useLanguage();
  const content = cartContent[Language];
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [formErrors, setFormErrors] = useState({
    name: false,
    phone: false,
    address: false
  });
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const isRTL = Language === "ar";
  const router = useRouter();

  // Load cart items from localStorage on component mount
  useEffect(() => {
    const loadCart = () => {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (e) {
          console.error("Failed to parse cart items", e);
          localStorage.removeItem('cart');
        }
      }
    };

    loadCart();
    
    const handleCartUpdate = () => {
      loadCart();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  // Save cart items to localStorage whenever they change
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

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
  };

  const removeItem = (id: number) => {
    const updatedItems = cartItems.filter(item => item.id !== id);
    setCartItems(updatedItems);
  };

  const subtotal = cartItems.reduce(
    (total, item) => total + (item.price * item.quantity), 
    0
  );
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  const validateForm = () => {
    const phoneRegex = /^01[0-2|5]{1}[0-9]{8}$/;
    const isPhoneValid = phoneRegex.test(customerPhone);
    
    const errors = {
      name: customerName.trim() === '',
      phone: customerPhone.trim() === '' || !isPhoneValid,
      address: customerAddress.trim() === ''
    };
    
    setFormErrors(errors);
    return !errors.name && !errors.phone && !errors.address;
  };

  const handleCheckout = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Prepare the order data according to the API requirements
      const orderData = {
        product_id: cartItems.map(item => item.productId),
        specification_id: cartItems.map(item => item.specification_id || 1),
        specification_detail_id: cartItems.map(item => item.specification_detail_id || 1),
        quantity: cartItems.map(item => item.quantity),
        price: cartItems.map(item => item.price),
        full_name: customerName,
        phone_number: customerPhone,
        address: customerAddress,
        notes: customerNotes
      };

      // Send the order to the API
      const response = await fetch('https://new.4youad.com/api/orders/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      // Get the first WhatsApp number from cart items (assuming all items have same WhatsApp)
      const whatsappNumber = cartItems[0]?.whatsappNumber || '';

      // Create order object for local storage
      const newOrder: Order = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        items: [...cartItems],
        total,
        customerName,
        customerPhone,
        customerAddress,
        whatsappNumber,
        status: 'pending'
      };

      // Save order to localStorage
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.unshift(newOrder);
      localStorage.setItem('orders', JSON.stringify(orders));

      // Clear cart
      clearCart();
      
      // Set current order for display
      setCurrentOrder(newOrder);
      
      // Show success
      setIsOrderSuccess(true);
      setIsCheckoutModalOpen(false);

      // Prepare WhatsApp message
      const orderSummary = newOrder.items.map(item => 
        `- ${item.name} (${item.specDetail || ''}): ${item.quantity} × ${item.price.toLocaleString()} EGP = ${(item.price * item.quantity).toLocaleString()} EGP`
      ).join('\n');

      const whatsappMessage = encodeURIComponent(
        Language === 'ar' 
          ? `مرحبًا، لقد أكملت طلبًا جديدًا:\n\n${orderSummary}\n\nإجمالي الطلب: ${total.toLocaleString()} ج.م\n\nاسم العميل: ${customerName}\nرقم الهاتف: ${customerPhone}\nالعنوان: ${customerAddress}\n\nالرجاء تأكيد الطلب.`
          : `Hello, I've completed a new order:\n\n${orderSummary}\n\nOrder Total: ${total.toLocaleString()} EGP\n\nCustomer Name: ${customerName}\nPhone: ${customerPhone}\nAddress: ${customerAddress}\n\nPlease confirm the order.`
      );

      // Open WhatsApp with the order details
      window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, '_blank');

    } catch (error) {
      console.error('Order error:', error);
      toast.error(content.orderError);
    } finally {
      setIsLoading(false);
    }
  };

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
            <Link href="/">
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
                  const productSpecs = parseSpecifications(item.fullProductData.product.specifications);
                  
                  return (
                    <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6">
                      <Link 
                        href={`/products/${item.slug}`}
                        className="bg-gray-100 rounded-xl w-24 h-24 flex-shrink-0 flex items-center justify-center overflow-hidden"
                      >
                        <Image
                          src={item.image || "/assets/images/default.png"}
                          alt={item.name}
                          width={96}
                          height={96}
                          className="object-cover w-full h-full"
                        />
                      </Link>
                      
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <Link href={`/products/${item.slug}`}>
                              <h3 className="font-medium text-lg mb-1 hover:text-primary transition-colors">
                                {item.name}
                              </h3>
                            </Link>
                            
                            <div className="flex flex-wrap gap-2 mb-2">
                              {item.specName && item.specDetail && (
                                <p className="text-gray-600 text-sm">
                                  <span className="font-medium">{item.specName}:</span> {item.specDetail}
                                </p>
                              )}
                            </div>
                            
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
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
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
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.phone === true ? content.required : content.invalidPhone}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="address" className="block mb-2">
                    {content.address} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="address"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className={`w-full ${formErrors.address ? 'border-red-500' : ''}`}
                    placeholder={Language === 'ar' ? 'أدخل عنوانك' : 'Enter your address'}
                  />
                  {formErrors.address && (
                    <p className="text-red-500 text-sm mt-1">{content.required}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="notes" className="block mb-2">
                    {content.notes}
                  </Label>
                  <Input
                    id="notes"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full"
                    placeholder={Language === 'ar' ? 'ملاحظات حول التوصيل (اختياري)' : 'Delivery notes (optional)'}
                  />
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
                    disabled={isLoading}
                  >
                    {content.cancel}
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleCheckout}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {content.confirmOrder}
                      </div>
                    ) : (
                      content.confirmOrder
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Order Success Modal */}
      {isOrderSuccess && currentOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">{content.orderSuccess}</h3>
              <p className="text-gray-600 mb-6">{content.orderMessage}</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 mb-6">
              <h4 className="font-bold text-lg mb-4">{content.orderDetails}</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{content.orderDate}:</span>
                  <span>{new Date(currentOrder.date).toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">{content.orderStatus}:</span>
                  <span className="capitalize">
                    {currentOrder.status === 'pending' && content.pending}
                    {currentOrder.status === 'completed' && content.completed}
                    {currentOrder.status === 'cancelled' && content.cancelled}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">{content.orderTotal}:</span>
                  <span className="font-bold">
                    {currentOrder.total.toLocaleString()} {Language === "ar" ? "ج.م" : "EGP"}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-bold text-lg mb-3">{content.items}</h4>
              
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {currentOrder.items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-start border-b border-gray-100 pb-4">
                    <div className="bg-gray-100 rounded-lg w-16 h-16 flex-shrink-0">
                      <Image
                        src={item.image || "/assets/images/default.png"}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full rounded-lg"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h5 className="font-medium">{item.name}</h5>
                      {item.specDetail && (
                        <p className="text-sm text-gray-600">{item.specDetail}</p>
                      )}
                      <p className="text-sm">
                        {item.quantity} × {item.price.toLocaleString()} {Language === "ar" ? "ج.م" : "EGP"}
                      </p>
                    </div>
                    
                    <div className="font-medium">
                      {(item.price * item.quantity).toLocaleString()} {Language === "ar" ? "ج.م" : "EGP"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsOrderSuccess(false);
                  router.push('/');
                }}
              >
                {content.continueShopping}
              </Button>
              {currentOrder.whatsappNumber && (
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    const orderSummary = currentOrder.items.map(item => 
                      `- ${item.name} (${item.specDetail || ''}): ${item.quantity} × ${item.price.toLocaleString()} EGP = ${(item.price * item.quantity).toLocaleString()} EGP`
                    ).join('\n');

                    const whatsappMessage = encodeURIComponent(
                      Language === 'ar' 
                        ? `مرحبًا، لقد أكملت طلبًا جديدًا:\n\n${orderSummary}\n\nإجمالي الطلب: ${currentOrder.total.toLocaleString()} ج.م\n\nاسم العميل: ${currentOrder.customerName}\nرقم الهاتف: ${currentOrder.customerPhone}\nالعنوان: ${currentOrder.customerAddress}\n\nالرجاء تأكيد الطلب.`
                        : `Hello, I've completed a new order:\n\n${orderSummary}\n\nOrder Total: ${currentOrder.total.toLocaleString()} EGP\n\nCustomer Name: ${currentOrder.customerName}\nPhone: ${currentOrder.customerPhone}\nAddress: ${currentOrder.customerAddress}\n\nPlease confirm the order.`
                    );

                    window.open(`https://wa.me/${currentOrder.whatsappNumber}?text=${whatsappMessage}`, '_blank');
                  }}
                >
                  <MessageCircle className={`${isRTL ? 'ml-2' : 'mr-2'} w-4 h-4`} />
                  {content.openWhatsApp}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}