"use client";
import Image, { ImageProps } from "next/image";
import { useState } from "react";

type Props = Omit<ImageProps, "src"> & { src: string; fallback?: string };

/** Imagen que cambia a una de reemplazo si la original falla (p. ej. 404 en Cloudinary). */
export const SafeImage = ({ src, fallback = "/2.jpg", alt, ...rest }: Props) => {
  const [failed, setFailed] = useState(false);
  return (
    <Image
      {...rest}
      alt={alt}
      src={failed || !src ? fallback : src}
      onError={() => setFailed(true)}
    />
  );
};
