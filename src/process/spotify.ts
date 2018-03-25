const request = require('request-promise-native')
import { Playlist } from '../classes/playlist'
import { Track } from '../classes/track';

export class Spotify {
    private static spotify: Spotify = null;
    private _user: string = '1240132288'
    private _urls = {
        tracks: (userId, playlistId) => `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`,
        playlists: (userId, playlistId?: number) => `https://api.spotify.com/v1/users/${userId}/playlists/?limit=50`,
        search: (track, artist) => `https://api.spotify.com/v1/search?q=${encodeURIComponent(track)}%20${encodeURIComponent(artist)}&type=track`
    }
    private _headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer BQDw3hCQMubI01BP0VhSxYXN-K9upGmHdY_ioGC2IDKh6NiHq9mH8hB8Q4XxWyrPU8nef82lHXHYW8MryRa7_rKB-38mEAqyYkxoehp6ZbjWpc1CEJWtghrXuJZsnf7xqpsOwSGsglKtlFaq8A5PgqGc4x0JFzU'
    }

    private constructor() { }

    public static Instance(): Spotify {
        // check if an instance of the class is already created
        if (this.spotify == null) {
            // If not created create an instance of the class
            // store the instance in the variable
            this.spotify = new Spotify();
        }
        // return the singleton object
        return this.spotify
        }

    /**
     * This function will mutate the playlist param and populate with tracks
     * @param playlist gets the tracks for a playlist
     */
    private getTracks = async (playlist: Playlist) => {
        const response = JSON.parse(await request({ url: this._urls.tracks(this._user, playlist.id), headers: this._headers }))
        playlist.tracks = response.items
            .map(item => item.track)
            .map(item => ({
                spotify_id: item.id,
                name: item.name,
                artists: item.artists.map(a => a.name),
                week: playlist.week
            }))
        
        return playlist
        
    }

    public getPlaylists = async () => {
        const response = JSON.parse(await request({ url: this._urls.playlists(this._user), headers: this._headers }))
        const playlistPromises = response.items
            .filter(item => item.name.includes('#nowplaying'))
            .map(item => Object.assign({}, item, { week: parseInt(item.name.split('#nowplaying')[1]) }))
            .map((item): Playlist => ({ id: item.id, name: item.name, week: item.week } as Playlist))
            .map(playlist => this.getTracks(playlist)) as Promise<Playlist>[]
        const playlists = await Promise.all(playlistPromises)

        return playlists
    }

    public trackSearch = async (trackName: string, artistName: string) => {
        const response = JSON.parse(await request({ url: this._urls.search(trackName, artistName), headers: this._headers }))

        const song = response.tracks.items[0]
        const track = new Track()

        track.spotify_id = song.id;
        track.name = song.name;
        track.artists = song.artists.map(artist => artist.name);
        track.img = song.album.images[0].url
        return track
    }

    public test = async () => {
        const playlists = (await this.getPlaylists()).map(playlist => {
            const ret = new Playlist()
            ret.id = playlist.id,
            ret.name = playlist.name,
            ret.tracks = playlist.tracks.map(track => {
                const trackRet = new Track()
                trackRet.spotify_id = track.spotify_id,
                trackRet.name = track.name,
                trackRet.artists = track.artists
                return trackRet
            })
            return ret
        })




        const songs = playlists
            .reduce((songs, playlist) => songs.concat(playlist.tracks.map(track => track.artists[0])), [])
            .reduce((obj, song) => {
                if (obj[song]) {
                    obj[song] += 1
                } else {
                    obj[song] = 1
                }
                return obj
            }, {})
            .sort((a, b) => a > b ? 1 : -1)
        console.log(songs)
        
        const playlist_songs = playlists.map(playlist => playlist.tracks.map(track => track.toString()))
        console.log(playlist_songs)
    }
}