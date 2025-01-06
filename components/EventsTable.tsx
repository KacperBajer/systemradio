import React from 'react'
import CustomCheckbox from './CustomCheckbox'
import { MdDelete } from "react-icons/md";
import TooltipButton from './TooltipButton';
import { EventActions } from '@/lib/constants';
import { toast } from 'react-toastify';
import { deleteEvent } from '@/lib/scheduler';

type Props = {
    data: any[]
    checked: number[]
    setChecked: React.Dispatch<React.SetStateAction<number[]>>
    fetchData: () => void
}

const EventsTable = ({data, checked, setChecked, fetchData}: Props) => {
  
    
    const handleSelectAllChange = () => {
        if (data.length === checked.length) {
          setChecked([]);
        } else {
          const ids = data.map(item => item.id)
          setChecked(prev => [...prev, ...ids.filter(item => !prev.includes(item))]);
        }
    };

    const getNameByFunction = (functionName: string) => {
        const action = EventActions.find(item => item.function === functionName);
        return action ? action.name : 'Not found';
    };

    const formatTime = (isRecurring: boolean, date: Date, time: string, days: string[]) => {
        if(!isRecurring) {
            return new Intl.DateTimeFormat('pl-PL', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).format(date).replace(',', '');
        }
        const dayMap: { [key: string]: string } = {
            Monday: 'Mon',
            Tuesday: 'Tue',
            Wednesday: 'Wed',
            Thursday: 'Thu',
            Friday: 'Fri',
            Saturday: 'Sat',
            Sunday: 'Sun'
        };

        const dayShortcuts = days
            .map(day => dayMap[day])
            .filter(Boolean)
            .join(',');

        return `${dayShortcuts} ${time.split('+')[0]}`;
    }

    const handleDelete = async (id: number) => {
        try {
            const res = await deleteEvent(id)
            if(res === 'err') {
                toast.error('Failed to delete event')
                return
            }
            toast.success('Event deleted')
            fetchData()
        } catch (error) {
            toast.error('Failed to delete event')
        }
    }

    return (
    <div className='overflow-x-auto'>
            <div className='flex flex-col px-4 '>
                <div className='sticky top-0 flex items-center pb-3 border-b-2 border-dark-200 text-gray-300 text-sm px-4'>
                    <CustomCheckbox handleChange={handleSelectAllChange} isChecked={data.length === checked.length} />
                    <p className='text-center w-[50px]'>#</p>
                    <p className='flex-1 min-w-[300px]'>Name</p>
                    <p className='w-[200px] text-center'>Action</p>
                    <p className='w-[200px] text-center'>Time</p>
                    <p className='w-[150px] text-center'>Executed</p>
                    <MdDelete className='text-lg text-red-600 w-[38px] text-center' />

                </div>
                {data.map((item, index) => (
                    <div className='flex items-center py-2 px-4 border-b-2 border-dark-200' key={item.id}>
                        <CustomCheckbox isChecked={checked.includes(item.id)} handleChange={() => setChecked(prev => prev.includes(item.id) ? prev.filter(eventid => eventid !== item.id) : [...prev, item.id])} />
                        <p className='text-center w-[50px]'>{index + 1}</p>
                        <div className='flex-1 min-w-[300px]'>
                            <p>{item.name}</p>
                        </div>
                        <div className='w-[200px] flex justify-center'>
                            <div className='py-2 px-4 bg-dark-50 rounded-md text-center w-fit'>
                                <p>{getNameByFunction(item.action)}</p>
                            </div>
                        </div>
                        <div className='w-[200px] text-center'>
                            <p>{formatTime(item.isrecurring, item.date, item.recurrencetime, item.recurrencedays)}</p>
                        </div>
                        <div className='w-[150px] text-center'>
                            {item.isrecurring ? <p className='text-gray-500'>-</p> : <p className={`uppercase ${item.executed ? 'text-green-500' : 'text-red-500'}`}>{item.executed.toString()}</p>}
                        </div>
                        <div className='w-[38px] flex justify-center'>
                            <TooltipButton onClick={() => handleDelete(item.id)} text='Delete event'>
                                <MdDelete className='text-lg text-red-600' />
                            </TooltipButton>
                        </div>

                    </div>
                ))}
            </div>
        </div>
  )
}

export default EventsTable