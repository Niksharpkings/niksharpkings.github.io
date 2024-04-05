// StartTime funtion is called when the page is loaded and the clock is started and updated every second by the setTimeout function and the checkTime function is called to add a zero in front of numbers < 10 and the time and date is displayed in the format of "Current Time: 00h:00m:00s:00ms 00/00/00pm" in the html element with the id of "txt" by using the document DOM object and the getElementById method and the innerHTML property to set the innerHTML to the current time and date in the format of "Current Time: 00h:00m:00s:00ms 00/00/00pm" and the setTimeout function is called to update the time and date every second.
function startTime() {
  const today = new Date(); // get current date and time
  let mh = today.getMonth(); // Month, using local time.
  let day = today.getDate(); // day, using local time.
  let fy = today.getFullYear(); // Full Year 20XX
  let h = today.getHours(); // Hours
  let m = today.getMinutes(); // minutes
  let s = today.getSeconds(); // seconds
  let ms = today.getMilliseconds(); // milliseconds

  mh = checkTime(mh); // add zero in front of numbers < 10
  day = checkTime(day); // add zero in front of numbers < 10
  fy = checkTime(fy); // add zero in front of numbers < 10
  h = checkTime(h); // add zero in front of numbers < 10
  m = checkTime(m); // add zero in front of numbers < 10
  s = checkTime(s); // add zero in front of numbers < 10
  ms = checkTime(ms); // add zero in front of numbers < 10

  const pmam = h >= 12 ? "pm" : "am"; // PM or AM

  // Document DOM Object and getting the element by its assigned html id and setting the innerHTML to the current time and date in the format of "Current Time: 00h:00m:00s:00ms 00/00/00pm"
  document.getElementById("currentTime").innerHTML =
    "Current Time: "
    +h +
    "h:" +
    m +
    "m:" +
    s +
    "s:" +
    ms +
    "ms " +
    mh +
    "/" +
    day +
    "/" +
    fy +
    pmam;
  setTimeout(startTime, 10); // update every second
}

// checktime function iterates through the time and adds a zero in front of numbers < 10
function checkTime(i) {
  if (i < 10) {
    i = "0" + i;
  } // add zero in front of numbers < 10
  return i; // return the value
}

// Source below https://www.w3schools.com/graphics/tryit.asp?filename=trycanvas_clock_start
// And Chatgpt chat.openai.com
// except for the milisecond thats I add and style color and font size.
// get the canvas element and set its context to 2d


const canvas = document.getElementById("canvas"); // get the canvas element
let ctx = canvas.getContext("2d"); // set the context to 2d

let radius = canvas.height / 2; // get the radius of the canvas height / 2 to get the center of the canvas element and set it to the radius variable to be used later on in the code to draw the clock hands and numbers in the center of the canvas element.
ctx.translate(radius, radius); // set the x and y position to the center of the canvas element to draw the clock hands and numbers in the center of the canvas element.
radius = radius * 0.9; // reduce the radius by 10% to make the clock hands and numbers fit in the canvas element.
setInterval(drawClock, 10); // call the drawClock function every 10 milliseconds to update the clock hands and numbers every 10 milliseconds.

function drawClock() { // create a function called drawClock
  drawFace(ctx, radius); // call the drawFace function to draw the clock face
  drawNumbers(ctx, radius); // call the drawNumbers function to draw the clock numbers
  drawTime(ctx, radius); // call the drawTime function to draw the clock hands
} // end of drawClock function

