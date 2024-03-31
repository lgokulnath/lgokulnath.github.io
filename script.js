const eps = 1e-6;

const point_radius = 3;


var bruteForceSECRuntime = document.getElementById('bruteForceSECRuntime');bruteForceSECRuntime
var randmizedSECRuntime = document.getElementById('randomizedSECRuntime');

// Get canvas element and its context
const canvas = document.getElementById('canvas');

// const rect = canvas.getBoundingClientRect();

var minX, maxX, minY, maxY;

var points = [];
var isDragging = false;
var moving_point_x = 0;
var moving_point_y = 0;
var moving_point_idx = 0;
var viz = true;
const sleep_time = 250;

const ctx = canvas.getContext('2d');
ctx.canvas.width = .8*window.innerWidth;
ctx.canvas.height = .8*window.innerHeight;
console.log('width: ', canvas.width, ctx.canvas.width);
console.log('height: ', canvas.height);
console.log(canvas.style.width, canvas.style.height);

var minY = canvas.height*.1,  maxY = canvas.height*.9;
const rect = canvas.getBoundingClientRect();
console.log(rect.width, rect.height);


// function sleep(delay) {
//     var start = new Date().getTime();
//     while (new Date().getTime() < start + delay);
// }


// some utility functions

// emsure manual points are not very close
function checkPoint(p) {
    for(let i = 0; i < points.length; i++) {
        const p1 = points[i]
        if((p.x - p1.x)**2 + (p.y - p1.y)**2 < 4 * point_radius**2) {
            return false;
        }
    }
    return true;
}

function checkViz() {
    
        var trueOption = document.getElementById('vizTrue');
        var falseOption = document.getElementById('vizFalse');
        
        if (trueOption.checked) {
          return true;
        } 
        return false;
      
}

// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
// equivalent to random permutation
function randomShuffle(a) {
    const n = a.length;
    for(let i=n-1; i >= 1; i--) {
        const j = Math.floor(Math.random() * (i+1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;

}


// credit: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
class Point {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
  
    static displayName = "point";
    static distance(a, b) {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
   
      return Math.hypot(dx, dy);
    }
    static getRandomPoint(min_x, max_x, min_y, max_y) {
        let x = Math.random() * (max_x - min_x) + min_x;
        let y = Math.random() * (max_y - min_y) + min_y;
        return new Point(x, y);
    }
}



class Circle {
    constructor(center, radius) {
        this.center = center;
        this.radius = radius;
    }

    // circle from diamterically opp points
    static diameterPoints(p1, p2) {
        const centerX = (p1.x + p2.x) / 2.0;
        const centerY = (p1.y + p2.y) / 2.0;
        const radius = Point.distance(p1, p2) / 2.0;
        const centerPoint = new Point(centerX, centerY);
        return new Circle(centerPoint, radius);
    }

    // circle passing thru 3 points
    static threePointCirle(p1, p2, p3) {
        let x1 = p1.x;
        let y1 = p1.y;
        let x2 = p2.x;
        let y2 = p2.y;
        let x3 = p3.x;
        let y3 = p3.y;
        x2 = x2 - x1;
        y2 = y2 - y1;
        x3 = x3 - x1;
        y3 = y3 - y1;

        let z1 = x2*x2 + y2*y2;
        let z2 = x3*x3 + y3*y3;
        let d = 2 * (x2 * y3 - x3 * y2);

        let xc = (z1 * y3 - z2 * y2) / d + x1;
        let yc = (x2 * z2 - x3 * z1) / d + y1;

        const centerPoint = new Point(xc, yc);
        const radius = Point.distance(centerPoint, p3);
        return new Circle(centerPoint, radius);
    }
}

//------------------------------------------------Algorithms---------------------------------------------------------

// O(n^3) brute force algo
function bruteForceSEC(points) {
    //console.log(points.length);
    if (points.length < 2) return new Circle(new Point(0,0),0);

    let sec = new Circle(new Point(0,0), maxX);

    for(let i=0; i<points.length; i++) {
        for(let j=i+1; j<points.length; j++) {
            const p0 = points[i];
            const p1 = points[j];

            let currentSec = Circle.diameterPoints(p0, p1);


            for(let k=j+1; k < points.length; k++) {
                const p2 = points[k];

                if(Point.distance(p2, currentSec.center) < currentSec.radius + eps) {
                    continue;
                }
                else {
                    currentSec = Circle.threePointCirle(p0, p1, p2);
                }
            }
           
            let flag = 1;
            for(let k=0; k < points.length; k++) {
                const p2 = points[k];

                if(Point.distance(p2, currentSec.center) < currentSec.radius + eps) {
                    continue;
                }
                else {
                    flag=0;
                    break;
                }
            }
            if (flag == 1 && sec.radius > currentSec.radius+eps) {
                // sec found
                sec = currentSec;
                //console.log('sec modified');
            }
         
        }
        
    }
    return sec;

}

function checkPointOutsideCircle(circle, point) {
    const center = circle.center;
    const radius = circle.radius;

    if(Point.distance(point, center) >= radius+eps) {
        return true;
    }
    return false;
}

function _randomizedSEC2(points, p0, p1) {
    let circle = Circle.diameterPoints(p0, p1);
    for(let i=0; i<points.length; i++)  {
        if(checkPointOutsideCircle(circle, points[i])) {
            circle = Circle.threePointCirle(points[i], p0, p1);
        }
    }
    return circle;

    
}

function _randomizedSEC1(points, point) {
    let shuffledPoints = randomShuffle(points);

    let circle = Circle.diameterPoints(point, shuffledPoints[0]);

    for(let i=1; i < points.length; i++) {
        const pi = shuffledPoints[i];
        if (checkPointOutsideCircle(circle, pi)) {
            circle = _randomizedSEC2(shuffledPoints.slice(0, i) ,point, pi);
        }

    }
    return circle;

}

function drawCircleAndPoints(points, sec) {

    clearCanvas();
    // Draw points
    ctx.fillStyle = 'blue';
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, point_radius, 0, Math.PI * 2);
        ctx.fill();
    });


    // Draw enclosing circle
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.arc(sec.center.x, sec.center.y, sec.radius, 0, Math.PI * 2);
    ctx.stroke();
}

