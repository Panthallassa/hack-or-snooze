"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
	storyList = await StoryList.getStories();
	$storiesLoadingMsg.remove();

	putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
	// console.debug("generateStoryMarkup", story);

	const hostName = story.getHostName();
	const likeButton = currentUser ? `<button class='like-btn'><i class="fa-regular fa-star"></i></button>` : ''; //adding likeing ability only when you're signed in
	const deleteButton = currentUser && currentUser.ownStories
	.some(s => s.storyId === story.storyId) ? `<button class='delete-btn'><i class="fa-solid fa-trash-can"></i></button>'` : '';

	return $(`
      <li id="${story.storyId}">
	  ${likeButton}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
		${deleteButton}
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
	console.debug("putStoriesOnPage");

	$allStoriesList.empty();

	// loop through all of our stories and generate HTML for them
	for (let story of storyList.stories) {
		const $story = generateStoryMarkup(story);
		$allStoriesList.append($story);
	}
	//hiding favStoriesList
	const favStoriesList = document.querySelector('#favorite-stories-list');
	favStoriesList.style.display = 'none';
	$allStoriesList.show();
}



//function to delete a Story
async function deleteStory(e) {
	const closestLi = e.target.closest('li'); //targeting the li
	const storyId = closestLi.id

	try {
		await storyList.removeStory(currentUser, storyId);
		closestLi.remove();
	//updates the storylist immidiatly
		await putStoriesOnPage();
	} catch (error) {
		 console.error('Error deleting story:', error);
		 alert('Error deleting story');
	}
}






//this function calls on addStory from models.js
//and then appends the story to the page

async function storyFormSubmit() {
	const author = document.querySelector("#author").value; // creating variables of the forms inputs
	const title = document.querySelector("#title").value;
	const url = document.querySelector("#url-input").value;

	console.log(author);
	console.log(title);
	console.log(url);

	try {
		const newStory = await storyList.addStory(currentUser, {
			title,
			author,
			url,
		});

		console.log("newStory", newStory);

		if (newStory) {
			// if newStory is created properly then add it to the page
			const storiesContainer = document.querySelector(
				"#all-stories-list"
			);
			const storyElement = generateStoryMarkup(newStory)[0];
			storiesContainer.appendChild(storyElement);
		} else {
			alert("Failed to add story");
		}
	} catch (error) {
		console.error("Error adding story:", error);
		alert("Error adding story");
	}
}
//attaching the eventlistener to the form button

const submitButton =
	document.getElementById("story-submit");

submitButton.addEventListener("click", async (e) => {
	e.preventDefault();

	await storyFormSubmit();
});

//button event listeners are added here so that they are after the code where the buttons are created

document.addEventListener('DOMContentLoaded', () => {
	//Add eventlistner to like star
	document.addEventListener('click', async (event) => {
		if (event.target.classList.contains('like-btn')) {
			const $storyLi = $(event.target).closest('li');
			const storyId = $storyLi.attr('id');
			const isLiked = $storyLi.hasClass('liked');
	
			try {
				if (isLiked) {
					console.log('unliked');
					await currentUser.unlikeStory(storyId);
					$storyLi.removeClass('liked');
				} else {
					console.log('liked')
					await currentUser.likeStory(storyId);
					$storyLi.addClass('liked');
				}
			} catch (error) {
				console.error('Error toggling story like:', error);
				alert('Error toggling story like');
			}
		}
	});
	
	


	// Add event listener to "Favorites" link
    const favoritesLink = document.getElementById('favorites');
    const allStories = document.querySelector('#all-stories-list');
	const favStoriesList = document.querySelector('#favorite-stories-list');

    if (!favoritesLink) return;

    favoritesLink.addEventListener('click', async (e) => {
		e.preventDefault()
		console.log('favorites link clicked');
		//show ol
		favStoriesList.style.display = 'block';
        // Hide the current content in the stories container
        allStories.style.display = 'none';

        // Populate the stories list with favorite stories
        currentUser.populateFavorites(favStoriesList);
    });
});
