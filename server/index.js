const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
	cors: {
		origin: "*",
	},
});

io.on("connection", (socket) => {
	socket.on("join", (data) => {
		socket.join(data.room);
		socket.emit("joined_room", data);
	});

	socket.on("makeMove", (data) => {
		socket.to(data.room).emit("madeMove", data);
	});
});

server.listen(8080, () => {
	console.log("CONNECTED");
});
