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
    setIframeContents("no matter");
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
        for(var i=0; i<data.koofers.ratings.length; ++i) {
            koofersReviews.push(
                '<div class="review">' + data.koofers.ratings[i].reviewText + '</div>'
            );
        }
        // make array of html strings for rmp reviews
        var rmpReviews = [];
        for(var i=0; i<data.rmp.ratings.length; ++i) {
            rmpReviews.push(
                '<div class="review">' + data.rmp.ratings[i].ratingText + '</div>'
            );
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
    return "http://ec2-52-53-153-54.us-west-1.compute.amazonaws.com/api/koofers/professor?school=California%20State%20Polytechnic%20University,%20Pomona&name=" + encodeURIComponent(name);
}

function generateRmpUrl(name) {
    return "http://ec2-52-53-153-54.us-west-1.compute.amazonaws.com/api/rmp/professor?school=California%20State%20Polytechnic%20University,%20Pomona&name=" + encodeURIComponent(name);
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
    // the very worst test data
    continuation({
        "overallRating": 5,
        "rmp": {
            "id":1,"overallQuality":5.0,"levelOfDifficulty":2.0,"wouldTakeAgain":1.0,
            "ratings":[
                {"id":1,"date":"04/06/2017","description":"awesome","overallQuality":5,"levelOfDifficulty":2,"className":"CS480","forCredit":"Yes","attendance":"Not Mandatory","textBookUsed":"No","wouldTakeAgain":"Yes","gradeReceived":"A","tags":["GROUP PROJECTS","LOTS OF HOMEWORK","Caring"],"ratingText":"Dr Sun is knowledgeable about the subject and communicates clearly, both verbally and through presentation materials. Live coding demos in class and energetic lecture keep the class interesting. Workload, however, is as much as you want to put in. If you are motivated to learn a lot about Software Engineering quickly, he is a good choice.","foundHelpful":0,"foundUnhelpful":0},
                {"id":2,"date":"02/06/2017","description":"awesome","overallQuality":5,"levelOfDifficulty":2,"className":"CS480","forCredit":"N/A","attendance":"Not Mandatory","textBookUsed":"No","wouldTakeAgain":"Yes","gradeReceived":"A","tags":["Inspirational","Caring","GROUP PROJECTS"],"ratingText":"Best Software Engineering professor at CPP.  Only class you'll take that means anything outside of college.","foundHelpful":1,"foundUnhelpful":0}
            ],
            "name":"Yu Sun","school":"California State Polytechnic University, Pomona"
        },
        "koofers": {
            "name":"mohammad husain","period":null,"school":"California State Polytechnic University, Pomona","department":null,"overallRating":5.0,"overallGPA":0.0,
            "ratings":[
                {"courseNumber":null,"courseName":"Secure Communication","period":null,"overallRating":0.0,"overallGPA":5.0,"reviewText":"Pros: -A good chunk of your grade is assignments, so if your'e not good at testing, you'll get some help there. -Tests and quizzes are exactly what you expect. He doesn't normally throw curveballs. -His lectures are pretty interactive, if you show up and show you are interested, he notices. Cons: Nothing really. Professor Husain is probably my favorite teacher at cal poly. He genuinely cares whether we learn and I can tell he actually puts work into his lectures and what he is teaching us. The \"Homework\" for Secure Communications was really more like \"Projects\" but the projects themselves were pretty descriptive. And if I ever had problems he always helped me during office hours. Like actually helped, without just giving the answers up. As for the class, It has been a bit dumbed down to increase enrollment sizes. He even told me so, since having too many prerequisites would make the class hard to fill. All I had under my belt was 241 as a prereq and I really wish I had some more experience with networks before I had taken this class. Not because it wouldve been easier but just so I could do a little more hands on stuff with what I learned. I had him for 141 as well, and I probably learned the most in these two classes I've had with him than in a couple of my other classes put together. I look forward to being in his Computer Architecture class thiscoming fall. If you can take either Husain or Tang in any classes, try to. They are really good teachers and so easy to learn from."},
                {"courseNumber":null,"courseName":"Senior Project","period":null,"overallRating":0.0,"overallGPA":5.0,"reviewText":"Pros: (Review for 460) - Lots of practical exercises and assignments - Use of real applications and scenarios - Makes the topic of security very challenging, and very fun - No lack of math, matrix manipulation, bitwise operations, relative primes - You will understand every step of AES encryption from matrix multiplication to using a galois field - One of the assignments involves employing a buffer overflow attack on a linux VM in order to gain super user access...how are you not already signed up for this class!? Cons: - Slides are only posted after lecture, so it's hard to follow along if you're short and late to class.... - Large workload...which isn't really a con, but most other CS professors tend to foster torpidity and lazyness ....so that culture may be inimical to your studies in this class Take this professor. He actually cares about your educational well being, although he's bloody tough."},
                {"courseNumber":null,"courseName":"Advanced Computer Architecture","period":null,"overallRating":0.0,"overallGPA":5.0,"reviewText":"Pros: He is really good teacher. He really wish to share knowledge to students as much as he can. He pay attention to every student. Cons: No"}
            ]
        },
    });
}

