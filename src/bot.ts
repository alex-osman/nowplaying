import { reportStartWeek, reportRecap } from './reporter';
import { Broadcaster } from './broadcaster/broadcaster';
import { IDatabase } from './database/database'
import { BlockchainAPI } from './blockchainAPI/blockchainAPI'
import { User } from './classes/user';
import { weekFilter } from './filters';
import { Statistics } from './statistics';
import { Post } from './classes/post';
import { Report } from './classes/report';
import { Spotify } from './process/spotify';
import { Track } from './classes/track';
import { Playlist } from './classes/playlist';
const dateformat = require('dateformat')

const steem = require('steem')

// this should be a singleton
export class Bot {
    week: number;
    communityName: string; // nowplaying
    username: string;      // nowplaying-music
    password: string;
    users: User[];
    posts: Post[];

    private _broadcaster: Broadcaster;
    private _blockchainAPI: BlockchainAPI;
    private _database: IDatabase;

    getPostingWif(): string {
        return steem.auth.toWif(this.username, this.password, 'posting')
    }

    getActiveWif(): string {
        return steem.auth.toWif(this.username, this.password, 'active')
    }

    setBroadcaster(broadcaster: Broadcaster): void {
        broadcaster.setCredentials(this.username, this.getPostingWif())
        this._broadcaster = broadcaster
    }

    setBlockchainAPI(blockchainAPI: BlockchainAPI) {
        this._blockchainAPI = blockchainAPI
    }

    async setDatabase(database: IDatabase): Promise<void> {
        this._database = database
        await this._database.setup()
        this.users = await this._database.getUsers()
    }

    public async close(): Promise<void> {
        await this._database.close();
    }

    public async scrape(): Promise<void> {
        console.log(`[${dateformat(new Date(), 'mmmm dS, h:MM:ss TT')}]`);
        console.log(`[Start Scraping - Week ${this.week}]`);
        try {
            const allPosts = await this._blockchainAPI.getPosts(this.communityName);
            const results = await this._database.writePosts(allPosts);
            console.log(`- created: ${results.created}\n- updated: ${results.updated}`);
            try { await this.approve(); } catch (e) { }
            try { await this.comment(); } catch (e) { }
            try { await this.vote(); } catch (e) { }
            try { await this.replies(); } catch (e) { }

        } catch (e) {
            console.log(e);
            console.log('got err');
        }
        console.log('[End Scraping]');
    }

    public async approve(): Promise<void> {
        const allPosts = await this._database.getPosts();
        const unapproved = allPosts.filter((post: Post) => !post.is_approved);

        const permlink = `${this.communityName}-week-${this.week}`;
        const weekPost = await this._blockchainAPI.getPost({ author: this.username, permlink } as Post);
        const voters = weekPost.active_votes.map(vote => vote.voter);
        const toApprove = unapproved.filter((post: Post) => voters.includes(post.author));
        console.log('- approving', toApprove.map(post => `${post.author}, ${post.permlink}`));
        this._database.approve(toApprove);
    }

    public async comment(): Promise<void> {
        try {
            const allPosts = await this._database.getPosts()

            const toCommentPosts = allPosts
                .filter(post => post.author !== this.username)
                .filter(post => !post.did_comment && post.is_approved)
            console.log('- commenting on', toCommentPosts)

            // Comment on each one with 20 second breaks
            for (const [index, post] of toCommentPosts.entries()) {
                try {
                    await this._broadcaster.makeComment(post);
                    await this._database.writeComment(post);
                } catch(e) {
                    console.log('err commenting', e);
                }
                await new Promise(resolve => setTimeout(resolve, 7 * 1000))
            }
        } catch(e) {
            console.log('something went wrong', e);
        }
    }

    async vote(): Promise<any> {
        try {
            const allPosts = await this._database.getPosts()
            // Only vote on approved posts
            const toVotePosts = allPosts
                .filter(post => post.author !== this.username)
                .filter(post => !post.did_vote && post.is_approved)
            console.log('- voting on', toVotePosts)

            // Vote on each one with 5 second breaks
            toVotePosts.forEach((post, index) => {
                setTimeout(async () => {
                    try {
                        await this._broadcaster.makeVote(post)
                        await this._database.writeVote(post)
                    } catch(e) {
                        console.log('err voting')
                    }
                }, index * 5 * 1000)
            })
        } catch(e) {
            console.log('something went wrong', e)
        }
    }

    public async payout(totalPayout: number): Promise<void> {
        const allUsers = await this._database.getUsers()
        const weekUsers = allUsers.filter(weekFilter(this.week));
        console.log(this.week)
        console.log(weekUsers.map(u => u.username));
        const wallet = await this._blockchainAPI.getWallet({ username: this.username } as User);
        wallet.setActive(this.getActiveWif());
        // wallet.setDanger(true);

        // Payout each user
        const individualPayout = totalPayout / weekUsers.length
        let current = 0;
        weekUsers.forEach((user: User, index: number) => {
            setTimeout(
                async () => {
                    try {
                        await wallet.powerUp(user, individualPayout);
                        current += individualPayout;
                        console.log(`${current.toFixed(3)}/${totalPayout} STEEM, [${index + 1}/${weekUsers.length}] transactions complete...`);
                    } catch (e) {
                        console.log('ran into an error');
                        console.log('~~~~~', user, index);
                        console.log(e);
                    }
                },
                index * 1000);
            // 1 second delay between transaction
        })
    }

