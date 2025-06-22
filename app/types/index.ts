import { ReactNode } from 'react';

export interface Petal {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  collected: boolean;
}

export interface Progress {
  personal: number;
  community: number;
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  images: string[];
  variants: Array<{
    id: string;
    price: number;
    title: string;
  }>;
  tags: string[];
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  image: string;
}

export interface SocialLink {
  name: string;
  url: string;
  icon: ReactNode;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
}

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}
