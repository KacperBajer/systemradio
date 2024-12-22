'use server'
import { headers } from "next/headers";
export async function getIPAddress() {

    const header = await headers()

    return header.get("x-forwarded-for");
}