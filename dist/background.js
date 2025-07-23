"use strict";
console.log("background running");
let pop_port = null;
const back_end_port = "https://text-whisperer-backend.onrender.com/";
let chat_response = "";
let pop_text = "";
let pt = "";
function set_popup_text(text) {
    pop_text = text;
}
function get_popup_text() {
    if (pop_text) {
        return pop_text;
    }
    else {
        console.error("No pop text to return");
    }
}
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "showSelectedText",
        title: "Text_Whisperer",
        contexts: ["selection"]
    });
    chrome.contextMenus.create({
        id: "pop_text",
        title: "Text_Whisperer for PDF",
        contexts: ["selection"]
    });
});
function set_chat_response(chat_resp) {
    chat_response = chat_resp;
}
function get_chat_response() {
    if (!chat_response || chat_response === "") {
        console.error("No chat response to return");
    }
    else {
        return chat_response;
    }
}
//listener for when the extension is clicked from context menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "pop_text") {
        console.log("Selected Text: ", info.selectionText);
        set_popup_text(info.selectionText);
    }
    else if (info.menuItemId === "showSelectedText" && tab?.id && info.selectionText) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['dist/content_scripts.js']
        }, () => {
            setTimeout(async () => {
                //loads before the message is sent there, preventing error
                if (!info.selectionText) {
                    alert("No info Selected");
                    return;
                }
                if (tab && typeof tab.id == 'number' && tab.id >= 0) {
                    chrome.tabs.sendMessage(tab.id, { action: "init_panel", selected_text: info.selectionText });
                }
                else {
                    console.error("Could not send load panel command");
                }
                let resp = await give_info(info.selectionText, tab.url);
                if (tab.url && resp) {
                    console.log("Initial response received.");
                }
                else {
                    console.error("Missing selected text, tab url, or chat response");
                }
                if (tab && typeof tab.id == 'number' && tab.id >= 0) {
                    chrome.tabs.sendMessage(tab.id, {
                        action: "show-text",
                        selected_text: info.selectionText,
                        chat_resp: resp,
                        tab: tab //passing the tab id to check if scriptable
                    });
                }
                else {
                    console.error("Tab id < 0. Not scriptable.");
                }
            }, 100);
        });
    }
});
chrome.runtime.onConnect.addListener(function (port) {
    if (port.name === "popup-background") {
        console.assert(port.name === "popup-background");
        port.onMessage.addListener(async function (msg) {
            console.log("Message from popup: ", msg);
            if (msg.pop_status === "user_text") {
                if (msg.message_num === 1) {
                    pt = get_popup_text();
                }
                else {
                    pt = msg.text;
                }
                let url = msg.url;
                if (pt) {
                    port.postMessage({ pop_status: "load_text", txt: pt });
                    let resp = await give_info(pt, url);
                    port.postMessage({ chat_txt: resp });
                }
                else {
                    console.log("No pt to post.");
                }
            }
        });
    }
    else if (port.name === "panel-background") {
        port.onMessage.addListener(async function (msg) {
            console.log("Message in panel-background");
            if (msg.action === "chat_prompt") {
                pt = msg.txt;
                let url = msg.url;
                if (pt) {
                    let resp = await give_info(pt, url);
                    port.postMessage({ chat_txt: resp });
                }
                else {
                    console.error("No pt to post to.");
                }
            }
        });
    }
});
async function give_info(selected_text, src_url) {
    console.log("give_info function");
    try {
        const data = await http(back_end_port + '/selected_text', back_end_port + '/chat_output', selected_text, src_url);
        if (data.response) {
            console.log("Received chat response: ", data.response);
            set_chat_response(data.response);
            return data.response;
            ///sending message back to wherever sent the message.
            // chrome.runtime.sendMessage({to: "panel", text: data.response, src: src_url});
        }
        else {
            console.log("No chat response from http");
        }
    }
    catch (error) {
        console.log("Error posting/fetching: ", error);
    }
}
async function http(post_request, get_request, sel_input, src_url) {
    console.log("Selected input: ", sel_input, "/ posting to: ", post_request);
    const response = await fetch(post_request, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: sel_input, source: src_url })
        //sends text and source to /selected_text as a POST request, giving backend access
    });
    if (!response.ok) {
        throw new Error(`Post failed with status ${response.status}`);
    }
    console.log("Fetching from: ", get_request);
    try {
        const get_response = await fetch(get_request);
        const chat_response = await get_response.json();
        return chat_response;
    }
    catch (error) {
        console.log("Error getting chat response: ", error);
    }
}
