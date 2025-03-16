import Layout from '../components/Layout';

export default function Blog() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-4xl font-bold text-pink-400 mb-4">Otakumori Insiders 🌸✨</h1>
        <p className="text-lg mb-6">
          Stay tuned, Commander! Exclusive content, behind-the-scenes peeks, and community insights will soon fill this space.  
        </p>
        <div className="mt-8 bg-gray-800 p-4 rounded-xl">
          <p className="italic">No blog posts yet...but great things are coming soon. 🌸</p>
        </div>
      </div>
    </Layout>
  );
}
