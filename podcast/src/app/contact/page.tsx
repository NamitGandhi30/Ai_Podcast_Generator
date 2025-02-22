"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/header";  // Import your header
import Footer from "@/components/footer";  // Import your footer

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Submitting...");

    setTimeout(() => {
      setStatus("Thank you for reaching out! We will get back to you soon.");
      setFormData({ name: "", email: "", message: "" });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header /> {/* Include the Header */}
      <div className="flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-gray-900 shadow-lg rounded-lg p-6">
          <h1 className="text-2xl font-bold text-center text-white mb-4">Contact Us</h1>
          <p className="text-center text-gray-400 mb-6">
            If you have any questions, feel free to reach out to us via the form below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-600 bg-gray-800 text-white rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-600 bg-gray-800 text-white rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-300">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-600 bg-gray-800 text-white rounded focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-300"
            >
              Submit
            </button>
          </form>

          {status && <p className="text-center text-green-400 mt-4">{status}</p>}

          <div className="mt-6 text-center">
            <h2 className="text-lg font-semibold text-white">Find Us On:</h2>
            <div className="flex justify-center gap-4 mt-2">
              <Link href="https://www.facebook.com" target="_blank" className="text-blue-400 hover:underline">
                Facebook
              </Link>
              <Link href="https://www.twitter.com" target="_blank" className="text-blue-400 hover:underline">
                Twitter
              </Link>
              <Link href="https://www.instagram.com" target="_blank" className="text-blue-400 hover:underline">
                Instagram
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer /> {/* Include the Footer */}
    </div>
  );
};

export default Contact;