    public async makePost(): Promise<void> {
        console.log(`[Should I Make a Post? - Week ${this.week}]`);
        const posts = (await this._database.getPosts())
            .filter((post: Post) => post.author === this.username);
        const thisWeekPost = posts.find((post: Post) => post.permlink === `${this.communityName}-week-${this.week}`);
        if (!thisWeekPost) {
            console.log('Need to post a week');
            await this.postWeek();
        } else {
            console.log('Good for this post');
        }

        const thisWeekPayout = posts.find((post: Post) => post.permlink === `${this.communityName}-recap-week-${this.week - 1}`);
        if (!thisWeekPayout) {
            if (new Date().getDay() > 3) {
                console.log('Need to post a recap');
                await this.postRecap();
            } else {
                console.log('ill do it later')
            }
        } else {
            console.log('Good for this recap');
        }
        return;
    }

    async postWeek(): Promise<Report> {
        try {
            const users = await this._database.getUsers()
            const report = await reportStartWeek(users)
            // this._broadcaster.makePost(report.post)
            return report
        } catch(e) {
            console.log(e)
            console.log('got err')
            return null
        }
    }

    async postRecap(): Promise<Report> {
        try {
            const users = await this._database.getUsers();
            const report = await reportRecap(users);
            // this._broadcaster.makePost(report.post);

            return report;
        } catch(e) {
            console.log(e)
            console.log('got err');

            return null
        }
    }

    async stats() {
        const statistics = Statistics.Instance()
        statistics.posts = await this._database.getPosts()
        statistics.users = await this._database.getUsers()

        statistics.general()
    }

    async spotify() {
        const spotify = Spotify.Instance()
        const playlists = await spotify.getPlaylists()
        playlists.forEach(playlist => {
            playlist.tracks.forEach(async track => {
                try {
                    await this._database.writeTrack(track)
                } catch(e) {
                    console.log(`couldn't write track ${track.name} due to ${e}`)
                    console.warn(e)
                }
            })
        })
    }

    public async authenticate() {
        const auth = await this._database.getSpotifyAuth();
        const spotify = Spotify.Instance();
        const updatedAuth = await spotify.authenticate(auth, this._database.writeSpotifyAuth);
        return updatedAuth
    }

    async replies() {
        try {
            const spotify = Spotify.Instance()

            const playlists = await spotify.getPlaylists()
            const playlist = playlists.find(playlist => playlist.week === this.week)

            const allPosts = (await this._database.getPosts())
                .filter(post => post.read_replies)

            // Check each post to see if we need to comment on any
            for (const rootPost of allPosts) {
                await this.replyTo(rootPost, playlist)

                // No longer look at this one if older than a week
                const now = new Date().getTime()
                if (new Date(rootPost.created).getTime() + (1000 * 60 * 60 * 24 * 7) < now) {
                    await this._database.stopReadReplies(rootPost)
                }
            }
        } catch(e) {
            process.exit()
            console.log('something went wrong', e)
        }
    }

    async replyTo(rootPost: Post, playlist: Playlist) {
        let replies: Post[] = await this._blockchainAPI.getReplies(rootPost)
        const spotify = Spotify.Instance()

        // Find our reply asking for songs
        const questionReply = replies.find(reply => reply.author === this.username)
        if (questionReply && questionReply.children) {
            // Read the replies
            replies = await this._blockchainAPI.getReplies(questionReply as Post)
            const authorReplies = replies.filter((post: Post) => post.author === rootPost.author || post.author === this.username || post.author === 'walnut1')
            for (const post of authorReplies) {
                try {
                    // Check if we already commented on this one
                    const subreplies = await this._blockchainAPI.getReplies(post)
                    // if not, parse the comment and reply
                    if (!subreplies.find((reply: Post) => reply.author === this.username)) {
                        // Strip any html
                        const search = post.body
                            .replace(/<[^>]*>/g, '')
                            .replace(/[Aa]rtist\:*\s*/, '')
                            .replace(/[Ss]ong\:*\s*/, '')
                            .replace(/[Tt]rack\:*\s*/, '')
                            .replace(/\s+/g, ' ')
                        console.log(search)
                        
                        // search the track
                        const track = await spotify.trackSearch(search)
                        track.postId = rootPost.id

                        // make the reply
                        await this.addTrackReply(post, track, playlist)
                    }
                } catch (e) { }
            }
        }
    }

    /**
     * This function will add a track to the database and
     * reply to the user's post
     * 
     * @param post The post to reply to
     * @param track The track being added
     * @param playlist The playlist to add to
     */
    async addTrackReply(post: Post, track: Track, playlist: Playlist) {
        const spotify = Spotify.Instance()

        // Check if this track has been seen before
        const posts = await this._database.getPostsByTrack(track)
        const text = posts.map(post => `@${post.author} posted this song on [${dateformat(post.created, 'mmmm dS')}](${post.getLink()})!`)
        text.push(`Adding ${track.name} to the weekly playlist\n[![](${track.img})](${playlist.getLink()})`);
        const replyText = text.join('\n')
        
        await this._broadcaster.makeReply(post, replyText)
        console.log('Posted a reply')
        await (() => new Promise(resolve => setTimeout(resolve, 20000)))()

        // add to the database
        await this._database.writeTrack(track)
        console.log('wrote to database')

        // add to the playlist
        await spotify.addTrack(playlist, track)
        console.log('added ', track.name)
    }
}
