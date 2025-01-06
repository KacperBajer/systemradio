import MusicPlayer from '@/components/MusicPlayer'
import QueueBar from '@/components/QueueBar'
import SideBar from '@/components/SideBar'
import { PlayerProvider } from '@/context/PlayerContext'
import { startScheduler } from '@/lib/scheduler'
import { getUser } from '@/lib/users'
import { redirect } from 'next/navigation'
import React, { ReactNode } from 'react'

export const dynamic = "force-dynamic";


const layout = async ({ children }: { children: ReactNode }) => {

  const user = await getUser()


  if (!user) {
    redirect('/sign-in')
  }

  startScheduler()

  return (
    <PlayerProvider player={1}>
      <div className='flex bg-dark-100 text-white h-screen'>
        <SideBar />
        <div className='flex flex-1 flex-col h-screen'>
          {children}
          <MusicPlayer />
        </div>
        <QueueBar />
      </div>
    </PlayerProvider>
  )
}

export default layout