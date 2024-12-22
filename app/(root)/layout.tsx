import MusicPlayer from '@/components/MusicPlayer'
import QueueBar from '@/components/QueueBar'
import SideBar from '@/components/SideBar'
import React, { ReactNode } from 'react'

const layout = ({children}: {children: ReactNode}) => {
  return (
    <div className='flex bg-dark-100 text-white h-screen'>
        <SideBar />
        <div className='flex flex-1 flex-col h-screen'>
            {children}
            <MusicPlayer />
        </div>
        <QueueBar />
    </div>
  )
}

export default layout