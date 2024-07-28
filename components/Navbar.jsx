"use client";

import { supabase } from "@/supabase";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";

const Navbar = () => {
  const pathName = usePathname();
  const NavLink = [
    {
        pathName: "Home",
        pathLink: "/"
    },
    {
        pathName: "UMKM Showcase",
        pathLink: "/umkm-showcase"
    }
  ]

  async function  getSession() {
      const { data : {session} } = await supabase.auth.getSession()
      return session
  }

  return (
    <nav className="flex gap-8 bg-primary-green-dark sticky">
        {NavLink.map((nav, index) =>{
            return (
                <Link href={nav.pathLink} key={index} className={`${nav.pathLink===pathName && "hover:text-white border-b-2 border-accent"} 
                     h-7 my-auto font-light hover:text-white hover:border-b-2 border-white transition-all`}>
                    {nav.pathName}
                </Link>
            )
        })}
        {
            getSession().then(session => {
                return (
                session ?
                 <button className="w-32 h-10 rounded-lg bg-white border-2 border-white outline-none cursor-pointer font-light hover:bg-primary-green-light hover:border-primary-green-dark hover:text-primary-green-dark duration-300 text-white">
                    Logout</button>
                :
                <button className="w-32 h-10 rounded-lg bg-primary-orange-dark  cursor-pointer font-light hover:bg-primary-orange-light hover:text-primary-orange-dark duration-300 text-white">
                Login
                </button>
                )
            })
        }
    </nav>
  )
}

export default Navbar