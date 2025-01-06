'use server'
import cron from 'node-cron';
import conn from './db';
import { Pool } from 'pg';
import { CreateEventData } from './types';



interface EventHandlers {
    [key: string]: (payload: any) => Promise<void>;
  }
  

const eventHandlers: EventHandlers = {
    startPlaying: async (payload: number[]) => {
        console.log(payload)

    },
};

export const checkAndExecuteEvents = async () => {
    const now = new Date();
    const currentDay = now.toLocaleString('pl-PL', { weekday: 'long' }).toLowerCase(); 

    try {

        const result = await (conn as Pool).query(
            `SELECT * FROM events 
            WHERE (date <= $1 AND executed = FALSE)
            OR (isrecurring = TRUE AND recurrencetime <= $2 AND executed = FALSE AND date <= $3 AND $4 = ANY(recurrencedays))`,
            [now, now.toTimeString().slice(0, 5), now, currentDay]
        );

        const events = result.rows;

        for (const event of events) {
            const { id, action, payload, isrecurring } = event;

            if (eventHandlers[action]) {
                await eventHandlers[action](payload);

                if (isrecurring) {

                    await (conn as Pool).query(
                        `UPDATE events SET executed = FALSE, date = $1 WHERE id = $2`,
                        [getNextExecutionDate(), id]
                    );
                } else {
                    await (conn as Pool).query(
                        `UPDATE events SET executed = TRUE WHERE id = $1`,
                        [id]
                    );
                }
            }
        }
    } catch (error) {
        console.error('Error checking or executing events:', error);
    }
};

const getNextExecutionDate = (): Date => {
    const now = new Date();
    const nextDate = new Date(now);
    nextDate.setDate(now.getDate() + 1);
    nextDate.setHours(0, 0, 0, 0); 
    return nextDate;
};

const scheduler = cron.schedule('*/15 * * * * *', checkAndExecuteEvents);

export const startScheduler = async () => {
    scheduler.stop()
    scheduler.start()
}

export const getEvents = async () => {
    try {
        const result = await (conn as Pool).query(`SELECT * FROM events`, [])
        return result.rows
    } catch (error) {
        return 'err'
    }
}
export const createEvents = async (data: CreateEventData) => {
    const currentDate = new Date().toISOString(); 
    try {
        const query = `
            INSERT INTO events 
            (name, date, action, payload, executed, isrecurring, recurrencetime, recurrencedays)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
      const values = [
        data.name,
        data.date || currentDate,
        data.function,
        {},
        false,
        data.recurring,
        data.recurring ? data.time : null,
        data.recurring ? data.days : null,
      ];
  
      const result = await (conn as Pool).query(query, values);
  
    } catch (error) {
        return 'err'
    }
}