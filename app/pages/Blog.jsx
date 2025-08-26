/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import Layout from '../components/Layout';

export default function Blog() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 p-8 text-white">
        <h1 className="mb-4 text-4xl font-bold text-pink-400">Otakumori Insiders 🌸✨</h1>
        <p className="mb-6 text-lg">
          Stay tuned, Commander! Exclusive content, behind-the-scenes peeks, and community insights
          will soon fill this space.
        </p>
        <div className="mt-8 rounded-xl bg-gray-800 p-4">
          <p className="italic">No blog posts yet...but great things are coming soon. 🌸</p>
        </div>
      </div>
    </Layout>
  );
}
