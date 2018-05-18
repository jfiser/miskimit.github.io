var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var objArray = [];
var paused = false;
var totalKineticEnergy = 0;
var bumped = false;

var leftHeld = false;
var upHeld = false;
var rightHeld = false;
var downHeld = false;

var beep = new Audio('beep');
beep.volume = 0.002

var gravityOn = false;
var dragOn = true;
var soundOn = true;

var clearCanv = true;

var bigBalls = false;

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function keyDownHandler(event) {
    if (event.keyCode == 67) { // c
        objArray[objArray.length] = new Ball(randomX(), randomY(), randomRadius());
    } else if (event.keyCode == 80) { // p
        paused = !paused;
    } else if (event.keyCode == 71) { // g
        gravityOn = !gravityOn;
        dragOn = !dragOn;
    } else if (event.keyCode == 77) { // m
        soundOn = !soundOn;
    } else if (event.keyCode == 65) { // A
        leftHeld = true;
    } else if (event.keyCode == 87) { // W
        upHeld = true;
    } else if (event.keyCode == 68) { // D
        rightHeld = true;
    } else if (event.keyCode == 83) { // S
        downHeld = true;
    } else if (event.keyCode == 82) { // r
        objArray = [];
    } else if (event.keyCode == 75) { // k
        clearCanv = !clearCanv;
    } else if (event.keyCode == 88) { // x
        bigBalls = !bigBalls;
    }
}

function keyUpHandler(event) {
    if (event.keyCode == 65) { // A
        leftHeld = false;
    } else if (event.keyCode == 87) { // W
        upHeld = false;
    } else if (event.keyCode == 68) { // D
        rightHeld = false;
    } else if (event.keyCode == 83) { // S
        downHeld = false;
    }
}

function arrowControls() {
    if (leftHeld) { // left arrow
        for (var obj in objArray) {
            objArray[obj].dx -= 0.3;
        }
    } if (upHeld) { // up arrow
        for (var obj in objArray) {
            objArray[obj].dy -= 0.3;
        }
    } if (rightHeld) { // right arrow
        for (var obj in objArray) {
            objArray[obj].dx += 0.3;
        }
    } if (downHeld) { // down arrow
        for (var obj in objArray) {
            objArray[obj].dy += 0.3;
        }
    }
}

function canvasBackground() {
    canvas.style.backgroundColor = "rgb(215, 235, 240)";
}

function wallCollision(ball) {
    if (ball.x - ball.radius + ball.dx < 0 ||
        ball.x + ball.radius + ball.dx > canvas.width) {
        ball.dx *= -1;
    }
    if (ball.y - ball.radius + ball.dy < 0 ||
        ball.y + ball.radius + ball.dy > canvas.height) {
        ball.dy *= -1;
    }
    if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
    }
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
    }
    if (ball.x + ball.radius > canvas.width) {
        ball.x = canvas.width - ball.radius;
    }
    if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
    }    
}

function ballCollision() {
    for (var obj1 in objArray) {
        for (var obj2 in objArray) {
            if (obj1 !== obj2 && distanceNextFrame(objArray[obj1], objArray[obj2]) <= 0) {
                var theta1 = objArray[obj1].angle();
                var theta2 = objArray[obj2].angle();
                var phi = Math.atan2(objArray[obj2].y - objArray[obj1].y, objArray[obj2].x - objArray[obj1].x);
                var m1 = objArray[obj1].mass;
                var m2 = objArray[obj2].mass;
                var v1 = objArray[obj1].speed();
                var v2 = objArray[obj2].speed();

                var dx1F = (v1 * Math.cos(theta1 - phi) * (m1-m2) + 2*m2*v2*Math.cos(theta2 - phi)) / (m1+m2) * Math.cos(phi) + v1*Math.sin(theta1-phi) * Math.cos(phi+Math.PI/2);
                var dy1F = (v1 * Math.cos(theta1 - phi) * (m1-m2) + 2*m2*v2*Math.cos(theta2 - phi)) / (m1+m2) * Math.sin(phi) + v1*Math.sin(theta1-phi) * Math.sin(phi+Math.PI/2);
                var dx2F = (v2 * Math.cos(theta2 - phi) * (m2-m1) + 2*m1*v1*Math.cos(theta1 - phi)) / (m1+m2) * Math.cos(phi) + v2*Math.sin(theta2-phi) * Math.cos(phi+Math.PI/2);
                var dy2F = (v2 * Math.cos(theta2 - phi) * (m2-m1) + 2*m1*v1*Math.cos(theta1 - phi)) / (m1+m2) * Math.sin(phi) + v2*Math.sin(theta2-phi) * Math.sin(phi+Math.PI/2);

                objArray[obj1].dx = dx1F;                
                objArray[obj1].dy = dy1F;                
                objArray[obj2].dx = dx2F;                
                objArray[obj2].dy = dy2F;
                
                if (soundOn)
                    beep.play();
            }            
        }
        wallCollision(objArray[obj1]);
    }
}

