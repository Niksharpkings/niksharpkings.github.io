// StartTime fuction is called when the page is loaded and the clock is started and updated every second by the setTimeout function and the checkTime function is called to add a zero in front of numbers < 10 and the time and date is displayed in the format of "Current Time: 00h:00m:00s:00ms 00/00/00pm" in the html element with the id of "txt" by using the document DOM object and the getElementById method and the innerHTML property to set the innerHTML to the current time and date in the format of "Current Time: 00h:00m:00s:00ms 00/00/00pm" and the setTimeout function is called to update the time and date every second.
function startTime() {
  const today = new Date(); // get current date and time
  let mh = today.getMonth(); // Month, using local time.
  let day = today.getDate(); // day, using local time.
  let fy = today.getFullYear(); // Full Year 20XX
  let h = today.getHours(); // Hours
  let m = today.getMinutes(); // minutes
  let s = today.getSeconds(); // seconds
  let ms = today.getMilliseconds(); // miliseconds

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
// except for the milisecond thats I add and style color and font size.
const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let radius = canvas.height / 2;
ctx.translate(radius, radius);
radius = radius * 0.9;
setInterval(drawClock, 10);

function drawClock() {
  drawFace(ctx, radius);
  drawNumbers(ctx, radius);
  drawTime(ctx, radius);
}

function drawFace(ctx, radius) {
  let grad;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, 2 * Math.PI);
  ctx.fillStyle = "#32a824";
  ctx.fill();
  grad = ctx.createRadialGradient(0, 0, radius * 0.95, 0, 0, radius * 1.05);
  grad.addColorStop(0, "#333");
  grad.addColorStop(0.5, "#0affeb");
  grad.addColorStop(1, "#333");
  ctx.strokeStyle = grad;
  ctx.lineWidth = radius * 0.1;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.1, 0, 2 * Math.PI);
  ctx.fillStyle = "#333";
  ctx.fill();
}

function drawNumbers(ctx, radius) {
  let ang;
  let num;
  ctx.font = radius * 0.3 + "px arial";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  for (num = 1; num < 13; num++) {
    ang = (num * Math.PI) / 6;
    ctx.rotate(ang);
    ctx.translate(0, -radius * 0.85);
    ctx.rotate(-ang);
    ctx.fillText(num.toString(), 0, 0);
    ctx.rotate(ang);
    ctx.translate(0, radius * 0.85);
    ctx.rotate(-ang);
  }
}

function drawTime(ctx, radius) {
  let now = new Date();
  let hour = now.getHours();
  let minute = now.getMinutes();
  let second = now.getSeconds();
  let ms = now.getMilliseconds(); // miliseconds
  //hour
  hour = hour % 12;
  hour =
    (hour * Math.PI) / 6 +
    (minute * Math.PI) / (6 * 60) +
    (second * Math.PI) / (360 * 60) +
    (ms * Math.PI) / (360 * 60 * 1000);

  drawHand(ctx, hour, radius * 0.5, radius * 0.07);
  //minute
  minute = (minute * Math.PI) / 30 + (second * Math.PI) / (30 * 60);
  drawHand(ctx, minute, radius * 0.8, radius * 0.07);
  // second
  second = (second * Math.PI) / 30;
  drawHand(ctx, second, radius * 0.9, radius * 0.02);
  // ms
  drawHand(ctx, ms, radius * 0.9, radius * 0.01);
}

function drawHand(ctx, pos, length, width) {
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.moveTo(0, 0);
  ctx.rotate(pos);
  ctx.lineTo(0, -length);
  ctx.stroke();
  ctx.rotate(-pos);
}
