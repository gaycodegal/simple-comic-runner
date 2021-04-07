const windowWidth = 640;
const windowHeight = 480;
window.addEventListener("load", function() {
    $(".world").css("width", windowWidth);
    $(".world").css("height", windowHeight);
    new Speech(0, windowHeight - 100, windowWidth, 100, "this is an example of a scene with only one piece of text that goes at the bottom");
    new Speech(10, 10, 200, 50, "hello!");
    new Speech(300, 10, 200, 40, "hi!");
    new Speech(10, 200, 200, 80, "This is an exceptionally long paragraph to shwow what would happen if you used something like German in google translate where the text would over flow the box or if you had like a big long monologue for the character to say. The text now repeats five times. This is an exceptionally long paragraph to shwow what would happen if you used something like German in google translate where the text would over flow the box or if you had like a big long monologue for the character to say. The text now repeats five times. This is an exceptionally long paragraph to shwow what would happen if you used something like German in google translate where the text would over flow the box or if you had like a big long monologue for the character to say. The text now repeats five times. This is an exceptionally long paragraph to shwow what would happen if you used something like German in google translate where the text would over flow the box or if you had like a big long monologue for the character to say. The text now repeats five times. This is an exceptionally long paragraph to shwow what would happen if you used something like German in google translate where the text would over flow the box or if you had like a big long monologue for the character to say. The text now repeats five times. ");
});
