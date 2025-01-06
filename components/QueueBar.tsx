'use client'
import { changeQueueOrder, deleteFromQueue, getQueue } from '@/lib/music'
import { QueueSong, Song } from '@/lib/types'
import React, { useEffect, useRef, useState } from 'react'
import SongCard from './SongCard'
import { ReactSortable } from 'react-sortablejs'
import { toast } from 'react-toastify'
import { FaTrash } from "react-icons/fa";
import { FaRandom } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";
import TooltipButton from './TooltipButton'
import { usePlayer } from '@/context/PlayerContext'
import EventsPopup from './EventsPopup'

const QueueBar = () => {

    const [songs, setSongs] = useState<QueueSong[] | null>(null)
    const [showEventsPopup, setShowEventsPopup] = useState(false)
    const [isLoadingShuffling, setIsLoadingShuffling] = useState(false)
    const { player } = usePlayer()
    const fetchingDisableRef = useRef(false)
    const playerRef = useRef(player)
    playerRef.current = player
    fetchingDisableRef.current = false

    const fetchData = async () => {
        if (fetchingDisableRef.current) return
        const res = await getQueue(playerRef.current)
        setSongs(res)
    }

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchData();
        }, 1000);

        return () => clearInterval(intervalId);
    }, [])

    useEffect(() => {
        fetchData()
    }, [])

    const changeOrder = async (data: Song[]) => {
        try {
            const res = await changeQueueOrder(data as QueueSong[])
            if (res === 'err') {
                toast.error('Failed to change order of queue')
                return
            }
        } catch (error) {
            toast.error('Failed to change order of queue')
        } finally {
            fetchingDisableRef.current = false
        }
    }

    const handleDelete = async (id: number) => {
        try {
            const res = await deleteFromQueue(id)
            if (res === 'err') {
                toast.error('Failed to delete from queue')
                return
            }
            fetchData()
            toast.success('Deleted from queue')
        } catch (error) {
            toast.error('Failed to delete from queue')
        }
    }

    const shuffleSongs = async (data: QueueSong[]) => {
        setIsLoadingShuffling(true)
        let shuffled = [...data];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        await changeOrder(shuffled)
        fetchData()
        setIsLoadingShuffling(false)
    }

    return (
        <>
            {showEventsPopup && <EventsPopup handleClose={() => setShowEventsPopup(false)} />}
            <div className='h-screen sticky top-0 right-0 w-[350px] min-w-[350px] max-w-[350px] p-4'>
                <div className='h-fit min-h-[calc(100vh-32px)] max-h-[calc(100vh-32px)] flex flex-col bg-dark-50 rounded-lg p-5'>
                    <p className='text-center text-3xl font-bold mb-6'>Queue</p>
                    <div className='overflow-x-auto hideScrollbar'>
                        {songs && <ReactSortable onStart={() => fetchingDisableRef.current = true} list={songs as QueueSong[]} setList={(newState) => {
                            setSongs(newState)
                        }} onEnd={(evt) => {
                            if (evt.newIndex !== evt.oldIndex) {
                                const reorderedSongs = [...songs!];
                                const [movedItem] = reorderedSongs.splice(evt.oldIndex!, 1);
                                reorderedSongs.splice(evt.newIndex!, 0, movedItem);
                                changeOrder(reorderedSongs);
                            }
                        }} className='flex flex-col gap-0.5'>
                            {songs?.map((item, index) => (
                                <div key={index} className='p-2 hover:bg-dark-200/50 rounded-md relative hover:cursor-pointer select-none flex justify-between items-center group'>
                                    <SongCard
                                        song={item}
                                    />
                                    <button className='group-hover:opacity-100 p-2 bg-dark-50 rounded-md z-10 absolute right-3 opacity-0' onClick={() => handleDelete(item.queue_id)}>
                                        <FaTrash className='text-sm text-red-700' />
                                    </button>
                                </div>
                            ))}
                        </ReactSortable>}
                    </div>
                    <div className='flex-1'></div>
                    <div className='pt-2 flex gap-2 items-center'>
                        <button onClick={() => setShowEventsPopup(true)} className='px-4 py-1.5 rounded-md outline-none appearance-none bg-dark-200/50 font-bold hover:cursor-pointer w-full'>Events</button>
                        <TooltipButton disabled={!songs || isLoadingShuffling} onClick={() => shuffleSongs(songs as QueueSong[])} bgColor='bg-dark-200/50' text='Shuffle queue'>
                            <FaRandom />
                        </TooltipButton>
                        <TooltipButton bgColor='bg-dark-200/50' text='Settings'>
                            <IoSettingsSharp />
                        </TooltipButton>
                    </div>
                </div>
            </div>
        </>

    )
}

export default QueueBar