"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    file: null,
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    if (e.target.type === "file") {
      setFormData({ ...formData, file: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Upload Image if exists
    let imageUrl = null;
    if (formData.file) {
      const fileExt = formData.file.name.split(".").pop();
      const filePath = `contact-images/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("otakumori-bucket")
        .upload(filePath, formData.file);

      if (error) {
        setStatus({ type: "error", message: "Image upload failed." });
        setLoading(false);
        return;
      }
      imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/otakumori-bucket/${filePath}`;
    }

    // Save Contact Form Data
    const { error } = await supabase.from("contact_messages").insert([
      {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        image_url: imageUrl,
      },
    ]);

    if (error) {
      setStatus({ type: "error", message: "Failed to submit." });
    } else {
      setStatus({ type: "success", message: "Message sent!" });
      setFormData({ name: "", email: "", message: "", file: null });
    }

    setLoading(false);
  };

  return (
    <div className="p-6 bg-black/80 rounded-xl shadow-lg max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
      {status && (
        <p
          className={`${
            status.type === "error" ? "text-red-500" : "text-green-500"
          } mb-3`}
        >
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
          className="w-full p-3 rounded-lg bg-gray-900 text-white placeholder-gray-400 focus:outline-none"
          required
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Your Email"
          className="w-full p-3 rounded-lg bg-gray-900 text-white placeholder-gray-400 focus:outline-none"
          required
        />
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Your Message"
          rows="4"
          className="w-full p-3 rounded-lg bg-gray-900 text-white placeholder-gray-400 focus:outline-none"
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="w-full p-2 text-white bg-gray-900 rounded-lg focus:outline-none"
        />
        <button
          type="submit"
          className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-lg transition-all"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}
