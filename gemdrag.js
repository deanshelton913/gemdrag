

var GD = {};
GD.GEM_SIZE = 64;
GD.GEM_SPACING = 2;
GD.BOARD_COLS = 5;
GD.BOARD_ROWS = 6;
GD.CANVAS_HEIGHT = 350;
GD.CANVAS_WIDTH = 400;
GD.GEM_SIZE_SPACED = GD.GEM_SIZE + GD.GEM_SPACING;
GD.SELECTED_GEM = null;
GD.GEMS_IN_ENTIRE_PATH = null;
GD.DIRECTIONS = null;
GD.POSITIONS_OF_PERPENDICULAR_RUNS = null;
GD.TESTED_GEMS = {};
GD.FOUND_RUNS = {};
GD.markers = [];

GD.initialize = function(){

  return new Phaser.Game(GD.CANVAS_HEIGHT, GD.CANVAS_WIDTH, Phaser.CANVAS, 'phaser-example', {
    'preload': function() {
      GD.GAME.load.spritesheet("GEMS", "diamonds32x5.png", GD.GEM_SIZE, GD.GEM_SIZE);
    },
    'create': function() {
      GD.GAME.input.addMoveCallback(GD.slideGem, GD);
      GD.GEMS = GD.GAME.add.group();
      GD.spawnBoard();
    },
    'render':function(){
      GD.markers.forEach(function(marker){
        GD.GAME.debug.geom(marker,'rgba(255,255,255, 0.5)');
      });
    }
  });
};

GD.spawnBoard = function(){
  // console.log('spawn board');
  for (var i = 0; i < GD.BOARD_COLS; i++){
    for (var j = 0; j < GD.BOARD_ROWS; j++){
      var gem = GD.GEMS.create(i * GD.GEM_SIZE_SPACED, j * GD.GEM_SIZE_SPACED, "GEMS");
      gem.name = 'gem' + i.toString() + 'x' + j.toString();
      gem.inputEnabled = true;
      gem.events.onInputDown.add(GD.selectGem, GD);
      gem.events.onInputUp.add(GD.releaseGem, GD);
      gem.frame =  GD.GAME.rnd.integerInRange(0, gem.animations.frameTotal - 1);
      GD.setGemPos(gem, i, j);
    }
  }
};

GD.searchForMatches = function() {
  GD.FOUND_RUNS = {}; // reset for every search.
  GD.TESTED_GEMS = {}; // reset for every search.
  GD.markers = [];

  console.log('==========================')
  console.log('beginning search for matching gem combos.')
  GD.GEMS.forEach(function(gem) {
    GD.GEMS_IN_ENTIRE_PATH = [];
    var _directions = GD.visibleRuns(gem);
    GD.POSITIONS_OF_PERPENDICULAR_RUNS = [];
    for(var n=0; n < _directions.length; n++) {

      var oneGemOver = GD.oneGemOver(gem,_directions[n]);
      if(oneGemOver !==  undefined){
        if(GD.TESTED_GEMS[oneGemOver.id] === undefined){
          console.log('- run found, beginning at gem: (x:'+gem.posX+',y:'+gem.posY+') and going '+ _directions[n]);
          var _path = GD.follow(gem, _directions[n]);
          var _color = gem.frame;
          GD.FOUND_RUNS[_color] = (GD.FOUND_RUNS[_color]||[]).concat(_path);
        }
      }
    }
  });
  console.log('- search complete.')
  console.log('- '+Object.keys(GD.FOUND_RUNS).length+ ' run(s) found')
  console.log('--------Summary----------')
  console.log('found runs:',GD.FOUND_RUNS)
};

