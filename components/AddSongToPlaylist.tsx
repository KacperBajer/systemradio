'use client'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { addToAnotherPlaylists, getAllPlaylists, getNotProtectedPlaylist } from '@/lib/music'
import { Playlist, Song } from '@/lib/types'
import SelectPlaylistBox from './SelectPlaylistBox'

type Props = {
    handleClose: () => void
    songs: number[]
}

const AddSongToPlaylist = ({ handleClose, songs }: Props) => {

    const boxRef = useRef<HTMLDivElement | null>(null)
    const [data, setData] = useState<Playlist[] | null>(null)
    const [selected, setSelected] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const getPlaylists = async () => {
            try {
                const res = await getNotProtectedPlaylist()
                setData(res)
            } catch (error) {
                console.log(error)
                toast.error('Something went wrong')
            }
        }
        getPlaylists()
    }, [])

    const handleSubmit = async () => {
        try {
            setIsLoading(true)
            const res = await addToAnotherPlaylists(selected, songs)
            if(res === 'err') {
                toast.error('Failed to add to playlists')
                return
            }
            toast.success('Added to playlists')
            handleClose()
        } catch (error) {
            console.log(error)
            toast.error('Failed to add to playlists')
        } finally {
            setIsLoading(false)
        }
    }

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

    const handleChange = (id: number) => {
        selected.includes(id.toString()) ? setSelected(prev => prev.filter(item => item !== id.toString())) : setSelected(prev => [...prev, id.toString()]) 
    }

    return (
        <div className='fixed top-0 left-0 z-50 w-full h-screen flex justify-center items-center bg-dark-50/40'>
            <div ref={boxRef} className='p-4 w-[350px] bg-dark-100 rounded-md border-2 border-dark-100 text-sm text-gray-200'>
                <p className='text-center text-3xl font-bold mb-6'>Add to playlist</p>
                <div className='flex flex-wrap gap-2 justify-center'>
                    {data?.map(item => (
                        <SelectPlaylistBox key={item.id} selected={selected.includes(item.id.toString())} setSelected={() => handleChange(item.id)} data={item} />
                    ))}
                </div>
                <button onClick={handleSubmit} disabled={selected.length === 0 || isLoading} className={`w-full mt-4 rounded-md bg-blue-600 ${(selected.length !== 0 || !isLoading) && "hover:bg-blue-700"} duration-300 transition-all font-bold py-1.5 px-4`}>Add</button>
            </div>
        </div>
    )
}

export default AddSongToPlaylist