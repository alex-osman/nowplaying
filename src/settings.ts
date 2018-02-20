export const settings = {
    communityName: 'nowplaying',
    username: process.env.STEEM_USERNAME,
    password: process.env.STEEM_PASSWORD,
    week: Math.ceil((((new Date() - new Date(2018, 0, 1)) / 86400000) + 1) / 7),
    payout: .435,
    tags: ['nowplaying', 'music', 'contest', 'share', 'spotify'],
    blacklist: [
        'nowplaying-music',

        'arsaljr',
        'clicknpict',
        'dianasteem7',
        'heroheri',
        'loubega',
        'maulinda',
        'rahmatz',
        'ryanananda',
        'safrizalpotret',
        'tasyazgs588',
    ]

}
