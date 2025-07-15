console.log("this is the content script");

let user_text = ""

function set_user_text(text:string){
    user_text = text;
}


function get_user_text(){
    if(user_text){
        return user_text;
    }else{
        console.error("No user text to return");
    }
}



chrome.runtime.onMessage.addListener((message, sender, sendResponse) =>{
    console.log(message);
    if (message.action === "init_panel"){
        init_panel(message.selected_text);
    }
    if (message.action === "show-text"){
        console.log("received show-text", message.selected_text);
        
        console.log("Source url: ", message.tab.url);
        set_user_text(message.selected_text)
        
        if (message.tab.id === -1){
            console.error("This is not scriptable. Implement pull down version.")
            alert("Use Pull Down when selecting from PDF's");
        }else{
            load_panel(get_user_text()!, message.chat_resp);
        }
    }else if (message.action === "popup-text"){
        console.log("Pop up text received: ", message.text)
    }
});
  
async function init_panel(selected_text:string){
    let panel = document.getElementById("panel") as HTMLIFrameElement;
    
    if(!panel){
        console.log("New panel created");
        panel = document.createElement("iframe");
        panel.onload = () => {
            console.log("Panel Loaded")
            if(panel.contentWindow){
                panel.contentWindow?.postMessage({text: selected_text}, "*");
            }else{
                console.log("no panel.content window");
            }
            
        };
        panel.id = ("panel");
        panel.src = chrome.runtime.getURL("dist/panel.html");
        panel.style.cssText= `
            position: fixed;
            top: 100px;
            height: 80vh;
            min-width: 380px;
            max-width: 30vw;
            resize: both;
            z-index: 999999;
            background: white;
            box-shadow: -2px 0 10px rgba(0,0,0,0.3);
            border: 2px solid black;
            border-radius: 5%;
        `;
        document.body.appendChild(panel);
    }
}


function load_panel(selected_text:string, chat_response:string) {
    let panel = document.getElementById("panel") as HTMLIFrameElement;
    if(panel){
        panel.contentWindow?.postMessage({chat_text: chat_response},"*");
    }else{
        console.error("No element in document with ID: panel");
    }          
}   


window.addEventListener('message', event =>{
    console.log("Exit message received: ", event.data);
    if(event.data.action === "exit"){
        const pan = document.getElementById("panel") as HTMLIFrameElement;
        if(pan){
            pan.remove();
        }else{
            console.error("Can't find panel iframe to remove on exit.");
        }
    }
});

