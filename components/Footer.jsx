"use client";

import { supabase } from "@/supabase";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";

const Footer = () => {
  const pathName = usePathname();
  const NavLink = [
    {
        pathName: "About Us",
        pathLink: "/about"
    },
    {
        pathName: "UMKM Showcase",
        pathLink: "/umkm"
    },
    {
        pathName: "Detail UMKM",
        pathLink: "/detail-umkm" // sementara
    },
  ]

  async function  getSession() {
      const { data : {session} } = await supabase.auth.getSession()
      return session
  }

  return (
    <div className="w-screen min-h-64 flex flex-col justify-center items-center px-[80px] py-4  bg-primary-green-dark">
        <div className="grid grid-cols-6 w-full">
            <div>
                <img src="logo.svg" className="h-[90px]" />
            </div>
            <div className="grid col-span-3">
                    {NavLink.map((nav, index) =>{
                    return (
                        <Link href={nav.pathLink} key={index} className={`text-white font-normal hover:text-primary-green-light transition-all`}>
                            {nav.pathName}
                        </Link>
                    )
                })}
            </div>
            <div className="grid col-span-2 place-content-end">
                <div className="mb-[58px]">
                    <p className="text-white text-lg font-bold">Grow your business with Us</p>
                </div>
                <div>
                    <p className="text-white font-normal text-sm">Contact Us</p>
                    <div className="flex grid-cols-4 mt-[10px]">
                        <img src="twitter.svg" className="h-[24px] mx-2" />
                        <img src="twitter.svg" className="h-[24px] mx-2" />
                        <img src="twitter.svg" className="h-[24px] mx-2" />
                        <img src="twitter.svg" className="h-[24px] mx-2" />
                    </div>
                </div>
            </div>

        </div>
        <div className="w-full mt-[30px]">
            <div className=" min-h-[1px] bg-white inline-block rounded-full "></div>
            <div className="flex justify-between">
                <div className="text-white text-xs font-normal">© 2024 Grow. All rights reserved</div>
                <div className="text-white text-xs font-normal underline">Privacy Policy</div>
            </div>
        </div>
     </div>
  )
}

export default Footer