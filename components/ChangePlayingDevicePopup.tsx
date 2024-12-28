'use client'
import { usePlayer } from '@/context/PlayerContext'
import { changePlayingDevice, getOnlineDevices } from '@/lib/music'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'

type Props = {
    handleClose: () => void
}


const ChangePlayingDevicePopup = ({handleClose}: Props) => {

    const boxRef = useRef<HTMLDivElement | null>(null)
    const [data, setData] = useState<any[] | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [selected, setSelected] = useState<string | null>(null)
    const {player} = usePlayer()

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)
                const res = await getOnlineDevices()
                if(res === 'err') {
                    toast.error('Something went wrong with fetching online devices')
                    return
                }
                console.log(res)
                setData(res.devices)
                const selectedDevice = res.playingDevices.find(device => device.id == player);
                setSelected(selectedDevice?.playingdevice)
            } catch (error) {
                console.log(error)
                toast.error('Something went wrong with fetching online devices')
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

    const handleSubmit = async () => {
        try {
            const res = await changePlayingDevice(selected as string, player)
            if(res === 'err') {
                toast.error('Something went wrong with changing playing device')
                return
            }
            toast.success('Changed playing device')
            handleClose()
        } catch (error) {
            console.log(error)
            toast.error('Something went wrong with changing playing device')
        }
    }

    return (
        <div className='fixed top-0 left-0 z-50 w-full h-screen flex justify-center items-center bg-dark-50/40'>
            <div ref={boxRef} className='p-4 min-w-[350px] max-w-[500px] w-fit bg-dark-100 rounded-md border-2 border-dark-100 text-sm text-gray-200'>
                <p className='text-center text-3xl font-bold mb-6'>Playing device</p>
                <div className='flex flex-wrap gap-2 justify-center'>
                    {data?.map((item, index) => (
                        <button onClick={() => setSelected(item.ip)} key={index} className={`px-4 py-1.5 rounded-md border-2 ${item.ip === selected ? 'border-blue-800 bg-blue-600/10' : 'border-dark-200/50'} transition-all duration-200 hover:cursor-pointer`}>
                            <p className='text-sm font-medium'>{item.ip}</p>
                        </button>
                    ))}
                </div>
                <button onClick={handleSubmit} disabled={isLoading} className={`w-full mt-4 rounded-md bg-blue-600 ${!isLoading && "hover:bg-blue-700"} duration-300 transition-all font-bold py-1.5 px-4`}>Change</button>
            </div>
        </div>
    )
}

export default ChangePlayingDevicePopup