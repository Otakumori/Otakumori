/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
/*=====================*\
 * START CONFIGURATION *
\*=====================*/

	var enable_sound = true;
	var difficulty   = 1.25; // 1.25 = normal
						  // 2 = hard
						  // 3 = insane

	var canvasWidth  = 640;
	var canvasHeight = 450;

/*===================*\
 * END CONFIGURATION *
\*===================*/

window.requestAnimFrame = function(){
    return (
        window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(/* function */ callback){
            window.setTimeout(callback, 1000 / 60);
        }
    );
}();

Achievement = function(id, name, description, goal) {

	this.id = id;
	this.name = name;
	this.description = description;
	this.progress = 0;
	this.goal = goal;
	this.complete = false;

	this.completed = function() {
		if (!this.complete) {
			this.complete = true;
			sound.level_sound.play();
			// console.log(storage.achieved.toString());
		}
	};

	this.update = function(progress) {
		this.progress += progress;

		if (this.progress >= this.goal) {
			this.completed();
		}

		storage.print();
		// console.log(this.id+":"+this.progress+"/"+this.goal);
	};

};

Storage = function() {

	ach0 = new Achievement("highscore", "High Score", "", 9999999999);

	ach1 = new Achievement("d5blcks", "Pentablock", "Destroy 5 blocks", 5);
	ach2 = new Achievement("d10blcks", "Decablock", "Destroy 10 blocks", 10);
	ach3 = new Achievement("d100blcks", "Century", "Destroy 100 blocks", 100);
	ach4 = new Achievement("d500blcks", "Half a millennia", "Destroy 500 blocks", 500);

	ach5 = new Achievement("die", "Ouch!", "Lose a life", 1);
	ach6 = new Achievement("die5", "Finished", "Die", 5);

	ach7 = new Achievement("lvl1", "Level 1 Completed!", "Complete level 1", 1);
	ach8 = new Achievement("lvl2", "Level 2 Completed!", "Complete level 2", 2);
	ach9 = new Achievement("lvl3", "Level 3 Completed!", "Complete level 3", 3);
	ach10 = new Achievement("lvl4", "Level 4 Completed!", "Complete level 4", 4);
	ach11 = new Achievement("lvl5", "Level 5 Completed!", "Complete level 5", 5);
	ach12 = new Achievement("lvl6", "Level 6 Completed!", "Complete level 6", 6);
	ach13 = new Achievement("lvl7", "Level 7 Completed!", "Complete level 7", 7);

	this.achievements = [ach0, ach1, ach2, ach3, ach4, ach5, ach6, ach7, ach8, ach9, ach10, ach11, ach12, ach13];

	this.read = function() {
		this.achievements = localStorage.beb12iwp;
	};

	this.write = function() {
		localStorage.beb12iwp = this.achievements;
	};

	this.reset = function() {
		for (var i=0; i < this.achievements.length; i++) {
			this.achievements[i].progress = 0;
		}
		localStorage.beb12iwp = [];
	};

	this.add = function(newitem) {
		localStorage.beb12iwp += newitem;
	};

	this.print = function() {
		var achcount = 0;
		document.getElementById("achievements").innerHTML = "<h2 class=\"chroma\">Achievements</h2>";
		document.getElementById("achievements").innerHTML += "<ul>";
		for (var i=0; i<this.achievements.length; i++) {
			var liclass = "notcomplete";
			if (this.achievements[i].complete) {
				liclass = "complete";
				achcount += 1;
			}
			if (this.achievements[i].id === "highscore") {
				document.getElementById("achievements").innerHTML += "<li>"+this.achievements[i].name+" : "+this.achievements[i].progress+"</li>";
			} else {
				document.getElementById("achievements").innerHTML += "<li class=\""+liclass+"\">"+this.achievements[i].name+" - "+this.achievements[i].description+" ("+this.achievements[i].progress+"/"+this.achievements[i].goal+")</li>";
			}
			document.getElementById("achcount").innerHTML = "Achievements ("+achcount+"/"+this.achievements.length+")";
		}
		document.getElementById("achievements").innerHTML += "</ul>";
	};

};

