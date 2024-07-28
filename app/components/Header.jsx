import Link from "next/link"
import Navbar from "./Navbar"

const Header = () => {
  return (
    <header className="py-4 text-white">
        <div className="container  flex justify-between  items-center">
            <Link href="/">
                <h1 className="text-4xl font-semibold ml-10">
                   LOGO  
                </h1>
            </Link>
            <div className="flex items-center align-baseline gap-8">
                <Navbar />
            </div>

        </div>
    </header>
  )
}

export default Header