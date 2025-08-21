// -----------------------------------------------------------------------------
// -- Constants and State
// -----------------------------------------------------------------------------

const OMNIBOX_KEYWORD = '/';
const MAX_SUGGESTIONS = 5;
const SHORTCUT_SEPARATOR = '/';

let bookmarkCache = [];

// -----------------------------------------------------------------------------
// -- Bookmark Helpers
// -----------------------------------------------------------------------------

/**
 * Recursively flattens the bookmark tree into a simple array of bookmark nodes.
 * @param {chrome.bookmarks.BookmarkTreeNode[]} nodes - The array of bookmark nodes to flatten.
 * @returns {chrome.bookmarks.BookmarkTreeNode[]} A flat array of bookmark items.
 */
function flattenBookmarks(nodes) {

  const flattened = [];

  for (const node of nodes) {

    if (node.url) {
      flattened.push(node);
    }

    if (node.children) {
      flattened.push(...flattenBookmarks(node.children));
    }

  }
  return flattened;
}

/**
 * Fetches all bookmarks, flattens them, and populates the cache.
 * Includes basic error handling.
 */
async function updateBookmarkCache() {
  try {
    const bookmarkTree = await chrome.bookmarks.getTree();
    bookmarkCache = flattenBookmarks(bookmarkTree);
    console.log('Bookmark cache updated.');

  } catch (error) {
    console.error('Error updating bookmark cache:', error);
    bookmarkCache = []; // Ensure cache is empty on error

  }
}

/**
 * Extracts a shortcut from a bookmark title.
 * Shortcuts are expected to be at the end, like "My Bookmark /shortcut".
 * @param {string} title The title of the bookmark.
 * @returns {string|null} The extracted shortcut, or null if not found.
 */
function getShortcutFromTitle(title) {

  const parts = title.trim().split(SHORTCUT_SEPARATOR);

  if (parts.length > 1) {
    return parts.pop().trim();
  }

  return null;
}

// -----------------------------------------------------------------------------
// -- Omnibox Event Listeners
// -----------------------------------------------------------------------------

/**
 * Handles user input in the omnibox to provide real-time bookmark suggestions.
 */
chrome.omnibox.onInputChanged.addListener((text, suggest) => {

  const query = text.trim();

  if (!query) {
    suggest([]);
    return;
  }

  const suggestions = bookmarkCache.reduce((acc, bookmark) => {

    if (acc.length >= MAX_SUGGESTIONS) {
      return acc;
    }

    const shortcut = getShortcutFromTitle(bookmark.title);

    if (shortcut && shortcut.startsWith(query)) {
      acc.push({
        content: shortcut,
        description: `${bookmark.title} <match>(${shortcut})</match>`
      });
    }

    return acc;

  }, []);

  suggest(suggestions);
});

/**
 * Handles the action when the user presses Enter in the omnibox.
 */
chrome.omnibox.onInputEntered.addListener((text) => {

  let openInNewTab = false;
  let query = text.trim();

  if (query.startsWith(OMNIBOX_KEYWORD)) {
    openInNewTab = true;
    query = query.slice(OMNIBOX_KEYWORD.length).trim();
  }

  if (!query) return; // Ignore empty queries

  const match = bookmarkCache.find(bookmark => {
    const shortcut = getShortcutFromTitle(bookmark.title);
    return shortcut === query;
  });

  if (match) {

    const url = match.url;

    if (openInNewTab) {
      chrome.tabs.create({ url });

    } else {
      chrome.tabs.update({ url });

    }
  } else {

    chrome.notifications?.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'Shortcut Not Found',
      message: `No bookmark found with the shortcut: "${query}"`
    });
  }
});

// -----------------------------------------------------------------------------
// -- Lifecycle Events
// -----------------------------------------------------------------------------

// Initial cache population on startup
chrome.runtime.onStartup.addListener(updateBookmarkCache);
chrome.runtime.onInstalled.addListener(updateBookmarkCache);


// Update cache when bookmarks change
chrome.bookmarks.onCreated.addListener(updateBookmarkCache);
chrome.bookmarks.onRemoved.addListener(updateBookmarkCache);
chrome.bookmarks.onChanged.addListener(updateBookmarkCache);
chrome.bookmarks.onMoved.addListener(updateBookmarkCache);

// Initial population for the first install/load
updateBookmarkCache();
