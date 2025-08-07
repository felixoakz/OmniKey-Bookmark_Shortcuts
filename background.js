chrome.omnibox.onInputChanged.addListener(async (text, suggest) => {

  const query = text.trim();
  const keywordPrefix = '>';
  const keyword = `${keywordPrefix}${query}`;

  const bookmarks = await chrome.bookmarks.getTree();
  const matches = findBookmarksStartingWith(bookmarks, keyword);

  const suggestions = matches.slice(0, 5).map(bookmark => ({
    content: bookmark.title.trim().slice(1), // remove leading '>'
    description: bookmark.title.trim()
  }));

  suggest(suggestions);
});

chrome.omnibox.onInputEntered.addListener(async (text) => {
  let openInNewTab = false;
  let query = text.trim();

  if (query.startsWith('>')) {
    openInNewTab = true;
    query = query.slice(1).trim();
  }

  const keyword = `>${query}`;
  const bookmarks = await chrome.bookmarks.getTree();
  const match = findBookmark(bookmarks, keyword);

  if (match) {
    if (openInNewTab) {
      chrome.tabs.create({ url: match.url });
    } else {
      chrome.tabs.update({ url: match.url });
    }
  } else {
    chrome.notifications?.create({
      type: "basic",
      iconUrl: "icon48.png",
      title: "Shortcut Not Found",
      message: `No bookmark found for "${keyword}".`
    });
  }
});

function findBookmark(nodes, keyword) {
  for (const node of nodes) {
    if (node.url && node.title.trim().startsWith(keyword)) {
      return node;
    }
    if (node.children) {
      const result = findBookmark(node.children, keyword);
      if (result) return result;
    }
  }
  return null;
}

function findBookmarksStartingWith(nodes, prefix, results = []) {
  for (const node of nodes) {
    if (node.url && node.title.trim().startsWith(prefix)) {
      results.push(node);
    }
    if (node.children) {
      findBookmarksStartingWith(node.children, prefix, results);
    }
  }
  return results;
}
