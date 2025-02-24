    "use client";

    import Image from "next/image";
    import Link from "next/link";
    import { FaTwitter, FaLinkedin, FaInstagram, FaEnvelope, FaPhone, FaHome } from "react-icons/fa";
    import { Card, CardContent } from "@/components/ui/card";
    import {
      featuresData,
      howItWorksData,
      statsData,
      testimonialsData,
    } from "@/data/landing";

    const Footer = () => {
      return (

        <>
        

          {/* Features Section */}
          <section className="py-20 bg-black text-center">
            <div className="container mx-auto px-4">
              <h2 className="text-4xl font-bold mb-12 text-purple-400">
                Everything you need to manage your podcast
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuresData.map((feature, index) => (
                  <div
                    key={index}
                    className="p-6 bg-gray-900 border border-purple-400 rounded-lg"
                  >
                    <CardContent className="space-y-4 pt-4">
                      {feature.icon}
                      <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                      <p className="text-gray-300">{feature.description}</p>
                    </CardContent>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* How it works section */}
          <section className="py-20 bg-black text-center">
            <div className="container mx-auto px-4">
              <h2 className="text-4xl font-bold mb-12 text-purple-400">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {howItWorksData.map((step, index) => (
                  <div key={index} className="text-white">
                    <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="text-gray-300">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials section */}
          <section id="testimonials" className="py-20 bg-black text-center">
            <div className="container mx-auto px-4">
              <h2 className="text-4xl font-bold mb-16 text-purple-400">What Our Users Say</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonialsData.map((testimonial, index) => (
                  <div key={index} className="p-6 bg-gray-900 border border-purple-400 rounded-lg">
                    <CardContent className="pt-4">
                      <div className="flex items-center mb-4">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          width={50}
                          height={50}
                          className="rounded-full border-2 border-purple-400"
                        />
                        <div className="ml-4 text-left">
                          <div className="font-semibold text-white">{testimonial.name}</div>
                          <div className="text-sm text-gray-300">{testimonial.role}</div>
                        </div>
                      </div>
                      <p className="text-gray-300">{testimonial.quote}</p>
                    </CardContent>
                  </div>
                ))}
              </div>
            </div>
          </section>
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
        </>

        
      );
    };

    export default Footer;
