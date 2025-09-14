import React from 'react';
import { type CanonicalRuneId } from '@/types/runes';
import { DEFAULT_RUNE_DISPLAYS } from '@/app/lib/runes-emoji';
import { getMaterialIcon } from '@/app/lib/runes-material';

type RuneGlyphStyle = 'emoji' | 'material' | 'auto';

export default function RuneGlyph({
  runeId,
  glyphOverride,
  className,
  style = 'auto',
  title,
}: {
  runeId: CanonicalRuneId;
  glyphOverride?: string;
  className?: string;
  style?: RuneGlyphStyle;
  title?: string;
}) {
  const emojiGlyph = glyphOverride || DEFAULT_RUNE_DISPLAYS[runeId]?.glyph || '✶';
  const materialName = getMaterialIcon(runeId);

  const globalPref = (process.env.NEXT_PUBLIC_RUNE_GLYPH_STYLE as RuneGlyphStyle | undefined) ?? 'material';
  const resolvedStyle: RuneGlyphStyle = style === 'auto' ? globalPref : style;
  // Prefer material only when requested and a mapping exists
  const useMaterial = resolvedStyle === 'material' && !!materialName;

  if (useMaterial && materialName) {
    return (
      <span
        className={['material-symbols-outlined', className].filter(Boolean).join(' ')}
        aria-hidden="true"
        title={title}
      >
        {materialName}
      </span>
    );
  }

  return (
    <span className={['emoji-noto', className].filter(Boolean).join(' ')} aria-hidden="true" title={title}>
      {emojiGlyph}
    </span>
  );
}
