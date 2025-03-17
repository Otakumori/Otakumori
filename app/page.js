import Header from './components/Header';
import CherryBlossomEffect from './components/CherryBlossomEffect';

export default function Home() {
  return (
    <div className="relative h-screen bg-gray-900 text-white">
      <Header />
      <CherryBlossomEffect />
      <main className="flex items-center justify-center h-full">
        <h1 className="text-5xl font-bold">Welcome to Otakumori!</h1>
      </main>
    </div>
  );
}
