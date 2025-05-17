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
      <div className="rounded-xl bg-gray-800 p-8 text-center text-white">
        <img src={avatar} alt="Profile Avatar" className="mx-auto h-40 w-40 rounded-full" />
        <h2 className="mt-4 text-4xl">Commander {user?.email || 'Loading...'}</h2>
        <p className="mt-2">Petals Collected: 🌸 {petals}</p>
        <button className="mt-4 rounded-lg bg-pink-500 px-4 py-2 transition hover:bg-pink-600">
          Edit Profile
        </button>
      </div>
    </Layout>
  );
}
