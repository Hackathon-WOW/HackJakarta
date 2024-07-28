import Link from "next/link"
import Navbar from "./Navbar"

const Header = () => {
  return (
<<<<<<< HEAD:app/components/Header.jsx
    <header className="py-4 text-white">
        <div className="container  flex justify-between  items-center">
            <Link href="/">
                <h1 className="text-4xl font-semibold ml-10">
                   LOGO  
                </h1>
=======
    <header className="py-4 text-white bg-primary-green-dark">
        <div className="container mx-auto flex justify-between items-center">
            <Link href="/">
                <img src="/logo.svg" className="h-[60px]" />
>>>>>>> 751f5bd4b30e9ad87c5287085e62cbb408c1627f:components/Header.jsx
            </Link>
            <div className="flex items-center align-baseline gap-8">
                <Navbar />
            </div>

        </div>
    </header>
  )
}

export default Header