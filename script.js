import Grid from "./Grid.js";

import Tile from "./Tile.js";

const gameBoard = document.getElementById("game-board");

const grid = new Grid(gameBoard);

// Creating Starting 2 Tiles
grid.randomEmptyCell().tile = new Tile(gameBoard);
grid.randomEmptyCell().tile = new Tile(gameBoard);

//To Start A Game
setUpInput();
function setUpInput() {
  gameBoard.addEventListener("swiped", handleMobileInput, { once: true });
  window.addEventListener("keydown", handleInput, { once: true });
}

async function handleMobileInput(e) {
  switch (e.detail.dir) {
    case "up":
      if (!canMoveUp()) {
        setUpInput();
        return;
      }
      await moveUp();
      break;
    case "down":
      e.preventDefault();
      if (!canMoveDown()) {
        setUpInput();
        return;
      }
      await moveDown();
      break;
    case "left":
      if (!canMoveLeft()) {
        setUpInput();
        return;
      }
      await moveLeft();
      break;
    case "right":
      if (!canMoveRight()) {
        setUpInput();
        return;
      }
      await moveRight();
      break;
    default:
      setUpInput();
      return;
  }

  grid.cells.forEach((cell) => cell.mergeTiles());

  const newTile = new Tile(gameBoard);
  grid.randomEmptyCell().tile = newTile;

  if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
    newTile.waitForTransition(true).then(() => {
      alert("Game Over!\nRefresh the page for a new one!");
    });
    return;
  }

  setUpInput();
}

async function handleInput(e) {
  switch (e.key) {
    case "ArrowUp":
      if (!canMoveUp()) {
        setUpInput();
        return;
      }
      await moveUp();
      break;
    case "ArrowDown":
      if (!canMoveDown()) {
        setUpInput();
        return;
      }
      await moveDown();
      break;
    case "ArrowLeft":
      if (!canMoveLeft()) {
        setUpInput();
        return;
      }
      await moveLeft();
      break;
    case "ArrowRight":
      if (!canMoveRight()) {
        setUpInput();
        return;
      }
      await moveRight();
      break;
    default:
      setUpInput();
      return;
  }

  grid.cells.forEach((cell) => cell.mergeTiles());

  const newTile = new Tile(gameBoard);
  grid.randomEmptyCell().tile = newTile;

  if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
    newTile.waitForTransition(true).then(() => {
      alert("YOU LOSE");
    });
    return;
  }

  setUpInput();
}

function moveUp() {
  slideTiles(grid.cellsByColumn);
}

function moveDown() {
  slideTiles(grid.cellsByColumn.map((column) => [...column].reverse()));
}

function moveRight() {
  slideTiles(grid.cellsByRow.map((row) => [...row].reverse()));
}

function moveLeft() {
  slideTiles(grid.cellsByRow);
}

// slide the tiles in the cells
function slideTiles(cells) {
  return Promise.all(
    cells.flatMap((group) => {
      //This array of Promise objects is used to ensure that all tile movements have finished before the next move is made.

      const promises = [];

      //iterates over the cells in the group (except the first one)
      for (let i = 1; i < group.length; i++) {
        const cell = group[i];

        if (cell.tile == null) continue; //It checks if the cell has a tile. If not, it skips to the next cell.
        let lastValidCell; //It finds the last valid cell in the group to which the current cell's tile can move.
        for (let j = i - 1; j >= 0; j--) {
          const moveToCell = group[j];
          if (!moveToCell.canAccept(cell.tile)) break;

          lastValidCell = moveToCell;
        }

        if (lastValidCell != null) {
          promises.push(cell.tile.waitForTransition());
          if (lastValidCell.tile != null) {
            //If the last valid cell already has a tile, the mergeTile property of that cell is set to the current cell's tile, indicating that the tiles should be merged in the next step.
            lastValidCell.mergeTile = cell.tile;
          } else {
            lastValidCell.tile = cell.tile; //If the last valid cell does not have a tile, the tile from the current cell is moved to that cell.
          }
          cell.tile = null;
        }
      }

      return promises;
    })
  );
}

function canMove(cells) {
  return cells.some((group) => {
    return group.some((cell, index) => {
      if (index == 0) return false; // checking if on the boundary
      if (cell.tile == null) return false; // checking if it has any Tile (if it does not have any tile that means it would not have any  value too so there is no need to move that tile )

      const moveToCell = group[index - 1]; //move to one above
      return moveToCell.canAccept(cell.tile);
    });
  });
}

//Check whether you can move up or Not
function canMoveUp() {
  return canMove(grid.cellsByColumn);
}
//Check whether you can move down or Not
function canMoveDown() {
  return canMove(grid.cellsByColumn.map((column) => [...column].reverse()));
}
//Check whether you can move left or Not
function canMoveLeft() {
  return canMove(grid.cellsByRow);
}
//Check whether you can move right or Not
function canMoveRight() {
  return canMove(grid.cellsByRow.map((row) => [...row].reverse()));
}
