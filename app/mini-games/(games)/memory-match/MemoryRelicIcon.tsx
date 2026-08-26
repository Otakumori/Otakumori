import type { SVGProps } from 'react';

type RelicIconProps = SVGProps<SVGSVGElement> & {
  faceId: string;
};

export function MemorySealIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 96 128" focusable="false" aria-hidden="true" {...props}>
      <path d="M48 10 77 27v74L48 118 19 101V27L48 10Z" />
      <path d="M48 25c13 0 23 10 23 23 0 18-23 39-23 39S25 66 25 48c0-13 10-23 23-23Z" />
      <path d="M48 36v38M32 51h32M36 38c6 6 18 6 24 0M36 64c6-6 18-6 24 0" />
      <path d="M20 27 48 43l28-16M20 101l28-17 28 17" />
    </svg>
  );
}

export function MemoryRelicIcon({ faceId, ...props }: RelicIconProps) {
  return (
    <svg viewBox="0 0 96 96" focusable="false" aria-hidden="true" {...props}>
      {renderRelic(faceId)}
    </svg>
  );
}

function renderRelic(faceId: string) {
  switch (faceId) {
    case 'blossom':
      return (
        <>
          <path d="M48 47c-8-13-3-28 0-31 3 3 8 18 0 31Z" />
          <path d="M45 49c-15-4-22-18-22-23 5 0 20 6 22 23Z" />
          <path d="M51 49c2-17 17-23 22-23 0 5-7 19-22 23Z" />
          <path d="M45 52c-12 10-27 7-31 4 4-4 19-9 31-4Z" />
          <path d="M51 52c12-5 27 0 31 4-4 3-19 6-31-4Z" />
          <circle cx="48" cy="50" r="7" />
        </>
      );
    case 'pouch':
      return (
        <>
          <path d="M27 38c7-9 35-9 42 0l-5 41H32L27 38Z" />
          <path d="M35 35c4-11 22-11 26 0M30 47c12 5 24 5 36 0" />
          <path d="M41 57h14M38 67h20" />
        </>
      );
    case 'reliquary':
      return (
        <>
          <path d="M48 13 72 31l-9 49H33l-9-49 24-18Z" />
          <path d="M48 25 61 36l-5 31H40l-5-31 13-11Z" />
          <path d="M48 13v67M25 31h46" />
        </>
      );
    case 'medallion':
      return (
        <>
          <circle cx="48" cy="50" r="28" />
          <circle cx="48" cy="50" r="16" />
          <path d="m48 31 5 13 14 1-11 9 4 14-12-8-12 8 4-14-11-9 14-1 5-13Z" />
          <path d="M32 18c9 7 23 7 32 0" />
        </>
      );
    case 'soapstone':
      return (
        <>
          <path d="M24 25c12-10 39-9 48 5 4 7 1 32-8 43-7 8-27 9-36 1-9-9-12-40-4-49Z" />
          <path d="M35 43c8-7 19-7 27 0M35 59c8 7 19 7 27 0" />
          <path d="M48 35v32" />
        </>
      );
    case 'root':
      return (
        <>
          <path d="M49 12c-7 19-5 40 0 68" />
          <path d="M48 31c-8-8-17-12-28-11M48 41c9-10 18-14 28-13M48 54c-11 1-20 7-28 18M49 64c11 0 20 5 28 17" />
          <path d="M39 27c-1 9 4 16 9 20 8-7 10-16 7-27" />
        </>
      );
    case 'lantern':
      return (
        <>
          <path d="M35 24h26l6 12-6 38H35l-6-38 6-12Z" />
          <path d="M39 15h18M48 15v9M34 37h28M35 67h26" />
          <path d="M48 42c8 9 8 17 0 23-8-6-8-14 0-23Z" />
        </>
      );
    case 'mirror':
      return (
        <>
          <path d="M48 15c17 0 30 12 30 28S65 71 48 71 18 59 18 43s13-28 30-28Z" />
          <path d="M34 75h28M48 71v12M34 35c8-8 20-10 31-4" />
          <path d="m30 51 13-12 8 8 13-13" />
        </>
      );
    case 'thread':
      return (
        <>
          <circle cx="48" cy="48" r="29" />
          <circle cx="48" cy="48" r="15" />
          <path d="M20 50c14-16 41-17 56-3M25 67c12-12 34-14 47-3M28 28c15 13 39 13 52 0" />
          <path d="M70 65c9 1 13 6 12 14-8 0-13-4-12-14Z" />
        </>
      );
    case 'mask':
      return (
        <>
          <path d="M20 26c17-10 39-10 56 0-2 31-13 47-28 54C33 73 22 57 20 26Z" />
          <path d="M33 44c5-5 13-5 18 0M57 44c5-5 13-5 18 0M40 61c5 4 11 4 16 0" />
          <path d="M48 29v41" />
        </>
      );
    default:
      return (
        <>
          <path d="M48 13 75 36 64 78H32L21 36 48 13Z" />
          <path d="M48 28v38M33 45h30" />
        </>
      );
  }
}
