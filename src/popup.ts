
let tab_url = ""

document.addEventListener("DOMContentLoaded", () =>{
    function get_tab_url(){
        console.log("get_tab_url called");
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) =>{
            console.log(tabs[0])
            return tabs[0];
        })
    }

    var port = chrome.runtime.connect({name: "popup-background"});
    tab_url = get_tab_url()!;
    port.postMessage({pop_status: "user_text", url: tab_url, message_num: 1});

    port.onMessage.addListener(function(msg){
        console.log("Message received from background: ", msg)
        if(msg.pop_status === "load_text"){
            set_user_text(msg.txt);
        }else if(msg.chat_txt){
            set_chat_text(msg.chat_txt);
        }
    });

    port.onDisconnect.addListener(() =>{
        console.log("Port disconnected");
    })




    function set_chat_text(text:string){
        const el = document.getElementById("chat_text");
        try{
            if(el && text){
                el.innerHTML = text;
            }
        }catch(error){
            console.error("Error setting pop chat text: ", error);
        }
    }

    function set_user_text(text:string){
        const el = document.getElementById("user_text");
        try{
            if(el && text){
                el.textContent = text;
            }
        }catch(error){
            console.error('Error trying to assign text content: ', error)
        }
    }

    const input_button = document.getElementById("user_input_button");
    const input_field = document.getElementById("user_input") as HTMLInputElement;
    const submit_message = () => {
        set_user_text(input_field.value.trim());
        console.log("button clicked");
        tab_url = get_tab_url()!;
        try{
            port.postMessage(        //sends message to background.ts
                { pop_status: "user_text", text: input_field.value.trim(), src: get_tab_url() },
            )
        }catch(error){
            console.error("Error sending message from popup input: ", error)
        }
        }

    if(input_button && input_field){
        input_button.addEventListener("click", submit_message);
        input_field.addEventListener("keydown", (e) => {
            if(e.key === "Enter"){
                submit_message();
            }
        });
    }else{
        console.log("Input button not found")
    }


    
});
