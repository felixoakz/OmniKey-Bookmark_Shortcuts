# Greater Shortcuts

> Boost your Chrome workflow with bookmark-driven keyboard shortcuts using the `>` omnibox!

---

## 🚀 What is it?

**Greater Shortcuts** is a minimal Chrome extension that lets you open bookmarks quickly by typing `>` + your shortcut keyword directly in the address bar.  
No more digging through bookmark folders or remembering full URLs — just type your shortcut and jump instantly.

---

## 🔥 Features

- Use `>` as an omnibox keyword to trigger shortcuts  
- Define bookmarks with names starting with `>` like `>gpt - ChatGPT`  
- Type `> gpt` (after `>`, press space then `gpt`) in the address bar to open your bookmarked site  
- Auto-suggestions based on your bookmark shortcuts as you type  
- Open shortcut in **current tab** with `> gpt`  
- Open shortcut in **new tab** with `> >gpt` (type an extra `>` after the space)  
- No external config: just create bookmarks with `>` prefix in the name  

---

## 🎯 Why use Greater Shortcuts?

- **Lightning-fast navigation** to your favorite sites  
- Keeps bookmarks organized and searchable  
- Leverages Chrome’s native bookmarks—no external databases or syncing  
- Minimal permissions, no privacy compromises  

---

## 💡 How to Use

1. Install the extension ([load unpacked](https://developer.chrome.com/docs/extensions/mv3/getstarted/#unpacked))  
2. Create bookmarks with names starting with `>`  
   - Example:  
     - Name: `>gpt - ChatGPT`  
     - URL: `https://chatgpt.com`  
3. Open Chrome’s address bar, type `>` then press **space** to activate Greater Shortcuts  
4. Type your shortcut keyword (e.g., `gpt`)  
5. Press **Enter** to open in current tab  
6. Or type an extra `>` before the shortcut (e.g., `> >gpt`) after the space to open in a new tab  

---

## 📦 Installation

- Clone this repo  
- Open `chrome://extensions` in Chrome  
- Enable **Developer mode**  
- Click **Load unpacked** and select this repo folder  

---

## ⚙️ Developer Notes

- Manifest v3, uses Chrome bookmarks and omnibox APIs  
- Background service worker handles input and bookmark lookup  
- Suggestions capped at 5 matches  
- Notifications alert when no shortcut found  

---

## 🙌 Contributing

Feel free to submit issues or PRs to improve! Ideas welcome:

- Fuzzy matching shortcuts  
- Syncing shortcut mappings across devices  
- Custom keywords  
- Icon customization  

---

## 📜 License

MIT License © [Felix Carvalho]

---

Enjoy blazing-fast navigation with **Greater Shortcuts**!  
