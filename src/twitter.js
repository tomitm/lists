export function getUsername() {
  // username is conveniently available as a data property on an element
  var user = document.getElementsByClassName('js-mini-current-user')[0];
  if (!user) {
    return;
  }
  return user.dataset.screenName;
}