Game = function() {

	storage = new Storage();
	sound = new Sound();

	this.state = "";
	this.level = 0;

	this.initCanvas = function() {

		var canvas = document.getElementById("canvas");
		ctx = canvas.getContext("2d");

		canvas.tabIndex = 1;

		canvas.width  = canvasWidth;
		canvas.height = canvasHeight;

		keys = [];

	};

	this.loadLevel = function() {
		level = new Level(this.level);
	};

	this.startGame = function() {
		paddle = new Paddle();
		balls = new Balls();
		this.loadLevel();
		this.state = "playing";
	}

	this.initCanvas();

};

Menu = function() {

	this.selected = 0;
	this.options = [];

	this.tick = 0;

	this.update = function() {
		this.tick++;
	};

	var bg = new Image();
	bg.src = "res/img/starfield.png";

	var logo = new Image();
	logo.src = "res/img/breakout.png";

	this.gameOver = function() {
		this.options = [];
		this.menuTitle = "Game Over!";
		this.options.push("Restart Game");
		this.options.push("Settings");
		this.options.push("Help");
	}

	this.pauseMenu = function() {
		this.options = [];
		this.menuTitle = "Paused";
		this.options.push("Resume");
		this.options.push("Settings");
		this.options.push("Help");
	}

	this.mainMenu = function() {
		this.options = [];
		this.menuTitle = "Main Menu";
		this.options.push("Play Game");
		this.options.push("Settings");
		this.options.push("Help");
	};

	this.settings = function() {
		this.options = [];
		this.menuTitle = "Settings";
		if (enable_sound) {
			this.options.push("Sound: On");
		} else {
			this.options.push("Sound: Off");
		}
		if (difficulty === 1.25) {
			this.options.push("Difficulty: Normal");
		} else if (difficulty === 2) {
			this.options.push("Difficulty: Hard");
		} else if (difficulty === 3) {
			this.options.push("Difficulty: Insane");
		}
		this.options.push("Reset Achievements");
	};

	this.help = function() {
		this.options = [];
		this.menuTitle = "Help";
		this.options.push("Use arrow keys or mouse to move paddle");
		this.options.push("Hit space or click to launch ball");
		this.options.push("Destroy all blocks.");
	};

	this.draw = function() {

		var pattern = ctx.createPattern(bg, 'repeat');
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

		ctx.drawImage(logo, (canvasWidth/2)-225, 25);

		ctx.font = "42px Helvetica";
      	ctx.textAlign = 'center';

      	var trans = (Math.abs(Math.sin(this.tick*0.05))+0.5)*0.25;

		ctx.fillStyle = "rgba(255,255,255,0.75)";

      	ctx.fillText(this.menuTitle, (canvasWidth/2), 185);

		ctx.font = "24px Helvetica";

		for (var i=0; i < this.options.length; i++) {
			if (this.selected === i) {
				var gradient = ctx.createLinearGradient(0, 0, canvasWidth, 0);
				gradient.addColorStop(0, "rgba(255,255,255,"+trans+")");
				gradient.addColorStop(0.5, "rgba(255,255,255,"+(trans+0.5)+")");
				gradient.addColorStop(1, "rgba(255,255,255,"+trans+")");
				ctx.fillStyle = gradient;
				ctx.fillRect(0, (canvasHeight/1.5)+(i*50)-87, canvasWidth, 40);
				ctx.fillStyle = "#000";
			} else {
				ctx.fillStyle = "#fff";
			}
			ctx.fillText(this.options[i], (canvasWidth/2), (canvasHeight/1.5)+(i*50)-(this.options.length*20));
		}

	};

	this.esc = function() {
		if (game.state === "menu") {
			this.mainMenu();
			sound.paddle_sound.play();
		} else if (game.state === "pause") {
			game.state = "playing";
		}
	}

	this.up = function() {
		if (this.selected > 0) {
			this.selected--;
		}
		sound.brick_sound.play();
	};

	this.down = function() {
		if (this.selected < this.options.length-1) {
			this.selected++;
		}
		sound.brick_sound.play();
	};

	this.mousePos = function(x, y) {
		for (var i=0; i < this.options.length; i++) {
			if (y > (canvasHeight/1.5)+(i*50)-87 &&
				y < (canvasHeight/1.5)+(i*50)-47) {
				this.selected = i;
			}
		}
	};

	this.enter = function() {
		switch (this.options[this.selected]) {
			case "Play Game": case "Restart Game":
				game.startGame();
				break;
			case "Resume":
				game.state = "playing";
			case "Settings":
				menu.settings();
				break;
			case "Difficulty: Insane":
				difficulty = 1.25;
				this.options[this.selected] = "Difficulty: Normal";
				break;
			case "Difficulty: Hard":
				difficulty = 3;
				this.options[this.selected] = "Difficulty: Insane";
				break;
			case "Difficulty: Normal":
				difficulty = 2;
				this.options[this.selected] = "Difficulty: Hard";
				break;
			case "Help":
				menu.help();
				break;
			case "Sound: On":
				enable_sound = false;
				this.options[this.selected] = "Sound: Off";
				sound.menu_sound.pause();
				break;
			case "Sound: Off":
				enable_sound = true;
				this.options[this.selected] = "Sound: On";
				sound.menu_sound.play();
				break;
			case "Reset Achievements":
				achievements.reset();
				break;
			default:
				menu.mainMenu();
				break;
		}
		sound.paddle_sound.play();
	};

	this.mainMenu();

	if (enable_sound && sound.menu_sound) {
		sound.menu_sound.play();
	}

};

