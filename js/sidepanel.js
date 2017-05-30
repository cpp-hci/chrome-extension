chrome.runtime.onMessage.addListener(function(msg, sender){
    if(msg == "toggle"){
        toggle();
    }
});

function openKoofersTab() {
    $("#koofersTabHead").addClass('active');
    $("#koofersTab").addClass('active');
    $("#rmpTabHead").removeClass('active');
    $("#rmpTab").removeClass('active');
}

function openRmpTab() {
    $("#koofersTabHead").removeClass('active');
    $("#koofersTab").removeClass('active');
    $("#rmpTabHead").addClass('active');
    $("#rmpTab").addClass('active');
}

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return JSON.stringify(obj) === JSON.stringify({});
}

var sidebar = document.createElement('div'); 
sidebar.style.background = "blue";
sidebar.style.height = "100%";
sidebar.style.width = "0px";
sidebar.style.position = "fixed";
sidebar.style.top = "0px";
sidebar.style.right = "0px";
sidebar.style.zIndex = "100000";
sidebar.id = "hciprojectframe";
// uses ajax to load the html. not ideal.
$(sidebar).load(chrome.extension.getURL("popup.html"), function() {
    // after html is loaded, set event listeners
    document.getElementById("koofersTabHead").addEventListener('click', openKoofersTab);
    document.getElementById("rmpTabHead").addEventListener('click', openRmpTab);

    //$(sidebar).on('load', function() {setIframeContents("no matter");});
    setIframeContents("Yu Sun");
}); 

document.body.appendChild(sidebar);

function toggle (){
    if(sidebar.style.width == "0px"){
        sidebar.style.width = "25%";
    } else {
        sidebar.style.width = "0px";
    }
}

/* Given a CPP professor name, set the contents of the sidebar with their reviews */
function setIframeContents(name) {
    var onError = function(e) {
        alert('woops ' + e);
    };
    var onProfessorResults = function(data) {
        // make array of html strings for koofers reviews
        var koofersReviews = [];
        if(!isEmpty(data.koofers)) {
            for(var i=0; i<data.koofers.ratings.length; ++i) {
                koofersReviews.push(
                    '<div class="review">' + data.koofers.ratings[i].reviewText + '</div>'
                );
            }
        } else {
            koofersReviews.push("Sorry, no reviews");
        }
        // make array of html strings for rmp reviews
        var rmpReviews = [];
        if(!isEmpty(data.rmp)) {
            for(var i=0; i<data.rmp.ratings.length; ++i) {
                rmpReviews.push(
                    '<div class="review">' + data.rmp.ratings[i].ratingText + '</div>'
                );
            }
        } else {
            rmpReviews.push("Sorry, no reviews");
        }
        // combine into one html string, stick in page
        var divider = "<hr />";
        $("#hciprojectframe #reviews").html(
            '<div class="reviewTab active" id="koofersTab">' + koofersReviews.join(divider) + '</div>' +
            '<div class="reviewTab" id="rmpTab">' + rmpReviews.join(divider) + '</div>'
        );
        $("#hciprojectframe #title").html(name);
    };
    getProfessorRatings(name, onProfessorResults, onError);
}

function generateKoofersUrl(name) {
    return "https://0177ebc8.ngrok.io/api/koofers/professor?school=California%20State%20Polytechnic%20University,%20Pomona&name=" + encodeURIComponent(name);
}

function generateRmpUrl(name) {
    return "https://0177ebc8.ngrok.io/api/rmp/professor?school=California%20State%20Polytechnic%20University,%20Pomona&name=" + encodeURIComponent(name);
}

function failToDefault(promise, defaultValue) {
    // only semi-sure this works
    return promise.then(function(answer) {
        return answer;
    }, function() {
        return $.Deferred().resolve(defaultValue).promise();
    });
}

/* get overall ratings, reviews, from both sites. format below
    {
        "combinedRating": number,
        "rmp": {
            "overallQuality": number,
            "levelOfDifficulty": number,
            "wouldTakeAgain": boolean,
            "ratings": [
                {
                    "date": string,
                    "description": string,
                    "overallQuality": number,
                    "className": string,
                    "ratingText": string,
                    "foundHelpful": number,
                    "foundUnHelpful": number
                }
            ],
        },
        "koofers": {
            "overallRating": number,
            "overallGPA": number,
            "ratings": [
                {
                    "courseNumber": string,
                    "courseName": string,
                    "overallRating": number,
                    "overallGPA": number,
                    "reviewText": string
                }
            ]
        }
    }
*/
function getProfessorRatings(name, continuation, onError) {
    var deferredKoofers = $.ajax({
        url: generateKoofersUrl(name),
        dataType: "json"
    });
    var deferredRmp = $.ajax({
        url: generateRmpUrl(name),
        dataType: "json"
    });
    $.when(failToDefault(deferredKoofers, []), failToDefault(deferredRmp, [])).then(function(koofers, rmp) {
        var koofersObject, rmpObject;
        // get single element of each list, or empty object
        if(koofers.length == 1) {
            koofersObject = koofers[0];
        } else {
            koofersObject = {};
        }
        if(rmp.length == 1) {
            rmpObject = rmp[0];
        } else {
            rmpObject = {};
        }
        // generate final data
        var combinedRating = 0;
        continuation({
            "combinedRating": combinedRating,
            "koofers": koofersObject,
            "rmp": rmpObject
        });
    });
}

