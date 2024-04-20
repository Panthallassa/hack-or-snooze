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
	console.debug("generateStoryMarkup");

	const hostName = story.getHostName();
	const likeButton = generateLikeButton(story);
	const deleteButton = generateDeleteButton(story);

	return $(`
      <li id="${story.storyId}">
	  ${likeButton}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>${deleteButton}
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

//function to create like button
function generateLikeButton(story) {
	const isFavorite = currentUser && currentUser.favorites.some(s => s.storyId === story.storyId);
	const starType = isFavorite ? 'fas' : 'far';

	return ` <span class="star">
            	<i class="${starType} fa-star"></i>
        	</span>`;
}

//function to create delete button
function generateDeleteButton(story) {
	return currentUser && currentUser.ownStories
	.some(s => s.storyId === story.storyId) ? `<button class='delete-btn'><i class="fa-solid fa-trash-can"></i></button>` : '';
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
/******************************************************************************
 * Event Listeners
 */

//attaching the eventlistener to the form button

const submitButton =
	document.getElementById("story-submit");

submitButton.addEventListener("click", async (e) => {
	e.preventDefault();
	$(".story-form-container").css('display', 'none');
	await storyFormSubmit();

	document.querySelector('#author').value = '';
	document.querySelector('#title').value = '';
	document.querySelector('#url-input').value = '';
});

async function putFavsOnPage() {
	console.debug('putFavsOnPage');

	$favStoriesList.empty();

	await currentUser.populateFavorites();

	$favStoriesList.show();
}

function putOwnStoriesOnPage() {
	console.debug('putOwnStoriesOnPage');

	$ownStoriesList.empty();

	loadFavoritesFromLocalStorage();

	$ownStoriesList.show();
}

//this function calls on addStory from models.js
//and then appends the story to the page

async function storyFormSubmit() {
	const author = document.querySelector("#author").value; // creating variables of the forms inputs
	const title = document.querySelector("#title").value;
	const url = document.querySelector("#url-input").value;

	try {
		const newStory = await storyList.addStory(currentUser, {
			title,
			author,
			url,
		});

		console.log("newStory", newStory);

		if (newStory) {
			// if newStory is created properly then add it to the page
			const storyElement = generateStoryMarkup(newStory)[0];
			$allStoriesList.append(storyElement);
			putStoriesOnPage();
		} else {
			alert("Failed to add story");
		}
	} catch (error) {
		console.error("Error adding story:", error);
		alert("Error adding story");
	}
}
	//Add eventlistener to like star
	async function toggleStoryFavorite(e) {
		console.debug("toggleStoryFavorite");
	  
		const $tgt = $(e.target);
		const $closestLi = $tgt.closest("li");
		const storyId = $closestLi.attr("id");
	  
		const starIcon = $tgt.hasClass("fas") ? $tgt : $tgt.find("i");
		const starType = starIcon.hasClass("fas") ? "fas" : "far";
	  
		try {
		  if (starType === "far") {
			await currentUser.likeStory(storyId);
			starIcon.toggleClass("fas far");
		  } else {
			await currentUser.unlikeStory(storyId);
			starIcon.toggleClass("fas far");
		  }

		  //check which list the user is viewing to reload that specific one
		  if ($favStoriesList.is(":visible")) {
			await putFavsOnPage();
		  } else {
			putStoriesOnPage();
		  }
		} catch (error) {
		  console.error("Error toggling story favorite:", error);
		}
	  }
	  
	  $allStoriesList.on("click", ".star", toggleStoryFavorite);
	  $favStoriesList.on("click", ".star", toggleStoryFavorite);
	  
	

	// Add eventlistener to delete button
	async function deleteStory(e) {
		console.debug('deleteStory');

		try {
		const $tgt = $(e.target);
		const $closestLi = $tgt.closest("li");
		const storyId = $closestLi.attr("id");

		await storyList.removeStory(currentUser, storyId);

		//check which list is being displayed and then reload that list
		if ($ownStoriesList.is(":visible")) {
			showUserStories();
		} else {
			putStoriesOnPage();
		}
		} catch (error) {
			console.error('Error deleting story:', error);
		}
	}

	$allStoriesList.on('click', '.delete-btn', deleteStory);
	$ownStoriesList.on('click', '.delete-btn', deleteStory);

// Add event listener to "Favorites" link
 const favoritesLink = document.getElementById('favorites');

favoritesLink.addEventListener('click', async (e) => {
	e.preventDefault()
	//hide everything first
	hidePageComponents();
	//hide delete buttons in the favorites link
	setTimeout(function() {
		$('.delete-btn').hide();
	}, 10);

    // Populate the stories list with favorite stories
    await currentUser.populateFavorites($favStoriesList);
});

//function to show userStories when nav link is clicked
async function showUserStories() {
	hidePageComponents();
	//hide like star and therefore the ability to like and unlike stories
	setTimeout(function() {
		$('.star').hide();
	}, 10);
	putOwnStoriesOnPage();
	const ownStories = currentUser.ownStories;
  
	ownStories.forEach(story => {
	  const storyMarkup = generateStoryMarkup(story);
	  $ownStoriesList.append(storyMarkup[0]);
	});
}
  
$userStories.on('click', showUserStories);