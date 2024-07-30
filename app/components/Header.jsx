import Link from "next/link"
import Navbar from "./Navbar"
import Image from "next/image"

const Header = ({ User:user }) => {
  return (
    <header className="py-4 text-accent-white bg-primary-green-dark">
        <div className="container mx-auto flex justify-between items-center">
            <Link href="/">
                <Image src={"/logo.svg"} width={115} height={60} alt="Grow Logo" priority={true}/>
            </Link>
            <div className="flex items-center align-baseline gap-8">
                <Navbar User={user}/>
            </div>

        </div>
    </header>
  )
}

export default Header