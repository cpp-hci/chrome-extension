chrome.browserAction.onClicked.addListener(function(){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, "toggle");
    })
})
/*TO-DO: Professor ID Tags increment as an array starting from $0
/ MTG_INSTR$0, MTG_INSTR$1, MTG_INSTR$2, etc.
*/
/* chrome was complaining about this, so I just caught the error. should be cut. */
try {
    var prof = document.getElementById("MTG_INSTR$0").innerText;
    console.log(prof);
} catch(e) {
    //console.log("lol");
}
