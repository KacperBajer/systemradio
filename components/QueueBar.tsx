'use client'
import { getQueue } from '@/lib/music'
import { Song } from '@/lib/types'
import React, { useEffect, useState } from 'react'
import SongCard from './SongCard'

const QueueBar = () => {

    const [song, setSongs] = useState<Song[] | null>(null)

    const fetchData = async () => {
        const res = await getQueue()
        setSongs(res)
    }

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchData();
        }, 5000);

        return () => clearInterval(intervalId);
    }, [])

    useEffect(() => {
        fetchData()
    }, [])

  return (
    <div className='h-screen sticky top-0 right-0 w-[350px] min-w-[350px] max-w-[350px] p-4'>
        <div className='h-fit min-h-[calc(100vh-32px)] bg-dark-50 rounded-lg p-5'>
            <p className='text-center text-3xl font-bold mb-6'>Queue</p>
            <div className='flex flex-col gap-2'>
                {song?.map((item, index) => (
                    <SongCard 
                        key={index}
                        song={item}
                    />
                ))}
            </div>
        </div>
    </div>
  )
}

export default QueueBar