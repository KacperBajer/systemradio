import { getUser } from '@/lib/users'
import { redirect } from 'next/navigation';
import React, { ReactNode } from 'react'

export const dynamic = "force-dynamic";


const layout = async ({children}: {children: ReactNode}) => {
  
    const user = await getUser()

    if(user) {
        redirect('/1')
    }

    return (
    <div className='w-full h-screen flex items-center justify-center bg-dark-100 text-white'>
        {children}        
    </div>
  )
}

export default layout