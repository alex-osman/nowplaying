export const settings = {
    communityName: 'nowplaying',
    username: process.env.STEEM_USERNAME,
    password: process.env.STEEM_PASSWORD,
    week: Math.ceil(((((new Date() as any) - (new Date(2018, 0, 1) as any)) / 86400000) ) / 7),
    payout: 0.4,
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
        'nowplaying-music',
        'rahmatz',
        'ryanananda',
        'safrizalpotret',
        'tasyazgs588',
    ],

    // Spotify
    spotifyLink: 'https://open.spotify.com/user/1240132288/playlist/0zOxW1tvzXkNUXtlfMIV5C?si=gFlNl8WxRX6Tsc8QF-ffAw',
    spotifyImg: 'https://steemitimages.com/DQmXpCkcSg6oZE9ucEiQHvAFJmQj2iWzidGjrHWYpKMDVnb/image.png',
}
