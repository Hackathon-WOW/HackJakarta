"use client";

import Link from "next/link";
import Image from "next/image";
import { FaGithub, FaTwitter, FaInstagram } from "react-icons/fa6";
import { IoIosMail } from "react-icons/io";
import { Fragment } from "react";

const Footer = () => {
    const FooterNavLink = [
        {
            id: 1.1,
            section : "Navigation",
            path : [
                {
                    id: 1,
                    pathName: "Home",
                    pathLink: "/"
                },
                {
                    id: 2,
                    pathName: "UMKM Showcase",
                    pathLink: "/umkm"
                },
                {
                    id: 3,
                    pathName: "Detail UMKM",
                    pathLink: "/detail-umkm"
                },
            ]
        },
        {
            id: 1.2,
            section: "Follow Us",
            path: [
                {
                    id: 4,
                    pathName: "Github",
                    pathLink: ""
                }
            ]
        },
        {
            id: 1.3,
            section: "Legal",
            path: [
                {
                    id: 5,
                    pathName: "Privacy Policy",
                    pathLink: "/"
                },
                {
                    id: 6,
                    pathName: "Terms & Conditions",
                    pathLink: "/"
                }
            ]
        }
    ]

  return (
    <>
    <footer className="bg-primary-green-dark text-accent-superWhite">
        <div className="mx-auto w-full max-w-screen-xl p-4 py-6">
            <div className="flex justify-between">
                <div className="mb-0 flex flex-col w-72">
                    <Link href="/" className="flex justify-center items-center">
                        <Image src={"/logo.svg"} width={180} height={90} className="me-3 items-center" alt="Grow Logo" priority={true}/>
                    </Link>
                    <div className="me-3">
                        Seamless financial management, easier access, and unlock new growth opportunities
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-8">
                    {FooterNavLink.map((nav, index) => {
                        return (
                            <ul key={nav.id} className="font-medium">
                                <h2 key={nav.id} className="mb-6 text-sm text-primary-orange-dark font-semibold uppercase">{nav.section}</h2>
                                {nav.path.map((val, innerIndex) => {
                                    return(
                                        <>
                                            <li key={val.id} className="mb-4">
                                                <Link href={val.pathLink} key={val.id} className="hover:border-b-2 border-primary-green-light transition-all">
                                                    {val.pathName}
                                                </Link>
                                            </li>
                                        </>
                                    )
                                })}
                            </ul>
                        )
                    })
                    }
                </div>
                <div className="flex flex-col">
                    <div className="mb-14">
                        <p className="text-white text-lg font-bold">Grow your business with Us</p>
                    </div>
                    <div>
                        <p className="text-white font-light text-sm">Stay Connected:</p>
                        <div className="flex grid-cols-4 mt-3">
                            <Link href={"/"} className="w-12 h-12 mr-4 border border-primary-green-dark rounded-full flex justify-center items-center text-white text-3xl hover:bg-primary-orange-dark hover:text-primary-green-dark hover:transition-all duration-500" target="_blank">
                                <IoIosMail />
                            </Link>
                            <Link href={"/"} className="w-12 h-12 mr-4 border border-primary-green-dark rounded-full flex justify-center items-center text-white text-3xl hover:bg-primary-orange-dark hover:text-primary-green-dark hover:transition-all duration-500" target="_blank">
                                <FaGithub />
                            </Link>
                            <Link href={"/"} className="w-12 h-12 mr-4 border border-primary-green-dark rounded-full flex justify-center items-center text-white text-3xl hover:bg-primary-orange-dark hover:text-primary-green-dark hover:transition-all duration-500" target="_blank">
                                <FaTwitter />
                            </Link>
                            <Link href={"/"} className="w-12 h-12 border border-primary-green-dark rounded-full flex justify-center items-center text-white text-3xl hover:bg-primary-orange-dark hover:text-primary-green-dark hover:transition-all duration-500" target="_blank">
                                <FaInstagram />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <hr className="mt-8 mb-6 border-accent-superWhite" />
        <div className="text-center align-middle pb-6">
            <span className="text-md">© 2024 <a href="https://hack-jakarta.vercell.app" className="hover:underline">Grow™</a>. All Rights Reserved.</span>
        </div>
    </footer>
    </>
  )
}

export default Footer