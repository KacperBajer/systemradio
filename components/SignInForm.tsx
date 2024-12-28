'use client'
import { login } from '@/lib/users'
import { useRouter } from 'next/navigation'
import React, { ChangeEvent, FormEvent, useState } from 'react'
import { toast } from 'react-toastify'

const SignInForm = () => {

    const router = useRouter()

    const [inputValue, setInputValue] = useState({
        login: '',
        password: ''
    })

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setInputValue(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        try {
            const res = await login(inputValue.login, inputValue.password)
            if(res === 'err') {
                toast.error('Something went wrong')
            }
            if(res === 'No acc') {
                toast.error('Incorrect login or/and password')
            }
            toast.success('Logged in')
            router.push('/1')
        } catch (error) {
            console.log(error)
            toast.error('Something went wrong')
        }
    }

    return (
        <form onSubmit={handleSubmit} className='text-sm'>
            <input
                className='w-full px-4 py-1.5 rounded-md bg-dark-200/15 border-2 border-dark-200/50 outline-none appearance-none'
                placeholder='Login'
                name='login'
                value={inputValue.login}
                onChange={handleChange}
            />
            <input
                className='w-full px-4 py-1.5 rounded-md bg-dark-200/15 border-2 border-dark-200/50 outline-none appearance-none mt-2'
                placeholder='Password'
                name='password'
                value={inputValue.password}
                onChange={handleChange}
                type='password'
            />
            <button type='submit' className='w-full py-1.5 px-4 outline-none appearance-none bg-blue-700 rounded-md mt-3 font-medium hover:cursor-pointer hover:bg-blue-800 duration-300 transition-all'>
                Sign In
            </button>
        </form>
    )
}

export default SignInForm