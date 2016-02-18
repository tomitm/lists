export function getUsername() {
  // username is conveniently available as a data property on an element
  var user = document.querySelector('js-mini-current-user');
  if (!user) {
    return;
  }
  return user.dataset.screenName;
}

function getInitData() {
  return JSON.parse(document.querySelector("#init-data").value);
}

export function postForm(url, data) {
  var form = Object.keys(data)
                    .map((key) => `${key}=${data[key]}`);
  form.push(`authenticity_token=${getInitData().formAuthenticityToken}`);

  var options = {
    method: "POST",
    credentials: 'include',
    headers: {
      accept: 'application/json, text/javascript, */*; q=0.01',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    body: form.join("&")
  };
  return fetch(url, options)
    .then(res => res.json());
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
