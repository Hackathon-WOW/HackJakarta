"use client";

import { supabase } from "@/supabase";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { useRouter } from 'next/navigation';
import { Router } from "next/router";
import { useState } from "react";

const Navbar = () => {
  const pathName = usePathname();
  const router = useRouter()
  let sessioncoba = '';
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

  const  getSession = async()=> {
      const { data : {session} } = await supabase.auth.getSession()
      sessioncoba = session
      return session
  }

  const logout = async() => {
    const { error } = await supabase.auth.signOut()
    sessioncoba = await supabase.auth.getSession()
    window.location.reload()
  }


  return (
    <nav className="flex gap-8 justify-between mx-20">
        {NavLink.map((nav, index) =>{
            return (
                <Link href={nav.pathLink} key={index} className={`${nav.pathLink===pathName && "text-white border-b-2 border-accent"} font-medium hover:text-primary-orange-medium hover:border-b-2 border-white transition-all`}>
                    {nav.pathName}
                </Link>
            )
        })}
        {
            getSession().then(session => {
                return (
                session !== null ? <button onClick={logout} className="w-32 h-10 rounded-lg bg-primary-orange-dark outline-none cursor-pointer font-medium hover:bg-primary-green-light hover:border-primary-green-dark hover:text-primary-green-dark duration-300 text-white">Logout</button>:
                <Link href="/auth/login">
                    <button className="w-32 h-10 rounded-lg bg-primary-orange-dark  outline-none cursor-pointer font-medium hover:bg-primary-green-light hover:border-primary-green-dark hover:text-primary-green-dark duration-300 text-white">Login</button>
                </Link>
                )
            })
        }
    </nav>
  )
}

export default Navbar