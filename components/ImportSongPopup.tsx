'use client'
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import SelectPlaylistBox from './SelectPlaylistBox'
import { Playlist } from '@/lib/types'
import { downloadSongs, getNotProtectedPlaylist } from '@/lib/music'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

type Props = {
    handleClose: () => void
}

const ImportSongPopup = ({ handleClose }: Props) => {

    const router = useRouter()
    const boxRef = useRef<HTMLDivElement | null>(null)
    const [inputValue, setInputValue] = useState({
        url: ''
    })
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

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target
        setInputValue(prev => ({...prev, [name]: value}))
    }

    const handlePlaylistsChange = (id: number) => {
        selected.includes(id.toString()) ? setSelected(prev => prev.filter(item => item !== id.toString())) : setSelected(prev => [...prev, id.toString()]) 
    }

    
    const handleSubmit = async () => {
        try {
            setIsLoading(true)
            const res = await downloadSongs(selected, inputValue.url)
            if(res === 'err') {
                toast.error('Something went wrong with importing')
                return
            }
            toast.success('Imported')
            router.push('/1')
            handleClose()
        } catch (error) {
            console.log(error)
            toast.error('Something went wrong with importing')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='fixed top-0 left-0 z-40 w-full h-screen flex justify-center items-center bg-dark-50/40'>
            <div ref={boxRef} className='p-4 w-[350px] bg-dark-100 rounded-md border-2 border-dark-100 text-sm text-gray-200'>
                <p className='text-3xl font-bold text-center text-white mb-6'>Import song</p>
                <div className='flex flex-wrap gap-2 mb-3 justify-center'>
                    {data?.map(item => (
                        <SelectPlaylistBox key={item.id} selected={selected.includes(item.id.toString())} setSelected={() => handlePlaylistsChange(item.id)} data={item} />
                    ))}
                </div>
                <input 
                    className='w-full px-4 py-1.5 rounded-md bg-dark-200 border-2 border-black/10 outline-none appearance-none'
                    placeholder='Paste url to song or playlist'
                    name='url'
                    value={inputValue.url}
                    onChange={handleChange}
                />
                <button onClick={handleSubmit} disabled={isLoading || !inputValue.url} className={`w-full mt-2 rounded-md bg-blue-600 ${(!isLoading && inputValue.url) && "hover:bg-blue-700"} duration-300 transition-all font-bold py-1.5 px-4`}>{isLoading ? 'Adding up...' : 'Add'}</button>
            </div>
        </div>
    )
}

export default ImportSongPopup