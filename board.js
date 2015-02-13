/*
The more i write this, the more i realize it is an extention of a
game. Should this go on the game prototype?
hmm... maybe after i am more familiar with this i can refactor in a way that makes more sense.

*/
Board = function(boardConfig, game) {
  this.GEM_SIZE = boardConfig.GEM_SIZE;
  this.GEM_SPACING = boardConfig.GEM_SPACING;
  this.BOARD_COLS = boardConfig.BOARD_COLS;
  this.BOARD_ROWS = boardConfig.BOARD_ROWS;
  this.GEM_SIZE_SPACED = boardConfig.GEM_SIZE_SPACED();
  this.game = game; // Should the board really store a public member of the game instance?
  this.gems = game.add.group();
  this.selectedGemStartPos = {};
  this.selectedGem = null;

  this.spawn = function(){

    for (var i = 0; i < this.BOARD_COLS; i++){
      for (var j = 0; j < this.BOARD_ROWS; j++){
        var gem = this.gems.create(i * this.GEM_SIZE_SPACED, j * this.GEM_SIZE_SPACED, "GEMS");
        gem.name = 'gem' + i.toString() + 'x' + j.toString();
        gem.inputEnabled = true;
        gem.events.onInputDown.add(GemDrag.board.selectGem, this);
        gem.events.onInputUp.add(GemDrag.board.releaseGem, this);
        gem.frame =  this.game.rnd.integerInRange(0, gem.animations.frameTotal - 1);
        gem.name = GemDrag.board.gemName(gem);
        this.setGemPos(gem, i, j);
      }
    }
  };

  this.selectGem = function(gem, pointer) {
    console.log('selectedGem', gem);
    this.selectedGem = gem;
    this.selectedGemStartPos.x = gem.posX;
    this.selectedGemStartPos.y = gem.posY;
  };

  this.releaseGem = function(){

    console.log('up from', this.selectedGem);
    //run the magic.

    this.selectedGem = null;
    this.tempShiftedGem = null;
  };

  this.setGemPos = function(gem, posX, posY) {
    gem.posX = posX;
    gem.posY = posY;
    gem.id = this.calcGemId(posX, posY); // should introspect...
  };

  this.calcGemId = function(posX, posY) {
    return posX + posY * this.BOARD_COLS;
  };

  this.gemName = function(gem){
    return gem.x+"-"+gem.y;
  };

  this.getGemPos = function(coordinate) {
    return Math.floor(coordinate / this.GEM_SIZE_SPACED);
  };

  this.getGem = function(posX, posY) {
    return this.gems.iterate("id", this.calcGemId(posX, posY), Phaser.Group.RETURN_CHILD);
  }

  this.checkIfGemCanBeMovedHere = function(fromPosX, fromPosY, toPosX, toPosY) {
    if (toPosX < 0 || toPosX >= this.BOARD_COLS || toPosY < 0 || toPosY >= this.BOARD_ROWS) {
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

  this.tweenGemPos = function(gem, newPosX, newPosY, durationMultiplier) {

    if (durationMultiplier === null || typeof durationMultiplier === 'undefined')
    {
      durationMultiplier = 1;
    }

    return game.add.tween(gem).to({x: newPosX  * this.GEM_SIZE_SPACED, y: newPosY * this.GEM_SIZE_SPACED}, 100 * durationMultiplier, Phaser.Easing.Linear.None, true);

  }

  this.swapGemPosition = function(gem1, gem2) {

    var tempPosX = gem1.posX;
    var tempPosY = gem1.posY;
    this.setGemPos(gem1, gem2.posX, gem2.posY);
    this.setGemPos(gem2, tempPosX, tempPosY);

  }


  this.slideGem = function(pointer, x, y, fromClick) {
    if (pointer.isDown && GemDrag.board.selectedGem) {
      var cursorGemPosX = GemDrag.board.getGemPos(x);
      var cursorGemPosY = GemDrag.board.getGemPos(y);
      if(GemDrag.board.checkIfGemCanBeMovedHere(GemDrag.board.selectedGem.posX, GemDrag.board.selectedGem.posY, cursorGemPosX, cursorGemPosY)) {
        GemDrag.board.gems.bringToTop(GemDrag.board.selectedGem); // bring GemDrag.board.selectedGem to top
        this.tempShiftedGem = GemDrag.board.getGem(cursorGemPosX, cursorGemPosY); // Get under-gem
        GemDrag.board.selectedGemTween = GemDrag.board.tweenGemPos(GemDrag.board.selectedGem, cursorGemPosX, cursorGemPosY); // selected slides over under-gem
        underGemTween = GemDrag.board.tweenGemPos(this.tempShiftedGem, GemDrag.board.selectedGem.posX , GemDrag.board.selectedGem.posY);
        GemDrag.board.swapGemPosition(GemDrag.board.selectedGem, this.tempShiftedGem);
      }
    }
  };
}
