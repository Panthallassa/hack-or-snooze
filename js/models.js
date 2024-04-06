"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {
	/** Make instance of Story from data object about story:
	 *   - {title, author, url, username, storyId, createdAt}
	 */

	constructor({
		storyId,
		title,
		author,
		url,
		username,
		createdAt,
	}) {
		this.storyId = storyId;
		this.title = title;
		this.author = author;
		this.url = url;
		this.username = username;
		this.createdAt = createdAt;
	}

	/** Parses hostname out of URL and returns it. */

	getHostName() {
		const urlObject = new URL(this.url);
		return urlObject.hostname;
	}
}

/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
	constructor(stories) {
		this.stories = stories;
	}

	/** Generate a new StoryList. It:
	 *
	 *  - calls the API
	 *  - builds an array of Story instances
	 *  - makes a single StoryList instance out of that
	 *  - returns the StoryList instance.
	 */

	static async getStories() {
		// Note presence of `static` keyword: this indicates that getStories is
		//  **not** an instance method. Rather, it is a method that is called on the
		//  class directly. Why doesn't it make sense for getStories to be an
		//  instance method?

		// query the /stories endpoint (no auth required)
		const response = await axios({
			url: `${BASE_URL}/stories`,
			method: "GET",
		});

		// turn plain old story objects from API into instances of Story class
		const stories = response.data.stories.map(
			(story) => new Story(story)
		);

		// build an instance of our own class using the new array of stories
		return new StoryList(stories);
	}

	/** Adds story data to API, makes a Story instance, adds it to story list.
	 * - user - the current instance of User who will post the story
	 * - obj of {title, author, url}
	 *
	 * Returns the new Story instance
	 */


	async removeStory(user, storyId) {
		const token = user.loginToken;
		const response = await axios.delete(`https://private-anon-ad8ec78263-hackorsnoozev3.apiary-mock.com/stories/${storyId}`,
		{
			headers: {
				'token': `Bearer ${token}`
			}
		});
	}

	async addStory(user, { title, author, url }) {
		try {
			const res = await fetch(
				"https://private-anon-ad8ec78263-hackorsnoozev3.apiary-mock.com/stories",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json", //requests the content in JSON format
						"token" : `Bearer ${user.loginToken}`,
					},
					body: JSON.stringify({
						//converts Javascript object to a JSON string
						token: user.loginToken,
						story: {
							title,
							author,
							url,
						},
					}),
				}
			);
			if (!res.ok) {
				throw new Error("Failed to add story");
			}
			const data = await res.json();
			const newStory = new Story(data.story);

			this.stories.push(newStory);
			return newStory;
		} catch (error) {

			console.error("Error adding story:", error);
			return null;
		}
	}
}

/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
	/** Make user instance from obj of user data and a token:
	 *   - {username, name, createdAt, favorites[], ownStories[]}
	 *   - token
	 */

	constructor(
		{
			username,
			name,
			createdAt,
			favorites = [],
			ownStories = [],
		},
		token
	) {
		this.username = username;
		this.name = name;
		this.createdAt = createdAt;

		// instantiate Story instances for the user's favorites and ownStories
		this.favorites = favorites.map((s) => new Story(s));
		this.ownStories = ownStories.map((s) => new Story(s));

		// store the login token on the user so it's easy to find for API calls.
		this.loginToken = token;
	}
	// function to add a liked story to favorites
	async likeStory(storyId) {
		try {
			await axios.post(`https://private-anon-ad8ec78263-hackorsnoozev3.apiary-mock.com/users/${this.username}/favorites/${storyId}`,
				{headers: {
					'Content-Type': 'application/json',
					'token': `Bearer ${this.loginToken}`
				}
				}
			);
			const storyList = await StoryList.getStories();
			const likedStory = storyList.stories.find(story => story.storyId === storyId);
			this.favorites.push(likedStory);
			return likedStory;
		} catch (error) {
			console.error('Error liking story:', error);
			alert('Error liking story:');
		}
	}
	//function to remove a story from favorites
	async unlikeStory(storyId) {
		try {
				await axios.delete(`https://private-anon-ad8ec78263-hackorsnoozev3.apiary-mock.com/users/${this.username}/favorites/${storyId}`,
					{headers: {
						'token': `Bearer ${this.loginToken}`
					}
				}
			);
			const index = this.favorites.findIndex(story => story.storyId === storyId);
			if (index !== -1) {
				this.favorites.splice(index, 1);
			}
		} catch (error) {
			console.error('Error unliking story:', error);
			alert('Error unliking story');
		}
	}
	

	  //this is a function to populate the storeis container with favirites when the nav link is clicked
	  async populateFavorites() {
		console.log('populating favorites');
		const favoritesNav = document.getElementById('favorites');
		const favStoriesList = document.querySelector('#favorite-stories-list');
		if(!favoritesNav) return;

		this.favorites.forEach(favorite => {
			const storyMarkup = generateStoryMarkup(favorite);
			const storyElement = storyMarkup[0];	//Do this to get the raw DOM from the jQuery object
			favStoriesList.appendChild(storyElement);
		});
	  }

	/** Register new user in API, make User instance & return it.
	 *
	 * - username: a new username
	 * - password: a new password
	 * - name: the user's full name
	 */

	static async signup(username, password, name) {
		const response = await axios({
			url: `${BASE_URL}/signup`,
			method: "POST",
			data: { user: { username, password, name } },
		});

		let { user } = response.data;

		return new User(
			{
				username: user.username,
				name: user.name,
				createdAt: user.createdAt,
				favorites: user.favorites,
				ownStories: user.stories,
			},
			response.data.token
		);
	}

	/** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

	static async login(username, password) {
		const response = await axios({
			url: `${BASE_URL}/login`,
			method: "POST",
			data: { user: { username, password } },
		});

		let { user } = response.data;

		return new User(
			{
				username: user.username,
				name: user.name,
				createdAt: user.createdAt,
				favorites: user.favorites,
				ownStories: user.stories,
			},
			response.data.token
		);
	}

	/** When we already have credentials (token & username) for a user,
	 *   we can log them in automatically. This function does that.
	 */

	static async loginViaStoredCredentials(token, username) {
		try {
			const response = await axios({
				url: `${BASE_URL}/users/${username}`,
				method: "GET",
				params: { token },
			});

			let { user } = response.data;

			return new User(
				{
					username: user.username,
					name: user.name,
					createdAt: user.createdAt,
					favorites: user.favorites,
					ownStories: user.stories,
				},
				token
			);
		} catch (err) {
			console.error(
				"loginViaStoredCredentials failed",
				err
			);
			return null;
		}
	}
}