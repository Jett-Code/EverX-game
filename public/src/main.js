
$(function() {
        
  //REQUEST ANIM FRAME---------------------------------
  // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
  // requestAnimationFrame polyfill by Erik M�ller
  // fixes from Paul Irish and Tino Zijdel
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
  //--------------------------------------------
  
  //MOUSE POSITION------------------------------------------
  function getMousePos(canvas, evt) {
    // get canvas position
    var obj = canvas;
    var top = 0;
    var left = 0;
    while (obj && obj.tagName != 'BODY') {
      top += obj.offsetTop;
      left += obj.offsetLeft;
      obj = obj.offsetParent;
    }
   
    // return relative mouse position
    var mouseX = evt.clientX - left + window.pageXOffset;
    var mouseY = evt.clientY - top + window.pageYOffset;
    return {
      x: mouseX,
      y: mouseY
    }
  }
  //--------------------------------------------------------
  
  function getTouchPos(canvas, x, y) {
    // get canvas position
    var obj = canvas;
    var top = 0;
    var left = 0;
    while (obj && obj.tagName != 'BODY') {
      top += obj.offsetTop;
      left += obj.offsetLeft;
      obj = obj.offsetParent;
    }
   
    // return relative mouse position
    var mouseX = x - left + window.pageXOffset;
    var mouseY = y - top + window.pageYOffset;
    return {
      x: mouseX,
      y: mouseY
    }
  }
  //--------------------------------------------------------
  
  //HELPFUL DEFBUG GUY-------------------------------
  function displayTest(output) {
    //Set the text font and color
    ctx.fillStyle = 'rgb(255,255,255)';
    ctx.font = "18px Helvetica, Ariel";

    ctx.fillText(output ,500,30);
  
  }
  //-------------------------------------------
  
  //INIT VARS---------------------------------
  //the canvas where everything goes
  var cvs = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  cvs.width = 700;
  cvs.height = 460;
  
  
  //make updates for mobile
  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) 
  {
    cvs.style.width = window.innerWidth;
    cvs.style.height = 460;
    //cvs.height = (window.innerHeight * (cvs.width / window.innerWidth));
    cvs.width = window.innerWidth;
    //cvs.height = window.innerHeight/2;
    //ctx.scale(1,0.5);
    //resizeTo(canvas,0.5,0.5)
    //cvs.width = 500;
    //cvs.height = 460;
  }
  
  
  //animation
  var loop;
  var fps = 60;
  
  //the game world that runs it all
  var gWorld = new gameWorld(6);
  gWorld.w = cvs.width;
  gWorld.h = cvs.height;
  
  //various UI buttons
  var startBox = new clickBox({
      //x: 500,
      x:350/700*cvs.width,
      y: cvs.height-80,
      w: 100,
      h: 60,
      active: true,
      draw: startImg
    });
    
  var pauseBtn = new clickBox({
    x: cvs.width - 40,
    y: 10,
    w: 30,
    h: 30,
    active: false,
    draw: pauseImg
  });
  
  var soundBtn = new clickBox({
    x: cvs.width - 80,
    y: 10,
    w: 20,
    h: 20,
    active: false,
    draw: soundImg
  });
    
  var touchRightBtn = new clickBox({
    x: cvs.width - 300,
    y: 30,
    w: 300,
    h: cvs.height-50,
    active: false
  });
  
  var touchLeftBtn = new clickBox({
    x: 0,
    y: 30,
    w: 300,
    h: cvs.height-50,
    active: false
  });
  
  var replayBtn = new clickBox({
    x: cvs.width / 2 - 50,
    y: cvs.height /2 + 30,
    w: 110,
    h: 40,
    active: false,
    draw: replayImg
  });
  //--------------------------------------------

  function togglePause() {
    if (gWorld.state === 'RUNNING') {
        gWorld.state = 'PAUSE';
        pauseBtn.draw = playImg;
      } else if (gWorld.state === 'PAUSE') {
        gWorld.state = 'RUNNING';
        pauseBtn.draw = pauseImg;
        gameLoop();
      }
  }
  
  function toggleSound() {
    if (gWorld.sound) {
      gWorld.sound = false;
      soundBtn.draw = muteImg;
    } else {
      gWorld.sound = true
      soundBtn.draw = soundImg;
    }
  }
  
  //HANDLING SOME CLICK AND KEY EVENTS----------
  var hammer = new Hammer(document.getElementById("canvas"));
  hammer.hold_timeout = 10;
  
  hammer.onrelease = function(evt)
  {
      gWorld.keyPressed.right = false;
      gWorld.keyPressed.left = false;
  }
  
  hammer.ontap = function(evt)
  {
    var t = getTouchPos(cvs, evt.touches[0].x, evt.touches[0].y);
    //ctx.fillText(t.x + ', ' + t.y, 100,100);
      
    if (startBox.testClick(t.x, t.y)) 
    {
      startBox.active = false;
      startGame();
    }
    
    if (pauseBtn.testClick(t.x, t.y)) {
      togglePause();
    }
    
    if (soundBtn.testClick(t.x, t.y)) {
      toggleSound();
    }
    
    if (touchRightBtn.testClick(t.x,t.y)){
      gWorld.keyPressed.right = true;
    }
    
    if (touchLeftBtn.testClick(t.x,t.y)){
      gWorld.keyPressed.left = true;
    }
    
    if (replayBtn.testClick(t.x, t.y)) {
      startGame();
    }

  }
  
  hammer.onhold = function(evt)
  {
    var t = getTouchPos(cvs, evt.touches[0].x, evt.touches[0].y);
    
    if (touchRightBtn.testClick(t.x,t.y)){
      gWorld.keyPressed.right = true;
    }
    
    if (touchLeftBtn.testClick(t.x,t.y)){
      gWorld.keyPressed.left = true;
    }
  }
  
  
  /*cvs.addEventListener('mousedown', function(evt)
  {
    var mousePos = getMousePos(cvs, evt);

    if (startBox.testClick(mousePos.x, mousePos.y)) {
      startBox.active = false;
      startGame();
    }
    
    if (pauseBtn.testClick(mousePos.x, mousePos.y)) {
      togglePause();
    }
    
    if (soundBtn.testClick(mousePos.x, mousePos.y)) {
      toggleSound();
    }
  });*/
  
  window.addEventListener('keydown', function(e) {
    //on main screen "enter" = start
    if (e.keyCode === 13) {
      if (gWorld.state === 'MAIN' || gWorld.state === 'END') {
        startGame();
        
      }
    }
    
    //"p" = pause
    if (e.keyCode === 80) {
      togglePause();
    }
    
    //"s" = toggle sound
    if (e.keyCode === 83) {
      toggleSound();
    }
    
    //"arrow right" = move right
    //"arrow left" = move left
    if (e.keyCode === 39) {
      gWorld.keyPressed.right = true;
    } else if (e.keyCode === 37){
      gWorld.keyPressed.left = true;
    }
    
    
  });
  
  window.addEventListener('keyup', function(e) {
    //stop moving
    if (e.keyCode === 39) {
      gWorld.keyPressed.right = false;
    } else if (e.keyCode === 37){
      gWorld.keyPressed.left = false;
    }
  });
  //--------------------------------------------
  
  //INTRO AND INSTRUCTIONS----------------------------
  //the starting screen for game
  function mainScreen() {
    startSplash(ctx);
    startBox.draw(ctx);
    
  }
  //--------------------------------------------
  
  //END Game-----------------------------------------
  function endScreen() {
    ctx.fillStyle = 'rgb(255,255,255)';
    ctx.font = "italic 80px Impact, Helvetica, Ariel";
    
    ctx.fillText("GAME OVER" ,cvs.width / 2 - 200 ,cvs.height / 2);
    
    replayBtn.active = true;
    replayBtn.draw(ctx);
  }
  //-------------------------------------------------
  
  //INIT AND RUN GAME-----------------------------------
  function startGame() {
    //init the game
    gWorld = new gameWorld(6);
    gWorld.w = cvs.width;
    gWorld.h = cvs.height;
    
    gWorld.state = 'RUNNING';
    gWorld.addObject(makeGround(gWorld.w, gWorld.h));
    gWorld.addObject(makeCanopy(gWorld.w));
    gWorld.addObject(makesnow(gWorld.w, gWorld.h));
    //gWorld.addObject(makeWalker(gWorld.w, gWorld.h));
    //gWorld.addObject(makeWalker(gWorld.w, gWorld.h,true));
    gWorld.addObject(makePlayer());
    
    startBox.active = false;
    pauseBtn.active = true;
    soundBtn.active = true;
    touchRightBtn.active = true;
    touchLeftBtn.active = true;
    replayBtn.active = false;
    
    gameLoop();
  }
  //--------------------------------------------
  
  //ANIMATE AND UPDATE GAMELOOP----------------
  function gameLoop() {
    setTimeout(function() {

      loop = window.requestAnimationFrame(gameLoop);
      
      gWorld.updateGameObjects();
      gWorld.drawGame(ctx);
      gWorld.removeDeadObjects();
      gWorld.addNewObjects();
        
      pauseBtn.draw(ctx); 
      soundBtn.draw(ctx);
      
      if (gWorld.state === 'PAUSE' || gWorld.state === 'END') {
        window.cancelAnimationFrame(loop);
        
        if (gWorld.state === 'END') 
        {
          endScreen();
        }
      }

    }, 1000 / fps);
  }
  //--------------------------------------------
  
  //LOAD THE MAIN SCREEN------------------------
  mainScreen();
  //--------------------------------------------
});