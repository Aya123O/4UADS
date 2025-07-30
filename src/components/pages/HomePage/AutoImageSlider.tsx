"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectCreative, Parallax } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-creative";
import "swiper/css/parallax";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../../../Context/LanguageContext";

interface GalleryImage {
  id: number;
  picture_url: string;
  title?: {
    en: string;
    ar: string;
  };
  description?: {
    en: string;
    ar: string;
  };
}

interface ApiResponse {
  data: GalleryImage[];
  message: string;
}

const sliderContent = {
  en: {
    loadingText: "Loading Premium Vehicles...",
    errorTitle: "Load Error",
    retryButton: "Retry",
    emptyTitle: "Empty Showroom",
    emptyMessage: "No vehicles currently available",
    exclusiveBadge: "EXCLUSIVE COLLECTION",
    defaultTitle: "Luxury Redefined",
    defaultDescription: "Experience unparalleled performance and sophistication in every detail",
    premiumBadge: "PREMIUM IMPORT",
    watermark: "4YOUAD PREMIUM",
    specs: {
      year: "MODEL YEAR",
      drive: "DRIVE SYSTEM",
      engine: "ENGINE"
    }
  },
  ar: {
    loadingText: "جاري تحميل السيارات الفاخرة...",
    errorTitle: "خطأ في التحميل",
    retryButton: "إعادة المحاولة",
    emptyTitle: "المعرض فارغ",
    emptyMessage: "لا توجد سيارات متاحة حالياً",
    exclusiveBadge: "مجموعة حصرية",
    defaultTitle: "إعادة تعريف الفخامة",
    defaultDescription: "اختبر الأداء غير المسبوق والأناقة في كل التفاصيل",
    premiumBadge: "واردات فاخرة",
    watermark: "4YOUاد بريميوم",
    specs: {
      year: "سنة الموديل",
      drive: "نظام الدفع",
      engine: "المحرك"
    }
  }
};

type LanguageKey = keyof typeof sliderContent;
type LanguageContent = typeof sliderContent['en'];

