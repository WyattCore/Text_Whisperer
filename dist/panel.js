"use strict";
document.addEventListener("DOMContentLoaded", () => {
    function get_tab_url() {
        console.log("get_tab_url called");
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            console.log(tabs[0]);
            return tabs[0];
        });
    }
    var port = chrome.runtime.connect({ name: "panel-background" });
    let tab_url = get_tab_url();
    let url_src = "";
    function set_source(source) {
        url_src = source;
    }
    function set_user_text(text) {
        const el = document.getElementById("user_text");
        try {
            if (el && text) {
                el.textContent = text;
            }
        }
        catch (error) {
            console.error('Error trying to assign text content: ', error);
        }
    }
    function set_chat_text(text) {
        const el = document.getElementById("chat_text");
        try {
            if (el && text) {
                el.textContent = text;
            }
        }
        catch (error) {
            console.error('Error trying to assign chat text: ', error);
        }
    }
    window.addEventListener("message", (event) => {
        console.log("Message Received: ", event);
        if (event.data.text) {
            let text = event.data.text;
            set_user_text(text);
        }
        else if (event.data.chat_text) {
            let chat_text = event.data.chat_text;
            set_chat_text(chat_text);
        }
        else {
            console.log("No event data type of text or chat_text: ", event.data);
        }
    });
    const input_button = document.getElementById("user_input_button");
    const input_field = document.getElementById("user_input");
    const submit_message = () => {
        set_user_text(input_field.value.trim());
        console.log("button clicked");
        if (input_button.textContent !== "") {
            //sends message to background.ts
            set_user_text(input_field.value.trim());
            set_chat_text("Loading...");
            port.postMessage({ action: "chat_prompt", txt: input_field.value.trim(), src: tab_url });
        }
    };
    port.onMessage.addListener(function (msg) {
        if (msg.chat_txt) {
            set_chat_text(msg.chat_txt);
        }
        else {
            console.log("Received message", msg);
            console.error("No chat text to update");
        }
    });
    if (input_button && input_field) {
        input_button.addEventListener("click", submit_message);
        input_field.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                submit_message();
            }
        });
    }
    else {
        console.log("Input button not found");
    }
    let exit_button = document.getElementById("exit");
    if (exit_button) {
        exit_button?.addEventListener("click", () => {
            console.log("Exit button clicked");
            window.parent.postMessage({ action: "exit" }, "*");
        });
    }
    else {
        console.error("No exit button found in document");
    }
});
