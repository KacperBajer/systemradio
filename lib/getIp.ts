'use server'
import { nanoid } from 'nanoid'
import { cookies, headers } from "next/headers";
export async function getIPAddress() {

    const header = await headers()
    const cookieStore = await cookies()
    const id = cookieStore.get('id')
    const key = nanoid(10)

    if(!id) {
        cookieStore.set('id', key)
    }

    const ip = header.get("x-forwarded-for")
    
    return `${ip}${id ? id.value : key}`;
}