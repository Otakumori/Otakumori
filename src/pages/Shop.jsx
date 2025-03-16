import Layout from '../components/Layout';
import ShopGrid from '../components/ShopGrid';
import { useEffect, useState } from 'react';
import { fetchProducts } from '../utils/printifyAPI';

export default function Shop() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function getProducts() {
      const data = await fetchProducts();
      setProducts(data);
    }
    getProducts();
  }, []);

  return (
    <Layout>
      <div className="p-8 text-center">
        <h2 className="text-4xl text-pink-400 mb-4">Otaku-Approved Gear 🔥</h2>
        <ShopGrid products={products} />
      </div>
    </Layout>
  );
}
