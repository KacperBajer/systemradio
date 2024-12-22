'use client'
import { Playlist } from '@/lib/types'
import React, { useEffect, useRef, useState } from 'react'
import { MdDelete } from "react-icons/md";
import { IoCopy } from "react-icons/io5";
import Tooltip from './Tooltip';
import TooltipButton from './TooltipButton';
import { deletePlaylist } from '@/lib/music';
import { toast } from 'react-toastify';
import { redirect, useRouter } from 'next/navigation';

type Props = {
    handleClose: () => void
    data: Playlist
}

const PlaylistSettings = ({ handleClose, data }: Props) => {

    const boxRef = useRef<HTMLDivElement | null>(null)
    const router = useRouter()

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
        }
    }


    return (
        <div className='fixed top-0 left-0 z-40 w-full h-screen flex justify-center items-center bg-dark-50/40'>
            <div ref={boxRef} className='p-4 w-[350px] bg-dark-100 rounded-md border-2 border-dark-100 text-sm text-gray-200'>
                <p className='text-center text-3xl mb-2 font-bold text-white'>{data.name}</p>
                <p className='text-center text-gray-400 text-sm mb-6'>{data.description}</p>
                <div className='flex gap-2'>
                    <TooltipButton onClick={handleDelete} customClass={`${data.isProtected && 'opacity-60'}`} disabled={data.isProtected} text='Delete playlist'><MdDelete className='text-red-600 text-xl' /></TooltipButton>
                    <TooltipButton text='Duplicate playlist'><IoCopy className='text-green-600 text-xl' /></TooltipButton>
                </div>
            </div>
        </div>
    )
}

export default PlaylistSettings