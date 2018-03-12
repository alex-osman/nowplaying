const request = require('request-promise-native')
import { Playlist } from '../classes/playlist'
import { Track } from '../classes/track';

const user = '1240132288';
const urls = {
    tracks: (userId, playlistId) => `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`,
    playlists: (userId, playlistId?: number) => `https://api.spotify.com/v1/users/${userId}/playlists/?limit=50`
}
const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer BQCvp-Z0taIPvaCQJQ-hgctBkgnnXxj9zRNAgdfvHyv0eAR8raygQqs5WrfMNCBIasjej5sc5B0lLZ9iDISFDhcx4bmcoXW0XKbAAgO5LuaKbR6uJtofCMKOdbzs1-3iBfupfj_drytxvmbGYs6lRzybPVWh_qM'
}

const getTracks = async (playlist: Playlist) => {
    const response = JSON.parse(await request({ url: urls.tracks(user, playlist.id), headers }))
    playlist.tracks = response.items
        .map(item => item.track)
        .map(item => ({ id: item.id, name: item.name, artists: item.artists.map(a => a.name)}))
    
    return playlist
    
}

const getPlaylists = async () => {
    const response = JSON.parse(await request({ url: urls.playlists(user), headers }))
    const playlistPromises = response.items
        .filter(item => item.name.includes('#nowplaying'))
        .map((item): Playlist => ({ id: item.id, name: item.name } as Playlist))
        .map(playlist => getTracks(playlist)) as Promise<Playlist>[]
    const playlists = await Promise.all(playlistPromises)

    return playlists
}

const main = async () => {
    const playlists = (await getPlaylists()).map(playlist => {
        const ret = new Playlist()
        ret.id = playlist.id,
        ret.name = playlist.name,
        ret.tracks = playlist.tracks.map(track => {
            const trackRet = new Track()
            trackRet.id = track.id,
            trackRet.name = track.name,
            trackRet.artists = track.artists
            return trackRet
        })
        return ret
    })
    const songs = playlists
        .reduce((songs, playlist) => songs.concat(playlist.tracks.map(track => track.toString())), [])
        .reduce((obj, song) => {
            if (obj[song]) {
                obj[song] += 1
            } else {
                obj[song] = 1
            }
            return obj
        })
        // .sort((a, b) => a > b ? 1 : -1)
    console.log(songs)
    
    const playlist_songs = playlists.map(playlist => playlist.tracks.map(track => track.toString()))
    // console.log(playlist_songs)
}

main()