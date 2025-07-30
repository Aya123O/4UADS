"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Globe } from "lucide-react";
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
    <footer className="bg-gray-900 text-white pt-12 pb-6" dir={Language === "ar" ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-6">
              <span className="text-2xl font-bold text-blue-400">4YOU</span>
              <span className="text-2xl font-bold text-white">AD</span>
            </div>
            <p className="text-gray-400 mb-6">
              {Language === "ar" 
                ? "منصة رائدة للإعلانات المبوبة في الشرق الأوسط"
                : "The leading classifieds platform in the Middle East"}
            </p>
            {!loading && socialLinks.length > 0 && (
              <div className="flex space-x-4 rtl:space-x-reverse m-3">
                {socialLinks.map((link) => (
                  <a 
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 hover:bg-blue-600 transition-colors p-2 rounded-full me-3"
                  >
                    {getSocialIcon(link.platform)}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">{currentContent.sections.explore}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/cars/new" className="text-gray-400 hover:text-blue-400 transition-colors">
                  {currentContent.links.newCars}
                </Link>
              </li>
              <li>
                <Link href="/cars/used" className="text-gray-400 hover:text-blue-400 transition-colors">
                  {currentContent.links.usedCars}
                </Link>
              </li>
              <li>
                <Link href="/cars/luxury" className="text-gray-400 hover:text-blue-400 transition-colors">
                  {currentContent.links.luxury}
                </Link>
              </li>
              <li>
                <Link href="/parts" className="text-gray-400 hover:text-blue-400 transition-colors">
                  {currentContent.links.parts}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">{currentContent.sections.services}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/services/financing" className="text-gray-400 hover:text-blue-400 transition-colors">
                  {currentContent.links.financing}
                </Link>
              </li>
              <li>
                <Link href="/services/insurance" className="text-gray-400 hover:text-blue-400 transition-colors">
                  {currentContent.links.insurance}
                </Link>
              </li>
              <li>
                <Link href="/services/test-drive" className="text-gray-400 hover:text-blue-400 transition-colors">
                  {currentContent.links.testDrive}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">{currentContent.sections.contact}</h3>
            {!loading && businessInfo && (
              <ul className="space-y-3 mb-6">
                <li className="flex items-start space-x-3 rtl:space-x-reverse">
                  <Phone className="h-5 w-5 text-blue-400 mt-0.5" />
                  <a href={`tel:${businessInfo.business_phone}`} className="text-gray-400 hover:text-blue-400">
                    {businessInfo.business_phone}
                  </a>
                </li>
                <li className="flex items-start space-x-3 rtl:space-x-reverse">
                  <Mail className="h-5 w-5 text-blue-400 mt-0.5" />
                  <a href={`mailto:${businessInfo.business_email}`} className="text-gray-400 hover:text-blue-400">
                    {businessInfo.business_email}
                  </a>
                </li>
                {businessInfo.address && (
                  <li className="flex items-start space-x-3 rtl:space-x-reverse">
                    <MapPin className="h-5 w-5 text-blue-400 mt-0.5" />
                    <span className="text-gray-400">
                      {businessInfo.address}
                    </span>
                  </li>
                )}
              </ul>
            )}

            <div>
              <h4 className="text-sm font-semibold mb-2 text-white">{currentContent.newsletter.title}</h4>
              <p className="text-gray-400 text-sm mb-4">{currentContent.newsletter.subtitle}</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder={currentContent.newsletter.placeholder}
                  className="px-4 py-2 text-sm rounded-l-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-r-md transition-colors">
                  {currentContent.newsletter.subscribe}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              {currentContent.copyright}
            </p>
            <div className="flex space-x-6 rtl:space-x-reverse">
              <Link href="/privacy" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">
                {currentContent.links.privacy}
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">
                {currentContent.links.terms}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}