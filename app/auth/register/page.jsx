"use client"

import { Category } from '@/app/static/Category';
import { supabase } from '@/supabase';
import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const Register = () => {
  const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/; 
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  const router = useRouter();
  const [data, setData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })

  const register = async () => {
    if (data.email && data.password && data.confirmPassword){
      if (!emailRegex.test(data.email)){
        toast.error('Email Input Is Not Valid')
      }else if (!passRegex.test(data.password)){
        toast.error('Password must contains 8 Character with UpperCase, Lowercase, and Numeric combination')
      }else if (data.password != data.confirmPassword){
        toast.error("Confirmation Password not equals with Password")
      } else {
        try{
          const { dataSignUp, error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password
          })
          if(error){
            throw error;
          }else {
            router.push('/auth/login');
          }
        }
        catch(error){
          toast.error(error.message)
          setData((prev) => ({
            ...prev,
            email: "",
            password: "",
            confirmPassword: ""
          }))
        }
      }
    }else{
      toast.error('Required field must be Filled')
    }
    
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value
    }))
  }
  
  return (
    <div className="min-h-screen text-white flex h-full w-screen justify-center items-center bg-gradient-to-b from-primary-green-dark to-primary-orange-dark">
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
      <div className="bg-accent-superWhite border border-accent-lightGrey rounded-md p-8 my-4 shadow-lg backdrop-filter backdrop-blur bg-opacity-100 items-center relative">
        <div className='h-full flex flex-col items-center m-10'>
          <div className="text-accent-black text-4xl font-bold my-4 mx-auto">Register</div>
          <div className="text-accent-black text-lg font-bold mb-4 mx-auto">To access all our features, please complete the registration process</div>
            <div className='h-full flex flex-col items-center m-10'>
              <div className="relative w-full my-4">
                <input type="text" name='email' value={data.email} onChange={handleChange} className='block w-72 py-2.5 px-0 text-md text-accent-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:text-accent-black focus:border-accent-black peer' placeholder=''/>
                <label htmlFor="" className='absolute text-md text-accent-black duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-accent-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>Email Address</label>
              </div>
              <div className="relative w-full my-4">
                <input type="password" name='password' value={data.password} onChange={handleChange} className='block w-72 py-2.5 px-0 text-md text-accent-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:text-accent-black focus:border-accent-black peer' placeholder=''/>
                <label htmlFor="" className='absolute text-md text-accent-black duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-accent-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>Password</label>
              </div>
              <div className="relative w-full my-4">
                <input type="password" name='confirmPassword' value={data.confirmPassword} onChange={handleChange} className='block w-72 py-2.5 px-0 text-md text-accent-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:text-accent-black focus:border-accent-black peer' placeholder=''/>
                <label htmlFor="" className='absolute text-md text-accent-black duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-accent-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>Konfirmasi Password</label>
              </div>
              <div className='mt-4 flex w-full justify-center items-center'>
                <button onClick={register} className='px-3 py-2 text-lg rounded-md w-full text-white bg-primary-green-dark hover:bg-primary-green-medium hover:text-primary-green-light'>Register</button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default Register