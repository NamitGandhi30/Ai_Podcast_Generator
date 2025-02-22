import Header from "@/components/header";
import Hero from "@/components/herosection";
import Footer from "@/components/Footer";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; // For icons
import './globals.css';
import Contact from "./contact";


export default function Home() {
  return (
    <div>
      <Header />
      <Hero/>
      
      <Footer/>
    </div>
  );
}