"use client";

import Link from "next/link";
import { FaTwitter, FaLinkedin, FaInstagram, FaEnvelope, FaPhone, FaHome } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-black text-white py-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h5 className="text-lg font-semibold mb-3">About Us</h5>
            <p className="text-gray-400">
              We are an AI-driven podcast platform bringing the latest insights on tech and innovation.
            </p>
          </div>
          <div>
            <h5 className="text-lg font-semibold mb-3">Quick Links</h5>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-white">Home</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white">About</Link></li>
              <li><Link href="/services" className="text-gray-400 hover:text-white">Services</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-lg font-semibold mb-3">Contact</h5>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center gap-2"><FaHome /> 123 AI Street, Tech City</li>
              <li className="flex items-center gap-2"><FaEnvelope /> contact@aipodcast.com</li>
              <li className="flex items-center gap-2"><FaPhone /> +1 800 555 0101</li>
            </ul>
            <h5 className="text-lg font-semibold mt-4">Follow Us</h5>
            <div className="flex justify-center md:justify-start space-x-4 mt-2">
              <Link href="https://twitter.com/AIPodcast" className="text-gray-400 hover:text-white text-xl" target="_blank" rel="noopener noreferrer">
                <FaTwitter />
              </Link>
              <Link href="https://www.linkedin.com/in/anshul-parkar-91306b286/" className="text-gray-400 hover:text-white text-xl" target="_blank" rel="noopener noreferrer">
                <FaLinkedin />
              </Link>
              <Link href="https://www.instagram.com/im__parkar" className="text-gray-400 hover:text-white text-xl" target="_blank" rel="noopener noreferrer">
                <FaInstagram />
              </Link>
            </div>
          </div>
        </div>
        <hr className="border-gray-700 my-6" />
        <div className="text-center text-gray-400">
          <p>&copy; 2025 AI Podcast. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
