import { Playlist } from '@/lib/types'
import React from 'react'

type Props = {
    data: Playlist
    selected: boolean
    setSelected: () => void
}

const SelectPlaylistBox = ({data, selected, setSelected}: Props) => {
  return (
    <button onClick={setSelected} className={`py-1.5 px-4 rounded-md border-2 ${selected ? "border-blue-800 bg-blue-600/10" : "border-dark-200/50"} transition-all duration-200 hover:cursor-pointer flex flex-col items-center`}>
        <p className='text-center font-medium'>{data.name}</p>
        <p className='text-center text-[10px] text-gray-300'>{data.description}</p>
    </button>
  )
}

export default SelectPlaylistBox