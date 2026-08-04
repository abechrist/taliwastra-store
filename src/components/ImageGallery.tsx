'use client';

import { useState } from 'react';
import Image from 'next/image';

type ImageGalleryProps = {
  images: string[];
  productName: string;
};

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selected, setSelected] = useState(0);

  if (!images.length) return null;

  return (
    <div className="space-y-3">
      <div className="w-full bg-surface-container-lowest rounded-xl overflow-hidden aspect-[4/3] relative">
        <Image
          src={images[selected]}
          alt={`${productName} - Image ${selected + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((url, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all relative ${
                i === selected ? 'border-primary opacity-100' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <Image src={url} alt={`${productName} thumb ${i + 1}`} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
