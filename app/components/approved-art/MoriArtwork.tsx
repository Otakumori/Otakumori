import Image from 'next/image';
import { cn } from '@/lib/utils';

interface MoriArtworkProps {
  src: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
}

export function MoriArtwork({
  src,
  className,
  imageClassName,
  sizes = '(max-width: 640px) 12rem, 14rem',
}: MoriArtworkProps) {
  return (
    <div className={cn('relative aspect-square w-48 sm:w-56', className)} aria-hidden="true">
      <Image src={src} alt="" fill sizes={sizes} className={cn('object-contain', imageClassName)} />
    </div>
  );
}
