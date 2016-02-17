export function getUsername() {
  // username is conveniently available as a data property on an element
  var user = document.getElementsByClassName('js-mini-current-user')[0];
  if (!user) {
    return;
  }
  return user.dataset.screenName;
}

export function fetchTemplate(url) {
  // we're part of the page, so do as Twitter does.
  // downside is their cookies only have template access, so no clean API,
  // but it allows this can work out of the box since OAuth isn't needed.
  var options = {
    credentials: 'include',
    headers: {
      accept: 'application/json, text/javascript, */*; q=0.01',
      'x-push-state-request': true // required to return template
    }
  };
  return fetch(url, options)
    .then(res => res.json());
}
