let score = 0;
let kill = 0;

let plane, laser;
let helis = [];
let boats = [];
let fuels = [];
let gameOver = false;

let planeImg
let heliImg // 1. Add a variable for the image
let boatImg
let fuelImg
let pixelFont; // Add at the top
let fuelMeter = 1; // 1 = full, 0 = empty

function preload() {
  planeImg = loadImage('assets/Plane.png')
  heliImg = loadImage('assets/helicopter.gif'); // 2. Load the image
  boatImg = loadImage('assets/boat.png');
  fuelImg = loadImage('assets/Fuel.png'); // Load fuel image
  pixelFont = loadFont('assets/Silkscreen-Regular.ttf'); // Load pixel font
}

function setup() {
  createCanvas(400, 400);
  noSmooth(); // <-- Add this line to turn off anti-aliasing for images

  plane = {
    x: 200,
    y: 350,
    w: 32,
    h: 32
  };

  laser = {
    x: plane.x + plane.w / 2 - 2.5, // center laser on plane
    y: plane.y + 10,
    w: 5,
    h: 15,
    vy: 0
  };

  for (let i = 0; i < 3; i++) {
    helis.push({
      x: random(0, 400),
      y: random(0, 200), // Only top half
      w: 32,
      h: 32,
      vy: 2
    });
  }

  for (let i = 0; i < 2; i++) {
    boats.push({
      x: random(0, 400),
      y: random(0, 200), // Only top half
      w: 32,
      h: 12,
      vy: 2
    });
  }

  for (let i = 0; i < 2; i++) {
    fuels.push({
      x: random(0, 400),
      y: random(0, 200), // Only top half
      w: 20,
      h: 20,
      vy: 2
    });
  }

  restartButton = createButton('Restart');
  // Place the button lower than the "GAME OVER" text
  // "GAME OVER" is at y=200, so place button at y=250 (centered horizontally)
  restartButton.position((width - 128) / 2, 250);
  restartButton.mousePressed(restartGame);
  restartButton.hide();
  restartButton.style('font-family', 'Silkscreen-Regular, monospace'); // Set pixel font
  restartButton.style('font-size', '16px');
  restartButton.style('letter-spacing', '1px');
  restartButton.style('border-radius', '0'); // No rounded corners
  restartButton.style('width', '128px');      // Make it square
  restartButton.style('height', '64px');      // Make it square
}

