import Link from 'next/link'
import { Button } from './ui/button'
import Image from 'next/image'

const Header = () => {
  return (
    <header className="fixed top-0 w-full bg-gray-900/80 backdrop-blur-lg z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/logo.png"
            alt="podify logo"
            height={32}
            width={32}
            className="h-8 w-8 object-contain"
          />
          <span className="text-xl font-bold text-purple-400">Podify</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" className="text-gray-300 hover:text-white">
            <Link href="/about">About</Link>
          </Button>
          <Button variant="ghost" className="text-gray-300 hover:text-white">
            <Link href="/services">Services</Link>
          </Button>
          <Button variant="ghost" className="text-gray-300 hover:text-white">
            <Link href="/contact">Contact</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}

export default Header