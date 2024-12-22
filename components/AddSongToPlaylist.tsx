'use client'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { getAllPlaylists } from '@/lib/music'
import { Playlist } from '@/lib/types'

type Props = {
    handleClose: () => void
}

const AddSongToPlaylist = ({ handleClose }: Props) => {

    const boxRef = useRef<HTMLDivElement | null>(null)
    const [data, setData] = useState<Playlist[] | null>(null)

    useEffect(() => {
        const getPlaylists = async () => {
            try {
                const res = await getAllPlaylists()
                setData(res)
            } catch (error) {
                console.log(error)
                toast.error('Something went wrong')
            }
        }
        getPlaylists()
    }, [])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
                handleClose()
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };

    }, [])

    return (
        <div className='fixed top-0 left-0 z-40 w-full h-screen flex justify-center items-center bg-dark-50/40'>
            <div ref={boxRef} className='p-4 w-[350px] bg-dark-100 rounded-md border-2 border-dark-100 text-sm text-gray-200'>
                <p className='text-center text-3xl font-bold mb-6'>Add to playlist</p>
            </div>
        </div>
    )
}

export default AddSongToPlaylist