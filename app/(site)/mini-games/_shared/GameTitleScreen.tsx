'use client';

interface GameTitleScreenProps {
  title: string;
  description?: string;
  instructions?: string[];
  onStart: () => void;
}

/**
 * Game Title Screen Component
 * "Tap to Start" view with game info using design system variables
 */
export function GameTitleScreen({
  title,
  description,
  instructions = [],
  onStart,
}: GameTitleScreenProps) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: 'var(--color-bg-base)',
      }}
    >
      <div className="max-w-2xl w-full mx-4 text-center">
        {/* Title */}
        <h1
          className="text-5xl font-bold mb-4"
          style={{
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-display, Space Grotesk, system-ui, sans-serif)',
          }}
        >
          {title}
        </h1>

        {/* Description */}
        {description && (
          <p
            className="text-xl mb-8"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {description}
          </p>
        )}

        {/* Instructions */}
        {instructions.length > 0 && (
          <div
            className="mb-8 p-6 rounded-xl mx-auto max-w-md"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-default)',
            }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              How to Play
            </h2>
            <ul className="space-y-2 text-left">
              {instructions.map((instruction, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <span style={{ color: 'var(--color-primary)' }}>•</span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Start Button */}
        <button
          onClick={onStart}
          className="px-12 py-4 rounded-xl font-bold text-lg transition-all"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-text-primary)',
            minHeight: '44px',
            minWidth: '200px',
            boxShadow: '0 0 20px var(--color-primary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Tap to Start
        </button>
      </div>
    </div>
  );
}

