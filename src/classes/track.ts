export class Track {
    spotify_id: string;
    name: string;
    week: number;
    artists: string[];
    img: string;
    postId: number;

    public getLink() {
        return `https://open.spotify.com/track/${this.spotify_id}`
    }

    public print() {
        const artistStr = this.artists.reduce((prev, current, index) => index ? `${current}` : `${prev},-${current}`)
        console.log(`${this.week}: ${artistStr} - ${this.name}`)
    }
    public toString() {
        const artistStr = this.artists.reduce((prev, current, index) => index ? `${current}` : `${prev},-${current}`)
        return `${this.week}: ${artistStr} - ${this.name}`
    }
}