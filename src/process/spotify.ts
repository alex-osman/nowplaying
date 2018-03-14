const request = require('request-promise-native')
import { Playlist } from '../classes/playlist'
import { Track } from '../classes/track';

export class Spotify {
    private static spotify: Spotify = null;
    private _user: string = '1240132288'
    private _urls = {
        tracks: (userId, playlistId) => `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`,
        playlists: (userId, playlistId?: number) => `https://api.spotify.com/v1/users/${userId}/playlists/?limit=50`
    }
    private _headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer BQCFiQxOtRSuuE60u8jSq_LrvRoMnDySwxe17B4O5-NnAS-xLeON2xXeMliJATyVeE-XzA_xWv2mV-uKyo84GivVJ88NuIjgzdvr6YhjfA0oVxwlpX_y0qFCH3ECePmAgS2K2K4kZABQiBwW4PwFL2RHhq7TnY0'
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




        // const songs = playlists
        //     .reduce((songs, playlist) => songs.concat(playlist.tracks.map(track => track.artists[0])), [])
            // .reduce((obj, song) => {
            //     if (obj[song]) {
            //         obj[song] += 1
            //     } else {
            //         obj[song] = 1
            //     }
            //     return obj
            // }, {})
            // .sort((a, b) => a > b ? 1 : -1)
        // console.log(songs)
        
        // const playlist_songs = playlists.map(playlist => playlist.tracks.map(track => track.toString()))
        // console.log(playlist_songs)
    }
}