export default function CompactCarImportGallery(): JSX.Element {
  const { language } = useLanguage();
  
  // Safely get content with fallback to English
  const getContent = (): LanguageContent => {
    const lang = language as LanguageKey;
    return sliderContent[lang] || sliderContent.en;
  };
  
  const content = getContent();
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        const response = await fetch("https://new.4youad.com/api/galleries");
        if (!response.ok) {
          throw new Error("Failed to fetch gallery images");
        }
        const data: ApiResponse = await response.json();
        setGalleryImages(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryImages();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px] bg-gradient-to-br from-gray-900 to-gray-800">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-white flex items-center"
        >
          <svg className="w-12 h-12 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="text-lg">{content.loadingText}</span>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[400px] bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center p-6 bg-black/50 rounded-xl max-w-md border border-red-400/30">
          <svg className="w-12 h-12 mx-auto mb-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-xl font-bold mb-2 text-white">{content.errorTitle}</h3>
          <p className="text-red-300 mb-4">{error}</p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-4 py-2 bg-red-500/20 border border-red-400 rounded-lg text-white text-sm"
            onClick={() => window.location.reload()}
          >
            {content.retryButton}
          </motion.button>
        </div>
      </div>
    );
  }

  if (!galleryImages.length) {
    return (
      <div className="flex justify-center items-center h-[400px] bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center p-6 bg-black/50 rounded-xl max-w-md border border-blue-400/30">
          <svg className="w-12 h-12 mx-auto mb-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-xl font-bold mb-2 text-white">{content.emptyTitle}</h3>
          <p className="text-blue-300 mb-4">{content.emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full mx-auto overflow-hidden group" dir={language === "ar" ? "rtl" : "ltr"}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectCreative, Parallax]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{
          delay: 6000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={true}
        speed={1000}
        navigation={{
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
          renderBullet: (index, className) => {
            return `<span class="${className} !w-2 !h-2 !bg-white !opacity-30 hover:!opacity-100 !mx-1 !transition-all !duration-300"></span>`;
          },
        }}
        effect="creative"
        creativeEffect={{
          prev: {
            shadow: true,
            translate: ["-125%", 0, -600],
            rotate: [0, 0, -20],
            opacity: 0,
          },
          next: {
            shadow: true,
            translate: ["125%", 0, -600],
            rotate: [0, 0, 20],
            opacity: 0,
          },
        }}
        parallax={true}
        grabCursor={true}
        className="w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-lg"
      >
        <div
          slot="container-start"
          className="parallax-bg"
          data-swiper-parallax="-25%"
          style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)",
          }}
        ></div>

        {galleryImages.map((image) => (
          <SwiperSlide key={image.id}>
            <div className="relative h-full w-full flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40 z-10" data-swiper-parallax="-100%"></div>

              <motion.img
                src={image.picture_url}
                alt={`Imported vehicle ${image.id}`}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                data-swiper-parallax="-35%"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />

              <div className="relative z-20 text-center px-6 w-full max-w-2xl">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="inline-block px-4 py-1 bg-white/10 backdrop-blur-sm rounded-full mb-3 border border-white/20"
                >
                  <span className="text-white text-xs font-medium tracking-wider">
                    {content.exclusiveBadge}
                  </span>
                </motion.div>

                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight"
                  style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
                >
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-white">
                    {image.title?.[language] || content.defaultTitle}
                  </span>
                </motion.h2>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="text-sm md:text-base text-white/80 max-w-md mx-auto mb-4 font-light"
                >
                  {image.description?.[language] || content.defaultDescription}
                </motion.p>

                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                  className="flex justify-center gap-6"
                >
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="text-center"
                  >
                    <div className="text-2xl font-bold text-white">2023+</div>
                    <div className="text-xs text-white/70">{content.specs.year}</div>
                  </motion.div>
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="text-center"
                  >
                    <div className="text-2xl font-bold text-white">AWD</div>
                    <div className="text-xs text-white/70">{content.specs.drive}</div>
                  </motion.div>
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="text-center"
                  >
                    <div className="text-2xl font-bold text-white">V6/V8</div>
                    <div className="text-xs text-white/70">{content.specs.engine}</div>
                  </motion.div>
                </motion.div>
              </div>

              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="absolute bottom-4 right-4 z-30"
              >
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-2 rounded-full shadow-lg border border-white/10">
                  <span className="text-xs font-medium">{content.premiumBadge}</span>
                </div>
              </motion.div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <motion.div
        whileHover={{ scale: 1.1 }}
        className={`swiper-button-next !hidden md:!flex !h-12 !w-12 !rounded-full !bg-white/10 !backdrop-blur-sm !border !border-white/20 hover:!bg-white/20 !transition-all !duration-300 ${language === 'ar' ? '!left-6' : '!right-6'} after:!text-white after:!text-2xl after:!font-bold group-hover:!opacity-100 !opacity-0 shadow-lg`}
      ></motion.div>
      <motion.div
        whileHover={{ scale: 1.1 }}
        className={`swiper-button-prev !hidden md:!flex !h-12 !w-12 !rounded-full !bg-white/10 !backdrop-blur-sm !border !border-white/20 hover:!bg-white/20 !transition-all !duration-300 ${language === 'ar' ? '!right-6' : '!left-6'} after:!text-white after:!text-2xl after:!font-bold group-hover:!opacity-100 !opacity-0 shadow-lg`}
      ></motion.div>

      <motion.div
        animate={{ 
          opacity: [0.3, 0.5, 0.3],
          y: [0, -3, 0]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          repeatType: "reverse",
          ease: "easeInOut"
        }}
        className={`absolute bottom-6 ${language === 'ar' ? 'right-6' : 'left-6'} z-30 text-white/20 text-xs font-mono tracking-widest`}
      >
        {content.watermark}
      </motion.div>
    </div>
  );
}