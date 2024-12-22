'use client'
import { changePlaylistOrder, getAllPlaylists } from '@/lib/music'
import { Playlist } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import AddPlaylistPopup from './AddPlaylistPopup'
import { ReactSortable } from 'react-sortablejs'
import { toast } from 'react-toastify'
import Loading from './Loading'

const SideBar = () => {

    const path = usePathname()
    const [playlists, setPlaylists] = useState<null | Playlist[]>(null)
    const [showAddPlaylist, setShowAddPlaylist] = useState(false)


    const getData = async () => {
        const res = await getAllPlaylists()
        setPlaylists(res)
    }
    useEffect(() => {
        getData()
    }, [showAddPlaylist, path])

    useEffect(() => {
        const intervalId = setInterval(() => {
            getData();
        }, 30000);

        return () => clearInterval(intervalId);
    }, [])


    const handleOrderChange = async (list: Playlist[]) => {
        try {

            const changeOrder = await changePlaylistOrder(list as Playlist[])

        } catch (error) {
            console.log(error)
            toast.error('Something went wrong with changing the order of playlists')
        }
    }


    return (
        <>
            {showAddPlaylist && <AddPlaylistPopup handleClose={() => setShowAddPlaylist(false)} />}
            <div className='h-screen sticky top-0 left-0 w-[350px] min-w-[350px] max-w-[350px] p-4'>
                <div className='min-h-[calc(100vh-32px)] max-h-[calc(100vh-32px)] h-[calc(100vh-32px)] bg-dark-50 rounded-lg p-5 flex flex-col '>
                    <p className='text-center text-3xl font-bold mb-6'>RADIO</p>
                    {!playlists && <div className='w-full flex justify-center'>
                        <Loading />
                    </div>}
                    {playlists && <ReactSortable list={playlists} setList={(newState) => {
                            setPlaylists(newState)
                            handleOrderChange(newState)
                        }}>
                        {playlists?.map(item => (
                            <Link href={`/${item.id}`} key={item.id} className={`flex gap-2 p-2 my-1 items-center w-full hover:bg-dark-200/50 hover:cursor-pointer rounded-md ${path === `/${item.id}` && 'bg-dark-200/50'}`}>

                                <Image
                                    alt=''
                                    src={'/playka.png'}
                                    height={48}
                                    width={48}
                                    className='rounded-md'
                                />

                                <div className='flex flex-col'>
                                    <p className='text-sm font-medium'>{item.name}</p>
                                    <p className='text-xs text-gray-400'>{item.description}</p>
                                </div>
                            </Link>
                        ))}
                    </ReactSortable>}


                    <div className='flex-1'>

                    </div>
                    <button onClick={() => setShowAddPlaylist(true)} className='px-4 py-1.5 text-sm bg-dark-100 hover:scale-105 duration-300 transition-all rounded-md mt-4 w-full'>
                        New playlist
                    </button>
                    <button className='px-4 py-1.5 text-sm bg-blue-800 hover:scale-105 duration-300 transition-all rounded-md mt-2 w-full'>Import song</button>
                </div>
            </div>
        </>
    )
}

export default SideBar