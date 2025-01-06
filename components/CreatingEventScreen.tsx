import { days, EventActions } from '@/lib/constants'
import React, { ChangeEvent, forwardRef, useState } from 'react'
import DatePicker from "react-datepicker";
import CustomCheckbox from './CustomCheckbox';
import { createEvents } from '@/lib/scheduler';
import { CreateEventData } from '@/lib/types';
import { toast } from 'react-toastify';

type Props = {
  inputValue: any
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void
  setInputValue:  (update: (prev: CreateEventData) => CreateEventData) => void
}

const Screen = ({ page, inputValue, handleChange, setInputValue }: { page: number } & Props) => {

  switch (page) {
    case 1:
      return <div>
        <input
          className='w-full px-4 py-1.5 rounded-md bg-dark-200 border-2 border-black/10 outline-none appearance-none'
          placeholder='Event name'
          name='name'
          value={inputValue.name}
          onChange={handleChange}
        />
      </div>
    case 2:
      return <div className='flex flex-wrap gap-2 justify-center'>
        {EventActions?.map((item, index) => (
          <button key={index} onClick={() => setInputValue((prev: any) => ({ ...prev, function: item.function }))} className={`py-1.5 px-4 rounded-md border-2 ${item.function === inputValue.function ? "border-blue-800 bg-blue-600/10" : "border-dark-200/50"} transition-all duration-200 hover:cursor-pointer flex flex-col items-center`}>
            <p className='text-center font-medium'>{item.name}</p>
          </button>
        ))}
      </div>
    case 3:
      return <div className='flex gap-2'>
        <button onClick={() => setInputValue(prev => ({ ...prev, recurring: false }))} className={`py-1.5 px-4 rounded-md border-2 ${inputValue.recurring === false ? "border-blue-800 bg-blue-600/10" : "border-dark-200/50"} flex-1 transition-all duration-200 hover:cursor-pointer flex flex-col items-center`}>
          <p className='text-center font-medium'>One time</p>
        </button>
        <button onClick={() => setInputValue((prev: any) => ({ ...prev, recurring: true }))} className={`py-1.5 px-4 rounded-md border-2 ${inputValue.recurring === true ? "border-blue-800 bg-blue-600/10" : "border-dark-200/50"} flex-1 transition-all duration-200 hover:cursor-pointer flex flex-col items-center`}>
          <p className='text-center font-medium'>Repeat</p>
        </button>
      </div>
    case 4:
      return inputValue.recurring === false ? <div className='w-full'>
        <DatePicker
          selected={inputValue.date}
          onChange={(date) => setInputValue(prev => ({ ...prev, date: date }))}
          showTimeSelect
          timeFormat="HH:mm"
          closeOnScroll
          placeholderText='Date'
          dateFormat="yyyy-MM-dd HH:mm"
          className='w-[318px] bg-transparent outline-none text-white px-4 py-1.5 rounded-md border-dark-200/50 border-2'
        />
      </div>
        :
      <div>
        <div className='flex flex-wrap gap-x-5 gap-y-2 justify-center mb-3'>
          {days.map(item => (
            <div key={item} className='flex items-center gap-1'>
              <CustomCheckbox isChecked={inputValue.days.includes(item)} handleChange={() =>
                setInputValue(prev => ({
                  ...prev,
                  days: prev.days.includes(item)
                    ? prev.days.filter(day => day !== item)
                    : [...prev.days, item]
                }))
              } />
              <p>{item.substr(0, 3)}</p>
            </div>
          ))}
        </div>
        <input 
          className='w-full bg-transparent outline-none text-white px-4 py-1.5 rounded-md border-dark-200/50 border-2'
          placeholder='10:00'
          name='time'
          value={inputValue.time}
          onChange={handleChange}
        />
      </div>
  }
}

const CreatingEventScreen = ({ inputValue, handleChange, setInputValue, handleClose }: Props & {handleClose: () => void}) => {

  const [page, setPage] = useState(1)

  const isDisabled = (page === 1 && !inputValue.name) || (page === 2 && !inputValue.function) || (page === 3 && inputValue.recurring === null) || ((page === 4 && !inputValue.date) && (page === 4 && (!inputValue.time || inputValue.days.length === 0)))

  const handleSubmit = async () => {
    const res = await createEvents(inputValue)
    if(res === 'err') {
      toast.error('Something went wrong')
      return
    }
    toast.success('Event created')
    handleClose()
  }

  return (
    <div className='w-[350px] h-fit p-4' >
      <p className='text-center text-3xl font-bold mb-6'>Creating Event</p>
      <Screen page={page} handleChange={handleChange} inputValue={inputValue} setInputValue={setInputValue} />
      {page !== 4 && <button disabled={isDisabled} onClick={() => setPage(prev => prev + 1)} className='mt-2 w-full rounded-md bg-blue-600 py-1.5 px-4 outline-none appearance-none'>Next</button>}
      {page === 4 && <button disabled={isDisabled} onClick={handleSubmit} className='mt-2 w-full rounded-md bg-blue-600 py-1.5 px-4 outline-none appearance-none'>Submit</button>}
    </div>
  )
}

export default CreatingEventScreen