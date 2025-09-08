'use client';
import { useEffect, useState } from 'react';

export default function NSFWAffirmNote() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const k = 'nsfw:affirmed';
    if (localStorage.getItem(k) === '1') return;
    setShow(true);
  }, []);

  if (!show) return null;

  const handleAffirm = async () => {
    localStorage.setItem('nsfw:affirmed', '1');
    setShow(false);

    try {
      await fetch('/api/prefs/nsfw/affirm', { method: 'POST' });
    } catch (error) {
      console.error('Failed to log NSFW affirmation:', error);
    }
  };

  return (
    <div className="my-3 rounded-xl border border-slate-700 bg-cube-900 p-3 text-sm text-slatey-400">{<>''
        <span role='img' aria-label='emoji'>T</span><span role='img' aria-label='emoji'>h</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>s</span>' '<span role='img' aria-label='emoji'>g</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>l</span><span role='img' aria-label='emoji'>l</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>y</span>' '<span role='img' aria-label='emoji'>m</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>y</span>' '<span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>n</span>' '<span role='img' aria-label='emoji'>R</span>-<span role='img' aria-label='emoji'>1</span><span role='img' aria-label='emoji'>8</span>' '<span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>t</span>.' '<span role='img' aria-label='emoji'>B</span><span role='img' aria-label='emoji'>y</span>' '<span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>u</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>g</span>' '<span role='img' aria-label='emoji'>y</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>u</span>' '<span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>f</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>m</span>' '<span role='img' aria-label='emoji'>y</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>u</span>'<span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>e</span>' '<span role='img' aria-label='emoji'>1</span><span role='img' aria-label='emoji'>8</span>+' '<span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>d</span>' '<span role='img' aria-label='emoji'>w</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>h</span>' '<span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>o</span>' '<span role='img' aria-label='emoji'>v</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>w</span>
        <span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>t</span>.
        ''</>}<button
        className="ml-2 underline hover:text-slatey-300 transition-colors"
        onClick={handleAffirm}
      >{<>''
        <span role='img' aria-label='emoji'>O</span><span role='img' aria-label='emoji'>K</span>
        ''</>}</button>
    </div>
  );
}
