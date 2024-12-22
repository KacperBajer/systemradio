'use client'
import React, { useEffect, useState } from 'react'

type Props = {
  text: string
}

const Tooltip = ({text}: Props) => {

    const [show, setShow] = useState(false)

    useEffect(() => {
        console.log('f')
        const timer = setTimeout(() => {
            setShow(true)
            console.log('df')
        }, 1000);

        return () => clearTimeout(timer)

    }, [])

    if(!show) {
      return null
    }

  return (
    <div className={`absolute whitespace-nowrap top-0 left-1/2 -translate-y-[120%] -translate-x-1/2 z-[200] px-2 py-1 rounded-md border-2 border-dark-100 text-gray-300 bg-[#222222] text-[10px]`}><p>{text}</p></div>
  )
}

export default Tooltip