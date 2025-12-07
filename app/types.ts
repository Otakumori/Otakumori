export interface Petal {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  collected: boolean;
  isSpecial?: boolean;
  }

export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  images?: string[];
  variants?: {
    id: string;
    price: number;
    title: string;
  }[];
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  createdAt: string;
  author: string;
  }

export interface SocialLink {
  name: string;
  url: string;
  icon: React.ReactNode;
}
