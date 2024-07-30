"use client"

import React, { useCallback, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { supabase } from '@/supabase'
import { MdOutlineEmail, MdOutlineLockOpen } from "react-icons/md";
import {useDropzone} from 'react-dropzone'


const Edit = () => {
    const [files, setFiles] =  useState([])

    const onDrop = useCallback(acceptedFiles => {
        console.log(acceptedFiles)
        if(acceptedFiles?.length){
            setFiles(previousFiles => [
                ...previousFiles,
                ...acceptedFiles.map(file =>
                    Object.assign(file, { preview: URL.createObjectURL(file) })
                )
            ])
        }
      }, [])
      const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})
      const uploadFiles = async () => {
        const uploads = files.map(async (file) => {
            const { data, error } = await supabase.storage
                .from('my-bucket')
                .upload(`uploads/${file.name}`, file)

            if (error) {
                console.error('Error uploading file:', error)
                return null
            }

            return data
        })

        const results = await Promise.all(uploads)
        console.log('Upload results:', results)
    }

    return (
        <>
            <div className="text-white flex flex-col w-screen h-max justify-center items-center bg-black">
                <div className='text-white flex text-4xl font-bold my-10'>Edit Ur Profile</div>
                <form className="w-3/4 flex flex-col items-center">
                    <div className="border border-white rounded-md p-10 my-1 shadow-lg backdrop-filter backdrop-blur bg-opacity-30 relative w-full h-72 flex justify-center items-center">
                        <div {...getRootProps()} className="flex flex-col items-center justify-center w-full h-full">
                            <input {...getInputProps()} className="w-full h-full opacity-0 absolute" />
                            {
                                isDragActive ?
                                <p>Drop the files here ...</p> :
                                <p>Drag `&apos;`n`&apos;` drop some files here, or click to select files</p>
                            }
                        </div>
                    </div>
                    
                    {/* Preview */}
                    <ul className='w-full'>
                        {files.map(file =>(
                            <li key={file.name} className="w-full">
                                <div className="border border-white rounded-md p-4 my-4 shadow-lg backdrop-filter backdrop-blur bg-opacity-30 relative w-full  flex flex-row items-center">
                                <img src={file.preview} alt = {file.name} className='w-40 h-24 mt-2'/>
                                <div className='w-full flex justify-end'>{file.name}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <button onClick={uploadFiles} className='px-3 py-2 text-lg rounded-md w-full text-white bg-primary-green-dark hover:bg-primary-green-medium hover:text-primary-green-light'>Upload Files</button>
                </form>
            </div>
        </>
    )
}

export default Edit