Level = function(level) {

	this.brickWidth  = 40;
	this.brickHeight = 20;

	this.bricksHoriz = 15;

	this.lives   = 5;
	this.score   = 0;

	this.maxBrickType = 6;

	bg = new Image();
	bg.src = "res/img/starfield.png";

	brick = new Image();
	brick.src = "res/img/brick.png";
	brick7 = new Image();
	brick7.src = "res/img/brick7.png";
	brick8 = new Image();
	brick8.src = "res/img/brick8.png";

	switch (level) {
		case 0:
			this.bg_music0 = new Audio("res/audio/chop_suey.mp3");
			this.bricks = [
				[7,8,8,8,0,8,0,0,0,8,0,8,8,0,7],
				[7,0,8,0,0,8,0,0,0,8,0,8,0,8,7],
				[7,0,8,0,0,8,0,0,0,8,0,8,0,8,7],
				[7,0,8,0,0,8,0,8,0,8,0,8,8,0,7],
				[7,0,8,0,0,8,8,8,8,8,0,8,0,0,7],
				[7,8,8,8,0,0,8,0,8,0,0,8,0,0,7],
				[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
				[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
			];
			break;
		case 1:
			this.bg_music1 = new Audio("res/audio/menu.mp3");
			this.bricks = [
				[7,0,0,0,0,0,0,0,0,0,0,0,0,0,7],
				[7,8,8,8,0,0,8,8,8,0,8,0,0,8,7],
				[7,8,0,0,8,0,8,0,0,0,8,8,0,8,7],
				[7,8,8,8,8,0,8,8,0,0,8,8,8,8,7],
				[7,8,0,0,8,0,8,0,0,0,8,0,8,8,7],
				[7,8,8,8,0,0,8,8,8,0,8,0,0,8,7],
				[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				[6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],
				[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
				[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
			];
			break;
		case 2:
			this.bg_music2 = new Audio("res/audio/menu.mp3");
			this.bricks = [
				[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
				[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
				[0,0,0,0,0,0,5,5,5,0,0,0,0,0,0],
				[6,6,6,6,6,0,0,0,0,0,6,6,6,6,6],
				[6,1,1,1,6,6,6,6,6,6,6,1,1,1,6],
				[6,1,1,1,6,6,6,6,6,6,6,1,1,1,6],
				[6,6,6,6,6,0,0,0,0,0,6,6,6,6,6],
				[0,0,0,0,0,0,5,5,5,0,0,0,0,0,0],
				[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
				[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
			];
			break;
		case 3:
			this.bg_music3 = new Audio("res/audio/chop_suey.mp3");
			this.bricks = [
				[6,2,6,6,6,6,6,7,6,6,6,6,6,2,6],
				[6,0,0,6,0,0,0,7,0,0,0,6,0,0,6],
				[6,0,0,6,1,6,0,7,0,6,1,6,0,0,6],
				[6,0,0,6,6,6,0,7,0,6,6,6,0,0,6],
				[6,0,0,0,0,0,0,7,0,0,0,0,0,0,6],
				[6,0,0,0,0,0,4,8,4,0,0,0,0,0,6],
				[6,7,7,7,7,7,8,8,8,7,7,7,7,7,6],
				[6,0,0,0,0,0,4,8,4,0,0,0,0,0,6],
				[6,0,0,0,0,0,0,7,0,0,0,0,0,0,6],
				[6,0,0,6,6,6,0,7,0,6,6,6,0,0,6],
				[6,0,0,6,1,6,0,7,0,6,1,6,0,0,6],
				[6,0,0,6,0,0,0,7,0,0,0,6,0,0,6],
				[6,2,6,6,6,6,6,7,6,6,6,6,6,2,6],
			];
			break;
		case 4:
			this.bg_music4 = new Audio("res/audio/chop_suey.mp3");
			this.bricks = [
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				[6,0,5,5,7,7,8,8,8,7,7,5,5,0,6],
				[6,0,5,5,4,4,5,5,5,4,4,5,5,0,6],
				[6,0,5,5,0,3,4,1,4,3,0,5,5,0,6],
				[6,0,5,5,3,0,4,1,4,0,3,5,5,0,6],
				[6,0,5,5,0,3,4,1,4,3,0,5,5,0,6],
				[6,0,5,5,3,0,4,1,4,0,3,5,5,0,6],
				[6,0,5,5,0,3,4,1,4,3,0,5,5,0,6],
				[6,0,5,5,3,0,4,1,4,0,3,5,5,0,6],
				[6,0,5,5,0,3,4,0,4,3,0,5,5,0,6],
				[6,5,5,5,5,5,4,0,4,5,5,5,5,5,6],
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			];
			break;
		case 5:
			this.bg_music5 = new Audio("res/audio/chop_suey.mp3");
			this.bricks = [
				[7,1,1,1,6,0,0,0,0,0,0,0,0,0,0],
				[7,1,1,1,6,5,0,0,0,0,0,0,0,0,0],
				[7,1,1,1,6,5,4,0,0,0,0,0,0,0,0],
				[7,1,1,1,6,5,4,3,0,0,0,0,0,0,0],
				[7,1,1,1,6,5,4,3,2,0,0,0,0,0,0],
				[7,1,1,1,6,5,4,3,2,6,0,0,0,0,0],
				[7,1,1,1,6,5,4,3,2,6,5,0,0,0,0],
				[7,1,1,1,6,5,4,3,2,6,5,4,0,0,0],
				[7,1,1,1,6,5,4,3,2,6,5,4,3,0,0],
				[7,1,1,1,6,5,4,3,2,6,5,4,3,2,0],
				[7,7,7,7,7,7,7,7,7,7,7,7,7,7,0],
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			];
			break;
		case 6:
			// v hard level, last one?
			this.bg_music6 = new Audio("res/audio/menu.mp3");
			this.bricks = [
				[7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
				[7,6,6,6,6,6,6,6,6,6,6,6,6,6,7],
				[7,6,6,6,6,6,6,6,6,6,6,6,6,6,7],
				[7,6,6,6,6,6,6,6,6,6,6,6,6,6,7],
				[7,6,6,6,6,6,6,6,6,6,6,6,6,6,7],
				[7,6,6,6,6,6,6,6,6,6,6,6,6,6,7],
				[7,6,6,6,6,6,6,6,6,6,6,6,6,6,7],
				[7,6,6,6,6,6,6,6,6,6,6,6,6,6,7],
				[7,1,1,1,1,1,1,1,1,1,1,1,1,1,7],
				[7,1,1,1,1,1,1,1,1,1,1,1,1,1,7],
				[7,1,1,1,1,1,1,1,1,1,1,1,1,1,7],
				[7,1,1,1,1,1,1,1,1,1,1,1,1,1,7],
				[7,7,7,7,7,7,8,1,8,7,7,7,7,7,7]
			];
			break;
		default:
			// make a randomised level! :D
			this.bg_music = new Audio("res/audio/chop_suey.mp3");
			for (var i = 0; i < 15; i++) {
				eval("var rand"+i+" = Math.floor(Math.random()*8);");
			}
			this.bricks = [
				[rand0,rand1,rand2,rand3,rand4,rand5,rand6,rand7,rand8,rand9,rand10,rand11,rand12,rand13,rand14],
				[rand13,rand5,rand7,rand8,rand6,rand10,rand11,rand4,rand8,rand2,rand14,rand12,rand3,rand6,rand0],
				[rand5,rand12,rand3,rand6,rand0,rand4,rand8,rand2,rand14,rand13,rand7,rand8,rand6,rand10,rand11],
				[rand14,rand12,rand2,rand8,rand8,rand3,rand6,rand10,rand7,rand13,rand5,rand11,rand4,rand6,rand0],
			];

			break;
	}

	// This margin is to centre the bricks on screen
	this.xMargin = (canvasWidth - this.bricksHoriz * this.brickWidth) / 2;

	if (enable_sound) {
		eval("this.bg_music"+game.level).play();
	}

	// loop through the bricks array and draw each brick
	this.drawBricks = function() {

		var pattern = ctx.createPattern(bg, 'repeat');
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.fillStyle = "rgba(0,50,100,0.25)";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

		count = 0;
		for (var brickX = 0; brickX < this.bricks.length; brickX++) {
			for (var brickY = 0; brickY < this.bricks[brickX].length; brickY++) {
				this.drawBrick(brickY, brickX, this.bricks[brickX][brickY]);
				if (this.bricks[brickX][brickY] < 7) {
					count += this.bricks[brickX][brickY];
				}
			}
		}
		return count;
	};

	// function to draw a single brick
	this.drawBrick = function(brickX, brickY, brickType) {

		var hue = Math.floor((brickType/this.maxBrickType)*360);
		if (brickType === 1) {
			ctx.fillStyle = "hsla("+hue+", 100%, 80%, 0.5)";
		} else {
			ctx.fillStyle = "hsl("+hue+", 100%, 80%)";
		}

		if (brickType !== 0) {
			ctx.fillRect(brickX * this.brickWidth + this.xMargin, brickY * this.brickHeight, this.brickWidth, this.brickHeight);
			// ctx.strokeStyle = "rgba(0,0,0,0.25)";
			// ctx.lineWidth   = 2;
			// ctx.strokeRect(brickX * this.brickWidth + this.xMargin, brickY * this.brickHeight, this.brickWidth, this.brickHeight);

			if (brickType > 1 && brickType < 7 ) {
				ctx.drawImage(brick, brickX * this.brickWidth + this.xMargin, brickY * this.brickHeight);
			} else if (brickType === 1) {
				ctx.fillStyle = "hsla("+hue+", 100%, 80%, 0.1)";
				var rand = Math.floor(Math.random()*3)+1;
				brickhit = new Image();
				brickhit.src = "res/img/brick-hit"+rand+".png";
				ctx.drawImage(brickhit, brickX * this.brickWidth + this.xMargin, brickY * this.brickHeight);
			} else if (brickType === 7) {
				ctx.drawImage(brick7, brickX * this.brickWidth + this.xMargin, brickY * this.brickHeight);
			} else if (brickType === 8) {
				ctx.drawImage(brick8, brickX * this.brickWidth + this.xMargin, brickY * this.brickHeight);
			}
		}

	};

	this.hitBrick = function(brickRow,brickCol) {
		if (this.bricks[brickRow][brickCol] < 7) {
			// blocks 7-8 are indestructible
			this.bricks[brickRow][brickCol]--;
		}

		if (this.bricks[brickRow][brickCol] > 0 && this.bricks[brickRow][brickCol] < 7) {
			// brick weakened
			this.score++;
			if (enable_sound && sound.brick_sound) {
				sound.brick_sound.play();
			}
			ach0.update(1);
		} else if (this.bricks[brickRow][brickCol] !== 7) {
			// brick destroyed
			this.score += 5;
			if (enable_sound && sound.brick_sound2) {
				sound.brick_sound2.play();
			}
			ach0.update(5);
			ach1.update(1);
			ach2.update(1);
			ach3.update(1);
			ach4.update(1);

			// pu = new powerupDrop(brickRow,brickCol);
			// pu.draw();
		}

	};

	this.loseLife = function() {

		// console.log("balls:"+balls.balls.length);
		// console.log("lives:"+this.lives);
		if (balls.balls.length === 1) {
			this.lives--;
			if (this.lives <= 0) {
				game.state = "menu";
				if (enable_sound && sound.gameover_sound) {
					sound.gameover_sound.play();
				}
				menu.gameOver();
			} else {
				if (enable_sound && sound.death_sound) {
					sound.death_sound.play();
				}
				balls.balls = [];
				balls.addBall();
			}
		} else {
			balls.removeBall();
		}
			ach5.update(1);
			ach6.update(1);
	};

	paddle = new Paddle();
	balls  = new Balls();

	balls.addBall();

};

Ball = function() {

	this.size = 10;

	this.x = canvasWidth/2;
	this.y = paddle.y - 5 - paddle.height;

	this.dx = 0;
	this.dy = 0;

	this.draw = function() {
		ctx.fillStyle = "#fff";
		ctx.fillRect(this.x, this.y, this.size, this.size);
	};

	this.update = function() {

		// out of bounds
		if (this.y + this.size > canvasHeight) {
			level.loseLife();
		}

		// paddle bounce
		if (this.y + this.size > paddle.y &&
			this.y < paddle.y + paddle.height) {
			if (this.x + this.size >= paddle.x &&
				this.x <= paddle.x + paddle.width) {

				// we've hit the paddle
				this.dy = -Math.abs(this.dy);

				// Change x velocity based on paddle hit position
				var hitPos = (((this.x - paddle.x)/paddle.width)*2)-1;
				this.dx = hitPos*4;

				if (enable_sound && sound.paddle_sound) {
					sound.paddle_sound.play();
				}

			}
		}

		// edge + brick collisions
		if (this.y <= 0) {
			this.dy = Math.abs(this.dy);
		}
		if (this.collisionYWithBrick() === 1) {
			this.dy *= -1;
		}

		if ((this.x < 0) ||	(this.x + this.size > canvasWidth)) {
			this.dx *= -1;
		}
		if (this.collisionXWithBrick() === 1) {
			this.dx *= -1;
		}

		this.x += this.dx;
		this.y += this.dy;

	};

	this.reset = function() {
		this.x = canvasWidth/2;
		this.y = paddle.y-5-paddle.height;
		this.dx = 0;
		this.dy = 0;
	};

	this.launch = function() {
		if ((this.dy === 0) && (this.dx === 0)) {
			this.reset();
			this.dy = -5*difficulty;
			this.dx = (Math.random()*8)-4;
		}
	};

	this.collisionXWithBrick = function() {
		var collided = 0;

		for (var brickRow=0; brickRow<level.bricks.length; brickRow++) {
			for (var brickCol=0; brickCol<level.bricks[brickRow].length; brickCol++) {

				if (level.bricks[brickRow][brickCol]) {
					var brickX = brickCol * level.brickWidth + level.xMargin;
					var brickY = brickRow * level.brickHeight;

					if (((ball.x + ball.dx >= brickX) && (ball.x + ball.dx <= brickX + level.brickWidth)) ||
						((ball.x + ball.dx + ball.size >= brickX) && (ball.x + ball.dx + ball.size <= brickX + level.brickWidth))) {

						if (((ball.y + ball.dy >= brickY) && (ball.y + ball.dy <= brickY + level.brickHeight)) ||
							((ball.y + ball.dy + ball.size >= brickY) && (ball.y + ball.dy + ball.size <= brickY + level.brickHeight))) {
							level.hitBrick(brickRow,brickCol);
							// console.log(level.bricks[brickRow][brickCol]);
							if (level.bricks[brickRow][brickCol] === 0) {
								collided = 2;
							} else {
								collided = 1;
							}
						}
					}

				}

			}
		}

		return collided;
	};

	this.collisionYWithBrick = function() {
		var collided = 0;

		for (var brickRow=0; brickRow<level.bricks.length; brickRow++) {
			for (var brickCol=0; brickCol<level.bricks[brickRow].length; brickCol++) {

				if (level.bricks[brickRow][brickCol]) {
					var brickX = brickCol * level.brickWidth + level.xMargin;
					var brickY = brickRow * level.brickHeight;

					if (((ball.y + ball.dy >= brickY) && (ball.y + ball.dy <= brickY + level.brickHeight)) ||
						((ball.y + ball.dy + ball.size >= brickY) && (ball.y + ball.dy + ball.size <= brickY + level.brickHeight))) {

						if (((ball.x + ball.dx >= brickX) && (ball.x + ball.dx <= brickX + level.brickWidth)) ||
							((ball.x + ball.dx + ball.size >= brickX) && (ball.x + ball.dx + ball.size <= brickX + level.brickWidth))) {
							level.hitBrick(brickRow,brickCol);

							// console.log(level.bricks[brickRow][brickCol]);
							if (level.bricks[brickRow][brickCol] === 0) {
								collided = 2;
							} else {
								collided = 1;
							}
						}
					}

				}

			}
		}

		return collided;
	};

};

// Hold an array of balls for easy multiball
Balls = function() {

	this.balls = [];

	this.addBall = function() {
		ball = new Ball();
		this.balls.push(ball);
	};

	this.removeBall = function() {
		this.balls.pop();
	};

	this.launch = function() {
		for (var ballNo = 0; ballNo < this.balls.length; ballNo++) {
			this.balls[ballNo].launch();
		}
	};

	this.draw = function() {
		for (var ballNo = 0; ballNo < this.balls.length; ballNo++) {
			this.balls[ballNo].draw();
		}
	};

	this.update = function() {
		for (var ballNo = 0; ballNo < this.balls.length; ballNo++) {
			this.balls[ballNo].update();
		}
	};

};

Paddle = function() {

	this.x = (canvasWidth / 2) - 40;
	this.y = canvasHeight - 30;

	this.dx = 0;

	this.width  = 80;
	this.height = 10;

	this.draw = function() {
		ctx.fillStyle = "white";
		ctx.fillRect(this.x, this.y, this.width, this.height);
	};

	this.update = function() {
		this.x += this.dx;
		this.dx *= 0.8;

		// prevent out of bounds
		if (this.x > canvasWidth-this.width) {
			this.x = canvasWidth-this.width;
		}
		if (this.x < 0) {
			this.x = 0;
		}

	};

	this.moveRight = function() {
		if (this.x < canvasWidth-this.width) {
			this.dx += 3;
		}
	};

	this.moveLeft = function() {
		if (this.x > 0) {
			this.dx -= 3;
		}
	};

};

Sound = function() {

	this.death_sound  = new Audio("res/audio/explode.mp3");
	this.paddle_sound = new Audio("res/audio/laser.mp3");
	this.brick_sound  = new Audio("res/audio/beep.mp3");
	this.brick_sound2 = new Audio("res/audio/laser.mp3");
	this.level_sound = new Audio("res/audio/powerup.mp3");
	this.menu_sound = new Audio("res/audio/menu.mp3");

};

init = function() {

	tvoverlay = new Image();
	tvoverlay.src = "res/img/tv-overlay.png";

	game = new Game();
	menu = new Menu();
	game.state = "menu";

	storage.print();

};

update = function() {
	if (game.state === "playing") {
		if (keys[32]) { // space
			balls.launch();
		}
		if (keys[37]) { // left
			paddle.moveLeft();
		}
		if (keys[39]) { // right
			paddle.moveRight();
		}

		sound.menu_sound.pause();
		paddle.update();
		balls.update();
	} else if (game.state === "menu" || game.state === "pause") {
		menu.update();
	}
};

draw = function() {
	if (game.state === "playing") {
		if (level.drawBricks() === 0) {
			game.level++;
			ach7.update(1);
			ach8.update(1);
			ach9.update(1);
			ach10.update(1);
			ach11.update(1);
			ach12.update(1);
			ach13.update(1);
			game.loadLevel();
			if (enable_sound && sound.level_sound) {
				sound.level_sound.play();
			}
		}

		ctx.fillStyle = "white";
		ctx.font = "15px Helvetica";
      	ctx.textAlign = 'left';
		ctx.fillText("Score: "+level.score, 3, canvasHeight-5);
      	ctx.textAlign = 'right';
		ctx.fillText("Lives: "+level.lives, canvasWidth-3, canvasHeight-5);

		paddle.draw();
		balls.draw();
	} else if (game.state === "menu" || game.state === "pause") {
		menu.draw();
	}
	// tv-overlay effect
	ctx.drawImage(tvoverlay, 0, 0);
};

animate = function() {
	update();
	ctx.clearRect(0,0,canvas.width,canvas.height);
	draw();
	requestAnimFrame(animate);
};

window.addEventListener("load", function() {
	init();
	animate();
});

// control stuff
getMousePos = function(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
};

document.getElementById("canvas").addEventListener('click', function(e) {
	if (game.state === "menu" || game.state === "pause") {
		menu.enter();
	} else if (game.state === "playing") {
		balls.launch();
	}
}, false);

document.getElementById("canvas").addEventListener('mousemove', function(e) {
	var mousePos = getMousePos(canvas, e);
	if (game.state === "playing") {
		paddle.x = mousePos.x - paddle.width/2;
	} else if (game.state === "menu" || game.state === "pause") {
		menu.mousePos(mousePos.x, mousePos.y);
	}
}, false);

document.getElementById("canvas").addEventListener("keydown", function(e) {
	keys[e.keyCode] = true;
	if (game.state === "menu" || game.state === "pause") {
		if (e.keyCode === 38) {
			menu.up();
		} else if (e.keyCode === 40) {
			menu.down();
		} else if (e.keyCode === 13 || e.keyCode === 32) {
			menu.enter();
		} else if (e.keyCode === 8 || e.keyCode === 27) {
			menu.esc();
		}
	} else if (game.state === "playing") {
		if (e.keyCode === 8 || e.keyCode === 27) {
			menu.pauseMenu();
			game.state = "pause";
		}
		if (e.keyCode === 13) {
			game.level++;
			game.loadLevel();
			ach7.update(1);
			ach8.update(1);
			ach9.update(1);
			ach10.update(1);
			ach11.update(1);
			ach12.update(1);
			ach13.update(1);
		}
	}
	e.preventDefault();
});

document.getElementById("canvas").addEventListener("keyup", function(e) {
	keys[e.keyCode] = false;
	e.preventDefault();
});
