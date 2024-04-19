"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
  //hide submit form
  const submitStoryForm = document.querySelector(".story-form-container");
  submitStoryForm.style.display = 'none';
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}
//function to show the story submit form when nav link is clicked
function navSubmitClick() {
  hidePageComponents();
$(".story-form-container").css('display', 'block');
}

const submitStoryLink = document.getElementById("submit-story");

submitStoryLink.addEventListener('click', function(e) {
  e.preventDefault();
  navSubmitClick();
});