function draw() {
  background('blue');
  fill('white');
  textFont(pixelFont); // Use pixel font
  textSize(16);
  text("Score: " + score, 10, 20);

  // --- FUEL METER LOGIC ---
  // Decrease fuel slowly if game is running
  if (!gameOver) {
    fuelMeter -= 0.0008; // Adjust this value for speed of fuel drain
    fuelMeter = constrain(fuelMeter, 0, 1);
    if (fuelMeter <= 0) {
      gameOver = true;
    }
  }

  // Draw fuel meter at bottom of screen
  let meterWidth = 300;
  let meterHeight = 16;
  let meterX = (width - meterWidth) / 2;
  let meterY = height - meterHeight - 10;
  stroke(255);
  noFill();
  rect(meterX, meterY, meterWidth, meterHeight);
  noStroke();
  fill('#FFD600');
  rect(meterX, meterY, meterWidth * fuelMeter, meterHeight);
  fill('white');
  textSize(12);
  textAlign(CENTER, CENTER);
  text("FUEL", meterX + meterWidth / 2, meterY + meterHeight / 2);

  textAlign(LEFT, BASELINE); // Reset alignment for rest of UI

  if (gameOver) {
    textSize(32);
    text("GAME OVER", 100, 200);
    restartButton.show();
    return;
  } else {
    restartButton.hide();
  }

  // --- Continuous plane movement ---
  if (keyIsDown(LEFT_ARROW)) {
    plane.x = max(plane.x - 5, 0);
    if (laser.vy === 0) laser.x = plane.x + plane.w / 2 - laser.w / 2;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    plane.x = min(plane.x + 5, width - plane.w);
    if (laser.vy === 0) laser.x = plane.x + plane.w / 2 - laser.w / 2;
  }

  // Draw the plane image
  image(planeImg, plane.x, plane.y, plane.w, plane.h);

  // --- Only draw laser if being fired ---
  if (laser.vy !== 0) {
    fill('red');
    rect(laser.x, laser.y, laser.w, laser.h);
  }

  // Draw helis
  fill('green');
  for (let heli of helis) {
    image(heliImg, heli.x, heli.y, heli.w, heli.h);
  }

  // Draw boats
  fill('orange');
  for (let boat of boats) {
    image(boatImg, boat.x, boat.y, boat.w, boat.h);
  }

  // Draw fuels
  fill('yellow');
  for (let fuel of fuels) {
    image(fuelImg,fuel.x, fuel.y, fuel.w, fuel.h);
  }

  // Move laser
  laser.y += laser.vy;

  // Reset laser if off screen
  if (laser.y <= 0) {
    laser.vy = 0;
    laser.y = plane.y + 5;
    laser.x = plane.x + plane.w / 2 - laser.w / 2;
  }

  // Move helis and boats
  let speedBoost = frameCount / (60 * 5);
  for (let heli of helis) {
    heli.y += heli.vy + speedBoost;
    if (heli.y > height) {
      heli.y = 0;
      heli.x = random(0, width);
    }
  }
  for (let boat of boats) {
    boat.y += boat.vy + speedBoost;
    if (boat.y > height) {
      boat.y = 0;
      boat.x = random(0, width);
    }
  }
  for (let fuel of fuels) {
    fuel.y += fuel.vy + speedBoost;
    if (fuel.y > height) {
      fuel.y = 0;
      fuel.x = random(0, width);
    }
  }

  // --- Only check collisions if laser is being fired ---
  if (laser.vy !== 0) {
    // Check collisions: laser with helis
    for (let heli of helis) {
      if (collideRectRect(laser.x, laser.y, laser.w, laser.h, heli.x, heli.y, heli.w, heli.h)) {
        kill++;
        heli.y = 0;
        heli.x = random(0, width);
        laser.vy = 0;
        laser.y = plane.y;
        laser.x = plane.x + plane.w / 2 - laser.w / 2;
      }
    }
    // Check collisions: laser with boats
    for (let boat of boats) {
      if (collideRectRect(laser.x, laser.y, laser.w, laser.h, boat.x, boat.y, boat.w, boat.h)) {
        kill++;
        boat.y = 0;
        boat.x = random(0, width);
        laser.vy = 0;
        laser.y = plane.y;
        laser.x = plane.x + plane.w / 2 - laser.w / 2;
      }
    }
    // Check collisions: laser with fuels (remove fuel if hit by laser)
    for (let fuel of fuels) {
      if (collideRectRect(laser.x, laser.y, laser.w, laser.h, fuel.x, fuel.y, fuel.w, fuel.h)) {
        fuel.y = 0;
        fuel.x = random(0, width);
        laser.vy = 0;
        laser.y = plane.y;
        laser.x = plane.x + plane.w / 2 - laser.w / 2;
      }
    }
  }

  // Check collisions: plane with helis/boats
  for (let heli of helis) {
    if (collideRectRect(plane.x, plane.y, plane.w, plane.h, heli.x, heli.y, heli.w, heli.h)) {
      gameOver = true;
    }
  }
  for (let boat of boats) {
    if (collideRectRect(plane.x, plane.y, plane.w, plane.h, boat.x, boat.y, boat.w, boat.h)) {
      gameOver = true;
    }
  }

  // (Optional) If you want to collect fuel when the plane touches it, add:
  for (let fuel of fuels) {
    if (collideRectRect(plane.x, plane.y, plane.w, plane.h, fuel.x, fuel.y, fuel.w, fuel.h)) {
      fuel.y = 0;
      fuel.x = random(0, width);
      fuelMeter += 0.25; // Refill some fuel
      fuelMeter = constrain(fuelMeter, 0, 1);
    }
  }

  score = kill * 5;
}

// --- Only keep spacebar logic in keyPressed ---
function keyPressed() {
  if (gameOver) return;
  if (key === ' ') {
    if (laser.vy === 0) {
      laser.vy = -10;
    }
  }
}

function restartGame() {
  // Reset all game variables and objects
  score = 0;
  kill = 0;
  speedBoost = 0;
  frameCount = 0;
  gameOver = false;

  plane.x = 200;
  plane.y = 350;

  laser.x = plane.x + plane.w / 2 - laser.w / 2;
  laser.y = plane.y;
  laser.vy = 0;

  helis = [];
  boats = [];
  fuels = [];
  for (let i = 0; i < 3; i++) {
    helis.push({
      x: random(0, 400),
      y: random(0, 200), // Only top half
      w: 32,
      h: 32,
      vy: 2
    });
  }
  for (let i = 0; i < 2; i++) {
    boats.push({
      x: random(0, 400),
      y: random(0, 200), // Only top half
      w: 32,
      h: 12,
      vy: 2
    });
  }
  for (let i = 0; i < 3; i++) {
    fuels.push({
      x: random(0, 400),
      y: random(0, 200), // Only top half
      w: 20,
      h: 20,
      vy: 2
    });
  }
  fuelMeter = 1;
}

// Simple rectangle collision
function collideRectRect(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2 + w2 &&
         x1 + w1 > x2 &&
         y1 < y2 + h2 &&
         y1 + h1 > y2;
}
