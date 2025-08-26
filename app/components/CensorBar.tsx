/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import React from 'react';

interface CensorBarProps {
  variant?: 'black' | 'pink' | 'pixel' | 'text' | 'skin';
  width?: number;
  height?: number;
  color?: string;
  text?: string;
}

const CensorBar: React.FC<CensorBarProps> = ({ variant = 'black', width = 120, height = 24, color, text }) => {
  let style = {
    width,
    height,
    borderRadius: 6,
    background: '#222',
    boxShadow: '0 0 8px #000',
  } as React.CSSProperties;
  let content = null;
  if (variant === 'pink') {
    style.background = 'linear-gradient(90deg, #ff6ec7, #ffb6e6)';
    style.boxShadow = '0 0 12px #ff6ec7';
  } else if (variant === 'pixel') {
    style.background = 'repeating-linear-gradient(90deg, #222 0 8px, #fff 8px 16px)';
    style.boxShadow = '0 0 8px #fff';
  } else if (variant === 'text') {
    style.background = color || '#222';
    content = <span style={{ color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: 1 }}>{text || 'Too lewd for this realm.'}</span>;
    style.display = 'flex';
    style.alignItems = 'center';
    style.justifyContent = 'center';
  } else if (variant === 'skin') {
    style.background = color || '#f5d6c6';
    style.boxShadow = '0 0 8px #f5d6c6';
  }
  return (
    <div style={style} className="relative overflow-hidden">
      {content}
    </div>
  );
};

export default CensorBar; 