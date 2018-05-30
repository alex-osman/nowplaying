const request = require('request-promise-native')
import { Playlist } from '../classes/playlist'
import { Track } from '../classes/track';
import { settings } from '../settings';

export class Spotify {
    private static spotify: Spotify = null;
    public access_token: string = process.env.ACCESS_TOKEN;
    public refresh_token: string = process.env.SPOTIFY_REFRESH_TOKEN;
    private _user: string = '1240132288'
    private _urls = {
        auth: () => `https://accounts.spotify.com/api/token`,
        tracks: (userId, playlistId) => `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`,
        playlists: (userId, playlistId?: number) => `https://api.spotify.com/v1/users/${userId}/playlists/?limit=50`,
        search: (track, artist) => `https://api.spotify.com/v1/search?q=${encodeURIComponent(track)}%20${encodeURIComponent(artist)}&type=track`,
        addTrack: (userId, playlistId, trackId) => `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks?uris=${encodeURIComponent(`spotify:track:${trackId}`)}`
    }
    private _headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
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

    private refresh_authentication = async (callback) => {
        try {
            const response = JSON.parse(
                await request.post({
                    url: this._urls.auth(),
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded'
                    }
                }).form({
                    grant_type: 'refresh_token',
                    refresh_token: this.refresh_token,
                    client_id: process.env.SPOTIFY_CLIENT_ID,
                    client_secret: process.env.SPOTIFY_CLIENT_SECRET,
                })
            )
            this.access_token = response.access_token
            callback({
                spotify_access: this.access_token,
                spotify_refresh: this.refresh_token
            })
        } catch(e) {
            console.warn('error refreshing', e)
            throw e
        }
    }

    public authenticate = async (auth, callback) => {
        console.log('authenticating...')
        const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env
        if (auth) {
            this.access_token = auth.spotify_access;
            this.refresh_token = auth.spotify_refresh;
        }

        try {
            if (!this.refresh_token) {
                const response = JSON.parse(
                    await request.post({
                        url: this._urls.auth(),
                        headers: {
                            'content-type': 'application/x-www-form-urlencoded'
                        }
                    }).form({
                        grant_type: 'authorization_code',
                        code: process.env.SPOTIFY_AUTH,
                        redirect_uri: 'https://www.google.com',
                        client_id: process.env.SPOTIFY_CLIENT_ID,
                        client_secret: process.env.SPOTIFY_CLIENT_SECRET,
                    })
                )
                console.log('~authenticated~')
                this.access_token = response.access_token;
                this.refresh_token = response.refresh_token;
            } else {
                console.log('~~authenticated~~')
            }
            setInterval(() => this.refresh_authentication(callback), 3600 * 1000)
            callback({
                spotify_access: this.access_token,
                spotify_refresh: this.refresh_token,
            })
        } catch(e) {
            if (e.error) {
                const error = JSON.parse(e.error)
                if (error.error_description === 'Authorization code expired') {
                    console.warn('Authorization __ code __ expired doofus')
                } else if (error.error_description === 'Invalid access token') {
                    console.warn('Invalid Access cokde', error)
                } else {
                    console.warn(error.error_description)
                }
            } else {
                console.warn('didnt go well', e)
            }
            return null
        }
    }

    public addTrack = async (playlist: Playlist, track: Track) => {
        try {
            const response = JSON.parse(
                await request.post({
                    url: this._urls.addTrack(this._user, playlist.spotify_id, track.spotify_id),
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.access_token}`,
                    }
                })
            )
            return response
        } catch (e) {
            console.log(e)
            console.log('Error adding track')
        }
    }

    /**
     * This function will mutate the playlist param and populate with tracks
     * @param playlist gets the tracks for a playlist
     */
    private getTracks = async (playlist: Playlist) => {
        try {
            const response = JSON.parse(
                await request({
                    url: this._urls.tracks(this._user, playlist.spotify_id),
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.access_token}`,
                    }
                }))
            playlist.tracks = response.items
                .map(item => item.track)
                .map(item => ({
                    spotify_id: item.id,
                    name: item.name,
                    artists: item.artists.map(a => a.name),
                    week: playlist.week
                }))

            return playlist
        } catch(e) {
            console.log(`couldn't get track`, e)
        }

    }

    public getPlaylists = async () => {
        try {
            const response = JSON.parse(
                await request({
                    url: this._urls.playlists(this._user),
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.access_token}`,
                    }
                }))
            const playlistPromises = response.items
                .filter(item => item.name.includes('#nowplaying'))
                .map(item => Object.assign({}, item, { week: parseInt(item.name.split('#nowplaying')[1]) }))
                .map((item): Playlist => {
                    const playlist = new Playlist()
                    playlist.spotify_id = item.id;
                    playlist.name = item.name;
                    playlist.week = item.week
                    return playlist
                })
                .map(playlist => this.getTracks(playlist)) as Promise<Playlist>[]
            const playlists = await Promise.all(playlistPromises)

            return playlists
        } catch(e) {
            console.log('getplaylists error')
            console.log(e)
        }
    }

    public trackSearch = async (trackName: string, artistName: string) => {
        try {
            const response = JSON.parse(
                await request({
                    url: this._urls.search(trackName, artistName),
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.access_token}`,
                    }
                }))
            if (response.tracks.items.length) {
                const song = response.tracks.items[0]
                const track = new Track()

                track.spotify_id = song.id;
                track.name = song.name;
                track.artists = song.artists.map(artist => artist.name);
                track.img = song.album.images[0].url
                return track
            } else {
                throw { error: 'cant find', trackName, artistName }
            }
        } catch(e) {
            console.warn('error searching for track', trackName, artistName, this._urls.search(trackName, artistName), e)
            throw e
        }
    }

    public test = async () => {
        const playlists = (await this.getPlaylists()).map(playlist => {
            const ret = new Playlist()
            ret.spotify_id = playlist.spotify_id,
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
