"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "../app/auth/actions";
import { Avatar, Dropdown } from "flowbite-react";
import { createClient } from "@/utils/supabase/client";
import { FaUsersGear, FaShop } from "react-icons/fa6";
import { IoLogOut } from "react-icons/io5";
import { useState } from "react";
import Image from "next/image";

const Navbar = ({ User:user }) => {
  const [open, setOpen] = useState(false);
  const supabase = createClient()
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
    <nav className="flex gap-8 justify-between mx-20">
        {NavLink.map((nav, index) =>{
          return (
            <Link href={nav.pathLink} key={index} className={`${nav.pathLink===pathName && "text-primary-orange-dark border-primary-orange-dark border-b-2"} h-7 my-auto font-medium hover:text-primary-orange-dark hover:border-b-2 border-primary-orange-dark transition-all`}>
              {nav.pathName}
            </Link>
          )
        })}
				
        {
        	user ? 
          <>
            <Image src={"/twitter.svg"} height={30} width={30} alt="Profile Picture" className="w-10 h-10 rounded-full cursor-pointer text-end border-2 border-primary-orange-medium" onClick={() => {setOpen(!open)}} />
            <div className={`absolute top-16 w-80 z-50 ${open? "max-h-96":"hidden"} transition-transform duration-500`}>
              <div className="bg-primary-green-medium p-5 m-3">
                <div className="flex items-center">
                  <Image src={"/twitter.svg"} height={60} width={60} alt="Profile Picture" className=" w-12 h-12 rounded-full cursor-pointer mr-3 border-2 border-primary-orange-medium" />
                  <h2>Kelvin Saputra</h2>
                </div>
                <hr className="border-0 h-px w-full bg-primary-orange-dark mt-3 mb-2 mx-0" />
                {/* <div className="h-px w-full bg-primary-orange-dark my-3"></div */}
                <Link href={"/"} className="flex items-center text-accent-superWhite my-3 mx-0 hover:text-bold hover:text-primary-orange-dark duration-500">
                  <FaUsersGear className="w-10 h-10 bg-primary-green-dark rounded-full p-2 mr-4"/>
                  <p className="w-full hover:font-semibold">Profile Settings</p>
                  <span className="text-xl transform duration-500 translate-x-2">&gt;</span>
                </Link>
                <Link href={"/"} className="flex items-center text-accent-superWhite my-3 mx-0 hover:text-bold hover:text-primary-orange-dark hover:p-0 duration-500">
                  <FaShop className="w-10 h-10 bg-primary-green-dark rounded-full p-2 mr-4"/>
                  <p className="w-full hover:font-semibold">Showcase Settings</p>
                  <span className="text-xl transform duration-500 translate-x-2">&gt;</span>
                </Link>
                <Link href={"/"} className="flex items-center text-accent-superWhite my-3 mx-0 hover:text-bold hover:text-primary-orange-dark hover:p-0 duration-500">
                  <IoLogOut className="w-10 h-10 bg-primary-green-dark rounded-full p-2 mr-4"/>
                  <p className="w-full hover:font-semibold">Logout</p>
                  <span className="text-xl transform duration-500 translate-x-2">&gt;</span>
                </Link>
              </div>
            </div>
          </>
          :
					<Link href={"/auth/login"}>
						<button className="w-32 h-10 rounded-lg bg-primary-orange-dark border-2 border-primary-green-dark outline-none cursor-pointer font-medium hover:bg-primary-orange-light hover:border-primary-green-dark hover:text-primary-orange-dark duration-100 text-white">Login</button>
					</Link>
        }
    </nav>
  )
}

export default Navbar