function _randomizedSEC(points, i, sec) {
    if(i >= points.length) return sec;
    const p = points[i];
    
    
    //var sec;
    if (checkPointOutsideCircle(sec, p)) {
        // outside
        sec = _randomizedSEC1(points.slice(0, i), p);
    }
    drawCircleAndPoints(points.slice(0, i), sec);
    drawAt(p, 'green');
    setTimeout(() => _randomizedSEC(points, i+1, sec), sleep_time);
}

function randomizedSEC(points){
    let shuffledPoints = randomShuffle(points);

    const p0 = shuffledPoints[0], p1 = shuffledPoints[1];

    let sec = Circle.diameterPoints(p0, p1);
    for(let i = 2; i < shuffledPoints.length; i++) {
        const p2 = shuffledPoints[i];
        if (checkPointOutsideCircle(sec, p2)) {
            // outside
            sec = _randomizedSEC1(shuffledPoints.slice(0, i), p2);
        }
        else {
            continue;
        }
    }
    return sec;
}

// randomized O(n) expected runtime algo
function randomizedSECviz(points) {



    let shuffledPoints = randomShuffle(points);

    const p0 = shuffledPoints[0], p1 = shuffledPoints[1];

    let sec = Circle.diameterPoints(p0, p1);
    
        // if(sleep_time > 0) {
        //     const p2 = shuffledPoints[i];
           // console.log('i = ', i) ;
            sec = _randomizedSEC(shuffledPoints, 0, sec);
            // sleep(sleep_time);
            //drawCircleAndPoints(shuffledPoints.slice(0, i), sec);
        // }
        // else{
        //     const p2 = shuffledPoints[i];
        //     if (checkPointOutsideCircle(sec, p2)) {
        //         // outside
        //         sec = _randomizedSEC1(shuffledPoints.slice(0, i), p2);
        //     }
        //     else {
        //         continue;
        //     }
        // }
    
    return sec;
}

//-----------------------------------------------------------canvas manipulations--------------------------------------------------------------------------------



function clearCanvas() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}



function getClickPosition(e) {
    var p = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
    p.x = p.x * canvas.width / rect.width;
    p.y = p.y * canvas.height / rect.height;
    console.log('Point: ');
    console.log(p.x, p.y);
    //drawAt(p);
    return p;
}

function drawAt(point, color='blue') {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(point.x, point.y, point_radius, 0, Math.PI * 2);
    
    ctx.fill();
  }  

function generateRandomPoints() {
    console.log('width: ', canvas.width);
    console.log('height: ', canvas.height);
    
    var minX = Math.floor(Math.random()*canvas.width*.75) ;
    var maxX = minX + canvas.width*.25;
    console.log('minX, maxX, minY, maxY', minX, maxX, minY, maxY);
    //resetCanvas();
    var numPoints = parseInt(document.getElementById('numPoints').value);
    console.log('read numpoints as ');
    console.log(numPoints);
    //let points = [];

    for(let i=1; i <= numPoints; i++) {
        points.push(Point.getRandomPoint(minX, maxX, minY, maxY));
    }
    // Draw points
    ctx.fillStyle = 'blue';
    points.forEach(point => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, point_radius, 0, Math.PI * 2);
    ctx.fill();
    });
}

