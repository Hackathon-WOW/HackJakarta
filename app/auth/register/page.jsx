"use client"

import { Category } from '@/app/static/Category';
import { supabase } from '@/supabase';
import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { BiChevronDown } from "react-icons/bi";
import { AiOutlineSearch } from "react-icons/ai";
import { FaRegUser, FaBookOpen } from "react-icons/fa";
import { MdOutlineAssignmentTurnedIn } from "react-icons/md"

const Register = () => {
  const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/; 
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  const formIndexPage = [1,2,3,4,5];
  const formIndexPage1 = [[1],[2,4],[3,5]];
  const pageInformation = [
    {
        info : "Account Credentials",
        icon : <FaRegUser />
    },
    {
        info : "Company General Information",
        icon : <MdOutlineAssignmentTurnedIn />
    }, 
    {
        info : "Company Detail Information",
        icon : <FaBookOpen />
    }
  ]
  const [categories, setCategories] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selected, setSelected] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setCategories(Category);
  }, []);
  
  
  const [formPage, setFormPage] = useState(formIndexPage[0])
  
  const [dataInvestor, setDataInvestor] = useState({
    id: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    name: "",
    address: "",
    phoneNumber: "",
    administrator: "",
    dateFounded: "",
    Description: "",
    Category: "",
  })
  const [dataUMKM, setDataUMKM] = useState({
    id: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "UMKM",
    name: "",
    address: "",
    phoneNumber: "",
    administrator: "",
    dateFounded: "",
    Description: "",
    Category: "",
  })

  const register = async () => {
    if (formPage === 4 && dataUMKM.Category && dataUMKM.address){
      const { data, error } = await supabase.auth.signUp({
        email: dataUMKM.email,
        password: dataUMKM.password
      })
      console.log(error)
      
      const { errorInsert } = await supabase
      .from('main.umkm_profile')
      .insert({ 
        id: data.id,
        email: dataUMKM.email,
        name: dataUMKM.name,
        address: dataUMKM.address,
        administrator: dataUMKM.administrator,
        phone: dataUMKM.phone,
        date_created: dataUMKM.dataFounded,
        category: dataUMKM.category
       })

    } else if (formPage === 5 && dataInvestor.Category && dataInvestor.address) {
      const { data, error } = await supabase.auth.signUp({
        email: dataInvestor.email,
        password: dataInvestor.password
      })
      console.log(error)
      const { errorInsert } = await supabase
      .from('main.investor_profile')
      .insert({ 
        id: data.id,
        email: dataInvestor.email,
        name: dataInvestor.name,
        address: dataInvestor.address,
        administrator: dataInvestor.administrator,
        phone: dataInvestor.phone,
        date_created: dataInvestor.dateFounded,
        category: dataInvestor.category
       })
       console.log(date_created)
       console.log(errorInsert)
    } else {
      toast.error('Please fill all required fields')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (value === "UMKM") {
      setDataUMKM((prev) => ({
        ...prev,
        [name]: value,
      }));
      setDataInvestor((prev) => ({
        ...prev,
        [name]: "",
      }));
    } else if (value === "INVESTOR") {
      setDataInvestor((prev) => ({
        ...prev,
        [name]: value,
      }));
      setDataUMKM((prev) => ({
        ...prev,
        [name]: "",
      }));
    } else {
      if (dataInvestor.role === "INVESTOR") {
        setDataInvestor((prev) => ({
          ...prev,
          [name]: value,
        }));
        setDataUMKM((prev) => ({
          ...prev,
          [name]: "",
        }));
      } else {
        setDataUMKM((prev) => ({
          ...prev,
          [name]: value,
        }));
        setDataInvestor((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
    }
  }
  
  const nextForm = () => {
    if (formPage === 1 && ((dataUMKM.role === "UMKM" && dataUMKM.email && dataUMKM.password) )) {
      if (!emailRegex.test(dataUMKM.email)) {
        toast.error('Email is not Valid')

      } else if (!passRegex.test(dataUMKM.password)) {
        toast.error('Password must contains 8 Character with UpperCase, Lowercase, and Numeric combination')

      } else if(dataUMKM.password !== dataUMKM.confirmPassword) {
        toast.error('The confirmation password not valid')

      } else {
        setFormPage(formPage + 1);
      }
    } else if (formPage === 1 && dataInvestor.role === "INVESTOR" && dataInvestor.email && dataInvestor.password && dataInvestor.password === dataInvestor.confirmPassword) {
      if (!emailRegex.test(dataInvestor.email)) {
        toast.error('Email is not Valid')

      } else if (!passRegex.test(dataInvestor.password)) {
        toast.error('Password must contains 8 Character with UpperCase, Lowercase, and Numeric combination')

      } else if(dataInvestor.password !== dataInvestor.confirmPassword) {
        toast.error('The confirmation password not valid')
        
      } else {
        setFormPage(formPage + 2);
      }
    } else if (formPage === 2 && dataUMKM.name && dataUMKM.phoneNumber && dataUMKM.administrator && dataUMKM.dateFounded && dataUMKM.Description) {
      setFormPage(formPage + 2);
    } else if (formPage === 3 && dataInvestor.name && dataInvestor.phoneNumber && dataInvestor.administrator && dataInvestor.dateFounded && dataInvestor.Description) {
      setFormPage(formPage + 2);
    } else {
      toast.error('Please fill all required fields')
    }
  }

  const previousForm = () => {
    if (formPage % 2 === 1) {
      setFormPage(formPage - 2);
    } else {
      formPage === 2 ? setFormPage(formPage - 1):setFormPage(formPage - 2);
    }
  }

  const isPageActive = (page, index) => {
    return (formPage === 1 && index === 0) || (formPage >= 2 && formPage <= 3 && index <= 1) || (formPage >= 4 && index <= 2);
  };

  const isPageDone = (page, index) => {
    return (formPage >= 2 && index == 0) || (formPage >= 3 && index == 1);
  };

  const isConnectorActive = (page, index) => {
      return (formPage >= 2 && formPage <= 3 && index < 1) || (formPage >= 4 && index < 2);
  };

  const isConnectorDone = (page, index) => {
      return (formPage >= 2 && formPage <= 3 && index < 1) || (formPage >= 4 && index < 2);
  };

  return (
    <div className="min-h-screen text-white flex h-full w-screen justify-center items-center bg-gradient-to-br from-primary-green-dark to-primary-orange-dark">
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
        <div className='flex justify-center items-center'>
          {
            formIndexPage1.map((page, index) => {
              return (
                <>
                  <div key={index} className={`w-10 h-10 my-3 mx-1 text-white rounded-full ${isPageActive(page[0], index) ? "bg-primary-orange-dark text-white":isPageDone(page[0], index)? 'bg-primary-green-dark':'bg-accent-lightGrey'} h-9 flex flex-row justify-center items-center`}>
                    {pageInformation[page[0]-1].icon}
                  </div>
                  {
                    index !== formIndexPage1.length - 1 && <div className={`w-24 h-1 ${isConnectorActive(page[0], index) ? 'bg-primary-orange-dark' : 'bg-accent-lightGrey'}`}></div>
                  }
                </>
              )
            })
          }
        </div>
        {
          formPage === 1 && <>
            <div className='h-full flex flex-col items-center m-10'>
              <div className="relative my-4">
                <input type="text" name='email' value={dataUMKM.role==="UMKM" ? dataUMKM.email:dataInvestor.email} onChange={handleChange} className='block w-72 py-2.5 px-0 text-md text-accent-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:text-accent-black focus:border-accent-black peer' placeholder=''/>
                <label htmlFor="" className='absolute text-md text-accent-black duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-accent-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>Email Address</label>
              </div>
              <div className="relative my-4">
                <input type="password" name='password' value={dataUMKM.role==="UMKM" ? dataUMKM.password:dataInvestor.password} onChange={handleChange} className='block w-72 py-2.5 px-0 text-md text-accent-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:text-accent-black focus:border-accent-black peer' placeholder=''/>
                <label htmlFor="" className='absolute text-md text-accent-black duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-accent-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>Password</label>
              </div>
              <div className="relative my-4">
                <input type="password" name='confirmPassword' value={dataUMKM.role==="UMKM" ? dataUMKM.confirmPassword:dataInvestor.confirmPassword} onChange={handleChange} className='block w-72 py-2.5 px-0 text-md text-accent-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:text-accent-black focus:border-accent-black peer' placeholder=''/>
                <label htmlFor="" className='absolute text-md text-accent-black duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-accent-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>Konfirmasi Password</label>
              </div>
              <div className='flex flex-col my-4'>
                  <div className="flex flex-row items-center">
                    <input value="UMKM" checked={dataUMKM.role === "UMKM"} onChange={handleChange} className='p-2 border border-slate-400 mt-1 outline-0 focus:border-blue-500 rounded-md mr-2' type="radio" name='role' id='umkm' />
                    <label htmlFor="umkm" className='mr-4 text-accent-black'>UMKM</label>
                    <input value="INVESTOR" checked={dataInvestor.role === "INVESTOR"} onChange={handleChange} className='p-2 border border-slate-400 mt-1 outline-0 focus:border-blue-500 rounded-md mr-2' type="radio" name='role' id='investor' />
                    <label htmlFor="investor" className='text-accent-black'>INVESTOR</label>
                  </div>
                </div>
              <div className='mt-4 flex w-full justify-center items-center'>
                <button onClick={nextForm} className='px-3 py-2 text-lg rounded-md w-full text-white bg-primary-green-dark hover:bg-primary-green-medium hover:text-primary-green-light'>Lanjut</button>
              </div>
            </div>
          </>
        }

        {
          formPage === 2 && <> 
            <div className='h-full flex flex-col items-center m-10'>
              <div className="relative my-4">
                <input type="text" name='name' value={dataUMKM?.name} onChange={handleChange} className='block w-72 py-2.5 px-0 text-md text-accent-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:text-accent-black focus:border-accent-black peer' placeholder=''/>
                <label htmlFor="" className='absolute text-md text-accent-black duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-accent-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>Nama Usaha</label>
              </div>
              <div className="relative my-4">
                <input type="text" name='phoneNumber' value={dataUMKM?.phoneNumber} onChange={handleChange} className='block w-72 py-2.5 px-0 text-md text-accent-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:text-accent-black focus:border-accent-black peer' placeholder=''/>
                <label htmlFor="" className='absolute text-md text-accent-black duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-accent-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>Nomor Handphone</label>
              </div>
              <div className="relative my-4">
                <input type="text" name='administrator' value={dataUMKM?.administrator} onChange={handleChange} className='block w-72 py-2.5 px-0 text-md text-accent-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:text-accent-black focus:border-accent-black peer' placeholder=''/>
                <label htmlFor="" className='absolute text-md text-accent-black duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-accent-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>Pemilik Usaha</label>
              </div>
              <div className="relative my-4">
                <input type="date" name='dateFounded' value={dataUMKM?.dateFounded} onChange={handleChange} className='block w-72 py-2.5 px-0 text-md text-accent-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:text-accent-black focus:border-accent-black peer' placeholder=''/>
                <label htmlFor="" className='absolute text-md text-accent-black duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-accent-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>Tanggal Pendirian</label>
              </div>
              <div className="relative my-4">
                <input type="text" name='Description' value={dataUMKM?.Description} onChange={handleChange} className='block w-72 py-2.5 px-0 text-md text-accent-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:text-accent-black focus:border-accent-black peer' placeholder=''/>
                <label htmlFor="" className='absolute text-md text-accent-black duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-accent-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>Deskripsi</label>
              </div>
              <div className='mt-4 flex w-full justify-center items-center'>
                <button onClick={previousForm} className='px-3 py-2 text-lg rounded-md w-full text-white bg-red-500'>Kembali</button>
                <button onClick={nextForm} className='px-3 py-2 text-lg rounded-md w-full text-white bg-primary-green-dark hover:bg-primary-green-medium hover:text-primary-green-light'>Lanjut</button>
              </div>
            </div>
          </>
        }

        {
          formPage === 3 && <> 
            <div className='h-full flex flex-col items-center m-10'>
              <div className="relative my-4">
                <input type="text" name='name' value={dataInvestor?.name} onChange={handleChange} className='block w-72 py-2.5 px-0 text-md text-accent-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:text-accent-black focus:border-accent-black peer' placeholder=''/>
                <label htmlFor="" className='absolute text-md text-accent-black duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-accent-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>Nama Usaha</label>
              </div>
              <div className="relative my-4">
                <input type="text" name='phoneNumber' value={dataInvestor?.phoneNumber} onChange={handleChange} className='block w-72 py-2.5 px-0 text-md text-accent-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:text-accent-black focus:border-accent-black peer' placeholder=''/>
                <label htmlFor="" className='absolute text-md text-accent-black duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-accent-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>Nomor Handphone</label>
              </div>
              <div className="relative my-4">
                <input type="text" name='administrator' value={dataInvestor?.administrator} onChange={handleChange} className='block w-72 py-2.5 px-0 text-md text-accent-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:text-accent-black focus:border-accent-black peer' placeholder=''/>
                <label htmlFor="" className='absolute text-md text-accent-black duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-accent-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>Pemilik Usaha</label>
              </div>
              <div className="relative my-4">
                <input type="date" name='dateFounded' value={dataInvestor?.dateFounded} onChange={handleChange} className='block w-72 py-2.5 px-0 text-md text-accent-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:text-accent-black focus:border-accent-black peer' placeholder=''/>
                <label htmlFor="" className='absolute text-md text-accent-black duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-accent-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>Tanggal Pendirian</label>
              </div>
              <div className="relative my-4">
                <textarea name='Description' defaultValue={dataInvestor?.Description} onChange={handleChange} className='block w-72 py-2.5 px-3 text-md text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:text-accent-black focus:border-accent-black peer' rows={3} style={{resize: "none", overflowY: "auto"}}></textarea>
                <label htmlFor="" className='absolute text-md text-accent-black duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-accent-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>Deskripsi</label>
              </div>
              <div className='mt-4 flex justify-between items-center'>
                <button onClick={previousForm} className='px-3 py-2 text-lg rounded-md w-full text-white bg-red-500'>Kembali</button>
                <button onClick={nextForm} className='px-3 py-2 text-lg rounded-md w-full text-white bg-primary-green-dark hover:bg-primary-green-medium hover:text-primary-green-light'>Lanjut</button>
              </div>
            </div>
          </>
        }

        {
          formPage === 4 && <> 
          <div className='h-full flex flex-col items-center m-10'>
            <div className="relative my-4">
            <textarea name='address' defaultValue={dataUMKM?.address} onChange={handleChange} className='block w-72 py-2.5 px-3 text-md text-accent-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:text-accent-black focus:border-accent-black peer' rows={3} style={{resize: "none", overflowY: "auto"}}></textarea>
            <label htmlFor="" className='absolute text-md text-accent-black duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-accent-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>Alamat Usaha</label>
            </div>
            <div className="relative my-4">
              <div className={`w-72 font-medium ${
                    open ? "max-h-60" : "max-h-0"
                  }`}>
                <div
                  onClick={() => setOpen(!open)}
                  className={`bg-primary-green-dark w-full p-2 flex items-center justify-between rounded ${
                    !selected && "text-accent-superWhite"
                  }`}
                >
                  {selected
                    ? selected?.length > 25
                      ? selected?.substring(0, 25) + "..."
                      : selected
                    : "Select Categories"}
                  <BiChevronDown className={`text-xl ${open && "rotate-180"}`} />
                </div>
                <ul
                  className={`bg-primary-green-dark mt-2 overflow-y-auto ${
                    open ? "max-h-60 border border-white" : "max-h-0"
                  } `}
                >
                  <div className="flex items-center px-2 top-0 bg-primary-green-dark sticky border border-b-2 border-white">
                    <AiOutlineSearch className={`text-white text-lg block float-left cursor-pointer mr-2`} />
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value.toLowerCase())}
                      placeholder="Enter Categories name"
                      className="text-base bg-transparent w-full text-white focus:outline-none placeholder:text-slate-200 my-2"
                    />
                  </div>
                  {categories?.map((category) => (
                    <li
                      key={category}
                      className={`p-2 text-sm hover:bg-primary-orange-medium hover:text-black text-primary-orange-medium
                      ${
                        category?.toLowerCase() === selected?.toLowerCase() &&
                        "bg-primary-orange-medium text-accent-black"
                      }
                      ${
                        category?.toLowerCase().startsWith(inputValue)
                          ? "block"
                          : "hidden"
                      }`}
                      onClick={() => {
                        if (category?.toLowerCase() !== selected.toLowerCase()) {
                          setSelected(category);
                          setDataUMKM({ ...dataUMKM, Category: category });
                          setOpen(false);
                          setInputValue("");
                        }
                      }}
                    >
                      {category}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className='mt-10 flex justify-center items-center'>
              <button onClick={previousForm} className='px-3 py-2 text-lg rounded-md w-full text-white bg-red-500'>Kembali</button>
              <button onClick={register} className='px-3 py-2 text-lg rounded-md w-full text-white bg-primary-orange-dark'>Daftar</button>
            </div>
          </div>
          </>
        }

        {
          formPage === 5 && <> 
            <div className='h-full flex flex-col items-center m-10'>
              <div className="relative my-4">
              <textarea name='address' defaultValue={dataInvestor?.address} onChange={handleChange} className='block w-72 py-2.5 px-3 text-md text-accent-black bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:text-accent-black focus:border-accent-black peer' rows={3} style={{resize: "none", overflowY: "auto"}}></textarea>
              <label htmlFor="" className='absolute text-md text-accent-black duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-accent-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'>Alamat Usaha</label>
              </div>
              <div className="relative my-4">
                <div className={`w-72 font-medium ${
                      open ? "max-h-60" : "max-h-0"
                    }`}>
                  <div
                    onClick={() => setOpen(!open)}
                    className={`bg-primary-green-dark w-full p-2 flex items-center justify-between rounded ${
                      !selected && "text-accent-superWhite"
                    }`}
                  >
                    {selected
                      ? selected?.length > 25
                        ? selected?.substring(0, 25) + "..."
                        : selected
                      : "Select Categories"}
                    <BiChevronDown className={`text-xl ${open && "rotate-180"}`} />
                  </div>
                  <ul
                    className={`bg-primary-green-dark mt-2 overflow-y-auto ${
                      open ? "max-h-60 border border-white" : "max-h-0"
                    } `}
                  >
                    <div className="flex items-center px-2 top-0 bg-primary-green-dark sticky border border-b-2 border-white">
                      <AiOutlineSearch className={`text-white text-lg block float-left cursor-pointer mr-2`} />
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value.toLowerCase())}
                        placeholder="Enter Categories name"
                        className="text-base bg-transparent w-full text-white focus:outline-none placeholder:text-slate-200 my-2"
                      />
                    </div>
                    {categories?.map((category) => (
                      <li
                        key={category}
                        className={`p-2 text-sm hover:bg-primary-orange-medium hover:text-black text-primary-orange-medium
                        ${
                          category?.toLowerCase() === selected?.toLowerCase() &&
                          "bg-primary-orange-medium text-accent-black"
                        }
                        ${
                          category?.toLowerCase().startsWith(inputValue)
                            ? "block"
                            : "hidden"
                        }`}
                        onClick={() => {
                          if (category?.toLowerCase() !== selected.toLowerCase()) {
                            setSelected(category);
                            setDataInvestor({ ...dataInvestor, Category: category });
                            setOpen(false);
                            setInputValue("");
                            console.log(dataUMKM.Category)
                            console.log(dataInvestor.Category)
                          }
                        }}
                      >
                        {category}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className='mt-10 flex justify-center items-center'>
                <button onClick={previousForm} className='px-3 py-2 text-lg rounded-md w-full text-white bg-red-500'>Kembali</button>
                <button onClick={register} className='px-3 py-2 text-lg rounded-md w-full text-white bg-primary-orange-dark'>Daftar</button>
              </div>
            </div>
          </>
        }
      </div>
      </div>
    </div>
  );
}

export default Register