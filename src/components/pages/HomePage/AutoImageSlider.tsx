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
      <div className="flex justify-center items-center h-[400px] bg-gray-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-gray-400 flex items-center"
        >
          <svg className="w-12 h-12 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[400px] bg-gray-100">
        <div className="text-center p-6 bg-white rounded-xl max-w-md border border-gray-200 shadow-sm">
          <svg className="w-12 h-12 mx-auto mb-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-gray-600 mb-4">{error}</p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-4 py-2 bg-gray-200 rounded-lg text-gray-700 text-sm"
            onClick={() => window.location.reload()}
          >
            Retry
          </motion.button>
        </div>
      </div>
    );
  }

  if (!galleryImages.length) {
    return (
      <div className="flex justify-center items-center h-[400px] bg-gray-100">
        <div className="text-center p-6 bg-white rounded-xl max-w-md border border-gray-200 shadow-sm">
          <svg className="w-12 h-12 mx-auto mb-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full mx-auto overflow-hidden group" dir={Language === "ar" ? "rtl" : "ltr"}>
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
          renderBullet: ( className) => {
            return `<span class="${className} !w-2.5 !h-2.5 !bg-white !opacity-50 hover:!opacity-100 !mx-1 !transition-all !duration-300"></span>`;
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
            background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 50%, #d1d5db 100%)",
          }}
        ></div>

        {galleryImages.map((image) => (
          <SwiperSlide key={image.id}>
            <div className="relative h-full w-full flex items-center justify-center">
              <div className="absolute inset-0 bg-black/20 z-10" data-swiper-parallax="-100%"></div>

              <motion.img
                src={image.picture_url}
                alt={`Gallery image ${image.id}`}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                data-swiper-parallax="-35%"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </div>
          </SwiperSlide>
        ))}

        <div className={`swiper-button-next !h-10 !w-10 md:!h-12 md:!w-12 !rounded-full !bg-white/80 !backdrop-blur-sm !border !border-gray-200 hover:!bg-white !transition-all !duration-300 ${
          Language === 'ar' ? '!left-2 md:!left-6' : '!right-2 md:!right-6'
        } after:!text-gray-700 after:!text-xl md:after:!text-2xl after:!font-bold !opacity-80 hover:!opacity-100 shadow-lg`}></div>
        
        <div className={`swiper-button-prev !h-10 !w-10 md:!h-12 md:!w-12 !rounded-full !bg-white/80 !backdrop-blur-sm !border !border-gray-200 hover:!bg-white !transition-all !duration-300 ${
          Language === 'ar' ? '!right-2 md:!right-6' : '!left-2 md:!left-6'
        } after:!text-gray-700 after:!text-xl md:after:!text-2xl after:!font-bold !opacity-80 hover:!opacity-100 shadow-lg`}></div>

        <div className="swiper-pagination !bottom-4 !left-0 !right-0 !w-auto !flex !justify-center !items-center !gap-1"></div>
      </Swiper>
    </div>
  );
}