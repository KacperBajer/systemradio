'use client'
import React, { ButtonHTMLAttributes, ReactNode, useState } from 'react'
import Tooltip from './Tooltip'

type Tooltip = {
    isVisible: boolean
    text?: string
}

type Props = {
    children: ReactNode
    text: string
    customClass?: string
    bgColor?: string
} & ButtonHTMLAttributes<HTMLButtonElement>

const TooltipButton = ({children, text, customClass, bgColor, ...props}: Props) => {
    
    const [showTooltip, setShowTooltip] = useState<Tooltip>({
        isVisible: false,
        text: '',
    })

  return (
    <div className='relative'>
        <button {...props} onMouseEnter={() => setShowTooltip({isVisible: true, text: text})} onMouseLeave={() => setShowTooltip({isVisible: false})} className={`${bgColor || 'bg-dark-50'} p-2.5 rounded-lg flex gap-1 items-center ${customClass}`}>{children}</button>
        {showTooltip.isVisible && <Tooltip text={showTooltip.text as string} />}
    </div>
  )
}

export default TooltipButton