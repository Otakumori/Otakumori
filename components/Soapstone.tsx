/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
import Image from 'next/image';

interface SoapstoneProps {
  preview: string;
  text: string;
}

export default function Soapstone({ preview, text }: SoapstoneProps) {
  return (
    <details className="group relative rounded-2xl overflow-hidden border border-pink-300/30 bg-[#121016]">
      <summary className="list-none cursor-pointer select-none p-4 text-pink-200/80 hover:text-pink-100">
        {preview}
      </summary>
      <div className="relative p-4 text-pink-100/90">
        <Image
          src="/assets/ui/soapstonefilter.svg"
          alt=""
          width={800}
          height={400}
          className="pointer-events-none absolute inset-0 opacity-50 mix-blend-screen"
        />
        <p className="relative">{text}</p>
      </div>
    </details>
  );
}
