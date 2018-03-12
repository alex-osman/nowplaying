const request = require('request-promise-native')
const user = '1240132288';
const playlist = '6NFODPrTH7nLylJS78DDlF';
const url = `https://api.spotify.com/v1/users/${user}/playlists/${playlist}`
const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer BQALYD-FMpB3OQLQcJ-syCnEuT9-uHhjTxZvwBpSsRszFuiiiQNIZWF06BHuEvT7BxG-bBUddQLv-SEW6RAcVOASDEs0OrdhD8BXQrBLoY-3Sy-onrliEfy_qOyBbLaOBFb9M2CY7wma0IppXh26C7ZB2e95RKQ'
}

const main = async () => {
    const response = JSON.parse(await request({ url, headers }))
    const songs = response.tracks.items.map(item => ({
        name: item.track.name,
        artists: item.track.artists.map(artist => artist.name)
    }))
    console.log(songs.map(song => `${song.artists}: ${song.name}`).reduce((prev, curr) => `${prev}\n${curr}`))
}

main()