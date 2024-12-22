'use client'
import { addToQueue } from '@/lib/music';
import React, { useEffect, useRef } from 'react'
import { toast } from 'react-toastify';

type Props = {
    position: { top: number; left: number }
    handleClose: () => void
    id: number
}

const MoreBox = ({position, handleClose, id}: Props) => {

    const boxRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
                handleClose()
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleAddToQueue = async () => {
        try {
            const add = await addToQueue(id)
            if(add === 'err') {
                toast.error('Failed to add to queue')
                return
            }
            toast.success('Added to queue')
            handleClose()
        } catch (error) {
            console.log(error)
            toast.error('Failed to add to queue')
        }
    }

  return (
    <div className='fixed top-0 left-0 z-40 w-full h-screen'>
        <div ref={boxRef} style={{top: position.top, left: position.left}} className='absolute p-1 bg-dark-50 rounded-md border-2 border-dark-100 w-fit text-sm text-gray-200'>
            <button onClick={handleAddToQueue} className='px-3 py-1.5 w-full text-left hover:cursor-pointer hover:bg-dark-100/70 rounded-md hover:text-white transition-all duration-200'>
                <p>Add to queue</p>
            </button>
            <div className='px-3 py-1.5 w-full text-left hover:cursor-pointer hover:bg-dark-100/70 rounded-md hover:text-white transition-all duration-200'>
                <p>Delete from this playlist</p>
            </div>
            <div className='px-3 py-1.5 w-full text-left hover:cursor-pointer hover:bg-dark-100/70 rounded-md hover:text-white transition-all duration-200'>
                <p>Add to another playlist</p>
            </div>
        </div>
    </div>
  )
}

export default MoreBox
