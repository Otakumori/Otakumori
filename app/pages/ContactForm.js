// DEPRECATED: This component is a duplicate. Use app\components\ContactForm.jsx instead.
'use client';
import { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    file: null,
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    if (e.target.type === 'file') {
      setFormData({ ...formData, file: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Replace with Prisma API call when migration is complete
    // For now, just show success message
    console.log('Contact form would be submitted:', formData);

    setStatus({
      type: 'success',
      message: 'Contact system temporarily disabled during migration. Please try again later.',
    });
    setFormData({ name: '', email: '', message: '', file: null });
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-lg rounded-xl bg-black/80 p-6 shadow-lg">
      <h2 className="mb-4 text-2xl font-bold text-white">{<><span role='img' aria-label='emoji'>C</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>t</span>' '<span role='img' aria-label='emoji'>U</span><span role='img' aria-label='emoji'>s</span></>}</h2>
      {status && (
        <p className={`${status.type === 'error' ? 'text-red-500' : 'text-green-500'} mb-3`}>
          {status.message}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your Name"
          className="w-full rounded-lg bg-gray-900 p-3 text-white placeholder-gray-400 focus:outline-none"
          required
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Your Email"
          className="w-full rounded-lg bg-gray-900 p-3 text-white placeholder-gray-400 focus:outline-none"
          required
        />
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Your Message"
          rows="4"
          className="w-full rounded-lg bg-gray-900 p-3 text-white placeholder-gray-400 focus:outline-none"
          required
        />
        <input
          type="file"
          name="file"
          onChange={handleChange}
          accept="image/*"
          className="w-full rounded-lg bg-gray-900 p-3 text-white placeholder-gray-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-pink-600 px-4 py-2 font-medium text-white transition-colors hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}
