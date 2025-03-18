"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";

// Supabase setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Shop() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    async function fetchData() {
      const { data: categories } = await supabase.from("categories").select("*");
      const { data: products } = await supabase.from("products").select("*");
      setCategories([{ name: "All" }, ...categories]);
      setProducts(products);
    }
    fetchData();
  }, []);

  return (
    <section className="container mx-auto p-6">
      <h1 className="text-4xl font-bold text-center text-white">Shop Otakumori</h1>

      {/* Category Filters */}
      <div className="flex flex-wrap justify-center gap-4 mt-6">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setSelectedCategory(cat.name)}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedCategory === cat.name ? "bg-pink-500 text-white" : "bg-gray-800 text-gray-300"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {products
          .filter((p) => selectedCategory === "All" || p.category === selectedCategory)
          .map((product) => (
            <div key={product.id} className="bg-gray-900 p-4 rounded-lg shadow-lg">
              <Image
                src={product.image_url[0]}
                alt={product.title}
                width={300}
                height={300}
                className="rounded-lg"
              />
              <h2 className="text-xl font-bold text-white mt-2">{product.title}</h2>
              <p className="text-gray-400 mt-1">{product.description}</p>
              <p className="text-pink-400 font-semibold mt-2">${product.price}</p>
              <Link href={`/shop/${product.id}`}>
                <button className="mt-3 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg">
                  View Details
                </button>
              </Link>
            </div>
          ))}
      </div>
    </section>
  );
}
