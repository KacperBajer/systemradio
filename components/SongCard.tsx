import { Song } from '@/lib/types'
import Image from 'next/image'
import React from 'react'

type Props = {
    song: Song
}

const SongCard = ({song}: Props) => {
    return (
        <div className='flex flex-1 gap-2 items-center'>
            <Image
                alt=''
                src={'/playka.png'}
                width={48}
                height={48}
                className='rounded-md'
            />

            <div className='flex flex-col'>
                <p className='text-sm font-medium'>{song.title}</p>
                <p className='text-xs text-gray-400'>{song.artist}</p>
            </div>
        </div>
    )
}

export default SongCard