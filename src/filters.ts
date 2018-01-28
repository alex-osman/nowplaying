export const weekFilter = number => (user) => user.posts.find(post => post.permlink.includes(`week`) && post.permlink.includes(`${number}`))