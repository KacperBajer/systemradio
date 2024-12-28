'use server'
import { v4 as uuidv4 } from 'uuid';
import { Pool } from "pg";
import conn from "./db";
import bcrypt from 'bcrypt';
import { cookies } from "next/headers";

export const login = async (login: string, password: string) => {
    try {

        const cookieStore = await cookies()

        const query = `SELECT * FROM users WHERE login = $1`

        const result = await (conn as Pool).query(
            query, [login]
        );
        
        if(result.rows.length === 0) {
            return 'No acc'
        }

        const isPasswordValid = await bcrypt.compare(password, result.rows[0].password);

        if (!isPasswordValid) {
            return 'No acc'
        }

        const session = uuidv4()
        cookieStore.set('token', session)

        const sessionQuery = `INSERT INTO sessions (session, userid) VALUES ($1, $2)`;
        await (conn as Pool).query(sessionQuery, [session, result.rows[0].id]);

        return 'success'; 

    } catch (error) {
        console.log(error)
        return 'err'
    }
}
export const getUser = async () => {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')
        

        if (!token) {
            return null
        }

        const query = `
            SELECT users.*
            FROM sessions
            INNER JOIN users ON sessions.userid = users.id
            WHERE sessions.session = $1
        `;

        const result = await (conn as Pool).query(query, [token.value]);

        if (result.rows.length === 0) {
            return null
        }

        return result.rows[0];
    } catch (error) {
        console.log(error)
        return null
    }
}