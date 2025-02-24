import Link from 'next/link';
import { Button } from './ui/button';
import Image from 'next/image';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

const Header = () => {

  return (
    <header className="fixed top-0 w-full bg-black/50 backdrop-blur-lg shadow-md h-18 px-4 flex items-center z-50">

      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex">
          <Image
            src={"/logo.png"}
            alt="podify logo"
            height={60}
            width={200}
            className="h-12 w-auto object-contain"
          />
          <p className='text-4xl font-extrabold text-purple-800 my-3 mx-2'>Podify</p>
        </Link>

        <div className="flex space-x-4">
        <nav className="hidden md:flex space-x-4">
          <Button variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-600 hover:text-white">
            <Link href="/about">About</Link>
          </Button>
          <Button variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-600 hover:text-white">
            <Link href="/services">Services</Link>
          </Button>
          <Button variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-600 hover:text-white">
            <Link href="/contact">Contact</Link>
          </Button>
        </nav>

        
          <SignedOut>
          <SignInButton forceRedirectUrl="/sign-in" >
              <Button variant="outline" className="bg-purple-600 text-white hover:bg-purple-700">Login</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
};

export default Header;
