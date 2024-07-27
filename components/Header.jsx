import Link from "next/link"
import Navbar from "./Navbar"

const Header = () => {
  return (
    <header className="py-4 text-white bg-primary-green-dark">
        <div className="container mx-auto flex justify-between items-center">
            <Link href="/">
                <img src="/logo.svg" className="h-[60px]" />
            </Link>
            <div className="flex items-center align-baseline gap-8">
                <Navbar />
            </div>

        </div>
    </header>
  )
}

export default Header