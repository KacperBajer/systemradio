'use client'
import { addPlaylist } from '@/lib/music'
import React, { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'

type Props = {
    handleClose: () => void
}

const AddPlaylistPopup = ({handleClose}: Props) => {

    const boxRef = useRef<HTMLDivElement | null>(null)
    const [inputValue, setInputValue] = useState({
        name: '',
        description: ''
    })

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if(boxRef.current && !boxRef.current.contains(e.target as Node)) {
                handleClose()
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };

    }, [])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        try {
            const res = await addPlaylist(inputValue.name, inputValue.description)
            if(res === 'err') {
                toast.error('Failed to create playlist')
                return
            }
            toast.success('Created playlist')
            handleClose()
        } catch (error) {
            console.log(error)
            toast.error('Failed to create playlist')
        }
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target
        setInputValue(prev => ({...prev, [name]: value}))
    }

  return (
    <div className='fixed top-0 left-0 z-40 w-full h-screen flex justify-center items-center bg-dark-50/40'>
        <div ref={boxRef} className='p-4 w-[350px] bg-dark-100 rounded-md border-2 border-dark-100 text-sm text-gray-200'>
           <p className='text-center text-3xl font-bold mb-6'>New playlist</p>
           <form onSubmit={handleSubmit}>
                <input 
                    className='w-full px-4 py-1.5 rounded-md bg-dark-200 border-2 border-black/10 outline-none appearance-none'
                    placeholder='Name'
                    name='name'
                    value={inputValue.name}
                    onChange={handleChange}
                />
                <input 
                    className='w-full px-4 py-1.5 rounded-md bg-dark-200 border-2 border-black/10 outline-none appearance-none mt-2'
                    placeholder='Description'
                    name='description'
                    value={inputValue.description}
                    onChange={handleChange}
                />
                <button type='submit' className='w-full py-1.5 px-4 outline-none appearance-none bg-blue-700 rounded-md mt-3 font-bold hover:cursor-pointer hover:bg-blue-800 duration-300 transition-all'>
                    Create
                </button>
           </form>
        </div>
    </div>
  )
}

export default AddPlaylistPopup