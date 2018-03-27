import { settings } from './../settings'
import { Track } from './track'

export class Playlist {
    spotify_id: string;
    id: string;
    name: string;
    week: number;
    tracks: Track[];

    public getLink() {
        return `https://open.spotify.com/user/${settings.spotifyUserId}/playlist/${this.spotify_id}`
    }
}