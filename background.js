// -----------------------------------------------------------------------------
// -- Constants
// -----------------------------------------------------------------------------

const OMNIBOX_KEYWORD = '/';
const MAX_SUGGESTIONS = 5;
const SHORTCUT_SEPARATOR = '/';

// -----------------------------------------------------------------------------
// -- Bookmark Helpers
// -----------------------------------------------------------------------------

/**
 * Recursively flattens the bookmark tree into a simple array of bookmark nodes.
 * This is more efficient than searching the tree multiple times.
 *
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
 * Fetches all bookmarks and returns them as a flattened array.
 * Includes basic error handling.
 *
 * @returns {Promise<chrome.bookmarks.BookmarkTreeNode[]>} A promise that resolves to a flat array of bookmarks.
 */
async function getBookmarks() {

  try {
    const bookmarkTree = await chrome.bookmarks.getTree();
    return flattenBookmarks(bookmarkTree);

  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return []; // Return an empty array to prevent crashes

  }
}

/**
 * Extracts a shortcut from a bookmark title.
 * Shortcuts are expected to be at the end, like "My Bookmark /shortcut".
 *
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
chrome.omnibox.onInputChanged.addListener(async (text, suggest) => {
  const query = text.trim();

  if (!query) {
    suggest([]);
    return;
  }

  const allBookmarks = await getBookmarks();

  const matches = allBookmarks
    .map(bookmark => {
      const shortcut = getShortcutFromTitle(bookmark.title);
      return shortcut ? { ...bookmark, shortcut } : null;
    })
    .filter(bookmark => bookmark && bookmark.shortcut.startsWith(query))
    .slice(0, MAX_SUGGESTIONS);

  const suggestions = matches.map(match => ({
    content: match.shortcut,
    description: `${match.title} (${match.shortcut})`
  }));

  suggest(suggestions);
});

/**
 * Handles the action when the user presses Enter in the omnibox.
 */
chrome.omnibox.onInputEntered.addListener(async (text) => {
  let openInNewTab = false;
  let query = text.trim();

  if (query.startsWith(OMNIBOX_KEYWORD)) {
    openInNewTab = true;
    query = query.slice(OMNIBOX_KEYWORD.length).trim();
  }

  if (!query) return; // Ignore empty queries

  const allBookmarks = await getBookmarks();

  const match = allBookmarks.find(bookmark => {
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
      type: "basic",
      iconUrl: "icon48.png",
      title: "Shortcut Not Found",
      message: `No bookmark found with the shortcut: "${query}"`
    });
  }
});
