"use strict";

// So we don't have to keep re-finding things on page, find DOM elements once:

const $body = $("body");
const $storiesLoadingMsg = $("#stories-loading-msg");
const $allStoriesList = $("#all-stories-list");
//added favStoriesList
const $favStoriesList = $("#favorite-stories-list");
//added ownStoriesList
const $ownStoriesList = $("#own-stories-list");
//added story container
const $storyContainer = $('.stories-container');
//added story form
const $storyForm = $('.story-form-container');
const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");
const $navLogin = $("#nav-login");
//added userStories
const $userStories = $('#my-stories');
const $navUserProfile = $("#nav-user-profile");
const $navLogOut = $("#nav-logout");


/** To make it easier for individual components to show just themselves, this
 * is a useful function that hides pretty much everything on the page. After
 * calling this, individual components can re-show just what they want.
 */

function hidePageComponents() {
    const components = [
      //added more components
      $storyForm,
      $ownStoriesList,
      $favStoriesList,
      $allStoriesList,
      $loginForm,
      $signupForm,
    ];
  components.forEach(c => c.hide());
}

/** Overall function to kick off the app. */

async function start() {
    console.debug("start");

    // "Remember logged-in user" and log in, if credentials in localStorage
    await checkForRememberedUser();
    await getAndShowStoriesOnStart();

    //load favorites from local storage
    const currentUserFavorites = loadFavoritesFromLocalStorage();
    const currentOwnStories = loadOwnStoriesFromLocalStorage();

    // if we got a logged-in user
    if (currentUser) {
      //initialize user favorites
      if (currentUserFavorites.length > 0) {
      currentUser.favorites = currentUserFavorites;
    }
    //initalize own stories
    if (currentOwnStories.length > 0) {
      currentUser.ownStories = currentOwnStories;
    }

    updateUIOnUserLogin();
  } else {
    //hide elements I dont't want the user to see if not logged in
    $('.nav-left').css('display', 'none');
    $storyContainer.hide();
    $storyForm.hide();
    //show these two forms
    $loginForm.show();
    $signupForm.show();
  }
}

// Once the DOM is entirely loaded, begin the app

console.warn("HEY STUDENT: This program sends many debug messages to" +
  " the console. If you don't see the message 'start' below this, you're not" +
  " seeing those helpful debug messages. In your browser console, click on" +
  " menu 'Default Levels' and add Verbose");
$(start);
