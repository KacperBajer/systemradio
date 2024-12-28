import SignInForm from '@/components/SignInForm'
import React from 'react'

const page = async () => {

    return (
        <>
            <div className='bg-dark-50 p-7 rounded-md w-[350px] border-2 border-dark-200'>
                <p className='text-center font-bold text-3xl'>Sign In</p>
                <p className='text-center text-gray-400 text-xs mt-3 mb-6'>Sign in and get access to dashboard!</p>
                <SignInForm />
            </div>
        </>

    )
}

export default page