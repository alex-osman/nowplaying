export class Track {
    id: string;
    name: string;
    artists: string[];

    public print() {
        const artistStr = this.artists.reduce((prev, current, index) => index ? `${current}` : `${prev},-${current}`)
        console.log(`${artistStr} - ${this.name}`)
    }
    public toString() {
        const artistStr = this.artists.reduce((prev, current, index) => index ? `${current}` : `${prev},-${current}`)
        return `${artistStr} - ${this.name}`
    }
}