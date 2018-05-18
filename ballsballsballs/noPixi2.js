

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
            || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());


(function() {

  var width, height, largeHeader, canvas, ctx, triangles, target, animateHeader = true, mouse = { x: 0, y: 0 };
    var colors = ['72,35,68', '43,81,102', '66,152,103', '250,178,67', '224,33,48'];

    // Main
    initHeader();
    addListeners();
    initAnimation();

    function initHeader() {
        width = window.innerWidth;
        height = window.innerHeight;
        target = {x: 0, y: height};
        mouse.x = width*0.5;
        mouse.y = height*0.5;

        largeHeader = document.getElementById('large-header');
        largeHeader.style.height = height+'px';

        canvas = document.getElementById('demo-canvas');
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');
        

        // create particles
        triangles = [];
        for(var x = 0; x < 1000; x++) {
            addTriangle(x*10);
        }
    }

    function addTriangle(delay) {
        setTimeout(function() {
            var t = new Triangle();
            triangles.push(t);
            tweenTriangle(t);
        }, delay);
    }

    function initAnimation() {
        animate();
    }

    function tweenTriangle(tri) {
        var t = Math.random()*(2*Math.PI);
        var x = (200+Math.random()*100)*Math.cos(t) + mouse.x;
        var y = (200+Math.random()*100)*Math.sin(t) + mouse.y;
        var time = 4+3*Math.random();

        TweenLite.to(tri.pos, time, {
            x: x,
            y: y, 
            r: ((2000*Math.random())-1000),
            ease:Back.easeOut, 
            onComplete: function() {
                tri.init();
                tweenTriangle(tri);
        }});
    }

    // Event handling
    function addListeners() {
        window.addEventListener('scroll', scrollCheck);
        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', onMouseMove);
    }
  
    function onMouseMove (e) {
      mouse.x = e.pageX;
      mouse.y = e.pageY;
    }

    function scrollCheck() {
        if(document.body.scrollTop > height) animateHeader = false;
        else animateHeader = true;
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        largeHeader.style.height = height+'px';
        canvas.width = width;
        canvas.height = height;
    }

    function animate() {
        if(animateHeader) {
            ctx.clearRect(0,0,width,height);
            for(var i in triangles) {
                triangles[i].draw();
            }
        }
        requestAnimationFrame(animate);
    }

    // Canvas manipulation
    function Triangle() {
        var _this = this;

        // constructor
        (function() {
            _this.coords = [{},{},{}];
            _this.pos = {};
            init();
        })();
      
        function randColor (base, range) {
          return base+Math.floor(Math.random()*range);
        }

        function init() {
            _this.pos.x = mouse.x;
            _this.pos.y = mouse.y;
            _this.pos.r = 0;
            _this.coords[0].x = -20+Math.random()*40;
            _this.coords[0].y = -20+Math.random()*40;
            _this.coords[1].x = -20+Math.random()*40;
            _this.coords[1].y = -20+Math.random()*40;
            _this.coords[2].x = -20+Math.random()*40;
            _this.coords[2].y = -20+Math.random()*40;
            _this.scale = 0.1+Math.random()*0.3;
            _this.color = randColor(150,50)+','+randColor(200,50)+','+randColor(200,50);
            //colors[Math.floor(Math.random()*colors.length)];
            setTimeout(function() { _this.alpha = 0.8; }, 10);
        }

        this.draw = function() {
            if(_this.alpha >= 0.005) _this.alpha -= 0.005;
            else _this.alpha = 0;
            ctx.save();
          //ctx.globalCompositeOperation = 'lighten';
            ctx.translate(Math.floor(_this.pos.x),Math.floor(_this.pos.y));
            ctx.rotate( _this.pos.r*(Math.PI/180) );  
         
            ctx.beginPath();
            ctx.moveTo(_this.coords[0].x, _this.coords[0].y);
            ctx.lineTo(_this.coords[1].x, _this.coords[1].y);
            ctx.lineTo(_this.coords[2].x, _this.coords[2].y);
            ctx.closePath();
            ctx.fillStyle = 'rgba('+_this.color+','+ _this.alpha+')';
            ctx.fill();
            ctx.restore();
        };

        this.init = init;
    }
    
})();