'use client';

import { useState } from 'react';
import Image from 'next/image';
import Icon from './Icon';

type ImageGalleryProps = {
  images: string[];
  productName: string;
};

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  if (!images.length) return null;

  const currentUrl = images[selected];
  const isFailed = failedImages[selected];

  return (
    <div className="space-y-3">
      <div className="w-full bg-surface-container-lowest rounded-xl overflow-hidden aspect-[4/3] relative flex items-center justify-center">
        {currentUrl && !isFailed ? (
          <Image
            src={currentUrl}
            alt={`${productName} - Image ${selected + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            onError={() => setFailedImages((prev) => ({ ...prev, [selected]: true }))}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-outline">
            <Icon name="image_not_supported" className="text-5xl mb-2" />
            <span className="text-xs font-body text-on-surface-variant">Gambar tidak dapat dimuat</span>
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((url, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all relative flex items-center justify-center bg-surface-container ${
                i === selected ? 'border-primary opacity-100' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              {!failedImages[i] ? (
                <Image
                  src={url}
                  alt={`${productName} thumb ${i + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                  onError={() => setFailedImages((prev) => ({ ...prev, [i]: true }))}
                />
              ) : (
                <Icon name="image_not_supported" className="text-xl text-outline" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
