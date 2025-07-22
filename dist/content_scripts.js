"use strict";
let user_text = "";
let mouse_x = 0;
let mouse_y = 0;
let start_x = 0;
let start_y = 0;
let initial_panel_y = 0;
let initial_panel_x = 0;
function set_user_text(text) {
    user_text = text;
}
function get_user_text() {
    if (user_text) {
        return user_text;
    }
    else {
        console.error("No user text to return");
    }
}
///////////////////////////////////////////////////////////////////////////////
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "init_panel") {
        init_panel(message.selected_text);
    }
    else if (message.action === "show-text") {
        console.log("received show-text", message.selected_text);
        console.log("Source url: ", message.tab.url);
        set_user_text(message.selected_text);
        if (message.tab.id === -1) {
            console.error("This is not scriptable. Implement pull down version.");
            alert("Use Pull Down when selecting from PDF's");
        }
        else {
            load_panel(get_user_text(), message.chat_resp);
        }
    }
    else if (message.action === "popup-text") {
        console.log("Pop up text received: ", message.text);
    }
});
window.addEventListener('message', function (event) {
    if (!(event.origin.includes("chrome-extension:"))) {
        return;
    }
    if (event.data.action === "exit") {
        console.log("Exit message received: ", event.data);
        const pan = document.getElementById("panel");
        if (pan) {
            pan.remove();
        }
        else {
            console.error("Can't find panel iframe to remove on exit.");
        }
    }
});
///////////////////////////////////////////////////////////////////////////////////////
async function init_panel(selected_text) {
    let panel = document.getElementById("panel");
    if (!panel) {
        console.log("New panel created");
        panel = document.createElement("iframe");
        panel.src = chrome.runtime.getURL("dist/panel.html");
        panel.id = ("panel");
        panel.style.cssText = `
            position: fixed;
            top: 2%;
            left: 65%;
            height: 80vh;
            min-width: 28vw;
            max-width: 30vw;
            resize: both;
            z-index: 999999;
            background: white;
            box-shadow: -2px 0 10px white;
            border: 2px solid black;
        `;
        panel.onload = on_panel_load;
        document.body.appendChild(panel);
    }
    function on_panel_load() {
        console.log(panel);
        if (panel.contentWindow) {
            console.log(panel.contentDocument);
            panel.contentWindow?.postMessage({ text: selected_text }, "*");
        }
        else {
            console.log("no panel.content window");
        }
    }
}
function load_panel(selected_text, chat_response) {
    let panel = document.getElementById("panel");
    if (panel) {
        panel.contentWindow?.postMessage({ chat_text: chat_response }, "*");
    }
    else {
        console.error("No element in document with ID: panel");
    }
}
