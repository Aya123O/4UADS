"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { useLanguage } from "@/Context/LanguageContext";

const footerContent = {
  ar: {
    sections: {
      explore: "استكشف",
      services: "خدماتنا",
      support: "الدعم",
      contact: "اتصل بنا"
    },
    links: {
      newCars: "سيارات جديدة",
      usedCars: "سيارات مستعملة",
      luxury: "سيارات فاخرة",
      parts: "قطع غيار",
      financing: "التمويل",
      insurance: "التأمين",
      testDrive: "تجربة قيادة",
      faq: "الأسئلة الشائعة",
      contact: "اتصل بنا",
      privacy: "سياسة الخصوصية",
      terms: "الشروط والأحكام"
    },
    newsletter: {
      title: "اشترك في نشرتنا",
      subtitle: "احصل على أحدث العروض والموديلات مباشرة إلى بريدك",
      placeholder: "بريدك الإلكتروني",
      subscribe: "اشتراك"
    },
    copyright: "© 2024 4YOUAD. جميع الحقوق محفوظة."
  },
  en: {
    sections: {
      explore: "Explore",
      services: "Our Services",
      support: "Support",
      contact: "Contact Us"
    },
    links: {
      newCars: "New Cars",
      usedCars: "Used Cars",
      luxury: "Luxury Cars",
      parts: "Auto Parts",
      financing: "Financing",
      insurance: "Insurance",
      testDrive: "Test Drive",
      faq: "FAQ",
      contact: "Contact Us",
      privacy: "Privacy Policy",
      terms: "Terms & Conditions"
    },
    newsletter: {
      title: "Subscribe to Newsletter",
      subtitle: "Get the latest offers and models delivered to your inbox",
      placeholder: "Your email",
      subscribe: "Subscribe"
    },
    copyright: "© 2024 4YOUAD. All rights reserved."
  }
};

export default function Footer() {
  const { Language } = useLanguage();
  const currentContent = footerContent[Language];
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://new.4youad.com/api/settings/business");
        const businessData = await response.json();
        setBusinessInfo(businessData.data);
        
        const socialResponse = await fetch("https://new.4youad.com/api/settings/social");
        const socialData = await socialResponse.json();
        setSocialLinks(socialData.data);
      } catch (error) {
        console.error("Error fetching footer data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return <Facebook className="h-5 w-5 " />;
      case 'twitter':
        return <Twitter className="h-5 w-5" />;
      case 'instagram':
        return <Instagram className="h-5 w-5" />;
      case 'youtube':
        return <Youtube className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <footer 
      className="bg-black text-white pt-16 pb-8 border-t-4 border-red-600" 
      dir={Language === "ar" ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-red-600">4YOU</span>
              <span className="text-2xl font-bold text-white">AD</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              {Language === "ar" 
                ? "منصة رائدة للإعلانات المبوبة في الشرق الأوسط"
                : "The leading classifieds platform in the Middle East"}
            </p>
            {!loading && socialLinks.length > 0 && (
              <div className="flex space-x-3 rtl:space-x-reverse">
                {socialLinks.map((link) => (
                  <a 
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 hover:bg-red-600 text-white p-2  mr-2 rounded-full transition-all duration-300 hover:scale-110"
                    aria-label={link.platform}
                  >
                    {getSocialIcon(link.platform)}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white border-b border-gray-800 pb-2">
              {currentContent.sections.explore}
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/cars/new", text: currentContent.links.newCars },
                { href: "/cars/used", text: currentContent.links.usedCars },
                { href: "/cars/luxury", text: currentContent.links.luxury },
                { href: "/parts", text: currentContent.links.parts },
              ].map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href} 
                    className="text-gray-300 hover:text-red-500 transition-colors duration-300 flex items-center group"
                  >
                    <ArrowRight 
                      className={`h-4 w-4 text-red-600 mr-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ${Language === "ar" ? "rotate-180" : ""}`} 
                    />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {item.text}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white border-b border-gray-800 pb-2">
              {currentContent.sections.services}
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/services/financing", text: currentContent.links.financing },
                { href: "/services/insurance", text: currentContent.links.insurance },
                { href: "/services/test-drive", text: currentContent.links.testDrive },
              ].map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href} 
                    className="text-gray-300 hover:text-red-500 transition-colors duration-300 flex items-center group"
                  >
                    <ArrowRight 
                      className={`h-4 w-4 text-red-600 mr-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ${Language === "ar" ? "rotate-180" : ""}`} 
                    />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {item.text}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-6 text-white border-b border-gray-800 pb-2">
                {currentContent.sections.contact}
              </h3>
              {!loading && businessInfo && (
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3 rtl:space-x-reverse">
                    <Phone className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <a 
                      href={`tel:${businessInfo.business_phone}`} 
                      className="text-gray-300 hover:text-red-500 transition-colors duration-300 hover:underline"
                    >
                      {businessInfo.business_phone}
                    </a>
                  </li>
                  <li className="flex items-start space-x-3 rtl:space-x-reverse">
                    <Mail className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <a 
                      href={`mailto:${businessInfo.business_email}`} 
                      className="text-gray-300 hover:text-red-500 transition-colors duration-300 hover:underline"
                    >
                      {businessInfo.business_email}
                    </a>
                  </li>
                  {businessInfo.address && (
                    <li className="flex items-start space-x-3 rtl:space-x-reverse">
                      <MapPin className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 hover:text-red-500 transition-colors duration-300">
                        {businessInfo.address}
                      </span>
                    </li>
                  )}
                </ul>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">
                {currentContent.newsletter.title}
              </h4>
              <p className="text-gray-300 text-sm">
                {currentContent.newsletter.subtitle}
              </p>
              <form className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder={currentContent.newsletter.placeholder}
                  className="px-4 py-2 text-sm rounded-md w-full focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 flex-grow border border-gray-300 transition-all duration-300 hover:border-red-400"
                  required
                />
                <button 
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm rounded-md transition-all duration-300 whitespace-nowrap hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  {currentContent.newsletter.subscribe}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              {currentContent.copyright}
            </p>
            <div className="flex space-x-6 rtl:space-x-reverse">
              <Link 
                href="/privacy" 
                className="text-gray-400 hover:text-red-500 text-sm transition-colors duration-300 font-medium hover:underline"
              >
                {currentContent.links.privacy}
              </Link>
              <Link 
                href="/terms" 
                className="text-gray-400 hover:text-red-500 text-sm transition-colors duration-300 font-medium hover:underline"
              >
                {currentContent.links.terms}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}