const board = document.querySelector(".mainBoard");
const modal = document.querySelector(".modal");
const reviewGrp = document.querySelector(".review-btn");
const currPlayer = document.querySelector(".currPlayer");
const roomNum = document.querySelector(".room-num");
const ass = document.querySelector(".ass");
import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";

const x = 1;
const o = 2;

let room;
let currentPlayer = x;
let assigned;
let winner;

const socket = io("http://localhost:8080");

let gameBoard = [
	[0, 0, 0],
	[0, 0, 0],
	[0, 0, 0],
];

let movesViewing = 0;
let moves = [];

socket.on("connect", () => {
	checkRoom();
});

socket.on("joined_room", (data) => {
	room = data.room;
	loadBoard();
	assigned = data.role === "host" ? x : o;
	const gameGrid = document.querySelectorAll(".gameGrid");
	ass.textContent = `YOU'RE ${assigned === x ? "x" : "o"}`;

	gameGrid.forEach((btn) => {
		btn.disabled = assigned === currentPlayer ? false : true;
	});
});

function checkRoom() {
	if (!room) {
		board.innerHTML = "";
		const jsx = `\
            <div class="flex flex-col gap-5 p-3">\
                <input type="text" class="border-2 w-full border-black room" />\
                <div class='flex gap-4'>\
                    <button class="bg-slate-700 text-white px-8 py-2 text-xl font-light rounded-md host">HOST</button>\
                    <button class="bg-slate-700 text-white px-8 py-2 text-xl font-light rounded-md join">JOIN</button>\
                </div>\
            </div>`;
		board.innerHTML += jsx;

		const host = document.querySelector(".host");
		const join = document.querySelector(".join");
		const roominput = document.querySelector(".room");

		host.addEventListener("click", () => {
			if (!roominput.value) {
				return;
			}
			socket.emit("join", { room: roominput.value, role: "host" });
		});

		join.addEventListener("click", () => {
			if (!roominput.value) {
				return;
			}
			socket.emit("join", { room: roominput.value, role: "player" });
		});

		return;
	}
}

function loadBoard() {
	board.innerHTML = "";
	for (let y = 1; y <= 3; y++) {
		const jsx = `\
                <div class='flex'>\
                    <button class='border-2 p-2 font-bold text-2xl border-black w-[5rem] h-[5rem] gameGrid' data-x="${1}" data-y="${y}"></button>\
                    <button class='border-2 p-2 font-bold text-2xl border-black w-[5rem] h-[5rem] gameGrid' data-x="${2}" data-y="${y}"></button>\
                    <button class='border-2 p-2 font-bold text-2xl border-black w-[5rem] h-[5rem] gameGrid' data-x="${3}" data-y="${y}"></button>\
                </div>`;
		board.innerHTML += jsx;
	}
	roomNum.textContent = `ROOM: ${room}`;
	currPlayer.textContent = `CURRENT PLAYER: ${currentPlayer === x ? "X" : "O"}`;

	initiateEvents();
}

function initiateEvents() {
	const gameGrid = document.querySelectorAll(".gameGrid");

	gameGrid.forEach((btn) => {
		btn.addEventListener("click", () => {
			socket.emit("makeMove", { room: room, x: btn.dataset.x, y: btn.dataset.y, btn: btn });
			makeMove(btn.dataset.x, btn.dataset.y);
		});
	});
}

socket.off("madeMove").on("madeMove", (data) => {
	console.log(data);
	makeMove(data.x, data.y);
});

function makeMove(xAxis, yAxis) {
	const gameGrid = document.querySelectorAll(".gameGrid");
	if (winner) {
		return;
	}

	moves.push({
		x: xAxis + 1,
		y: yAxis + 1,
		play: currentPlayer,
	});

	gameBoard[yAxis - 1][xAxis - 1] = currentPlayer;

	const btn = Array.from(gameGrid).filter(
		(grid) =>
			xAxis.toString() === grid.dataset.x.toString() &&
			yAxis.toString() === grid.dataset.y.toString()
	);

	btn[0].disabled = true;
	btn[0].innerHTML = currentPlayer === x ? "x" : "o";

	checkWin();
}

function checkWin() {
	const gameGrid = document.querySelectorAll(".gameGrid");

	for (let y = 0; y <= 2; y++) {
		if (
			gameBoard[y][0] === currentPlayer &&
			gameBoard[y][1] === currentPlayer &&
			gameBoard[y][2] === currentPlayer
		) {
			winState("win");
			break;
		}

		if (
			gameBoard[0][y] === currentPlayer &&
			gameBoard[1][y] === currentPlayer &&
			gameBoard[2][y] === currentPlayer
		) {
			winState("win");
			break;
		}

		if (
			gameBoard[0][0] === currentPlayer &&
			gameBoard[1][1] === currentPlayer &&
			gameBoard[2][2] === currentPlayer
		) {
			winState("win");
			break;
		}

		if (
			gameBoard[2][0] === currentPlayer &&
			gameBoard[1][1] === currentPlayer &&
			gameBoard[0][2] === currentPlayer
		) {
			winState("win");
			break;
		}
	}
	if (winner) {
		return;
	}

	if (
		gameBoard[0][0] !== 0 &&
		gameBoard[0][1] !== 0 &&
		gameBoard[0][2] !== 0 &&
		gameBoard[1][0] !== 0 &&
		gameBoard[1][1] !== 0 &&
		gameBoard[1][2] !== 0 &&
		gameBoard[2][0] !== 0 &&
		gameBoard[2][1] !== 0 &&
		gameBoard[2][2] !== 0
	) {
		winState("draw");
		return;
	}

	currentPlayer = currentPlayer === x ? o : x;
	currPlayer.textContent = `CURRENT PLAYER: ${currentPlayer === x ? "X" : "O"}`;
	gameGrid.forEach((btn) => {
		console.log(btn.innerHTML);
		if (btn.innerHTML || assigned !== currentPlayer) {
			btn.disabled = true;
		} else {
			btn.disabled = false;
		}
	});
}

