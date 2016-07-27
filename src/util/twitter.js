function getInitData() {
  const initElement = document.querySelector('#init-data');
  if (!initElement || !initElement.value) {
    return {};
  }
  return JSON.parse(initElement.value) || {};
}

function getToken() {
  return getInitData().formAuthenticityToken;
}

export function getUsername() {
  // username is conveniently available as a data property on an element
  const user = document.querySelector('.js-mini-current-user');

  if (!user) return;
  return user.dataset.screenName;
}

export function isLoggedIn() {
  return getInitData().loggedIn;
}

export function postForm(url, data) {
  const form = Object.keys(data)
                    .map((key) => `${key}=${data[key]}`);
  form.push(`authenticity_token=${getToken()}`);

  const options = {
    method: 'POST',
    credentials: 'include',
    headers: {
      accept: 'application/json, text/javascript, */*; q=0.01',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    body: form.join('&')
  };
  return fetch(url, options)
    .then(res => res.json());
}

export function fetchTemplate(url) {
  // we're part of the page, so do as Twitter does.
  // downside is their cookies only have template access, so no clean API,
  // but it allows this can work out of the box since OAuth isn't needed.
  const options = {
    credentials: 'include',
    redirect: 'manual',
    headers: {
      accept: 'application/json, text/javascript, */*; q=0.01',
      'x-push-state-request': true // required to return template
    }
  };
  return fetch(url, options)
    .then((res) => {
      if (!res.ok) return; // not okay if failed, or redirected to login
      return res.json();
    });
}

export function observeChanges(selector, onChange, config = { attributes: true }) {
  if (!selector) return;

  let target = selector;
  if (typeof selector === 'string') {
    target = document.querySelector(target);
    if (!target) return;
  }

  const observer = new MutationObserver(onChange);
  observer.observe(target, config);

  return observer;
}
