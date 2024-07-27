"use client"

import { supabase } from '@/supabase'
import React, { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast';
import { MdOutlineEmail, MdOutlineLockOpen } from "react-icons/md";

const Login = () => {
    const [data, setData] = useState({
        email: "",
        password: ""
    })

    const login = async () => {
        try{
            const { data, error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password
            })
            if (error) {
                throw error;
            }

        } catch (error){
            setData((prev) => ({
                ...prev,
                email: "",
                password: ""
            }));
            toast.error("Email dan Password yang Anda Masukkan Tidak Sesuai")
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
        <Toaster position='top-right' gutter={3}
              toastOptions={{
                success: {
                  style: {
                    border: '1px solid #52D689',
                    background: '#C7DDB5'
                  },
                },
                error: {
                  style: {
                    border: '1px solid #F97072',
                    background: '#FECACA'
                  },
                },
              }}
        />
        <div className="text-accent-superWhite flex h-screen w-screen justify-center items-center bg-gradient-to-b from-primary-green-dark to-primary-orange-dark">
            <div className="bg-accent-superWhite border border-white rounded-md p-8 my-4 shadow-lg backdrop-filter backdrop-blur bg-opacity-100 relative">
                <div className='h-full flex flex-col items-center m-10'>
                    <div className='text-accent-black text-4xl font-bold my-3'>Login</div>
                    <div className='text-accent-black text-xl font-bold my-3'>To access all our features, please login.</div>
                    <div className="relative my-4">
                        <input type="text" name='email' value={data?.email} onChange={handleChange} className='block w-72 py-2.5 px-0 text-md text-accent-black bg-transparent border-0 border-b-2 border-accent-black appearance-none focus:outline-none focus:ring-0 focus:text-accent-black focus:border-primary-orange-dark peer' placeholder=''/>
                        <label htmlFor="" className='absolute text-md text-accent-black duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-primary-orange-dark peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>Alamat Email</label>
                        <MdOutlineEmail className='absolute top-4 right-4 text-accent-black peer-focus:text-primary-orange-dark text-xl' />
                    </div>
                    <div className="relative my-4">
                        <input type="password" name='password' value={data?.password} onChange={handleChange} className='block w-72 py-2.5 px-0 text-md text-accent-black bg-transparent border-0 border-b-2 border-accent-black appearance-none focus:outline-none focus:ring-0 focus:text-accent-black focus:border-primary-orange-dark peer' placeholder=''/>
                        <label htmlFor="" className='absolute text-md text-accent-black duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-primary-orange-dark peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>Kata Sandi</label>
                        <MdOutlineLockOpen className='absolute top-4 right-4 text-accent-black peer-focus:text-primary-orange-dark text-xl' />
                    </div>
                    <button type='Submit' onClick={login} className='w-72 mb-4 text-lg font-medium mt-6 rounded-full bg-primary-green-dark text-accent-superwhite hover:bg-primary-green-medium hover:text-primary-green-light py-2 duration-300'>Masuk</button>
                    <div className='border border-t-0 border-accent-black w-full'></div>
                    <div className='mt-4 font-semibold text-md text-accent-black text-center'>
                        Tidak memiliki akun? <span>
                            <a href="./auth/register" className='text-primary-orange-dark hover:text-primary-orange-medium hover:underline hover:underline-offset-4 duration-300'>
                                Daftarkan disini
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