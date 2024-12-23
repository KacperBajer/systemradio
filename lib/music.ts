'use server'

import { Pool } from "pg";
import conn from "./db";
import { CurrentSong, Playlist, Song } from "./types";

export const getSong = async () => {
    try {
        const query = `
            SELECT s.id, s.title, s.artist, s.src, s.duration, ps.isplaying, ps.currenttime, ps.playingdevice
            FROM playback ps
            JOIN songs s ON ps.id = s.id
            LIMIT 1;
        `;

        const result = await (conn as Pool).query(
            query, []
        );

        if (result.rows.length < 1) {
            return 'err'
        }

        return {
            song: {
                id: result.rows[0].id,
                artist: result.rows[0].artist,
                src: result.rows[0].src,
                title: result.rows[0].title,
                duration: result.rows[0].duration
            },
            ip: result.rows[0].playingdevice,
            currenttime: result.rows[0].currenttime,
            isplaying: result.rows[0].isplaying,
        } as CurrentSong
    } catch (error) {
        console.log(error)
        return 'err'
    }
}

export const setOnlineDevice = async (ip: string) => {
    try {
        const query = `
            INSERT INTO onlinedevices (ip, date)
            VALUES ($1, NOW())
            ON CONFLICT (ip)
            DO UPDATE SET date = NOW();
        `;
        const result = await (conn as Pool).query(
            query, [ip]
        );
        return 'success'
    } catch (error) {
        console.log(error)
        return 'err'
    }
}

export const getOnlineDevices = async () => {
    try {
        const query = `
            SELECT ip, date
            FROM onlinedevices
            WHERE date >= NOW() - INTERVAL '15 seconds';
        `;

        const result = await (conn as Pool).query(
            query, []
        );
        const onlineDevices = result.rows;

        const queryPlaybackDevice = `
            SELECT playingdevice
            FROM playback
            LIMIT 1; -- Pobranie tylko jednego wiersza
        `;
  
      const playbackDeviceResult = await (conn as Pool).query(queryPlaybackDevice, []);
      const playbackDevice = playbackDeviceResult.rows[0]?.playingdevice; 

      const onlineIPs = onlineDevices.map(device => device.ip);
      const missingDevices = playbackDevice && !onlineIPs.includes(playbackDevice)
        ? [{ ip: playbackDevice, date: null }]
        : [];
  
      const allDevices = [...onlineDevices, ...missingDevices];

        return {
            devices: allDevices,
            playingDevice: playbackDevice
        }
    } catch (error) {
        console.log(error)
        return 'err'
    }
}
export const changePlayingDevice = async (ip: string) => {
    try {
        const query = `
            UPDATE playback
            SET playingdevice = $1, forced = true
            WHERE id = (
                SELECT id
                FROM playback
                LIMIT 1
        )`;
        
        const result = await (conn as Pool).query(
            query, [ip]
        );
        return 'success'
    } catch (error) {
        console.log(error)
        return 'err'
    }
}
export const getQueue = async () => {
    try {
        const query = `SELECT 
                s.id AS song_id,
                s.title,
                s.artist,
                s.src,
                q.id AS queue_id,
                q.place
            FROM 
                queue q
            JOIN 
                songs s 
            ON 
                q.songid = s.id
            ORDER BY 
                q.place ASC;
        `

        const result = await (conn as Pool).query(
            query, []
        );

        if (result.rows.length < 1) {
            return null
        }

        return result.rows
    } catch (error) {
        console.log(error)
        return null
    }
}

export const skipSong = async () => {
    try {

        const insertPlaybackQuery = `
           UPDATE playback
            SET id = (
                SELECT songid
                FROM queue
                ORDER BY place ASC
                LIMIT 1
            ), currenttime = 0, isplaying = true, forced = true
            WHERE sysnum = 1;
        `;

        await (conn as Pool).query(insertPlaybackQuery, []);

        const query = `
            DELETE FROM queue
            WHERE id = (
                SELECT id
                FROM queue
                ORDER BY place ASC
                LIMIT 1
            );
        `
        const result = await (conn as Pool).query(
            query, []
        );

        const updateQuery = `
            WITH updated_queue AS (
                SELECT id, ROW_NUMBER() OVER (ORDER BY place ASC) AS new_place
                FROM queue
            )
            UPDATE queue
            SET place = updated_queue.new_place
            FROM updated_queue
            WHERE queue.id = updated_queue.id;
        `;

        const update = await (conn as Pool).query(
            updateQuery, []
        );

        const song = await getSong()
        return song
    } catch (error) {
        console.log(error)
        return 'err'
    }
}

