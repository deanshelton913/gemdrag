function follow(gem, direction) {
  if(_tested_gems[gemName(gem)]){
    return _gems_in_entire_path; // the path has looped around.
  }
  _tested_gems[gemName(gem)]=true;
  _gems_in_entire_path.push(gem);

  var _nextGemToCheck = oneGemOver(gem,direction);

  findPerpendicularStarts(gem, direction); //check for other run-starts

  if(_nextGemToCheck !== undefined && gem.c === _nextGemToCheck.c){ //  next gem has same color
    return follow(_nextGemToCheck, direction); // recurse
  } else {// end of run.

    while(_positions_of_perpendicular_runs.length > 0) { // recurse on any found _perpendicular runs.
      var _obj = _positions_of_perpendicular_runs.shift();
      var _directions = _obj.directions;

      for(var _d = 0; _d < _directions.length; _d++){
        console.log(' ↳ linked run beginning at (x:'+_obj.gem.x+',y:'+_obj.gem.y+') and going '+ _directions[_d]+')');
        var new_new_gem = oneGemOver(_obj.gem, _directions[_d]);
        return follow(new_new_gem, _directions[_d]);
      }
    };
    return _gems_in_entire_path;
  }
}

function gemName(gem){
  return gem.x+"-"+gem.y;
}

function findPerpendicularStarts(gem, direction){
  var _found_directions = [];
  switch (direction){
    case 'up':
    case 'down':
      var left = countRun(gem,'left');
      var right = countRun(gem,'right');
      if(left>0){ _found_directions.push('left') }
      if(right>0){ _found_directions.push('right') }
      break;
    case 'left':
    case 'right':
      var up = countRun(gem,'up');
      var down = countRun(gem,'down');
      if(up>0){ _found_directions.push('up') }
      if(down>0){ _found_directions.push('down') }
      break;
  }

  if(_found_directions.length>0){
    return _positions_of_perpendicular_runs.push({ 'gem':gem, 'directions': _found_directions });
  }
  return false;
}

function countRun(gem, direction){
  var count = 0;
  switch(direction) {
    case 'up':
      count = countSameColorGems(gem, 0, -1);
      break;
    case 'right':
      count = countSameColorGems(gem, 1, 0);
      break;
    case 'down':
      count = countSameColorGems(gem, 0, 1);
      break;
    case 'left':
      count = countSameColorGems(gem, -1, 0);
    break;
  }
  return count;
}

function oneGemOver(gem, direction){
  switch(direction) {
    case 'up':
      new_x = gem.x;
      new_y = gem.y-1;
      break;
    case 'right':
      new_x = gem.x+1;
      new_y = gem.y;
      break;
    case 'down':
      new_x = gem.x;
      new_y = gem.y+1;
      break;
    case 'left':
      new_x = gem.x-1;
      new_y = gem.y;
    break;
  }
  return findGem(new_x,new_y);
}


function visibleRuns(gem){
    directions = [];
    var countRight = countSameColorGems(gem, 1, 0);
    var countLeft = countSameColorGems(gem, -1, 0);
    var countUp = countSameColorGems(gem, 0, -1);
    var countDown = countSameColorGems(gem, 0, 1);
    if(countUp>1){directions.push('up');}
    if(countDown>1){directions.push('down');}
    if(countLeft>1){directions.push('left');}
    if(countRight>1){directions.push('right');}
    return directions;
}


function findGem(x,y){
  for(var i=0;i<UNTESTED_GEMS.length;i++){
    if(UNTESTED_GEMS[i].x === x && UNTESTED_GEMS[i].y === y){
      return UNTESTED_GEMS[i];
    }
  }
  return false;
}








//loop
var UNTESTED_GEMS = [
  {'x':0,'y':0,'c':0},
  {'x':0,'y':1,'c':0},
  {'x':0,'y':2,'c':0},
  {'x':0,'y':3,'c':3},
  {'x':0,'y':4,'c':2},
  {'x':1,'y':0,'c':0},
  {'x':1,'y':1,'c':0},
  {'x':1,'y':2,'c':0},
  {'x':1,'y':3,'c':3},
  {'x':1,'y':4,'c':2},
  {'x':2,'y':0,'c':0},
  {'x':2,'y':1,'c':0},
  {'x':2,'y':2,'c':8},
  {'x':2,'y':3,'c':4},
  {'x':2,'y':4,'c':3},
  {'x':3,'y':0,'c':0},
  {'x':3,'y':1,'c':4},
  {'x':3,'y':2,'c':2},
  {'x':3,'y':3,'c':1},
  {'x':3,'y':4,'c':1},
  {'x':4,'y':0,'c':4},
  {'x':4,'y':1,'c':2},
  {'x':4,'y':2,'c':2},
  {'x':4,'y':3,'c':2},
  {'x':4,'y':4,'c':5}
]
// var UNTESTED_GEMS = [
//   {'x':0,'y':0,'c':0},//1a
//   {'x':0,'y':1,'c':0},//1b
//   {'x':0,'y':2,'c':0},//1c
//   {'x':0,'y':3,'c':0},//1d & 2a
//   {'x':0,'y':4,'c':3},//-------z1
//   {'x':1,'y':0,'c':3},
//   {'x':1,'y':1,'c':2},
//   {'x':1,'y':2,'c':2},
//   {'x':1,'y':3,'c':0},//2b
//   {'x':1,'y':4,'c':3},//-------z2
//   {'x':2,'y':0,'c':3},
//   {'x':2,'y':1,'c':0},//3c & 4a
//   {'x':2,'y':2,'c':0},//3b
//   {'x':2,'y':3,'c':0},//2c & 3a
//   {'x':2,'y':4,'c':3},//-------z3
//   {'x':3,'y':0,'c':2},
//   {'x':3,'y':1,'c':0},//4b
//   {'x':3,'y':2,'c':2},
//   {'x':3,'y':3,'c':0},//2d
//   {'x':3,'y':4,'c':1},
//   {'x':4,'y':0,'c':2},
//   {'x':4,'y':1,'c':0},//4c
//   {'x':4,'y':2,'c':1},
//   {'x':4,'y':3,'c':2},
//   {'x':4,'y':4,'c':2}
// ]

var _all_paths = [];
var _all_colors = {};
var _tested_gems = {};

console.log('==========================')
console.log('beginning search for matching gem combos.')

for(var _gem_id=0; _gem_id < UNTESTED_GEMS.length; _gem_id++) {
  var _gems_in_entire_path = [];
  var _directions = visibleRuns(UNTESTED_GEMS[_gem_id]);
  var _positions_of_perpendicular_runs = [];

  for(var n=0; n < _directions.length; n++) {
    _g = UNTESTED_GEMS[_gem_id];

    if(_tested_gems[gemName(_g)] === undefined){
      console.log('run found, beginning at gem:'+_gem_id+' (x:'+_g.x+',y:'+_g.y+') and going '+ _directions[n]+')');
      path = follow(UNTESTED_GEMS[_gem_id], _directions[n]);
      color = UNTESTED_GEMS[_gem_id].c;

      _all_paths.push({'c':color,'gems':path});
      _all_colors[color] = (_all_colors[color]||[]).concat(path);
    };
  };
};


console.log('--------Summary----------')
console.log(_all_colors);
var i=1;
_all_paths.forEach(function(obj){
  console.log('--- Combo '+i+' ---');
  console.log('Color = '+obj.c+' Length = '+obj.gems.length)
  i++;
});
console.log('==========================')
