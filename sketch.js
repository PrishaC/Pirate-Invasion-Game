
const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Constraint = Matter.Constraint;

var engine, world, backgroundImg;
var canvas, angle, tower, ground, cannon;
var balls = [];
var boats = [];
//variables for the boat animation
var boatAnimation = []
var boatSheet,  boatData
//variables for the broken boat animation
var brokenBoatAnimation = []
var brokenSheet, brokenData
//variables for the water splash animation
var waterAnimation = []
var waterSheet, waterData

var score = 0;

var isGameOver = false
var isLaughing = false

//variables for sounds
var bgS
var wsS 
var plS
var ceS

function preload() {
  backgroundImg = loadImage("./assets/background.gif");
  towerImage = loadImage("./assets/tower.png");
  boatSheet = loadImage("assets/boat/boat.png")
  boatData = loadJSON("assets/boat/boat.json")
  brokenSheet = loadImage("assets/boat/broken_boat.png")
  brokenData = loadJSON("assets/boat/broken_boat.json")
  waterSheet = loadImage("assets/water_splash/water_splash.png")
  waterData = loadJSON("assets/water_splash/water_splash.json")
  bgS = loadSound("assets/background_music.mp3")
  wsS = loadSound("assets/cannon_water.mp3")
  plS = loadSound("assets/pirate_laugh.mp3")
  ceS = loadSound("assets/cannon_explosion.mp3")

}

function setup() {
  canvas = createCanvas(1200, 600);
  engine = Engine.create();
  world = engine.world;
  angleMode(DEGREES)
  angle = 15


  ground = Bodies.rectangle(0, height - 1, width * 2, 1, { isStatic: true });
  World.add(world, ground);

  tower = Bodies.rectangle(160, 350, 160, 310, { isStatic: true });
  World.add(world, tower);

  cannon = new Cannon(200, 110, 130, 100, angle);

  //extracting the images one by one from the boat sheet
  // and pushing them into the boat animation array
  var boatFrames = boatData.frames
  for (var i = 0; i<boatFrames.length; i = i+1){
    var pos = boatFrames[i].position
    var img = boatSheet.get(pos.x,pos.y,pos.w,pos.h)
    boatAnimation.push(img)
  }
  //extracting the images one by one from the broken boat sheet
  // and pushing them into the broken boat animation array
  var brokenFrames = brokenData.frames
  for(var i = 0; i<brokenFrames.length; i = i+1){
    var pos = brokenFrames[i].position
    var img = brokenSheet.get(pos.x,pos.y,pos.w,pos.h)
    brokenBoatAnimation.push(img)
  }
  //extracting the images one by one from the water splash sheet
  // and pushing them into the water splash animation array
  var waterFrames = waterData.frames
  for(var i = 0; i<waterFrames.length; i = i+1){
    var pos = waterFrames[i].position
    var img = waterSheet.get(pos.x,pos.y,pos.w,pos.h)
    waterAnimation.push(img)
  }
  
}

function draw() {
  background(189);
  image(backgroundImg, 0, 0, width, height);
  if(!bgS.isPlaying()){
    bgS.play()
    bgS.setVolume(0.02)
  }

  Engine.update(engine);

  push();
  translate(ground.position.x, ground.position.y);
  fill("brown");
  rectMode(CENTER);
  rect(0, 0, width * 2, 1);
  pop();

  push();
  translate(tower.position.x, tower.position.y);
  rotate(tower.angle);
  imageMode(CENTER);
  image(towerImage, 0, 0, 160, 310);
  pop();

  showBoats();

  for (var i = 0; i < balls.length; i++) {
    showCannonBalls(balls[i], i);
    collisionWithBoat(i);
  }

  cannon.display();


}

function collisionWithBoat(index) {
  for (var i = 0; i < boats.length; i++) {
    if (balls[index] !== undefined && boats[i] !== undefined) {
      var collision = Matter.SAT.collides(balls[index].body, boats[i].body);

      if (collision.collided) {
        boats[i].remove(i);

        Matter.World.remove(world, balls[index].body);
        delete balls[index];
      }
    }
  }
}

function keyPressed() {
  if (keyCode === DOWN_ARROW) {
    var cannonBall = new CannonBall(cannon.x, cannon.y);
    cannonBall.trajectory = [];
    Matter.Body.setAngle(cannonBall.body, cannon.angle);
    balls.push(cannonBall);
  }
}

function showCannonBalls(ball, index) {
  if (ball) {
    ball.display();
    ball.animate()
    if (ball.body.position.x > width+20 || ball.body.position.y >= height - 50) {
      if(!ball.isSink){
        wsS.play()
        wsS.setVolume(0.02)
        ball.remove(index);
      }
      
    }
  }
}

function showBoats() {
  if (boats.length > 0) {
    if (
      boats[boats.length - 1] === undefined ||
      boats[boats.length - 1].body.position.x < width - 300
    ) {
      var positions = [-40, -60, -70, -20];
      var position = random(positions);
      var boat = new Boat(width, height - 100, 170, 170, position, boatAnimation);

      boats.push(boat);
    }

    for (var i = 0; i < boats.length; i++) {
      if (boats[i]) {
        Matter.Body.setVelocity(boats[i].body, {
          x: -0.9,
          y: 0
        });

        boats[i].display();
        boats[i].animate()
        
        //checking for collision between tower and boats
        var collision = Matter.SAT.collides(boats[i].body,tower)
        if(collision.collided && !boats[i].isBroken){
          if(!isLaughing && !plS.isPlaying()){
            plS.play()
            plS.setVolume(0.03)
            isLaughing = true
          }
          isGameOver = true;
          gameOver ()
        }
      } else {
        boats[i];
      }
    }
  } else {
    var boat = new Boat(width, height - 60, 170, 170, -60, boatAnimation);
    boats.push(boat);
  }
}

function gameOver(){
swal (
  {
    title : `Game Over!!!`,
    text  : "Thanks For Playing!!",
    imageUrl  : "https://www.smileysapp.com/emojis/loser-smiley.png",
    imageSize : "200x200",
    confirmButtonText : "Play Again"
  },
  function (isConfirm){
    if(isConfirm){
      location.reload()
    }
  }
)
}

function keyReleased() {
  if (keyCode === DOWN_ARROW) {
    ceS.play()
    ceS.setVolume(0.01)
    balls[balls.length - 1].shoot();
  }
}
