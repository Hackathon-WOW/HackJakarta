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
        pathLink: "/umkm"
    },
    {
        pathName: "Open Tender",
        pathLink: "/tender"
    },
  ]

  async function  getSession() {
      const { data : {session} } = await supabase.auth.getSession()
      return session
  }

  return (
    <nav className="flex gap-8">
        {NavLink.map((nav, index) =>{
            return (
                <Link href={nav.pathLink} key={index} className={`${nav.pathLink===pathName && "text-primary-green-dark border-b-2 border-accent"} font-medium hover:text-primary-green-medium hover:border-b-2 border-primary-green-dark transition-all`}>
                    {nav.pathName}
                </Link>
            )
        })}
        {
            getSession().then(session => {
                return (
                session ? <button className="w-32 h-10 rounded-lg bg-primary-green-dark border-2 border-white outline-none cursor-pointer font-medium hover:bg-primary-green-light hover:border-primary-green-dark hover:text-primary-green-dark duration-300 text-white">Logout</button>:<button className="w-32 h-10 rounded-lg bg-primary-green-dark border-2 border-white outline-none cursor-pointer font-medium hover:bg-primary-green-light hover:border-primary-green-dark hover:text-primary-green-dark duration-300 text-white">Login</button>
                )
            })
        }
    </nav>
  )
}

export default Navbar