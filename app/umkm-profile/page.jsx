"use client"


import { supabase } from '@/supabase'
import React, { useEffect, useState} from 'react'
import toast, { Toaster } from 'react-hot-toast';
import Header from '@/components/Header';
import { MdOutlineEmail, MdOutlineLockOpen } from "react-icons/md";

const profile = () => {
    let metadata1 = "asdfs"
    // const fetchData = async() =>{
        
    //     try {
    //         const [metadata2, error] = await supabase.from('main.showcase').select('id')
    //         metadata1 = metadata2
    //         if(error){
    //             throw error
    //         }
    //     } catch (error) {
    //         console.log("skdflasdfasdf")
    //     }
    //     console.log(metadata1)
    //     return metadata1
    // }
    // const metadataVar = fetchData()

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({
          ...prev,
          [name]: value
        }))
      }

    return(
        <>
        <div className='bg-primary-green-dark min-h-screen'>
            <Header/>
            <div className='bg-accent-superWhite flex flex-col h-full w-full overflow-x-hidden'>
                <div className='flex flex-row flex-grow mx-60 my-10 h-full w-11/12'>
                    <div className='bg-accent-superWhite text-primary-green-dark text-4xl font-bold my-5'>
                        Profile
                    </div>
                    <div id="blackline" className='border-black bg-accent-black mx-10 my-5 h-auto w-0.5 opacity-40'></div>
                    <div className='flex flex-col justify-center my-5 w-full'>
                        <div className='text-accent-black mb-3'>Email</div>
                        <div className='relative w-full mb-3'>
                            <input type="text" name="email" onChange={handleChange} value="" className='block w-2/3 py-2.5 px-5 text-sm text-accent-lightGrey bg-transparent border-2 italic border-gray-300 shadow-sm rounded-md'></input>
                        </div>
                        <div className='text-accent-black mb-3'>Password</div>
                        <div className='relative w-full mb-3'>
                            <input type="text" name="password" onChange={handleChange} value="" className='block w-2/3 py-2.5 px-5 text-sm text-accent-lightGrey bg-transparent border-2 italic border-gray-300 shadow-sm rounded-md'></input>
                        </div>
                        <div className='text-accent-black mb-3'>Company Name</div>
                        <div className='relative w-full mb-3'>
                            <input type="text" name="companyName" onChange={handleChange} value="" className='block w-2/3 py-2.5 px-5 italic text-sm text-accent-lightGrey bg-transparent border-2 border-gray-300 shadow-sm rounded-md'></input>
                        </div>
                        <div className='text-accent-black mb-3'>Year Established</div>
                        <div className='relative w-full mb-3'>
                            <input type="text" name="yearEstablished" onChange={handleChange} value="" className='block w-2/3 py-2.5 px-5 italic text-sm text-accent-lightGrey bg-transparent border-2 border-gray-300 shadow-sm rounded-md'></input>
                        </div>
                        <div className='text-accent-black mb-3'>Company Category</div>
                        <div className='relative w-full mb-3'>
                            <input type="text" name="companyCategory" onChange={handleChange} value="" className='block w-2/3 py-2.5 px-5 italic text-sm text-accent-lightGrey bg-transparent border-2 border-gray-300 shadow-sm rounded-md'></input>
                        </div>
                        <div className='text-accent-black mb-3'>Company Description</div>
                        <div className='relative w-full mb-3'>
                            <input type="text" name="companyDescription" onChange={handleChange} value="" className='block w-2/3 py-2.5 italic px-5 text-sm text-accent-lightGrey bg-transparent border-2 border-gray-300 shadow-sm rounded-md'></input>
                        </div>
                        <div className='text-accent-black mb-3'>Company Address</div>
                        <div className='relative w-full mb-3'>
                            <input type="text" name="companyAddress" onChange={handleChange} value="" className='block w-2/3 py-2.5 px-5 text-sm italic text-accent-lightGrey bg-transparent border-2 border-gray-300 shadow-sm rounded-md'></input>
                        </div>
                        <div className='text-accent-black mb-3'>Contact Person</div>
                        <div className='relative w-full mb-3'>
                            <input type="text" name="contactPerson" onChange={handleChange} value="" className='block w-2/3 py-2.5 px-5 text-sm italic text-accent-lightGrey bg-transparent border-2 border-gray-300 shadow-sm rounded-md'></input>
                        </div>
                    </div>
                </div>
                <div className='flex justify-center items-end mb-10'>
                    <button className="w-80 h-10 rounded-lg bg-primary-orange-dark outline-none cursor-pointer font-medium hover:bg-primary-green-light border-2 border-primary-orange-dark hover:border-primary-green-dark hover:text-primary-green-dark duration-300 text-white">Submit</button>
                </div>
                <div className='flex flex-col mt-5 mb-10'>
                    <div className='text-primary-green-dark text-2xl font-bold ml-60 pr-32'> Haven’t connected to POS? </div>
                    <div className='text-primary-orange-dark text-2xl font-bold ml-60 pr-32'> Connect Now! </div>
                    <div className='text-primary-green-dark w-3/4 text-justify text-xl ml-60 pr-32'>
                        By connecting your POS account to our platform, we can provide comprehensive financial analysis 
                        to help investors evaluate your business. Positive results can significantly enhance your chances 
                        of attracting investment partnerships. Once the connection is made, you also have the option to feature 
                        your business in our UMKM showcase section, gaining additional visibility and potential opportunities.
                    </div>
                    <button className="w-40 h-12 rounded-lg bg-primary-green-dark border-primary-green-dark border-2 ml-60 mt-5 font-medium hover:bg-primary-green-light hover:border-primary-green-dark
                     hover:text-primary-green-dark duration-300 text-white">Connect to POS
                     </button>
                </div>
            </div>
        </div>
            
        </>
    )
}


export default profile