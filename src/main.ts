const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const SCREEN_HEIGHT = 480;
const SCREEN_WIDTH = SCREEN_HEIGHT * 2;
canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;

const MAP_SIZE = 8;
const TILE_SIZE = (SCREEN_WIDTH / 2) / MAP_SIZE;
const FOV = Math.PI / 3;
const HALF_FOV = FOV / 2;
const CASTED_RAYS = 160;
const STEP_ANGLE = FOV / CASTED_RAYS;
const MAX_DEPTH = MAP_SIZE * TILE_SIZE;
const SCALE = (SCREEN_WIDTH / 2) / CASTED_RAYS;

let playerX = (SCREEN_WIDTH / 2) / 2;
let playerY = (SCREEN_WIDTH / 2) / 2;
let playerAngle = Math.PI;

const MAP: string[] = [
  "########",
  "# #    #",
  "# #  ###",
  "#      #",
  "##     #",
  "#  ### #",
  "#   #  #",
  "########"
];

function drawMap(): void {
  for (let i = 0; i < MAP_SIZE; i++) {
    for (let j = 0; j < MAP_SIZE; j++) {
      const square = MAP[i][j];
      ctx.fillStyle = square === "#" ? "rgb(191, 191, 191)" : "rgb(65, 65, 65)";
      ctx.fillRect(j * TILE_SIZE, i * TILE_SIZE, TILE_SIZE - 1, TILE_SIZE - 1);
    }
  }

  ctx.fillStyle = "rgb(162, 0, 255)";
  ctx.beginPath();
  ctx.arc(playerX, playerY, 12, 0, 2 * Math.PI);
  ctx.fill();
}

function rayCasting(): void {
  let startAngle = playerAngle - HALF_FOV;

  for (let ray = 0; ray < CASTED_RAYS; ray++) {
    for (let depth = 0; depth < MAX_DEPTH; depth++) {
      const targetX = playerX - Math.sin(startAngle) * depth;
      const targetY = playerY + Math.cos(startAngle) * depth;

      const col = Math.floor(targetX / TILE_SIZE);
      const row = Math.floor(targetY / TILE_SIZE);

      if (row >= 0 && row < MAP_SIZE && col >= 0 && col < MAP_SIZE && MAP[row][col] === "#") {
        ctx.strokeStyle = "rgb(233, 166, 49)";
        ctx.beginPath();
        ctx.moveTo(playerX, playerY);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        const color = 255 / (1 + depth * depth * 0.0001);
        const correctedDepth = depth * Math.cos(playerAngle - startAngle);
        const wallHeight = Math.min(SCREEN_HEIGHT, 21000 / correctedDepth);

        ctx.fillStyle = `rgb(${color}, ${color}, ${color})`;
        ctx.fillRect(SCREEN_HEIGHT + ray * SCALE, (SCREEN_HEIGHT / 2) - wallHeight / 2, SCALE, wallHeight);
        break;
      }
    }
    startAngle += STEP_ANGLE;
  }
}

function gameLoop(): void {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, SCREEN_HEIGHT, SCREEN_HEIGHT);

  ctx.fillStyle = "rgb(100, 100, 100)";
  ctx.fillRect(SCREEN_HEIGHT, SCREEN_HEIGHT / 2, SCREEN_HEIGHT, SCREEN_HEIGHT);

  ctx.fillStyle = "rgb(200, 200, 200)";
  ctx.fillRect(SCREEN_HEIGHT, -SCREEN_HEIGHT / 2, SCREEN_HEIGHT, SCREEN_HEIGHT);

  drawMap();
  rayCasting();
}

function handleInput(event: KeyboardEvent): void {
  const movementSpeed = 5;
  const rotationSpeed = 0.1;

  if (event.key === "ArrowLeft") {
    playerAngle -= rotationSpeed;
  }
  if (event.key === "ArrowRight") {
    playerAngle += rotationSpeed;
  }
  if (event.key === "ArrowUp") {
    playerX += -Math.sin(playerAngle) * movementSpeed;
    playerY += Math.cos(playerAngle) * movementSpeed;
  }
  if (event.key === "ArrowDown") {
    playerX -= -Math.sin(playerAngle) * movementSpeed;
    playerY -= Math.cos(playerAngle) * movementSpeed;
  }
}

window.addEventListener("keydown", handleInput);

function main(): void {
  gameLoop();
  requestAnimationFrame(main);
}

main();
