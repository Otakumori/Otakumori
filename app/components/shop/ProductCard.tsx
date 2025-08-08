import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

export default function ProductCard({ id, name, price, image, category }: ProductCardProps) {
  return (
    <Card className="overflow-hidden border-pink-500/30 bg-white/10 transition-colors hover:border-pink-500/50">
      <div className="relative aspect-square">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardContent className="p-4">
        <div className="space-y-1">
          <h3 className="font-semibold text-white">{name}</h3>
          <p className="text-sm text-pink-200">{category}</p>
          <p className="text-lg font-bold text-white">${price}</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full bg-pink-600 hover:bg-pink-700">Add to Cart</Button>
      </CardFooter>
    </Card>
  );
}
