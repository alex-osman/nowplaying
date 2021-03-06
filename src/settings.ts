const isTest = Boolean(process.env.NOWPLAYING_TESTING)

export const settings = {
    communityName: 'nowplaying',
    username: process.env.STEEM_USERNAME,
    password: process.env.STEEM_PASSWORD,
    week: () => isTest ? 10 : Math.ceil(((((new Date() as any) - (new Date(2018, 0, 1) as any)) / 86400000) ) / 7),
    payout: .814,
    tags: ['nowplaying', 'music', 'contest', 'share', 'spotify'],
    blacklist: [
        'arsaljr',
        'clicknpict',
        'clicknpict2',
        'dianasteem7',
        'heroheri',
        'hidayat007',
        'loubega',
        'maulinda',
        'moontrap',
        'rahmatz',
        'ryanananda',
        'safrizalpotret',
        'tasyazgs588',
    ],

    // Spotify
    spotifyLink: 'https://open.spotify.com/user/1240132288/playlist/5SbUiRIpH2dQ7q2wXuc0Qp?si=rOopOVUVTa6iSNUmYU6upg',
    spotifyImg: 'https://steemitimages.com/DQmRVimTJm1cffUjuLDfSoRAFknghH885zqSS6xd3n8cyGd/image.png',
    spotifyUserId: 1240132288,

    commentBody: `Thanks for entering this week's #nowplaying!\nIf you would like your song added to the weekly spotify playlist, reply to this comment in the following format:\n\`\`\`\nArtist\nSong\n\`\`\`\nIf you have multiple songs, make multiple replies to this comment`,
    access_token: null,
    refresh_token: null,
}
