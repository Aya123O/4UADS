"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectCreative, Parallax } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-creative";
import "swiper/css/parallax";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../../../Context/LanguageContext";

interface GalleryImage {
  id: number;
  picture_url: string;
}

interface ApiResponse {
  data: GalleryImage[];
  message: string;
}

export default function CompactCarImportGallery(): JSX.Element {
  const { Language } = useLanguage();
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const swiperRef = useRef<any>(null);
  const [isHovered, setIsHovered] = useState(false);

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
      <div className="flex justify-center items-center h-[400px] md:h-[500px] overflow-hidden">
        <div className="relative flex flex-col items-center">
          <div className="relative h-10 w-10">
            {/* Large static inner circle */}
            <div className="absolute inset-0 rounded-full bg-blue-900 m-1"></div>
            
            {/* Rotating outer circle */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-600 border-r-red-600 animate-spin"></div>
          </div>
          <motion.p 
            className="mt-6 text-gray-400 font-medium text-sm"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {Language === "ar" ? "جاري تحميل الصور..." : "Loading gallery..."}
          </motion.p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-[400px] ">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 bg-gray-800/90 backdrop-blur-md rounded-2xl max-w-md border border-gray-700 shadow-xl"
        >
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping"></div>
            <svg className="relative w-16 h-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-gray-200 mb-6 text-lg">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-xl text-white font-medium shadow-lg hover:shadow-red-500/30 transition-all"
            onClick={() => window.location.reload()}
          >
            {Language === "ar" ? "إعادة المحاولة" : "Retry"}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Empty state
  if (!galleryImages.length) {
    return (
      <div className="flex justify-center items-center h-[400px] bg-gray-900">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-gray-800/90 backdrop-blur-md rounded-2xl border border-gray-700 shadow-xl"
        >
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-200 mb-2">
            {Language === "ar" ? "لا توجد صور" : "No images available"}
          </h3>
          <p className="text-gray-400">
            {Language === "ar" ? "لم يتم العثور على صور للمعرض" : "No gallery images found"}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full mx-auto overflow-hidden shadow-2xl group"
      dir={Language === "ar" ? "rtl" : "ltr"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Swiper
        ref={swiperRef}
        modules={[Navigation, Pagination, Autoplay, EffectCreative, Parallax]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={true}
        speed={1200}
        navigation={{
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
          renderBullet: ( className) => {
            return `<span class="${className} !w-2.5 !h-2.5 !bg-white !opacity-50 hover:!opacity-100 !mx-1 !transition-all !duration-300"></span>`;
          },
        }}
        effect="creative"
        creativeEffect={{
          prev: {
            shadow: true,
            translate: ["-25%", 0, -800],
            rotate: [0, 0, -5],
            opacity: 0,
          },
          next: {
            shadow: true,
            translate: ["25%", 0, -800],
            rotate: [0, 0, 5],
            opacity: 0,
          },
        }}
        parallax={true}
        grabCursor={true}
        className="w-full h-[400px] md:h-[500px]"
      >
        {galleryImages.map((image) => (
          <SwiperSlide key={image.id}>
            <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
              {/* Gradient Overlay */}
              <div className="absolute inset-0 z-10 "></div>
              
              {/* Reflective Floor Effect */}
              <div className="absolute bottom-0 left-0 right-0 h-1/4 z-10 "></div>
              
              {/* Image with parallax effect */}
              <div 
                className="absolute inset-0 w-full h-full"
                data-swiper-parallax="-30%"
              >
                <img
                  src={image.picture_url}
                  alt={`Gallery image ${image.id}`}
                  className="w-full h-full object-cover transform scale-110 transition-all duration-[1500ms] group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              
              {/* Subtle vignette */}
              <div className="absolute inset-0 z-0 shadow-[inset_0_0_80px_20px_rgba(0,0,0,0.8)]"></div>
              
              {/* Light reflection effect */}
              <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/10 to-transparent z-10 mix-blend-soft-light"></div>
            </div>
          </SwiperSlide>
        ))}

        {/* Custom Navigation Buttons */}
        <div 
          className={`swiper-button-next !h-10 !w-10 md:!h-12 md:!w-12 !rounded-full !bg-black/40 !backdrop-blur-sm !border !border-white/20 hover:!bg-black/60 !transition-all !duration-300 !opacity-0 group-hover:!opacity-100 ${
            Language === 'ar' ? '!left-2 md:!left-6' : '!right-2 md:!right-6'
          } after:!text-white after:!text-lg after:!font-thin`}
        ></div>
        
        <div 
          className={`swiper-button-prev !h-10 !w-10 md:!h-12 md:!w-12 !rounded-full !bg-black/40 !backdrop-blur-sm !border !border-white/20 hover:!bg-black/60 !transition-all !duration-300 !opacity-0 group-hover:!opacity-100 ${
            Language === 'ar' ? '!right-2 md:!right-6' : '!left-2 md:!left-6'
          } after:!text-white after:!text-lg after:!font-thin`}
        ></div>

        {/* Animated Pagination */}
        <div className="swiper-pagination !bottom-5 !left-0 !right-0 !w-auto !flex !justify-center !items-center !gap-1"></div>
      </Swiper>
      
      {/* Floating Counter */}
      <motion.div 
        className={`absolute bottom-5 z-20 ${Language === "ar" ? "left-6" : "right-6"}`}
        initial={{ opacity: 0, x: Language === "ar" ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full">
          <span className="text-white text-xs md:text-sm font-mono">
            {swiperRef.current?.swiper?.realIndex + 1 || 1} / {galleryImages.length}
          </span>
        </div>
      </motion.div>
      
      <style jsx global>{`
        .swiper-pagination-bullet-active {
          background-color: #ef4444 !important;
          opacity: 1 !important;
          transform: scale(1.2);
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.8);
        }
      `}</style>
    </div>
  );
}