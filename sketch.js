/*
Week 5 — Example 1: Top-Down Camera Follow (Centered, No Bounds)

Course: GBDA302 | Instructors: Dr. Karen Cochrane & David Han
Date: Feb. 12, 2026

Move: WASD/Arrows

Goal:
- Keep player position in world space
- Compute a camera offset from the player (view state)
- Draw world using translate(-cam.x, -cam.y)
- Draw HUD in screen space (no translate)
*/

// WORLD + PLAYER
// ======================== =======
let player = { x: 300, y: 300, s: 3 };
let cam = { x: 0, y: 0 };

const WORLD_W = 2400;
const WORLD_H = 1600;

const VIEW_W = 800;
const VIEW_H = 480;

let cycleLength = 1200;

function setup() {
  createCanvas(VIEW_W, VIEW_H);
  textFont("sans-serif");
  textSize(14);
  noStroke();
}

function draw() {
  // ===============================
  // PLAYER MOVEMENT
  // ===============================
  const dx =
    (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) -
    (keyIsDown(LEFT_ARROW) || keyIsDown(65));

  const dy =
    (keyIsDown(DOWN_ARROW) || keyIsDown(83)) -
    (keyIsDown(UP_ARROW) || keyIsDown(87));

  const len = max(1, abs(dx) + abs(dy));

  player.x += (dx / len) * player.s;
  player.y += (dy / len) * player.s;

  cam.x = player.x - width / 2;
  cam.y = player.y - height / 2;

  // ===============================
  // TIME
  // ===============================
  let t = (frameCount % cycleLength) / cycleLength;
  let dayFactor = (sin(TWO_PI * t - HALF_PI) + 1) / 2;

  // ===============================
  // SKY
  // ===============================
  let dayTop = color(135, 200, 255);
  let dayBottom = color(200, 230, 255);
  let nightTop = color(10, 15, 40);
  let nightBottom = color(40, 50, 100);

  let skyTop = lerpColor(nightTop, dayTop, dayFactor);
  let skyBottom = lerpColor(nightBottom, dayBottom, dayFactor);

  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    stroke(lerpColor(skyTop, skyBottom, inter));
    line(0, y, width, y);
  }

  noStroke();

  // ===============================
  // WORLD
  // ===============================
  push();
  translate(-cam.x, -cam.y);

  // ===============================
  // 🌞🌙 SHINING SUN & MOON
  // ===============================

  if (dayFactor < 0.6) {
    let starAlpha = map(dayFactor, 0.6, 0, 0, 255);
    starAlpha = constrain(starAlpha, 0, 255);

    for (let i = 0; i < 300; i++) {
      let sx = (i * 173) % WORLD_W;
      let sy = (i * 97) % (WORLD_H / 2);

      let twinkle = sin(frameCount * 0.1 + i) * 50;

      fill(255, 255, 255, starAlpha + twinkle);
      circle(sx, sy, 2);
    }
  }

  // ===============================
  // 🌞🌙 SUN & MOON
  // ===============================

  let celestialX = map(t, 0, 1, 0, WORLD_W);
  let celestialY = 200 + sin(TWO_PI * t) * 150;

  if (dayFactor > 0.5) {
    fill(255, 220, 100, 255 * dayFactor);
    ellipse(celestialX, celestialY, 100);
  } else {
    fill(240, 240, 255, 255 * (1 - dayFactor));
    ellipse(celestialX, celestialY, 80);

    // 🌟 Stars
    fill(255, 255, 255, 200 * (1 - dayFactor));
    for (let i = 0; i < 100; i++) {
      let sx = (i * 97) % WORLD_W;
      let sy = (i * 53) % (WORLD_H / 2);
      circle(sx, sy, 2);
    }
  }

  // ===============================
  // MOUNTAINS (continuous)
  // ===============================
  // --- BACK MOUNTAIN LAYER
  // MOUNTAINS (hide in town area)
  // ===============================

  push();
  translate(cam.x * 0.3, 0);
  let backColor = lerpColor(
    color(120, 120, 130),
    color(30, 40, 70),
    1 - dayFactor,
  );
  fill(backColor);
  let spacingBack = 400;
  for (let bx = -spacingBack; bx < WORLD_W + spacingBack; bx += spacingBack) {
    let peak = 350 + noise(bx * 0.001) * 200;
    triangle(
      bx,
      WORLD_H / 2,
      bx + spacingBack / 2,
      WORLD_H / 2 - peak,
      bx + spacingBack,
      WORLD_H / 2,
    );
  }
  pop(); // --- FRONT MOUNTAINS push(); translate(cam.x * 0.5, 0); let frontColor = lerpColor( color(170, 170, 180), color(20, 30, 60), 1 - dayFactor, ); fill(frontColor); let spacingFront = 300; for ( let fx = -spacingFront; fx < WORLD_W + spacingFront; fx += spacingFront ) { let peak = 250 + noise(fx * 0.002) * 150; triangle( fx, WORLD_H / 2, fx + spacingFront / 2, WORLD_H / 2 - peak, fx + spacingFront, WORLD_H / 2, ); } pop();

  // ===============================
  // GRASS
  // ===============================
  fill(lerpColor(color(100, 200, 120), color(40, 80, 60), 1 - dayFactor));
  rect(0, WORLD_H / 2, WORLD_W, WORLD_H / 2);

  // ===============================
  // NIGHT FOG
  // ===============================
  if (dayFactor < 0.6) {
    let fogStrength = map(dayFactor, 0.6, 0, 0, 180);
    fogStrength = constrain(fogStrength, 0, 180);

    for (let y = WORLD_H / 2 - 100; y < WORLD_H; y += 4) {
      let alpha = map(y, WORLD_H / 2 - 100, WORLD_H, 0, fogStrength);
      fill(200, 220, 255, alpha);
      rect(0, y, WORLD_W, 4);
    }
  }

  // Generate buildings based on world grid
  let buildingSpacing = 600;

  // Only start town after certain X
  let townStartX = 800;

  for (let x = townStartX; x < player.x + 2000; x += buildingSpacing) {
    let buildingType = noise(x * 0.01);

    let buildingHeight = 120 + buildingType * 120;
    let buildingWidth = 200;

    // House
    if (buildingType < 0.5) {
      fill(200, 160, 120);
      rect(x, WORLD_H / 2 - buildingHeight, buildingWidth, buildingHeight);

      // Roof
      fill(150, 80, 60);
      triangle(
        x - 20,
        WORLD_H / 2 - buildingHeight,
        x + buildingWidth / 2,
        WORLD_H / 2 - buildingHeight - 80,
        x + buildingWidth + 20,
        WORLD_H / 2 - buildingHeight,
      );

      // Door
      fill(120, 80, 50);
      rect(x + 70, WORLD_H / 2 - 60, 60, 60);
    }

    // Shop
    else {
      let shopX = x;
      let shopY = WORLD_H / 2 - buildingHeight;
      let shopW = buildingWidth;
      let shopH = buildingHeight;

      // Main building
      fill(190, 190, 210);
      rect(shopX, shopY, shopW, shopH);

      // Roof
      fill(120, 120, 140);
      rect(shopX - 10, shopY - 20, shopW + 20, 20);

      // Sign board
      fill(255);
      rect(shopX + 20, shopY - 50, shopW - 40, 35);

      fill(0);
      text("SHOP", shopX + shopW / 2 - 25, shopY - 28);

      // Windows (light up at night)
      let windowColor = lerpColor(
        color(200, 230, 255),
        color(255, 240, 180),
        1 - dayFactor,
      );

      fill(windowColor);

      rect(shopX + 20, shopY + 40, 50, 50);
      rect(shopX + shopW - 70, shopY + 40, 50, 50);

      // Door
      fill(120, 80, 50);
      rect(shopX + shopW / 2 - 25, shopY + shopH - 70, 50, 70);

      // Door handle
      fill(0);
      circle(shopX + shopW / 2 + 10, shopY + shopH - 35, 6);
    }
  }
  // ===============================
  // BIRD PLAYER
  // ===============================
  push();
  translate(player.x, player.y);

  let moveAngle = atan2(dy, dx);
  if (dx !== 0 || dy !== 0) rotate(moveAngle);

  fill(255, 200, 80);
  ellipse(0, 0, 30, 20);

  let flap = sin(frameCount * 0.3) * 10;
  fill(255, 180, 60);
  ellipse(-5, flap, 25, 12);

  fill(255, 140, 0);
  triangle(15, 0, 25, -4, 25, 4);

  fill(0);
  circle(5, -3, 4);

  pop();

  pop(); // end world

  // ===============================
  // HUD
  // ===============================
  fill(20);
  text("WASD / Arrows to move", 12, 20);
}
