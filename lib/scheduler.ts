'use server'
import cron from 'node-cron';
import conn from './db';
import { Pool } from 'pg';
import { CreateEventData } from './types';
import { changePlayingStatus, skipSong } from './music';



interface EventHandlers {
    [key: string]: (payload: any) => Promise<void>;
  }
  

const eventHandlers: EventHandlers = {
    play: async (payload: number[]) => {
        for (const p of payload) {
            changePlayingStatus(false, p)
        }
    },
    playNext: async (payload: number[]) => {
        console.log(payload)
        for (const p of payload) {
            skipSong(p)
        }
    },
    pause: async (payload: number[]) => {
        for (const p of payload) {
            changePlayingStatus(true, p)
        }
    },
};

export const checkAndExecuteEvents = async () => {
    const now = new Date();
    const currentDay = now.toLocaleString('pl-PL', { weekday: 'long' }).toLowerCase(); 
    const currentTime = now.toISOString().slice(11, 19);

    try {

      const result = await (conn as Pool).query(
        `SELECT * FROM events 
        WHERE (date <= $1 AND executed = FALSE)
        OR (isrecurring = TRUE AND 
            (recurrencetime AT TIME ZONE 'UTC')::time <= $2::time AND 
            executed = FALSE AND 
            date <= $3 AND 
            $4 = ANY(recurrencedays))`,
        [now, currentTime, now, currentDay]
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
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
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
  
      return 'success'
    } catch (error) {
        console.log(error)
        return 'err'
    }
}
export const updateEventPayloads = async (ids: number[], player: string | number) => {
    try {
      const fetchQuery = `SELECT id, payload FROM events;`;
      const events = await (conn as Pool).query(fetchQuery);
  
      if (events.rows.length === 0) {
        return 'err';
      }
  
      for (const event of events.rows) {
        const currentPayload: string[] = event.payload || [];
        let updatedPayload: string[];
  
        if (ids.includes(event.id)) {
          if (!currentPayload.includes(player.toString())) {
            updatedPayload = [...currentPayload, player.toString()];
          } else {
            updatedPayload = currentPayload; 
          }
        } else {
          updatedPayload = currentPayload.filter((p) => p != player);
        }
  
        const updateQuery = `
          UPDATE events
          SET payload = $1
          WHERE id = $2;
        `;
        await (conn as Pool).query(updateQuery, [updatedPayload, event.id]);
      }
  
      return 'success';
    } catch (error) {
      console.log(error);
      return 'err';
    }
  };
  
  export const deleteEvent = async (id: number) => {
    try {
      const deleteQuery = `
        DELETE FROM events
        WHERE id = $1;
      `;
      const result = await (conn as Pool).query(deleteQuery, [id]);
  
      if (result.rowCount === 0) {
        return 'err';
      }
  
      return 'success';
    } catch (error) {
      console.log(error);
      return 'err';
    }
  };
  
  