export const addToQueue = async (songIds: number | number[]) => {
    try {
        const songs = Array.isArray(songIds) ? songIds : [songIds];

        const maxPlaceQuery = `
            SELECT COALESCE(MAX(place), 0) AS max_place
            FROM queue;
        `;
        const maxPlaceResult = await (conn as Pool).query(maxPlaceQuery, []);
        let maxPlace = maxPlaceResult.rows[0]?.max_place || 0;

        const insertQuery = `
            INSERT INTO queue (songid, place)
            VALUES ($1, $2);
        `;

        for (const songId of songs) {
            maxPlace += 1;
            await (conn as Pool).query(insertQuery, [songId, maxPlace]);
        }

        const updatedQueueQuery = `
            SELECT *
            FROM queue
            ORDER BY place ASC;
        `;
        const updatedQueue = await (conn as Pool).query(updatedQueueQuery, []);

        return 'success';
    } catch (error) {
        console.error(error);
        return 'err';
    }
};

export const getPlaylist = async (playlist: string) => {
    try {
        const playlistQuery = `
            SELECT 
                id,
                name, 
                description, 
                isprotected
            FROM 
                playlists
            WHERE 
                id = $1;
        `;

        const songsQuery = `
            SELECT 
                s.id AS id,
                s.title,
                s.artist,
                s.src,
                s.duration
            FROM 
                playlistssong ps
            JOIN 
                songs s 
            ON 
                ps.songid = s.id
            WHERE 
                ps.playlistid = $1;
        `;

        const playlistResult = await (conn as Pool).query(playlistQuery, [playlist]);
        const songsResult = await (conn as Pool).query(songsQuery, [playlist]);

        if (playlistResult.rows.length === 0) {
            return null;
        }

        const playlistData = playlistResult.rows[0];

        return {
            id: playlistData.id,
            name: playlistData.name,
            description: playlistData.description,
            isProtected: playlistData.isprotected,
            songs: songsResult.rows
        } as Playlist;
    } catch (error) {
        console.log(error);
        return null;
    }
};


export const getAllPlaylists = async () => {
    try {
        const query = `
            SELECT * FROM playlists ORDER BY place ASC;
        `;

        const result = await (conn as Pool).query(query, []);
        return result.rows as Playlist[];
    } catch (error) {
        console.log(error);
        return null;
    }
};

export const getNotProtectedPlaylist = async () => {
    try {
        const query = `
            SELECT * FROM playlists WHERE isprotected = false ORDER BY place ASC;
        `;

        const result = await (conn as Pool).query(query, []);
        return result.rows as Playlist[];
    } catch (error) {
        console.log(error);
        return null;
    }
};

export const addToAnotherPlaylists = async (
    playlists: string[] | number[],
    songs: number[]
) => {
    try {
        for (const playlistId of playlists) {
            for (const songId of songs) {
                const checkQuery = `
            SELECT 1 
            FROM playlistssong 
            WHERE playlistid = $1 AND songid = $2
            LIMIT 1;
          `;
                const checkResult = await (conn as Pool).query(checkQuery, [playlistId, songId]);

                if (checkResult.rowCount === 0) {
                    const insertQuery = `
              INSERT INTO playlistssong (playlistid, songid)
              VALUES ($1, $2);
            `;
                    await (conn as Pool).query(insertQuery, [playlistId, songId]);
                }
            }
        }
        return 'success'
    } catch (error) {
        console.log(error)
        return 'err'
    }
};

export const deleteFromPlaylist = async (playlistId: string | number, songIds: number[]) => {
    try {
        const deleteQuery = `
            DELETE FROM playlistssong
            WHERE playlistid = $1 AND songid = ANY($2);
        `;

        const result = await (conn as Pool).query(deleteQuery, [playlistId, songIds]);

        return 'success'

    } catch (error) {
        console.log(error)
        return 'err'
    }
}

