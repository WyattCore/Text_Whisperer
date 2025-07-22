# Text_Whisperer

Text_Whisperer is a side project I wanted to create to dive into the world of Chrome Extensions. I decided to learn TypeScript to implement this project, which I really enjoyed doing. The project is pretty short and simple: You select text on your web page and Text_Whisperer opens a chat box that tells you more about it, along with extended chat functionality.

### The backend is in a separate repository

https://github.com/WyattCore/Text_Whisperer_Backend


####HOW TO DOWNLOAD AND USE TEXT_WHISPERER

1) Download the zip of the dist/ folder.
2) Go to "chrome://extensions" and toggle the "developer mode" on. (Usually in the top right of the page.)
3) Press the "load unpacked" button and select the zipped the "dist/" folder.
4) Text whisperer will appear in the extension menu on the top right of your browser, and also in your right-click menu after you have selected text.

## IMPORTANT

### If you try opening the extension in an environment that doesn't allow content script injection (pdf viewers), simply select the text and click on the "Text_Whisperer for PDF" button, then click the extension in the browser tabs area. This will send your text to the chat automatically.
