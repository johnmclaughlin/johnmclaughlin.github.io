
// Set up the canvas
const canvas = document.getElementById("game");
const context = canvas.getContext("2d");

// Get the dimensions of the browser window
const width = window.innerWidth;
const height = window.innerHeight;

// Set up easy references to the HTML elements
const space = document.querySelector("canvas")
let offline = document.querySelector('.offline')
let outOfRange = document.querySelector('.outOfRange')
let winner = document.querySelector('.winner')
let altitude = document.querySelector('.altitude')
let velocity = document.querySelector('.velocity')
let rotation = document.querySelector('.rotation')
let start = document.querySelector('.start')
let reboot = document.querySelector('.reboot')
let replay = document.querySelector('.replay')

// Return a randon number within a range from StackOverflow
function getRandomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

// Generate a random location for the landing pad
const xPad = getRandomInRange(0, width-100)

// SOUNDS
const thrust = new Audio('sounds/thrust.wav')
const off = new Audio('sounds/offline.wav')
const out = new Audio('sounds/outOfRange.wav')
const off_vocal = new Audio('sounds/offline_vocal.m4a')
const win_vocal = new Audio('sounds/winner.m4a')

// Set the canvas dimensions to match the browser window
space.height = height;
space.width = width;

// Set up the properties of the spaceship
let spaceship = {
    color: "#fff",
    width: 8,
    height: 22,
    position:
    {
        x: width/2,
        y: height * 0.1
    },
    angle: 0,
    velocity: {
        x: 0,
        y: 0
    },
    engineOn: false,
    rotatingLeft: false,
    rotatingRight: false,
}

// Function to draw the spaceship and thruster flame on the canvas
function drawSpaceship()
{
    context.save();
    context.beginPath();
    context.translate(spaceship.position.x, spaceship.position.y);
    context.rotate(spaceship.angle);
    context.rect(spaceship.width * -0.5, spaceship.height * -0.5, spaceship.width, spaceship.height);
    context.fillStyle = spaceship.color;
    context.fill();
    context.closePath();

    // Draw the flame if engine is on
    if(spaceship.engineOn)
    {
        context.beginPath();
        context.moveTo(spaceship.width * -0.5, spaceship.height * 0.5);
        context.lineTo(spaceship.width * 0.5, spaceship.height * 0.5);
        context.lineTo(0, spaceship.height * 0.5 + Math.random() * 10);
        context.lineTo(spaceship.width * -0.5, spaceship.height * 0.5);
        context.closePath();
        context.fillStyle = "orange";
        context.fill();
    }
    context.restore();
}

// Function to draw the ground. This should be more interesting with craters & mountains
function drawGround() {
    context.save();
    context.fillStyle = "#fff"
    context.fillRect(0, height-20, width, 20);
    context.restore();
}

// Function to draw a simple landing pad
function drawLandingPad() {
    context.save();
    context.fillStyle = "blue"
    context.fillRect(xPad, height-35, 100, 10);
    context.restore();
}

// Define simeple gravity
const gravity = -0.05

// Counter to limit audio playback
let x = 0