function staticCollision() {
    for (var obj1 in objArray) {
        for (var obj2 in objArray) {
            if (obj1 !== obj2 &&
                distance(objArray[obj1], objArray[obj2]) < objArray[obj1].radius + objArray[obj2].radius)
            {
                var theta = Math.atan2((objArray[obj1].y - objArray[obj2].y), (objArray[obj1].x - objArray[obj2].x));
                var overlap = objArray[obj1].radius + objArray[obj2].radius - distance (objArray[obj1], objArray[obj2]);
                var smallerObject = objArray[obj1].radius < objArray[obj2].radius ? obj1 : obj2
                objArray[smallerObject].x -= overlap * Math.cos(theta);
                objArray[smallerObject].y -= overlap * Math.sin(theta);
            }
        }
    }
}

function applyGravity() {
    for (var obj in objArray) {
        if (objArray[obj].onGround() == false) {
            objArray[obj].dy += 0.29;
        }   
    }
}

function applyDrag() {
    for (var obj in objArray) {
        objArray[obj].dx *= 0.99
        objArray[obj].dy *= 0.99
    }
}

function moveObjects() {
    for (var obj in objArray) {
        objArray[obj].x += objArray[obj].dx;
        objArray[obj].y += objArray[obj].dy;
    }    
}

function drawObjects() {
    for (var obj in objArray) {
        objArray[obj].draw();
    }
}

function draw() {

    if(clearCanv) clearCanvas();
    canvasBackground();

    if (!paused) {
        arrowControls();
        if (gravityOn) {
            applyGravity();
            applyDrag();
        }
        moveObjects();
    }

    drawObjects();
    staticCollision();
    ballCollision();
    //logger();
    //requestAnimationFrame(draw);
}

function drawTween() {

  if(clearCanv) clearCanvas();
  canvasBackground();
  tweenBalls();
  drawObjects();
  requestAnimationFrame(drawTween);
}

function tweenBalls(){
  for(var i = 0; i < objArray.length; i++){
    TweenLite.to(objArray[i], 2, {
      x: 200,
      y: 200,
      ease: Linear
    });
  }
}

function logger() {
    //log some stuff
}

// spawn the initial small thingies.
//for (i = 0; i<2; i++) {
   // objArray[objArray.length] = new Ball(randomX(), randomY(), randomRadius());
//}

bigBalls = true;

// manually spawn the few large ones that
// start with no velocity. because i'm lazy.
setCircles(100, 120, 14);
//setCircles(15, 70);

function setCircles(numNodes, radius, ballRadius){
    var angle, x, y;
    var spaceBetween = ballRadius + 5; //15; 
    // center of the circles
    var centerx = canvas.width/2; //350;
    var centery = canvas.height/2; //350;  
    
    var k = 5;
    var i = 1;
    while ( i < numNodes ) {
        // number of elements on this circle
        var steps = k * 6;
        // angular distance between elements
        var angle_range = 2 * Math.PI / steps;
        // every circle is bigger then the previuos of the same amount
        //var radius = k * 30;
        var radius = k * (ballRadius + spaceBetween);
        var j = 0;
        while ( j < steps  &&  i < numNodes ) {
            var angle = j * angle_range;
            var x = Math.round(centerx + radius * Math.cos(angle));
            var y = Math.round(centery + radius * Math.sin(angle));

            var tmpBall = new Ball(x, y, ballRadius);
            tmpBall.dx = 0;
            tmpBall.dy = 0;
            objArray[objArray.length] = tmpBall;    
            i++;
            j++;
        }
        k++;
    }


    /*for (i = 0; i<numNodes; i++) {
        angle = (i / (numNodes/2)) * Math.PI; // Calculate the angle at which the element will be placed.

        x = (radius * Math.cos(angle)) + (width/2); // Calculate the x position of the element.
        y = (radius * Math.sin(angle)) + (width/2); // Calculate the y position of the element.

        //var temp = new Ball(randomX(), randomY(), randomRadius());
        var temp = new Ball(x, y, 11);

        temp.dx = 0;
        temp.dy = 0;
        objArray[objArray.length] = temp;
    }*/
}

// brought in
function concentricCircles(){
    // center of the circles
    var centerx = 350;
    var centery = 350;
    // start drawing the central (first) element
    if ( items.length > 0 ) {
    // draw item at centerx, centery
    }
    var k = 1;
    var i = 1;
    while ( i < items.length ) {
        // number of elements on this circle
        var steps = k * 6;
        // angular distance between elements
        var angle_range = 2 * Math.PI / steps;
        // every circle is bigger then the previuos of the same amount
        var radius = k * 60;
        var j = 0;
        while ( j < steps  &&  i < items.length ) {
            var angle = j * angle_range;
            var x = Math.round(centerx + radius * Math.cos(angle));
            var y = Math.round(centery + radius * Math.sin(angle));
            //draw item at x,y

            i++;
            j++;
        }
        k++;
    }
}

// and manually spawn one large ball WITH initial velocity.
// just to impart some more initial energy in the system.
//objArray[objArray.length] = new Ball(randomX(), randomY(), 11);

//draw();
drawTween();

//*********************** */
