class Puzzle {
	constructor(config) {
		this.canvas = document.querySelector(".game-window");
		this.ctx = this.canvas.getContext("2d");

		document.addEventListener('keydown', e => this.onKeyDown(e));
		this.canvas.addEventListener('touchstart', e => this.onTouchStart(e));
		this.canvas.addEventListener('touchend', e => this.onTouchEnd(e));
		this.canvas.addEventListener('click', e => this.onClick(e));
		this.canvas.addEventListener('contextmenu', e => {
			e.preventDefault();
			this.onClick(e);
		});
		this.dragX = null;
		this.dragY = null;

		this.newGame(config);
	}

	newGame({ image = "blank.jpg", columns = 4, rows = 4, emptyX = 0, emptyY = 0 }) {
		this.image = new Image();
		this.image.onload = () => {
			this.width = this.image.width;
			this.height = this.image.height;

			this.canvas.setAttribute('width', this.width);
			this.canvas.setAttribute('height', this.height);

			this.columns = columns;
			this.rows = rows;
			this.tileWidth = this.width / columns;
			this.tileHeight = this.height / rows;
			
			this.tiles = [];
			for (let y = 0; y < rows; y++) {
				for (let x = 0; x < columns; x++) {
					const tile = {id: (y * columns) + x, x, y, imgX: x, imgY: y};
					if (x === emptyX && y === emptyY) this.emptyTile = tile;
					this.tiles.push(tile);
				}
			}

			this.startGame();
		}
		this.image.src = image;
	}

	onClick(e) {
		if (!this.emptyTile) return;

		const { left, top } = this.canvas.getBoundingClientRect();
		const x = Math.floor((e.x - left) / this.tileWidth);
		const y = Math.floor((e.y - top) / this.tileHeight);
		this.makeMove(x, y);
	}
	
	onTouchStart(e) {
		e.preventDefault();
		if (!this.emptyTile) return;
		const touch = e.touches[0];
		this.dragX = touch.pageX;
		this.dragY = touch.pageY;
	}
	onTouchEnd(e) {
		if (!this.emptyTile) return;
		
		const touch = e.changedTouches[0];
		const diffX = Math.abs(touch.pageX - this.dragX);
		const diffY = Math.abs(touch.pageY - this.dragY);

		if (diffX > diffY) {
			if (touch.pageX < this.dragX) {
				// Swipe Left
				this.makeMove(this.emptyTile.x + 1, this.emptyTile.y);
			}
			else {
				// Swipe Right
				this.makeMove(this.emptyTile.x - 1, this.emptyTile.y);
			}
		}
		else {
			if (touch.pageY < this.dragY) {
				// Swipe Up
				this.makeMove(this.emptyTile.x, this.emptyTile.y + 1);
			}
			else {
				// Swipe Down
				this.makeMove(this.emptyTile.x, this.emptyTile.y - 1);
			}
		}
	}
	onKeyDown(e) {
		if (!this.emptyTile) return;

		let { x, y } = this.emptyTile;
		if (e.keyCode === 37 || e.keyCode === 65) x++;			// Left or A
		else if (e.keyCode === 39 || e.keyCode === 68) x--;	// Right or D
		else if (e.keyCode === 38 || e.keyCode === 87) y++;	// Up or W
		else if (e.keyCode === 40 || e.keyCode === 83) y--;	// Down or S
		
		this.makeMove(x, y);
	}

	startGame() {
		// if (this.columns === this.rows) this.randomiseTiles();
		// else this.randomlyPlay();

		this.randomlyPlay();
		this.draw();
	}

	randomiseTiles() {
		do {
			for (let i = this.tiles.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[this.tiles[i], this.tiles[j]] = [this.tiles[j], this.tiles[i]];
			}
			for (let y = 0; y < this.rows; y++) {
				for (let x = 0; x < this.columns; x++) {
					const tile = this.tiles[y * this.columns + x];
					tile.x = x;
					tile.y = y;
				}
			}
		}
		while (!this.checkIsSolvable());
	}
	
