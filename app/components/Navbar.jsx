"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "../auth/actions";

const Navbar = ({ User:user }) => {
  const pathName = usePathname();
  const NavLink = [
    {
        pathName: "Home",
        pathLink: "/"
    },
    {
        pathName: "UMKM Showcase",
        pathLink: "/umkm"
    },
  ]

  return (
    <nav className="flex gap-8 bg-primary-green-dark sticky">
        {NavLink.map((nav, index) =>{
          return (
            <Link href={nav.pathLink} key={index} className={`${nav.pathLink===pathName && "text-accent-superWhite border-b-2 border-accent-superWhite"} h-7 my-auto font-medium hover:text-primary-green-light hover:border-b-2 border-primary-green-light transition-all`}>
              {nav.pathName}
            </Link>
          )
        })}
				
        {
        	user ? 
					<button onClick={logout()} className="w-32 h-10 rounded-lg bg-primary-orange-dark border-2 border-primary-green-dark outline-none cursor-pointer font-medium hover:bg-primary-orange-light hover:border-primary-green-dark hover:text-primary-orange-dark duration-100 text-white">Logout</button>
					:
					<Link href={"/auth/login"}>
						<button className="w-32 h-10 rounded-lg bg-primary-orange-dark border-2 border-primary-green-dark outline-none cursor-pointer font-medium hover:bg-primary-orange-light hover:border-primary-green-dark hover:text-primary-orange-dark duration-100 text-white">Login</button>
					</Link>
        }
    </nav>
  )
}

export default Navbar