// Client ID and API key from the Developer Console
var CLIENT_ID = '224468472081-bu21fpmllul81db0j0hpqctkr0pcps6d.apps.googleusercontent.com';
var API_KEY = 'AIzaSyAc4uRMFEmOU1cYo46cth656na0GVzZyAc';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/calendar.events";

var authorizeButton = document.getElementById('authorize_button');
var signoutButton = document.getElementById('signout_button');
var signedInAs = document.getElementById("signed_in_email");

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
  }, function(error) {
    appendPre(JSON.stringify(error, null, 2));
  });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately.
 */
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'block';

    // update signed in as
    signedInAs.innerHTML = `Signed in as <b>${gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getEmail()}</b>`;
    signedInAs.style.display = "block";
  } else {
    authorizeButton.style.display = 'block';

    signoutButton.style.display = 'none';
    signedInAs.style.display = "none";
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
  var pre = document.getElementById('content');
  var textContent = document.createTextNode(message + '\n');
  pre.appendChild(textContent);
}

function addRecurringEvent(name, dtStart, dtEnd, dUntil, location, colorId="1") {
  gapi.client.calendar.events.insert({
    'calendarId': 'primary',
    "summary": name,
    "location": location,
    "start": {
      "dateTime": dtStart,
      "timeZone": "Europe/Warsaw"
    },
    "end": {
      "dateTime": dtEnd,
      "timeZone": "Europe/Warsaw"
    },
    "recurrence": [
      `RRULE:FREQ=WEEKLY;UNTIL=${dUntil};`,
    ],
    "colorId": colorId
  }).then(function(response) {
    appendPre("Added event");
  });
}

// plan functions

// monday - 0
// hour - "HH:MM-HH:MM"
function addLessonEvent(subject, week_d, hours, location, comment) {
  dt = new Date();

  // convert js week day
  weekDayNow = dt.getDay() - 1;
  if (weekDayNow < 0) { weekDayNow = 6; }

  // get closest date with week_d
  dt.setDate(dt.getDate()+(week_d-weekDayNow));

  // set hours
  hours = hours.split("-");
  hours[0] = hours[0].split(":");
  hours[1] = hours[1].split(":");

  dtStart = new Date(dt.getTime());
  dtStart.setHours(hours[0][0], hours[0][1], 0);

  dtEnd = new Date(dt.getTime());
  dtEnd.setHours(hours[1][0], hours[1][1], 0);

  // TODO: change 2022 to auto year
  addRecurringEvent(subject, dtStart.toISOString(), dtEnd.toISOString(),
    `20220630`, location);
}