GD.follow = function(gem, direction) {
  if(GD.TESTED_GEMS[gem.id]){
    console.log('loop path found');
    return GD.GEMS_IN_ENTIRE_PATH; // the path has looped around.
  }
  GD.TESTED_GEMS[gem.id]=true;
  GD.GEMS_IN_ENTIRE_PATH.push(gem);

  GD.markers.push(new Phaser.Rectangle(gem.posX*GD.GEM_SIZE_SPACED, gem.posY*GD.GEM_SIZE_SPACED, GD.GEM_SIZE, GD.GEM_SIZE));
  var _nextGemToCheck = GD.oneGemOver(gem, direction);

  GD.findPerpendicularStarts(gem, direction); //check for other run-starts
  if(_nextGemToCheck !== undefined && gem.frame === _nextGemToCheck.frame){ //  next gem has same color
    return GD.follow(_nextGemToCheck, direction); // recurse
  } else {// end of run.

    while(GD.POSITIONS_OF_PERPENDICULAR_RUNS.length > 0) { // recurse on any found _perpendicular runs.
      var _obj = GD.POSITIONS_OF_PERPENDICULAR_RUNS.shift();
      var _directions = _obj.directions;

      for(var _d = 0; _d < _directions.length; _d++){
        console.log(' ↳ linked run beginning at (x:'+_obj.gem.posX+',y:'+_obj.gem.posY+') and going '+ _directions[_d]+')');
        var new_newgem = GD.oneGemOver(_obj.gem, _directions[_d]);
        return GD.follow(new_newgem, _directions[_d]);
      }
    }
    return GD.GEMS_IN_ENTIRE_PATH;
  }
};

GD.selectGem = function(gem, pointer) {
    // console.log('SELECTED_GEM', gem);
    GD.SELECTED_GEM = gem;
    // GD.SELECTED_GEM_START_POS.x = gem.posX;
    // GD.SELECTED_GEM_START_POS.y = gem.posY;
  };

GD.releaseGem = function(){

  // console.log('up from', GD.SELECTED_GEM);
  GD.searchForMatches();//run the magic.
  GD.SELECTED_GEM = null;
  GD.tempShiftedGem = null;
};

GD.setGemPos = function(gem, posX, posY) {
  gem.posX = posX;
  gem.posY = posY;
  gem.id = GD.calcGemId(posX, posY);
};

GD.calcGemId = function(posX, posY) {
  return posX + posY * GD.BOARD_COLS;
};

GD.gemName = function(gem){
  return gem.x+"-"+gem.y;
};

GD.getGemPos = function(coordinate) {
  return Math.floor(coordinate / GD.GEM_SIZE_SPACED);
};

GD.getGem = function(posX, posY) {
  return GD.GEMS.iterate("id", GD.calcGemId(posX, posY), Phaser.Group.RETURN_CHILD);
};

GD.checkIfGemCanBeMovedHere = function(fromPosX, fromPosY, toPosX, toPosY) {
  if (toPosX < 0 || toPosX >= GD.BOARD_COLS || toPosY < 0 || toPosY >= GD.BOARD_ROWS) {
      return false;
  }

  if (fromPosX === toPosX && fromPosY >= toPosY - 1 && fromPosY <= toPosY + 1) {
      return true;
  }

  if (fromPosY === toPosY && fromPosX >= toPosX - 1 && fromPosX <= toPosX + 1) {
      return true;
  }

  return false;
};

GD.tweenGemPos = function(gem, newPosX, newPosY, durationMultiplier) {

  if (durationMultiplier === null || typeof durationMultiplier === 'undefined')
  {
    durationMultiplier = 1;
  }

  return GD.GAME.add.tween(gem).to({x: newPosX  * GD.GEM_SIZE_SPACED, y: newPosY * GD.GEM_SIZE_SPACED}, 100 * durationMultiplier, Phaser.Easing.Linear.None, true);

};

GD.swapGemPosition = function(gem1, gem2) {

  var tempPosX = gem1.posX;
  var tempPosY = gem1.posY;
  GD.setGemPos(gem1, gem2.posX, gem2.posY);
  GD.setGemPos(gem2, tempPosX, tempPosY);

};


// count how many gems of the same color lie in a given direction
// eg if moveX=1 and moveY=0, it will count how many gems of the same color lie to the right of the gem
// stops counting as soon as a gem of a different color or the board end is encountered
GD.countSameColorGems = function(startGem, moveX, moveY) {

  // var curX = startGem.posX + moveX;
  // var curY = startGem.posY + moveY;

  var curX = startGem.posX + moveX;
  var curY = startGem.posY + moveY;
  var count = 0;

  // while (curX >= 0 && curY >= 0 && curX < BOARD_COLS && curY < BOARD_ROWS && getGemColor(getGem(curX, curY)) === getGemColor(startGem))
  while (GD.getGem(curX,curY) && GD.getGem(curX,curY).frame === startGem.frame)
  {
    count++;
    curX += moveX;
    curY += moveY;
  }

  return count;

};