function winState(state) {
	if (state === "win") {
		winner = currentPlayer;
	}

	modal.innerHTML =
		state === "win"
			? `\
	<div class='p-5 bg-white flex flex-col items-center gap-5 shadow-2xl w-[30rem]'>\
		<h1 class='text-3xl font-bold'>Winner: ${winner === 1 ? "X" : "O"}</h1>\
		<div class='flex gap-7'>\
			<a href="/index.html" class='px-8 border-2 bg-red-300 rev'>< Go Back</a>\
		</div>\
	</div>`
			: `\
	<div class='p-5 bg-white flex flex-col items-center gap-5 shadow-2xl w-[30rem]'>\
		<h1 class='text-3xl font-bold'>DRAW</h1>\
		<div class='flex gap-7'>\
			<a href="/index.html" class='px-8 border-2 bg-red-300 rev'>< Go Back</a>\
		</div>\
	</div>`;

	/* 
        WIP 
    */
	// const nextMatch = document.querySelector(".nxt-match");
	// const reviewMatch = document.querySelector(".rev");

	// nextMatch.addEventListener("click", () => resetMatch());
	// reviewMatch.addEventListener("click", () => {
	// 	movesViewing = moves.length - 1;
	// 	review();
	// });
}

/* 
    WIP 
*/

// function resetMatch() {
// 	winner = null;
// 	currentPlayer = Math.floor(Math.random()) + 1 < 2 ? o : x;
// 	moves = [];

// 	gameBoard = [
// 		[0, 0, 0],
// 		[0, 0, 0],
// 		[0, 0, 0],
// 	];

// 	loadBoard();
// 	modal.innerHTML = "";
// 	reviewGrp.innerHTML = "";
// 	currPlayer.textContent = `CURRENT PLAYER: ${currentPlayer === x ? "X" : "O"}`;
// }

// function review() {
// 	modal.innerHTML = "";
// 	reviewGrp.innerHTML =
// 		"\
// 			<button class='border-2 p-2 rounded-md rewind'>\
// 				<svg\
// 					xmlns='http://www.w3.org/2000/svg'\
// 					fill='none'\
// 					viewBox='0 0 24 24'\
// 					stroke-width='1.5'\
// 					stroke='currentColor'\
// 					class='w-6 h-6'\
// 				>\
// 					<path\
// 						stroke-linecap='round'\
// 						stroke-linejoin='round'\
// 						d='M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3'\
// 					/>\
// 				</svg>\
// 			</button>\
// 			<button class='border-2 p-2 rounded-md fforward'>\
// 				<svg\
// 					xmlns='http://www.w3.org/2000/svg'\
// 					fill='none'\
// 					viewBox='0 0 24 24'\
// 					stroke-width='1.5'\
// 					stroke='currentColor'\
// 					class='w-6 h-6'\
// 				>\
// 					<path\
// 						stroke-linecap='round'\
// 						stroke-linejoin='round'\
// 						d='M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3'\
// 					/>\
// 				</svg>\
// 			</button>\
// 			<button class='px-8 border-2 bg-green-300 nxt-match'>Next Match</button>\
// 		";
// 	const nextMatch = document.querySelector(".nxt-match");
// 	const rewind = document.querySelector(".rewind");
// 	const fforward = document.querySelector(".fforward");

// 	console.log(movesViewing);

// 	fforward.disabled = movesViewing === moves.length - 1 ? true : false;
// 	rewind.disabled = movesViewing === -1 ? true : false;

// 	nextMatch.addEventListener("click", () => resetMatch());

// 	rewind.addEventListener("click", () => rewindPlay());
// 	fforward.addEventListener("click", () => forwardPlay());

// 	const gameGrid = document.querySelectorAll(".gameGrid");

// 	gameGrid.forEach((btn) => {
// 		btn.disabled = true;
// 	});
// }

// function rewindPlay() {
// 	const gameGrid = document.querySelectorAll(".gameGrid");

// 	const selectedGrid = Array.from(gameGrid).filter(
// 		(grid) =>
// 			moves[movesViewing].x.toString() === grid.dataset.x.toString() &&
// 			moves[movesViewing].y.toString() === grid.dataset.y.toString()
// 	);

// 	selectedGrid[0].textContent = "";
// 	movesViewing = movesViewing > 0 ? movesViewing - 1 : -1;
// 	currPlayer.textContent = `CURRENT PLAYER: ${moves[movesViewing].play === x ? "X" : "O"}`;

// 	review();
// }

// function forwardPlay() {
// 	const gameGrid = document.querySelectorAll(".gameGrid");

// 	const selectedGrid = Array.from(gameGrid).filter(
// 		(grid) =>
// 			moves[movesViewing + 1].x.toString() === grid.dataset.x.toString() &&
// 			moves[movesViewing + 1].y.toString() === grid.dataset.y.toString()
// 	);

// 	selectedGrid[0].textContent = moves[movesViewing + 1].play === 1 ? "x" : "o";
// 	movesViewing = movesViewing < moves.length - 1 ? movesViewing + 1 : moves.length - 1;
// 	currPlayer.textContent = `CURRENT PLAYER: ${moves[movesViewing].play === x ? "X" : "O"}`;

// 	review();
// }