export const updatePlaybackState = async (songId: number | null, currentTime: number, isPlaying: boolean) => {
    try {
        let query: string;
        let params: any[] = [songId, currentTime, isPlaying];

        const forcedCheckQuery = `
            SELECT forced, id, currenttime, isplaying
            FROM playback
            WHERE sysnum = 1;
        `;
        const result = await (conn as Pool).query(forcedCheckQuery, []);


        if (result.rows.length > 0 && result.rows[0].forced === true && (result.rows[0].id !== songId || result.rows[0].isplaying !== isPlaying)) {
            const song = await getSong()
            return {
                action: 'update',
                data: song
            }
        }

        if (songId === null) {
            return {
                action: 'error',
                data: ''
            }
        } else {
            query = `
                UPDATE playback
                SET id = $1, currenttime = $2, isplaying = $3, forced = false
                WHERE sysnum = 1;
            `;
            params = [songId, currentTime, isPlaying];
        }

        await (conn as Pool).query(query, params);
        
        const queryPlayingDevice = `SELECT playingdevice FROM playback LIMIT 1`
        const resultPlayingDevice = await (conn as Pool).query(queryPlayingDevice, []);
        return {
            action: 'success',
            data: resultPlayingDevice.rows[0].playingdevice
        }
    } catch (error) {
        console.log(error)
        return {
            action: 'error',
            data: ''
        }
    }
}

export const handlePlayPlayback = async (isPlaying: boolean) => {
    try {
        const query = `
            UPDATE playback
            SET isplaying = $1, forced = true
            WHERE sysnum = 1;
        `;
        await (conn as Pool).query(query, [!isPlaying]);
        return 'success'
    } catch (error) {
        console.log(error)
        return 'err'
    }
}

export const addPlaylist = async (name: string, description: string) => {
    try {
        const query = `
            INSERT INTO playlists (name, description)
            VALUES ($1, $2);
        `;

        const result = await (conn as Pool).query(query, [name, description]);
        return 'success';
    } catch (error) {
        console.log(error);
        return 'err';
    }
};
export const editPlaylist = async (name: string, description: string, id: number) => {
    try {
        const query = `
            UPDATE playlists
            SET name = $1, description = $2
            WHERE id = $3;
        `;

        const result = await (conn as Pool).query(query, [name, description, id]);
        return 'success';
    } catch (error) {
        console.log(error);
        return 'err';
    }
};
export const copyPlaylist = async (id: number) => {
    try {

        const getQuery = `
            SELECT name, description
            FROM playlists
            WHERE id = $1;
        `;
        const getResult = await (conn as Pool).query(getQuery, [id]);

        if (getResult.rows.length === 0) {
            return 'err'
        }

        const { name, description } = getResult.rows[0];

        const query = `
            INSERT INTO playlists (name, description)
            VALUES ($1, $2) RETURNING id;
        `;

        const insertResult = await (conn as Pool).query(query, [`Copy of ${name}`, description]);

        const newPlaylistId = insertResult.rows[0].id;

        const copySongsQuery = `
            INSERT INTO playlistssong (playlistid, songid)
            SELECT $1, songid
            FROM playlistssong
            WHERE playlistid = $2;
        `;
        await (conn as Pool).query(copySongsQuery, [newPlaylistId, id]);


        return newPlaylistId;
    } catch (error) {
        console.log(error);
        return 'err';
    }
};
export const deletePlaylist = async (id: number) => {
    try {

        const checkQuery = `
        SELECT isprotected FROM playlists WHERE id = $1
        `;
        const checkResult = await (conn as Pool).query(checkQuery, [id]);

        if (checkResult.rowCount === 0) {
            return 'Playlist not found';
        }

        const isProtected = checkResult.rows[0].isprotected;

        if (isProtected) {
            return 'Playlist is protected and cannot be deleted';
        }

        const deleteSongsQuery = `
            DELETE FROM playlistssong WHERE playlistid = $1
        `;
        await (conn as Pool).query(deleteSongsQuery, [id]);

        const query = `
            DELETE FROM playlists WHERE id = $1
        `;

        const result = await (conn as Pool).query(query, [id]);
        return 'success';
    } catch (error) {
        console.log(error);
        return 'err';
    }
};
export const changePlaylistOrder = async (playlists: Playlist[]) => {
    try {
        console.log(playlists)
        const query = `
            UPDATE playlists
            SET place = $1
            WHERE id = $2
        `
        for (let i = 0; i < playlists.length; i++) {
            const playlist = playlists[i]
            const result = await (conn as Pool).query(query, [i + 1, playlist.id]);
        }
        return 'success'
    } catch (error) {
        return 'err'
    }
}