GD.getGem = function(posX, posY){
  if((posX<0||posX>GD.BOARD_COLS) || (posY < 0 || posY > GD.BOARD_ROWS)){
    return undefined;
  }
  return GD.GEMS.iterate("id", GD.calcGemId(posX, posY), Phaser.Group.RETURN_CHILD);
};

GD.visibleRuns = function(gem){
    directions = [];
    var countRight = GD.countSameColorGems(gem, 1, 0);
    var countLeft = GD.countSameColorGems(gem, -1, 0);
    var countUp = GD.countSameColorGems(gem, 0, -1);
    var countDown = GD.countSameColorGems(gem, 0, 1);
    if(countUp>1){directions.push('up');}
    if(countDown>1){directions.push('down');}
    if(countLeft>1){directions.push('left');}
    if(countRight>1){directions.push('right');}
    return directions;
};

GD.findPerpendicularStarts = function(gem, direction){

  var _found_directions = [];
  switch (direction){
    case 'up':
    case 'down':
      var left = GD.countRun(gem,'left');
      var right = GD.countRun(gem,'right');
      if(left>1|| (right>1 && left>0)){ _found_directions.push('left'); }
      if(right>1|| (left>1 && right>0)){ _found_directions.push('right'); }
      break;
    case 'left':
    case 'right':
      var up = GD.countRun(gem,'up');
      var down = GD.countRun(gem,'down');
      if(up>1|| (down>1 && up>0)){ _found_directions.push('up'); }
      if(down>1 || (up>1 && down>0)){ _found_directions.push('down'); }
      break;
  }


  if(_found_directions.length > 0){
    return GD.POSITIONS_OF_PERPENDICULAR_RUNS.push({ 'gem':gem, 'directions': _found_directions });
  }
  return false;
};

GD.countRun = function(gem, direction){
  var count = 0;
  switch(direction) {
    case 'up':
      count = GD.countSameColorGems(gem, 0, -1);
      break;
    case 'right':
      count = GD.countSameColorGems(gem, 1, 0);
      break;
    case 'down':
      count = GD.countSameColorGems(gem, 0, 1);
      break;
    case 'left':
      count = GD.countSameColorGems(gem, -1, 0);
    break;
  }
  return count;
};

GD.oneGemOver = function(gem, direction){
  switch(direction) {
    case 'up':
      new_x = gem.posX;
      new_y = gem.posY-1;
      break;
    case 'right':
      new_x = gem.posX+1;
      new_y = gem.posY;
      break;
    case 'down':
      new_x = gem.posX;
      new_y = gem.posY+1;
      break;
    case 'left':
      new_x = gem.posX-1;
      new_y = gem.posY;
    break;
  }

  if(new_x >= GD.BOARD_COLS || new_y >= GD.BOARD_ROWS){
    return undefined;
  }

  return GD.getGem(new_x,new_y);
};


GD.slideGem = function(pointer, x, y, fromClick) {
  if (pointer.isDown && GD.SELECTED_GEM) {
    var cursorGemPosX = GD.getGemPos(x);
    var cursorGemPosY = GD.getGemPos(y);
    if(GD.checkIfGemCanBeMovedHere(GD.SELECTED_GEM.posX, GD.SELECTED_GEM.posY, cursorGemPosX, cursorGemPosY)) {
      GD.GEMS.bringToTop(GD.SELECTED_GEM); // bring GD.SELECTED_GEM to top
      GD.tempShiftedGem = GD.getGem(cursorGemPosX, cursorGemPosY); // Get under-gem
      GD.selectedGemTween = GD.tweenGemPos(GD.SELECTED_GEM, cursorGemPosX, cursorGemPosY); // selected slides over under-gem
      underGemTween = GD.tweenGemPos(GD.tempShiftedGem, GD.SELECTED_GEM.posX , GD.SELECTED_GEM.posY);
      GD.swapGemPosition(GD.SELECTED_GEM, GD.tempShiftedGem);
    }
  }
};
