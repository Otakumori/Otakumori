import Header from '../components/Header'

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-pink-50">
      <Header />
      <section className="max-w-3xl mx-auto pt-32 pb-12 px-4 flex flex-col items-center">
        <h1 className="text-3xl md:text-5xl font-extrabold text-pink-700 mb-6 text-center">My Profile</h1>
        <div className="w-full bg-white/80 rounded-2xl shadow-xl p-8 flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-pink-200 rounded-full flex items-center justify-center text-4xl font-extrabold text-pink-700 mb-2">🧑‍🎤</div>
          <div className="text-pink-900 font-semibold text-xl mb-2">Username</div>
          <div className="text-pink-500 mb-4">"Ready for more, Commander?"</div>
          <div className="w-full flex flex-col md:flex-row gap-6 mt-4">
            <div className="flex-1">
              <h2 className="font-semibold text-pink-700 mb-2">Achievements</h2>
              <ul className="list-disc pl-6 text-pink-900">
                <li>Bloomtouched</li>
                <li>Cherry Warden</li>
                <li>Profile Customizer</li>
              </ul>
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-pink-700 mb-2">Customization</h2>
              <div className="text-pink-400 italic">(Profile themes and avatar editor coming soon!)</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
} 