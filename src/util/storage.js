/** Gets one or more items from storage as an object.
  * @see chrome.storage.sync.get
  * @param {string|Array|Object|null} keys
  * @return {Promise<Object>}
  */
export function get(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(keys, items => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(items);
    });
  });
}

/** Sets multiple items. Unspecified keys will not be affected.
  * @see chrome.storage.sync.set
  * @param {Object} items
  * @return {Promise}
  */
export function set(items) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(items, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve();
    });
  });
}

/** Register a listener for whatever a given key updates, to be able to act on changes.
  * @param {string} key - Key to be notified for changes on
  * @param {Function} cb
  */
export function addChangeListener(key, cb) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'sync') return;
    if (!changes[key]) return;
    cb(changes[key].newValue);
  });
}
