export const getWeek = (date: Date) => Math.ceil((((date.getTime() - new Date(2018, 0, 1).getTime()) / 86400000) + 1) / 7)
