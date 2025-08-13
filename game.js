const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const menu = document.getElementById('menu');
const gameOverUI = document.getElementById('gameOverUI');
const finalScore = document.getElementById('finalScore');
const scoreDisplay = document.getElementById('score');
const bestDisplay = document.getElementById('best');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let lastTime = 0;

// ===== 플레이어 이미지 랜덤 선택 =====
const playerImgs = [new Image(), new Image()];
playerImgs[0].src = 'assets/player1.png';
playerImgs[1].src = 'assets/player2.png';
let playerImg;

// 플레이어 상태
const buttonHeight = 80; // 하단 좌우 버튼 높이
const player = {x:100, y:0, w:60, h:60, speed:320};

// ===== 장애물 이미지 5개 =====
const obstacleImgs = [];
for(let i=1;i<=5;i++){
  const img = new Image();
  img.src = `assets/obstacle${i}.png`;
  obstacleImgs.push(img);
}
let obstacles = [];

// ===== 효과음 =====
const startSoundSrc = 'assets/start.mp3';
const hitSoundSrc = 'assets/hit.mp3';
const intervalSoundSrcs = ['assets/interval1.mp3','assets/interval2.mp3','assets/interval3.mp3'];

// ===== 점수 =====
let score=0, best=0, timeElapsed=0;
let leftHeld=false, rightHeld=false;
let intervalTimer=0;
let spawnTimer=0;
let gameRunning=false;

// ===== 이벤트 =====
leftBtn.addEventListener('touchstart', ()=>leftHeld=true);
leftBtn.addEventListener('touchend', ()=>leftHeld=false);
rightBtn.addEventListener('touchstart', ()=>rightHeld=true);
rightBtn.addEventListener('touchend', ()=>rightHeld=false);

// ===== 장애물 생성 =====
function spawnObstacle(){
  const img = obstacleImgs[Math.floor(Math.random()*obstacleImgs.length)];
  const w = 50 + Math.random()*30;
  const h = 50 + Math.random()*30;
  const x = Math.random()*(canvas.width-w);
  obstacles.push({img,x,y:-h,w,h,speed:100 + Math.random()*60});
}

// ===== 보스 스테이지 =====
function spawnBossObstacle(){
  const gap = Math.random()*(canvas.width-120)+60;
  obstacles.push({x:0,y:-60,w:gap,h:60,img:obstacleImgs[Math.floor(Math.random()*obstacleImgs.length)],speed:140});
  obstacles.push({x:gap+60,y:-60,w:canvas.width-gap-60,h:60,img:obstacleImgs[Math.floor(Math.random()*obstacleImgs.length)],speed:140});
}

// ===== 충돌 체크 (히트박스 80%) =====
function collide(a,b){
  const scale = 0.8;
  const px = a.x + a.w*(1-scale)/2;
  const py = a.y + a.h*(1-scale)/2;
  const pw = a.w*scale;
  const ph = a.h*scale;

  return px < b.x + b.w &&
         px + pw > b.x &&
         py < b.y + b.h &&
         py + ph > b.y;
}

// ===== 게임 루프 =====
function loop(ts){
  if(!lastTime) lastTime = ts;
  const dt = (ts-lastTime)/1000;
  lastTime = ts;

  ctx.clearRect(0,0,canvas.width,canvas.height);

  // ===== 플레이어 이동 =====
  if(leftHeld) player.x -= player.speed*dt;
  if(rightHeld) player.x += player.speed*dt;
  player.x = Math.max(0, Math.min(canvas.width-player.w, player.x));
  player.y = canvas.height - player.h - buttonHeight - 10;

  // 플레이어 이미지 세로 85%로 줄이기
  const playerDrawH = player.h * 0.85;
  ctx.drawImage(playerImg, player.x, player.y + player.h*0.15, player.w, playerDrawH);

  // ===== 장애물 생성 =====
  spawnTimer += dt;
  if(spawnTimer >= 0.8){
    spawnObstacle();
    spawnTimer = 0;
  }

  if(Math.floor(timeElapsed)%15===0 && Math.floor(timeElapsed) !=0 && obstacles.length===0){
    spawnBossObstacle();
  }

  // ===== 장애물 이동 & 충돌 =====
  for(let i=obstacles.length-1;i>=0;i--){
    const o = obstacles[i];
    o.y += o.speed*dt;

    const obsDrawH = o.h * 0.75; // 세로 비율 75%
    ctx.drawImage(o.img, o.x, o.y + o.h*0.25, o.w, obsDrawH);

    if(collide(player,o)){
      new Audio(hitSoundSrc).play();
      gameOver();
      return;
    }

    if(o.y>canvas.height) obstacles.splice(i,1);
  }

  // ===== 점수 업데이트 =====
  score += dt;
  timeElapsed += dt;
  scoreDisplay.textContent = `점수: ${score.toFixed(1)}`;
  bestDisplay.textContent = `최고 기록: ${best.toFixed(1)}`;

  // ===== 5초마다 랜덤 효과음 =====
  intervalTimer += dt;
  if(intervalTimer >= 5){
    intervalTimer = 0;
    const sound = new Audio(intervalSoundSrcs[Math.floor(Math.random()*intervalSoundSrcs.length)]);
    sound.play();
  }

  if(gameRunning) requestAnimationFrame(loop);
}

// ===== 게임 시작 =====
function startGame(){
  playerImg = playerImgs[Math.floor(Math.random()*playerImgs.length)];
  player.x = canvas.width/2 - player.w/2;
  leftHeld=false;
  rightHeld=false;
  obstacles=[];
  score=0;
  timeElapsed=0;
  intervalTimer=0;
  spawnTimer=0;
  lastTime=0;
  gameRunning=true;

  new Audio(startSoundSrc).play();
  menu.style.display='none';
  gameOverUI.style.display='none';

  requestAnimationFrame(loop);
}

// ===== 게임오버 UI =====
function gameOver(){
  gameRunning=false;
  if(score > best) best = score;
  finalScore.textContent = `점수: ${score.toFixed(1)}`;
  gameOverUI.style.display='block';
}

// ===== 이벤트 =====
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