function drawFace(ctx, radius) { // create a function called drawFace with the ctx and radius parameters
  let grad; // create a variable called grad to be used later on in the code to create a gradient for the clock face
  ctx.beginPath(); // begin the path to draw the clock face and numbers
  ctx.arc(0, 0, radius, 0, 2 * Math.PI); // draw the arc for the clock face and numbers
  ctx.fillStyle = "#32a824"; // set the fill style to a green color
  ctx.fill(); // fill the clock face and numbers
  grad = ctx.createRadialGradient(0, 0, radius * 0.95, 0, 0, radius * 1.05); // create a radial gradient for the clock face and numbers
  grad.addColorStop(0, "#333"); // add a color stop to the gradient
  grad.addColorStop(0.5, "#0affeb"); // add a color stop to the gradient
  grad.addColorStop(1, "#333"); // add a color stop to the gradient
  ctx.strokeStyle = grad; // set the stroke style to the gradient color
  ctx.lineWidth = radius * 0.1; // set the line width to the radius * 0.1
  ctx.stroke(); // stroke the clock face and numbers to the canvas element
  ctx.beginPath(); // begin the path to draw the clock face and numbers again
  ctx.arc(0, 0, radius * 0.1, 0, 2 * Math.PI); // draw the arc for the clock face and numbers 
  ctx.fillStyle = "#333"; // set the fill style to a dark color for the center of the clock face and numbers
  ctx.fill(); // fill the clock face and numbers
}

function drawNumbers(ctx, radius) { // create a function called drawNumbers with the ctx and radius parameters
  let ang; // create a variable called ang to be used later on in the code to draw the clock numbers
  let num; // create a variable called num to be used later on in the code to draw the clock numbers
  ctx.font = radius * 0.3 + "px arial"; // set the font size and font family for the clock numbers
  ctx.textBaseline = "middle"; // set the text baseline to middle
  ctx.textAlign = "center"; // set the text align to center
  for (num = 1; num < 13; num++) { // create a for loop to draw the clock numbers
    ang = (num * Math.PI) / 6; // set the angle to the clock numbers
    ctx.rotate(ang); // rotate the clock numbers
    ctx.translate(0, -radius * 0.85); // translate the clock numbers
    ctx.rotate(-ang); // rotate the clock numbers
    ctx.fillText(num.toString(), 0, 0); // fill the clock numbers
    ctx.rotate(ang); // rotate the clock numbers
    ctx.translate(0, radius * 0.85); // translate the clock numbers
    ctx.rotate(-ang); // rotate the clock numbers
  }
}

function drawTime(ctx, radius) { // create a function called drawTime with the ctx and radius parameters
  let now = new Date(); // create a new date object
  let hour = now.getHours(); // get the hours from the date object
  let minute = now.getMinutes(); // get the minutes from the date object
  let second = now.getSeconds();  // get the seconds from the date object
  let ms = now.getMilliseconds(); // get the milliseconds from the date object
  //hour
  hour = hour % 12; // set the hour to 12
  hour =
    (hour * Math.PI) / 6 + // add the hour to the clock hand movement for the hour 
    (minute * Math.PI) / (6 * 60) + // add the minute to the clock hand movement for the hour
    (second * Math.PI) / (360 * 60) + // add the second to the clock hand movement for the hour
    (ms * Math.PI) / (360 * 60 * 500); // add milliseconds to the clock hand movement for the hour

  drawHand(ctx, hour, radius * 0.5, radius * 0.07); // call the drawHand function to draw the clock hand for the hour
  minute = (minute * Math.PI) / 30 + (second * Math.PI) / (30 * 60); // add the minute to the clock hand movement for the minute
  drawHand(ctx, minute, radius * 0.8, radius * 0.07); // call the drawHand function to draw the clock hand for the minute
  second = (second * Math.PI) / 30; // add the second to the clock hand movement for the second
  drawHand(ctx, second, radius * 0.9, radius * 0.02); // call the drawHand function to draw the clock hand for the second
  ms = (ms * Math.PI) / 500; // add the milliseconds to the clock hand movement for the milliseconds
  drawHand(ctx, ms, radius * 0.9, radius * 0.01); // call the drawHand function to draw the clock hand for the milliseconds
}

function drawHand(ctx, pos, length, width) {
  ctx.beginPath(); // begin the path to draw the clock hand
  ctx.lineWidth = width; // set the line width to the width parameter
  ctx.lineCap = "round"; // set the line cap to round
  ctx.moveTo(0, 0); // move the clock hand to the center of the clock face
  ctx.rotate(pos); // rotate the clock hand
  ctx.lineTo(0, -length); // draw the clock hand
  ctx.stroke(); // stroke the clock hand to the canvas element
  ctx.rotate(-pos); // rotate the clock hand
}