function genSECviz() {
    // console.log('Printing points....');
    // console.log(points);
    // var startTime = performance.now();
    randomizedSECviz(points);
//     var endTime = performance.now();
//     var runtime = endTime - startTime;
//     randmizedSECRuntime.value = runtime.toString() + ' ms';
//     console.log(runtime);
//     console.log('Runtime for randmized SEC: ', runtime);
//    // console.log(runtime);
//     startTime = performance.now();
//     const c3 = bruteForceSEC(points);
//     endTime = performance.now();
//     runtime = endTime-startTime;
//     bruteForceSECRuntime.value = runtime.toString() + ' ms';
//     console.log('Runtime for brute force SEC: ', runtime);
    //console.log(runtime);
    // console.log(c1.center);
    // console.log(c1.radius);
    // console.log('center and radius of circle as below');
    // console.log(c2.center);
    // console.log(c2.radius);
}


function genSEC() {
    clearCanvas();
    viz = checkViz();
    if(viz) {
        genSECviz();
        return;
    }
    // Draw points
    ctx.fillStyle = 'blue';
    points.forEach(point => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, point_radius, 0, Math.PI * 2);
    ctx.fill();
    });

    console.log('Printing points....');
    console.log(points);
    var startTime = performance.now();
    const c2 = randomizedSEC(points);
    var endTime = performance.now();
    var runtime = endTime - startTime;
    randmizedSECRuntime.value = runtime.toString() + ' ms';
    console.log(runtime);
    console.log('Runtime for randmized SEC: ', runtime);
   // console.log(runtime);
    startTime = performance.now();
    const c3 = bruteForceSEC(points);
    endTime = performance.now();
    runtime = endTime-startTime;
    bruteForceSECRuntime.value = runtime.toString() + ' ms';
    console.log('Runtime for brute force SEC: ', runtime);
    //console.log(runtime);
    // console.log(c1.center);
    // console.log(c1.radius);
    console.log('center and radius of circle as below');
    console.log(c2.center);
    console.log(c2.radius);

    // Draw enclosing circle
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.arc(c2.center.x, c2.center.y, c2.radius, 0, Math.PI * 2);
    ctx.stroke();

}

function addManualPoints() {
    //points = [];
    canvas.addEventListener('click', function(e) {
        console.log('click detected');
        var point = getClickPosition(e);
        if(checkPoint(point)) {
            drawAt(point);
            points.push(point);
        }
    })
    

}

function resetCanvas() {
    points.length = 0;
    console.log('reset function');
    console.log(points);
    clearCanvas();
}
// ------------------Event listeners--------------------------------------


// Function to draw the point
function drawPoint(x, y) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //ctx.beginPath();
    points[moving_point_idx].x = x;
    points[moving_point_idx].y = y;
    // Draw points
    ctx.fillStyle = 'blue';
    points.forEach(point => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
    ctx.fill();
    });
    // ctx.arc(x, y, point_radius, 0, Math.PI * 2);
    // ctx.fillStyle = 'blue';
    // ctx.fill();
    // ctx.closePath();
}

// Function to handle mouse down event
canvas.addEventListener('mousedown', function(e) {
    console.log('mousedown triggered... ');
    var rect = canvas.getBoundingClientRect();
    var mouseCoords = getClickPosition(e);
    var mouseX = mouseCoords.x;
    var mouseY = mouseCoords.y;
    // var mouseX = e.clientX - rect.left;
    // var mouseY = e.clientY - rect.top;
    for(let i = 0; i < points.length; i++) {
        // Check if the mouse is over the point
        const point = points[i];
        var distance = Math.sqrt(Math.pow(mouseX - point.x, 2) + Math.pow(mouseY - point.y, 2));
        console.log('distance = ', distance);
        
        if (distance <= 10) {
            isDragging = true;
            moving_point_x = point.x;
            moving_point_y = point.y;
            moving_point_idx = i;
            drawAt(point, 'green');
        }
    }
});

// Function to handle mouse move event
canvas.addEventListener('mousemove', function(e) {
    if (isDragging) {
        // var rect = canvas.getBoundingClientRect();
        // var x = e.clientX - rect.left;
        // var y = e.clientY - rect.top;
        var mouseCoords = getClickPosition(e);

        drawPoint(mouseCoords.x, mouseCoords.y);

    }
});

// Function to handle mouse up event
canvas.addEventListener('mouseup', function() {
    isDragging = false;
});






