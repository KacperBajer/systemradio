import React from 'react'
import CustomCheckbox from './CustomCheckbox'
import { MdDelete } from "react-icons/md";
import TooltipButton from './TooltipButton';

type Props = {
    data: any[]
    checked: number[]
    setChecked: React.Dispatch<React.SetStateAction<number[]>>
}

const EventsTable = ({data, checked, setChecked}: Props) => {
  
    
    const handleSelectAllChange = () => {
        if (data.length === checked.length) {
          setChecked([]);
        } else {
          const ids = data.map(item => item.id)
          setChecked(prev => [...prev, ...ids.filter(item => !prev.includes(item))]);
        }
    };


    return (
    <div className='overflow-x-auto'>
            <div className='flex flex-col px-4 '>
                <div className='sticky top-0 flex items-center pb-3 border-b-2 border-dark-200 text-gray-300 text-sm px-4'>
                    <CustomCheckbox handleChange={handleSelectAllChange} isChecked={data.length === checked.length} />
                    <p className='text-center w-[50px]'>#</p>
                    <p className='flex-1 min-w-[300px]'>Name</p>
                    <p className='w-[200px] text-center'>Action</p>
                    <p className='w-[200px] text-center'>Time</p>
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
                                <p>{item.action}</p>
                            </div>
                        </div>
                        <div className='w-[200px] text-center'>
                            <p>2024-12-12</p>
                        </div>
                        <div className='w-[38px] flex justify-center'>
                            <TooltipButton text='Delete event'>
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