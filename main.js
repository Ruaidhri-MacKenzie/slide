const canvas = document.querySelector(".game-window");
const ctx = canvas.getContext("2d");

class Puzzle {
	constructor(width, height, columns, rows) {
		this.width = width;
		this.height = height;
		canvas.setAttribute('width', width);
		canvas.setAttribute('height', height);
		canvas.rect = canvas.getBoundingClientRect();

		this.columns = columns;
		this.rows = rows;
		this.tileWidth = width / columns;
		this.tileHeight = height / rows;
		
		this.tiles = [];
		for (let y = 0; y < rows; y++) {
			this.tiles[y] = [];
			for (let x = 0; x < columns; x++) {
				this.tiles[y][x] = (y * columns) + x;
			}
		}
		this.selectedTile = {x: 0, y: 0};
		
		canvas.addEventListener('click', e => this.onClick(e));
		this.draw();
	}

	onClick(e) {
		const x = Math.floor((e.x - canvas.rect.left) / this.tileWidth);
		const y = Math.floor((e.y - canvas.rect.top) / this.tileHeight);
		this.switchTiles(x, y);
	}

	switchTiles(x, y) {
		const x2 = this.selectedTile.x;
		const y2 = this.selectedTile.y;
		const distanceX = Math.abs(x - x2);
		const distanceY = Math.abs(y - y2);

		if ((distanceX === 1 && y === y2) || (distanceY === 1 && x === x2)) {
			const temp = this.tiles[y][x];
			this.tiles[y][x] = this.tiles[y2][x2];
			this.tiles[y2][x2] = temp;
			this.selectedTile = {x, y};
			this.draw();
		}
		else {
			console.log("Invalid Move");
		}
	}

	draw() {
		ctx.clearRect(0, 0, this.width, this.height);
		ctx.font = "30px Arial";
		for (let y = 0; y < this.rows; y++) {
			for (let x = 0; x < this.columns; x++) {
				if (this.tiles[y][x] === 0) ctx.fillStyle = '#000';
				else ctx.fillStyle = '#00f';
				ctx.fillRect(x * this.tileWidth, y * this.tileHeight, this.tileWidth, this.tileHeight);

				ctx.strokeRect(x * this.tileWidth, y * this.tileHeight, this.tileWidth, this.tileHeight);

				if (this.tiles[y][x] === 0) ctx.fillStyle = '#000';
				else ctx.fillStyle = '#ff0';
				ctx.fillText(this.tiles[y][x], (x * this.tileWidth) + (this.tileWidth / 2), (y * this.tileHeight) + (this.tileHeight / 2));
			}
		}
	}
}

const slide = new Puzzle(400, 500, 3, 4);
