import Layout from '../components/Layout';
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState('/assets/default-avatar.png');
  const [petals, setPetals] = useState(0);

  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        setAvatar(profile.avatar_url || avatar);
        setPetals(profile.petals || 0);
      }
    }
    fetchUser();
  }, []);

  return (
    <Layout>
      <div className="text-white text-center p-8 bg-gray-800 rounded-xl">
        <img src={avatar} alt="Profile Avatar" className="w-40 h-40 rounded-full mx-auto" />
        <h2 className="text-4xl mt-4">Commander {user?.email || 'Loading...'}</h2>
        <p className="mt-2">Petals Collected: 🌸 {petals}</p>
        <button className="mt-4 px-4 py-2 bg-pink-500 rounded-lg hover:bg-pink-600 transition">Edit Profile</button>
      </div>
    </Layout>
  );
}