	checkIsSolvable() {
		let inversions = 0;
		for (let i = 0; i < this.tiles.length - 1; i++) {
			for (let j = i + 1; j < this.tiles.length; j++) {
				if (this.tiles[i].id > this.tiles[j].id) inversions++;
			}
		}

		if (this.columns % 2 === 1) {
			if (inversions % 2 === 0) return true;
			else return false;
		}
		else {
			if ((this.rows - this.emptyTile.y) % 2 === 0) {
				if (inversions % 2 === 1) return true;
				else return false;
			}
			else {
				if (inversions % 2 === 0) return true;
				else return false;
			}
		}
	}

	randomlyPlay() {
		for (let i = 0; i < this.columns * this.rows * 100; i++) {
			switch (Math.floor(Math.random() * 4)) {
				case 0:
					if (this.emptyTile.x > 0) this.switchTiles(this.emptyTile.x - 1, this.emptyTile.y);
				break;
				case 1:
					if (this.emptyTile.x < this.columns - 1) this.switchTiles(this.emptyTile.x + 1, this.emptyTile.y);
				break;
				case 2:
					if (this.emptyTile.y > 0) this.switchTiles(this.emptyTile.x, this.emptyTile.y - 1);
				break;
				case 3:
					if (this.emptyTile.y < this.rows - 1) this.switchTiles(this.emptyTile.x, this.emptyTile.y + 1);
				break;
			}
		}
	}

	makeMove(x, y) {
		if (x < 0 || x >= this.columns || y < 0 || y >= this.rows) return;

		if (this.emptyTile && this.switchTiles(x, y)) {
			if (this.checkIsComplete()) this.winGame();
			this.draw();
		}
	}

	switchTiles(x, y) {
		const selectedTile = this.tiles.find(tile => tile.x === x && tile.y === y);
		const distanceX = Math.abs(x - this.emptyTile.x);
		const distanceY = Math.abs(y - this.emptyTile.y);

		if ((distanceX === 1 && y === this.emptyTile.y) || (distanceY === 1 && x === this.emptyTile.x)) {
			selectedTile.x = this.emptyTile.x;
			selectedTile.y = this.emptyTile.y;
			this.emptyTile.x = x;
			this.emptyTile.y = y;
			return true;
		}
	}
	
	checkIsComplete() {
		for (let i = 0; i < this.tiles.length; i++) {
			const { id, x, y } = this.tiles[i];
			if (id !== y * this.columns + x) return false;
		}
		return true;
	}

	winGame() {
		console.log("You Win!");
		this.emptyTile = null;
	}

	draw() {
		this.ctx.clearRect(0, 0, this.width, this.height);

		for (let i = 0; i < this.tiles.length; i++) {
			const { x, y, imgX, imgY } = this.tiles[i];
			if (this.emptyTile === this.tiles[i]) this.ctx.fillRect(x * this.tileWidth, y * this.tileHeight, this.tileWidth, this.tileHeight);
			else this.ctx.drawImage(this.image, this.tileWidth * imgX, this.tileHeight * imgY, this.tileWidth, this.tileHeight, this.tileWidth * x, this.tileHeight * y, this.tileWidth, this.tileHeight);
			if (this.emptyTile) this.ctx.strokeRect(x * this.tileWidth, y * this.tileHeight, this.tileWidth, this.tileHeight);
		}
	}
}

const config1 = {
	image: "dali1.jpg",
	columns: 3, rows: 3,
	emptyX: 2, emptyY: 0,
};

const config2 = {
	image: "dali2.jpg",
	columns: 3, rows: 4,
	emptyX: 2, emptyY: 0,
};

const config3 = {
	image: "dali3.jpg",
	columns: 4, rows: 4,
	emptyX: 3, emptyY: 0,
};

let puzzle = new Puzzle(config2);

const btns = document.querySelectorAll(".menu-btn");
btns.forEach(btn => {	
	btn.onclick = () => {
		if (!puzzle.emptyTile || window.confirm("Are you sure you want to start a new game?")) {
			const activeBtn = document.querySelector(".menu-btn--active");
			activeBtn.classList.remove("menu-btn--active");
			btn.classList.add("menu-btn--active");
			
			if (btn.name === "easy") puzzle.newGame(config1);
			else if (btn.name === "medium") puzzle.newGame(config2);
			else if (btn.name === "hard") puzzle.newGame(config3);
		}
	}
});
