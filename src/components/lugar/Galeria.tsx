"use client";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperObject } from "swiper";
import { Autoplay, FreeMode, Navigation, Pagination, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import "./muestra.css";
import { SafeImage } from "../ui/SafeImage";

interface Props {
  imagenes: string[];
  titulo: string;
  className?: string;
}

export const Galeria = ({ imagenes, titulo, className = "" }: Props) => {
  const [thumbs, setThumbs] = useState<SwiperObject | null>(null);
  const varias = imagenes.length > 1;

  return (
    <div className={`galeria ${className}`}>
      <Swiper
        className="principal overflow-hidden rounded-2xl shadow-xl"
        spaceBetween={10}
        navigation={varias}
        pagination={varias ? { clickable: true } : false}
        autoplay={varias ? { delay: 4000, disableOnInteraction: true } : false}
        thumbs={{ swiper: thumbs && !thumbs.destroyed ? thumbs : null }}
        modules={[FreeMode, Navigation, Thumbs, Autoplay, Pagination]}
      >
        {imagenes.map((src) => (
          <SwiperSlide key={src}>
            <SafeImage src={src} alt={titulo} fill sizes="(min-width:1024px) 60vw, 100vw" className="object-cover" />
          </SwiperSlide>
        ))}
      </Swiper>
      {varias && (
        <Swiper
          className="miniaturas hidden sm:block"
          onSwiper={setThumbs}
          spaceBetween={12}
          slidesPerView={Math.min(5, imagenes.length)}
          freeMode
          watchSlidesProgress
          modules={[FreeMode, Navigation, Thumbs]}
        >
          {imagenes.map((src) => (
            <SwiperSlide key={src}>
              <SafeImage src={src} alt="" fill sizes="120px" className="object-cover" />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};
