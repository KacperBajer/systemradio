'use client'
import { usePlayer } from '@/context/PlayerContext'
import { getPlayers } from '@/lib/music'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'

type Props = {
    handleClose: () => void
}


const ChangePlayerPopup = ({handleClose}: Props) => {

    const boxRef = useRef<HTMLDivElement | null>(null)
    const [data, setData] = useState<any[] | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const {player, setPlayer} = usePlayer()

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)
                const res = await getPlayers()
                if(res === 'err') {
                    toast.error('Something went wrong with fetching players')
                    return
                }
                setData(res)
            } catch (error) {
                console.log(error)
                toast.error('Something went wrong with fetching players')
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
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

    const handleSubmit = async (id: number | string) => {
        setPlayer(Number(id))
        handleClose()
    }

    return (
        <div className='fixed top-0 left-0 z-50 w-full h-screen flex justify-center items-center bg-dark-50/40'>
            <div ref={boxRef} className='p-4 w-[350px] bg-dark-100 rounded-md border-2 border-dark-100 text-sm text-gray-200'>
                <p className='text-center text-3xl font-bold mb-6'>Player</p>
                <div className='flex flex-col gap-2 justify-center'>
                    {data?.map((item, index) => (
                        <button disabled={isLoading} onClick={() => handleSubmit(item.id)} key={index} className={`px-4 py-1.5 rounded-md border-2 ${parseInt(item.id) === player ? 'border-blue-800 bg-blue-600/10' : 'border-dark-200/50'} transition-all duration-200 hover:cursor-pointer`}>
                            <p className='text-sm font-medium'>{item.id}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ChangePlayerPopup