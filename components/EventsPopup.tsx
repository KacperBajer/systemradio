import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import EventsTable from './EventsTable'
import { toast } from 'react-toastify'
import { getEvents } from '@/lib/scheduler'
import { FaPlus } from "react-icons/fa";
import TooltipButton from './TooltipButton';
import CreatingEventScreen from './CreatingEventScreen';
import { CreateEventData } from '@/lib/types';

type Props = {
  handleClose: () => void
}

const EventsPopup = ({ handleClose }: Props) => {

  const boxRef = useRef<HTMLDivElement | null>(null)
  const [data, setData] = useState<any[] | null>(null)
  const [checked, setChecked] = useState<number[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [inputValue, setInputValue] = useState<CreateEventData>({
    name: '',
    function: '',
    recurring: null,
    date: null,
    days: [],
    time: '',
  })

  const fetchData = async () => {
    try {
      const res = await getEvents()
      if (res === 'err') {
        toast.error('Failed to fetch events')
        return
      }
      setData(res)
    } catch (error) {
      console.log(error)
      toast.error('Failed to fetch events')
    }
  }

  useEffect(() => {
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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setInputValue(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className='fixed top-0 left-0 z-40 w-full h-screen flex justify-center items-center bg-dark-50/40'>
      <div ref={boxRef} className='bg-dark-100 rounded-md text-sm text-gray-200'>
        {showCreate ? <CreatingEventScreen setInputValue={setInputValue} handleChange={handleChange} inputValue={inputValue} /> :
          <div className='py-4'>
            <div className='flex justify-between items-center mb-10 px-8'>
              <p className='text-3xl font-bold'>Events</p>
              <TooltipButton onClick={() => setShowCreate(true)} text='Create Event'>
                <FaPlus className='text-green-500' />
              </TooltipButton>
            </div>
            {data && <EventsTable data={data} checked={checked} setChecked={setChecked} />} </div>}
      </div>
    </div>
  )
}

export default EventsPopup