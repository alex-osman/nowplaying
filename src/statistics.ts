import { postWeekFilter } from './filters';
import { Post } from './classes/post';
import { User } from './classes/user';
import { settings } from './settings';

export class Statistics {
    private static statistics: Statistics = null;
    private _users: User[] = [];
    private _posts: Post[] = [];

    private constructor() {   
    }

    public static Instance(): Statistics {
        // check if an instance of the class is already created
        if (this.statistics == null) {
            // If not created create an instance of the class
            // store the instance in the variable
            this.statistics = new Statistics();
        }
        // return the singleton object
        return this.statistics
    }


	public set users(value: User[] ) {
		this._users = value;
	}

	public set posts(value: Post[] ) {
		this._posts = value;
	}
    
    public general() {
        console.log('posts: ', this._posts.length)
        console.log('users: ', this._users.length)
        const weeks = [...Array(settings.week + 1).keys()]
            .map(weekNum => ({ weekNum, posts: this._posts.filter(postWeekFilter(weekNum))}))
            .map(week => ({ length: week.posts.length, posts: week.posts, weekNum: week.weekNum }))
            .map(week => ({
                ...week,
                votes: week.posts.map(p => p.votes).reduce((p, c) => p + c, 0),
                authors: week.posts
                    .map(post => post.author)
                    .filter((author, index, authors) => authors.indexOf(author) === index)
                })
            )
            
        console.log(weeks.map(week => `Week ${week.weekNum} had ${week.length} entries with ${week.authors.length} users and ${week.votes} total votes!`))
    }
}