export default function PetalIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 2c4 2 7 5.5 7 9.5S15.5 21 12 21s-7-3-7-9.5S8 4 12 2Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M8.2 10.5c1.7-.9 3.8-.9 5.6 0 1.8.9 2.7 2.5 2.4 4.1-.3 1.6-1.8 2.9-4.2 3.3"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.7"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
