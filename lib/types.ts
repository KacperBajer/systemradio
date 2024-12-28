export type Song = {
  id: number;
  title: string;
  artist: string;
  src: string;
  duration: number,
}
export type CurrentSong = {
  song: Song
  ip: string
  currenttime: number
  isplaying: boolean
}
export type Playlist = {
  id: number
  description: string
  name: string
  isProtected: boolean
  songs: Song[]
}
export type QueueSong = {
  queue_id: number
  place: number
} & Song