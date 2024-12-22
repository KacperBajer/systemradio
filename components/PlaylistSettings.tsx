'use client'
import { Playlist } from '@/lib/types'
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { MdDelete } from "react-icons/md";
import { IoCopy } from "react-icons/io5";
import Tooltip from './Tooltip';
import TooltipButton from './TooltipButton';
import { copyPlaylist, deletePlaylist, editPlaylist } from '@/lib/music';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

type Props = {
    handleClose: () => void
    data: Playlist
}

const PlaylistSettings = ({ handleClose, data }: Props) => {

    const boxRef = useRef<HTMLDivElement | null>(null)
    const router = useRouter()
    const [inputValue, setInputValue] = useState({
        name: data.name || '',
        description: data.description || ''
    })
    const [isLoadingDeleting, setIsLoadingDeleting] = useState(false)
    const [isLoadingDuplicating, setIsLoadingDuplicating] = useState(false)
    const [isLoadingEditing, setIsLoadingEditing] = useState(false)

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
                handleClose()
            }
        }

        document.addEventListener('mousedown', handleClick);

        return () => {
            document.removeEventListener('mousedown', handleClick);
        };

    }, [])

    const handleDelete = async () => {
        try {
            setIsLoadingDeleting(true)
            const res = await deletePlaylist(data.id)
            if (res !== 'success') {
                toast.error('Failed to remove playlist')
                return
            }
            toast.success('Playlist removed')
            router.push('/1')
            handleClose()
        } catch (error) {
            console.log(error)
            toast.error('Failed to remove playlist')
        } finally {
            setIsLoadingDeleting(false)
        }
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target
        setInputValue(prev => ({...prev, [name]: value}))
    }

    const handleCopy = async () => {
        try {
            setIsLoadingDuplicating(true)
            const res = await copyPlaylist(data.id)
            if(res === 'err') {
                toast.error('Failed to duplicate playlist')
                return
            }
            toast.success('Playlist duplicated')
            router.push(`/${res}`)
            handleClose()
        } catch (error) {
            console.log(error)
            toast.error('Failed to duplicate playlist')
        } finally {
            setIsLoadingDuplicating(false)
        }
    }

    const handleEdit = async () => {
        try {
            setIsLoadingEditing(true)
            const res = await editPlaylist(inputValue.name, inputValue.description, data.id)
            if(res === 'err') {
                toast.error('Failed to edit playlist')
                return
            }
            toast.success('Playlist edited')
            handleClose()
        } catch (error) {
            console.log(error)
            toast.error('Failed to edit playlist')
        } finally {
            setIsLoadingEditing(false)
        }
    }

    return (
        <div className='fixed top-0 left-0 z-40 w-full h-screen flex justify-center items-center bg-dark-50/40'>
            <div ref={boxRef} className='p-4 w-[350px] bg-dark-100 rounded-md border-2 border-dark-100 text-sm text-gray-200'>
                <p className='text-center text-3xl mb-2 font-bold text-white'>{data.name}</p>
                <p className='text-center text-gray-400 text-sm mb-6'>{data.description}</p>
                <input 
                    className='w-full px-4 py-1.5 rounded-md bg-dark-200 border-2 border-black/10 outline-none appearance-none'
                    placeholder='Name'
                    name='name'
                    value={inputValue.name}
                    disabled={data.isProtected}
                    onChange={handleChange}
                />
                <input 
                    className='w-full px-4 py-1.5 rounded-md bg-dark-200 border-2 border-black/10 outline-none appearance-none mt-2'
                    placeholder='Description'
                    name='description'
                    value={inputValue.description}
                    disabled={data.isProtected}
                    onChange={handleChange}
                />
                <div className='flex gap-2 mt-3'>
                    <TooltipButton onClick={handleDelete} customClass={`${data.isProtected && 'opacity-60'}`} disabled={data.isProtected || isLoadingDeleting} text='Delete playlist'><MdDelete className='text-red-600 text-xl' /></TooltipButton>
                    <TooltipButton disabled={isLoadingDuplicating} onClick={handleCopy} text='Duplicate playlist'><IoCopy className='text-green-600 text-xl' /></TooltipButton>
                    <button onClick={handleEdit} disabled={data.isProtected || isLoadingEditing} type='submit' className={`w-full py-1.5 px-4 outline-none appearance-none bg-dark-50 rounded-md font-bold ${data.isProtected && 'opacity-60'} duration-300 transition-all`}>
                        {isLoadingEditing ? 'Changing...' : 'Change'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PlaylistSettings