function updateSpaceship()
{
    // Is the spaceship above the ground?
    if (height - spaceship.position.y > 20) {
        // Is it very close to the landing pad and not exceeding 2m/s? Range used for Y because it will skip numbers at higher velocities
        if ((height - spaceship.position.y > 43) && (height - spaceship.position.y < 47) && (spaceship.velocity.y < 2)){
            // Is it over the landing pad?
            if (spaceship.position.x > xPad && spaceship.position.x < xPad + 100){
                // Is the angle of the spaceship less than 5 degrees?
                if (spaceship.angle*60 < 5){
                    // Winner, winner, chicken dinner
                    winner.style.display = 'block'
                    // Only play vocal once
                    if (x == 0){
                      win_vocal.play();
                      x++
                    }
                    return
                }
            }
        }
        // Is the spaceship off the screen? It's gonna be hard to get back.
        if (spaceship.position.x <= 0 || spaceship.position.x >= width){
            // Repeat warning sound as long as the ship is offscreen
            out.play()
            space.style.display = 'none'
            outOfRange.style.display = 'flex'
            // Update the display
            altitude.innerHTML = "ALTITUDE: " + ((height - spaceship.position.y) * 10).toFixed(2) + "m";
            velocity.innerHTML = "VELOCITY: " + -(spaceship.velocity.y * 10).toFixed(2) + "m/s";
            rotation.innerHTML = "ROTATION: " + (spaceship.angle*60).toFixed(1) + "&#176;";
        } else {
            // Regular flight
            space.style.display = 'block'
            outOfRange.style.display = 'none'
            // Update the display
            altitude.innerHTML = "ALTITUDE: " + ((height - spaceship.position.y) * 1).toFixed(2) + "m";
            document.querySelector('.velocity').innerHTML = "VELOCITY: " + -(spaceship.velocity.y * 1).toFixed(2) + "m/s";
            rotation.innerHTML = "ROTATION: " + (spaceship.angle*60).toFixed(1) + "&#176;";
        }
    } else {
        // Game over. Play audio and update display one last time
        if (x == 0){
          x++
          off.play()
          // delay the vocal until after the explosion sound
          setTimeout(() => off_vocal.play(), 1000);
          space.style.display = 'none'
          outOfRange.style.display = 'none'
          offline.style.display = 'flex'
          altitude.innerHTML = "ALTITUDE: " + ((height - spaceship.position.y) * 1).toFixed(2) + "m";
          velocity.innerHTML = "VELOCITY: " + -(spaceship.velocity.y * 1).toFixed(2) + "m/s";
          rotation.innerHTML = "ROTATION: " + (spaceship.angle*60).toFixed(1) + "&#176;";
        }
    }

    // Calculate new spaceship position
    spaceship.position.x += parseFloat(spaceship.velocity.x);
    spaceship.position.y += parseFloat(spaceship.velocity.y);

    if(spaceship.rotatingRight)
    {
        spaceship.angle += Math.PI / 180;
    }
    else if(spaceship.rotatingLeft)
    {
        spaceship.angle -= Math.PI / 180;
    }

    // Distribute thrust to x & y axis when the engine is on
    if(spaceship.engineOn)
    {
        spaceship.velocity.x += .1 * Math.sin(spaceship.angle);
        spaceship.velocity.y -= .1 * Math.cos(-spaceship.angle);
    }
    // And apply gravity
    spaceship.velocity.y -= gravity;
}

// Set up the stars
let stars = [];
// Keep the star density consistent across browser sizes
const starDensity = width*height/800

for (var i = 0; i < starDensity; i++) {
    stars[i] = {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.sqrt(Math.random() * 2),
      alpha: 1.0,
      decreasing: true,
      magnitude: Math.random()*0.05
    };
}

// Adapted from a few StackOverflow answers for generating random fields
function drawStars() {
    context.save();
    context.fillStyle = "#111"
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < stars.length; i++) {
      let star = stars[i];
      context.beginPath();
      context.arc(star.x, star.y, star.radius, 0, 2*Math.PI);
      context.closePath();
      context.fillStyle = "rgba(255, 255, 255, " + star.alpha + ")";
      if (star.decreasing == true)
      {
        star.alpha -= star.magnitude;
        if (star.alpha < 0.1)
        { star.decreasing = false; }
      }
      else
      {
        star.alpha += star.magnitude;
        if (star.alpha > 0.95)
        { star.decreasing = true; }
      }
      context.fill();
    }
    context.restore();
}

// This function intializes the game
function draw()
{
    // Clear entire screen
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawStars()
    drawGround()
    drawLandingPad()

    updateSpaceship();
    drawSpaceship();
    // recursive function that continuously redraws the canvas
    requestAnimationFrame(draw);
}

// Set up the keyboard events - key up
function keyUp(event)
{
    // console.log(spaceship);
    switch(event.keyCode)
    {
        case 37:
            // Left Arrow key
            spaceship.rotatingLeft = false;
            break;
        case 39:
            // Right Arrow key
            spaceship.rotatingRight = false;
            break;
        case 32:
            // spacebar up
            spaceship.engineOn = false;
            // Stop & reset the thruster sound
            thrust.pause()
            thrust.currentTime = 0;
            break;
    }
}

document.addEventListener('keyup', keyUp);

// Set up the keyboard events - key down
function keyDown(event)
{
    //console.log(spaceship);
    switch(event.keyCode)
    {
        case 37:
            // Left Arrow key
            spaceship.rotatingLeft = true;
            break;
        case 39:
            // Right Arrow key
            spaceship.rotatingRight = true;
            break;
        case 32:
            // Spacebar down
            spaceship.engineOn = true;
            // Play the thruster sound
            thrust.play()
            break;
    }
}

document.addEventListener('keydown', keyDown);

// Add event listeners for the HTML buttons
start.addEventListener('click', event => {
    draw();
    start.style.visibility = 'hidden'
});

reboot.addEventListener('click', event => {
    location.reload();
});

replay.addEventListener('click', event => {
    location.reload();
});

// Draw the intial state at Start
drawStars()
drawGround()
