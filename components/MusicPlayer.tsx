'use client'
import { formatTime } from '@/lib/func';
import { getSong, handlePlayPlayback, setOnlineDevice, skipSong, updatePlaybackState } from '@/lib/music';
import { Song } from '@/lib/types';
import React, { useEffect, useRef, useState } from 'react'
import { IoIosSkipBackward } from "react-icons/io";
import { IoIosSkipForward } from "react-icons/io";
import { IoPauseCircle } from "react-icons/io5";
import { IoPlayCircleSharp } from "react-icons/io5";
import SongCard from './SongCard';
import { toast } from 'react-toastify';
import { getIPAddress } from '@/lib/getIp';
import { FaHeadphonesAlt } from "react-icons/fa";
import ChangePlayerPopup from './ChangePlayerPopup';

const MusicPlayer = () => {

    const audioRef = useRef<HTMLAudioElement | null>(null)
    const progressRef = useRef<HTMLDivElement>(null);
    const [song, setSong] = useState<Song | null>(null)
    const [isPlaying, setIsPlaying] = useState<boolean>(false)
    const [progress, setProgress] = useState<number>(0)
    const [currentTime, setCurrentTime] = useState<number>(0)
    const [duration, setDuration] = useState<number>(0)
    const [mode, setMode] = useState<'control' | 'playback'>('control')
    const [showChangePlayer, setShowChangePlayer] = useState(false)

    // initial fetch
    const fetchSong = async () => {
        const ip = await getIPAddress()
        const res = await getSong()
        if (res === 'err') {
            toast.error("Something went wrong with fetching data!")
            return
        }
        setMode(ip === res.ip ? 'playback' : 'control')
        console.log(ip, res.ip, ip === res.ip)
        setDuration(res.song.duration)
        setCurrentTime(res.currenttime)
        setProgress(res.currenttime / res.song.duration * 100)
        setIsPlaying(res.isplaying)
        setSong(res.song)
    }

    useEffect(() => {
        fetchSong()
    }, [])

    // fetch for controlers
    useEffect(() => {
        if (mode === 'control') {
            const interval = setInterval(fetchSong, 1000);

            return () => clearInterval(interval);
        }
    }, [mode])

    // update for playback
    useEffect(() => {
        const update = async () => {
            if (song && audioRef.current) {
                const res = await updatePlaybackState(song ? song.id : null, Math.round(audioRef.current.currentTime), isPlaying)
                if (res.action === 'update') {
                    const ip = await getIPAddress()
                    setMode(ip === res.data.ip ? 'playback' : 'control')
                    if(ip !== res.data.ip) {
                        return
                    }
                    setDuration(res.data.song.duration)
                    setCurrentTime(res.data.currenttime)
                    setProgress(res.data.currenttime / res.data.song.duration * 100)
                    setIsPlaying(res.data.isplaying)
                    setSong(res.data.song)
                }
                if(res.action === 'success') {
                    const ip = await getIPAddress()
                    setMode(ip === res.data ? 'playback' : 'control')
                }
            }
        }

        if (mode === 'playback') {
            const interval = setInterval(update, 1000);

            return () => clearInterval(interval);
        }

    }, [song, audioRef, isPlaying, mode])

    // play/pause
    const handlePlayPause = async () => {
        const res = await handlePlayPlayback(isPlaying)
        console.log(res)
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setProgress(
                (audioRef.current.currentTime / audioRef.current.duration) * 100
            )
        }
    }

    // play next song
    const handlePlayNext = async () => {
        try {
            const res = await skipSong()
            if (res === 'err') {
                toast.error('Could not skip the song')
                return
            }
            setDuration(res.song.duration)
            setCurrentTime(res.currenttime)
            setProgress(res.currenttime / res.song.duration * 100)
            setIsPlaying(res.isplaying)
            setSong(res.song)
        } catch (error) {
            toast.error('Could not skip the song')
        }
    }

    // play next song when current end
    const handleSongEnd = async () => {
        try {
            const res = await skipSong();
            if (res === 'err') {
                toast.error('Could not play the next song');
                setIsPlaying(false);
                return;
            }
            setDuration(res.song.duration)
            setCurrentTime(res.currenttime)
            setProgress(res.currenttime / res.song.duration * 100)
            setIsPlaying(res.isplaying)
            setSong(res.song)
        } catch (error) {
            console.log(error);
            toast.error('Error playing the next song');
        }
    }

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration)
        }
    }

    useEffect(() => {
        if (mode === 'playback' && audioRef.current) {
            audioRef.current.src = (song?.src as string)
            audioRef.current.currentTime = currentTime || 0
            if (isPlaying) {
                audioRef.current.play();
            }
        }
    }, [song])

    const handleSeek = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (progressRef.current && audioRef.current) {
            const rect = progressRef.current.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const newProgress = (clickX / rect.width) * 100;
            const newTime = (audioRef.current.duration * newProgress) / 100;

            audioRef.current.currentTime = newTime;
            setProgress(newProgress);
        }
    }

    useEffect(() => {
        const handleOnline = async () => {
            const ip = await getIPAddress()
            const res = await setOnlineDevice(ip as string)
        }
        const interval = setInterval(handleOnline, 10000);

        return () => clearInterval(interval);
    }, [])

    if (!song) {
        return null;
    }

    return (
        <>
            {showChangePlayer && <ChangePlayerPopup handleClose={() => setShowChangePlayer(false)} />}
            <div className='sticky bottom-0 px-4 pb-4'>
                <div className='flex items-center bg-dark-50 rounded-lg p-4'>
                    {mode === 'playback' && <audio
                        ref={audioRef}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={handleSongEnd}
                    />
                    }
                    <SongCard
                        song={song}
                    />

                    <div className='flex flex-col items-center'>
                        <div className='flex mb-1 gap-3 items-center'>
                            <button className='hover:cursor-pointer group'>
                                <IoIosSkipBackward className='text-2xl text-gray-200 group-hover:text-white duration-200 transition-all' />
                            </button>
                            <button onClick={handlePlayPause} className={`group hover:cursor-pointer`}>
                                {isPlaying ?
                                    <IoPauseCircle className='text-3xl text-gray-200 group-hover:text-white duration-200 transition-all' /> :
                                    <IoPlayCircleSharp className='text-3xl text-gray-200 group-hover:text-white duration-200 transition-all' />
                                }
                            </button>
                            <button onClick={handlePlayNext} className='hover:cursor-pointer group'>
                                <IoIosSkipForward className='text-2xl text-gray-200 group-hover:text-white duration-200 transition-all' />
                            </button>
                        </div>
                        <div className='flex gap-2 items-center'>
                            <p className='text-sm text-gray-300'>{formatTime(currentTime)}</p>
                            <div ref={progressRef} onClick={handleSeek} className={`relative w-[350px] ${mode === 'playback' && 'hover:cursor-pointer'}`}>
                                <div className='w-full h-1 rounded-full bg-dark-200'></div>
                                <div style={{ width: `${progress}%` }} className='absolute rounded-lg top-0 left-0 h-1 bg-white'></div>
                            </div>
                            <p className='text-sm text-gray-300'>{formatTime(duration)}</p>
                        </div>
                    </div>
                    <div className='flex-1 flex justify-end items-center'>
                        <button onClick={() => setShowChangePlayer(true)} className='mr-4'>
                            <FaHeadphonesAlt className='text-2xl text-gray-400' />
                        </button>
                    </div>
                </div>
            </div>
        </>

    )
}

export default MusicPlayer;
