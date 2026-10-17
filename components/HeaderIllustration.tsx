'use client';

import { useState } from 'react';

export default function HeaderIllustration({
  src,
  alt,
}: {
  src?: string;
  alt: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) return null;

  return (
    <div className="relative z-10 flex items-center justify-start lg:justify-end shrink-0">
      <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/95 p-3.5 shadow-2xl backdrop-blur transition hover:scale-[1.02]">
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className="h-36 sm:h-44 w-auto max-w-[260px] sm:max-w-[320px] object-contain rounded-xl"
        />
      </div>
    </div>
  );
}
