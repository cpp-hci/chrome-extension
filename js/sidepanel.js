chrome.runtime.onMessage.addListener(function(msg, sender){
    if(msg == "toggle"){
        toggle();
    }
})

var iframe = document.createElement('iframe'); 
iframe.style.background = "blue";
iframe.style.height = "100%";
iframe.style.width = "0px";
iframe.style.position = "fixed";
iframe.style.top = "0px";
iframe.style.right = "0px";
iframe.style.zIndex = "100000";
iframe.src = chrome.extension.getURL("popup.html")

document.body.appendChild(iframe);

function toggle (){
    if(iframe.style.width == "0px"){
        iframe.style.width = "25%";
    } else {
        iframe.style.width = "0px";
    }
}