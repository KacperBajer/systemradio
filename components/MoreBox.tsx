'use client'
import { usePlayer } from '@/context/PlayerContext';
import { addToQueue, addToQueueFirst, deleteFromPlaylist } from '@/lib/music';
import { Playlist } from '@/lib/types';
import React, { useEffect, useRef, useState } from 'react'
import { FaTrash } from 'react-icons/fa';
import { MdAddToQueue } from 'react-icons/md';
import { RiPlayListAddLine } from 'react-icons/ri';
import { toast } from 'react-toastify';
import { IoIosPlay } from "react-icons/io";

type Props = {
    position: { top: number; left: number }
    handleClose: () => void
    id: number
    addToAnotherPlaylists: (e: number | boolean) => void
    playlist: Playlist
    setChecked: (e: number[]) => void
}

const MoreBox = ({ position, handleClose, id, addToAnotherPlaylists, playlist, setChecked }: Props) => {

    const boxRef = useRef<HTMLDivElement | null>(null)
    const {player} = usePlayer()

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
                handleClose()
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleAddToQueue = async () => {
        try {
            const add = await addToQueue(id, player)
            if (add === 'err') {
                toast.error('Failed to add to queue')
                return
            }
            toast.success('Added to queue')
            handleClose()
        } catch (error) {
            console.log(error)
            toast.error('Failed to add to queue')
        }
    }

    const handlePlayNext = async () => {
        try {
            const add = await addToQueueFirst(id, player)
            if (add === 'err') {
                toast.error('Failed to add to queue')
                return
            }
            toast.success('Added to queue')
            handleClose()
        } catch (error) {
            console.log(error)
            toast.error('Failed to add to queue')
        }
    }

    const handleDeleteFromPlaylist = async () => {
        try {
            const add = await deleteFromPlaylist(playlist.id, [id])
            if (add === 'err') {
                toast.error('Failed to delete songs from playlist')
                return
            }
            toast.success('Songs removed from playlist')
            setChecked([])
            handleClose()
        } catch (error) {
            console.log(error)
            toast.error('Failed to delete songs from playlist')
        }
    }

    return (
        <div className='fixed top-0 left-0 z-40 w-full h-screen'>
            <div ref={boxRef} style={{ top: position.top, left: position.left }} className='absolute p-1 bg-dark-50 rounded-md border-2 flex flex-col gap-0.5 border-dark-100 w-fit text-xs text-gray-200'>
                <button onClick={handleAddToQueue} className='px-3 py-1.5 w-full text-left hover:cursor-pointer hover:bg-dark-100/70 rounded-md hover:text-white transition-all duration-200 flex gap-2 items-center'>
                    <MdAddToQueue className='text-green-500 text-lg' />
                    <p>Add to queue</p>
                </button>
                <button onClick={handlePlayNext} className='px-3 py-1.5 w-full text-left hover:cursor-pointer hover:bg-dark-100/70 rounded-md hover:text-white transition-all duration-200 flex gap-2 items-center'>
                    <IoIosPlay className='text-violet-600 text-lg' />
                    <p>Play next</p>
                </button>
                {!playlist.isProtected && <button onClick={handleDeleteFromPlaylist} className={`px-3 py-1.5 w-full text-left hover:bg-dark-100/70 hover:cursor-pointer rounded-md hover:text-white transition-all duration-200 flex items-center gap-2`}>
                    <FaTrash className='text-red-700 text-sm mx-0.5' />
                    <p>Delete from this playlist</p>
                </button>}
                <button onClick={() => {
                    addToAnotherPlaylists(id)
                    handleClose()
                }} className='px-3 py-1.5 w-full text-left hover:cursor-pointer hover:bg-dark-100/70 rounded-md hover:text-white transition-all duration-200 flex gap-2 items-center'>
                    <RiPlayListAddLine className='text-blue-600 text-lg' />
                    <p>Add to another playlist</p>
                </button>
            </div>
        </div>
    )
}

export default MoreBox
