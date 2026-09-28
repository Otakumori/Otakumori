import type { CSSProperties, HTMLAttributes } from 'react';

export const MORI_PROVISIONAL_ICON_NAMES = [
  'back',
  'cart',
  'close',
  'community',
  'filter',
  'home',
  'menu',
  'orders',
  'profile',
  'search',
  'settings',
  'wishlist',
] as const;

export type MoriProvisionalIconName = (typeof MORI_PROVISIONAL_ICON_NAMES)[number];

type MoriProvisionalIconProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  name: MoriProvisionalIconName;
  size?: number | string;
  label?: string;
};

/** Replaceable mask-based utility icon for the provisional visual pass. */
export function MoriProvisionalIcon({
  name,
  size = 20,
  label,
  className,
  style,
  ...props
}: MoriProvisionalIconProps) {
  const iconStyle = {
    ...style,
    '--mori-provisional-icon': `url('/assets/provisional/sitewide-visual-pass-1/icons/${name}.svg')`,
    height: size,
    width: size,
  } as CSSProperties & Record<'--mori-provisional-icon', string>;

  return (
    <span
      {...props}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={['mori-provisional-icon', className].filter(Boolean).join(' ')}
      data-mori-provisional-icon={name}
      role={label ? 'img' : undefined}
      style={iconStyle}
    />
  );
}
