import Image from 'next/image';

interface AvatarControlGlyphProps {
  src: string;
  size?: 32 | 40 | 48 | 64;
}

export default function AvatarControlGlyph({ src, size = 48 }: AvatarControlGlyphProps) {
  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      sizes={`${size}px`}
      aria-hidden="true"
      className="shrink-0 object-contain drop-shadow-[0_5px_10px_rgba(0,0,0,0.45)]"
    />
  );
}
