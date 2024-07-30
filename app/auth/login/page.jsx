"use client"

import { createClient } from '@/utils/supabase/client';
import React, { useState } from 'react'
import { MdOutlineEmail, MdOutlineLockOpen } from "react-icons/md";
import toast from 'react-hot-toast';
import ToasterStyle from '../../components/toaster'

const Login = () => {
    const [data, setData] = useState({
        email: "",
        password: ""
    })

    const login = async () => {
        const supabase = createClient();
        console.log(await supabase.auth.getUser)
        try{
            const { error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password
            });
            if (error) {
                toast.error(error.message)
                throw error;
            }
            revalidatePath('/', 'layout')
            redirect('/')
            
        } catch (error){
            setData((prev) => ({
                ...prev,
                email: "",
                password: ""
            }));
        }
    }

    const handleChange = (e) => {
        const {name, value } = e.target;
        setData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

  return (
    <>
        <ToasterStyle />
        <div className="text-accent-superWhite flex min-h-screen w-screen justify-center items-center bg-gradient-to-b from-primary-green-dark to-primary-orange-dark">
            <div className="bg-accent-superWhite border border-white rounded-md p-8 my-4 shadow-lg backdrop-filter backdrop-blur bg-opacity-100 relative">
                <div className='h-full flex flex-col items-center m-10'>
                    <div className='text-accent-black text-4xl font-bold my-3'>Login</div>
                    <div className='text-accent-black text-xl font-bold my-3'>To access all our features, please login.</div>
                    <div className="relative my-4">
                        <input type="text" name='email' value={data?.email} onChange={handleChange} className='block w-72 py-2.5 px-0 text-md text-accent-black bg-transparent border-0 border-b-2 border-accent-black appearance-none focus:outline-none focus:ring-0 focus:text-accent-black focus:border-primary-orange-dark peer' placeholder=''/>
                        <label htmlFor="" className='absolute text-md text-accent-black duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-accent-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>Email Address</label>
                        <MdOutlineEmail className='absolute top-4 right-4 text-accent-black peer-focus:text-accent-black text-xl' />
                    </div>
                    <div className="relative my-4">
                        <input type="password" name='password' value={data?.password} onChange={handleChange} className='block w-72 py-2.5 px-0 text-md text-accent-black bg-transparent border-0 border-b-2 border-accent-black appearance-none focus:outline-none focus:ring-0 focus:text-accent-black focus:border-primary-orange-dark peer' placeholder=''/>
                        <label htmlFor="" className='absolute text-md text-accent-black duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-accent-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>Password</label>
                        <MdOutlineLockOpen className='absolute top-4 right-4 text-accent-black peer-focus:text-accent-black text-xl' />
                    </div>
                    <button type='Submit' onClick={login} className='w-72 mb-4 text-lg font-medium mt-6 rounded-full bg-primary-green-dark text-accent-superwhite hover:bg-primary-green-medium hover:text-primary-green-light py-2 duration-300'>Sign In</button>
                    <div className='border border-t-0 border-accent-black w-full'></div>
                    <div className='mt-4 font-semibold text-md text-accent-black text-center'>
                        Dont have an account? <span>
                            <a href="./auth/register" className='text-primary-orange-dark hover:text-primary-orange-medium hover:underline hover:underline-offset-4 duration-300'>
                                Sign Up Here
                            </a>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </>
  )
}

export default Login