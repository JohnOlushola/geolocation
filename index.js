const express = require('express');
const http = require('http')
const io = require('socket.io')(http)

const app = express();
const server = http.Server(app)

app.get("/", (req, res) => {
	res.send("Real-time geolocation tracking service");
})

server.listen(4000, () => {
	console.log("Listening on *:4000")
})

io.on('connection', (clientSocket) => {
	console.log("a user connected");

	clientSocket.on('disconnect', () => {
		console.log('user disconnected')
		disconnectedTrackedUser(clientSocket.id)
	});

	clientSocket.on("connectTrackedUser", (nickname) => {
		connectTrackedUser(clientSocket.id, nickname)
	});

	clientSocket.on("disconnectTrackedUser", () => {
		disconnectTrackedUser(clientSocket.id);
	});

	clientSocket.on("requestUpdatedTrackedUserList", () => {
		emitTrackedUsersListUpdate();
	})

	clientSocket.on("connectTrackedUserTracker", (trackedUserSocketId) => {
		connectTrackedUserTracker(trackedUserSocketId, clientSocket);
	});

	clientSocket.on("disconnectTrackedUserTracker", (trackedUserSocketId) => {
		disconnectTrackedUserTracker(trackedUserSocketId, clientSocket);
	})

	clientSocket.on("trackedUserCoordinates", (latitude, longitute) => {
		emitCoordinatesToTrackingUsers(clientSocket.id, latitude, longitute);
	})
})

function connectTrackedUser(clientSocketId, nickname) {
	let message = `User ${nickname} has started tracking.`
	console.log(message);

	let trackedUserInfo = {
		id: clientSocketId,
		nickname: nickname
	};

	trackedUsers[clientSocket.id] = trackedUserInfo;

	emitTrackedUsersListUpdate();
}

function emitTrackedUsersListUpdate() {
	let trackedUserList = Object.keys(trackedUsers).map((key) => {
		return trackedUser[key]
	});

	io.emit("trackedUserListUpdate", trackedUserList)
}

function disconnectTrackedUser(clientSocketId) {
	emitTrackedUserHasStoppedSharingLocation(clientSocketId)
	// emitTrackedUserHasStoppedSharingLocation(clientSocket.id)

	if (trackedUsers[clientSocketId] != null) {
		let message = `User ${trackedUsers[clientSocketId]} ${nickname} has stopped tracking.`
		console.log(message);

		delete trackedUsers[clientSocketId],
			delete trackedUsersTrackers[clientSocketId]
	}

	emitTrackedUsersListUpdate();
}

function emitTrackedUserHasStoppedSharingLocation(clientSocket) {
	for (index in trackedUsersTrackers[clientSocket]) {
		let socket = trackedUsersTrackers[clientSocket][index]
		if (socket.connected) {
			socket.emit("trackedUserHasStoppedUpdate", trackedUsers[clientSocket]["nickname"]);
		}
	}
}

function connectTrackedUserTracker(trackedUserSocketId, clientSocket){
	if(trackedUser[trackedUserSocketId]["nickname"]){
		let message = `User ${cleintSocket.id} is tracking ${trackedUsers[trackedUserSocketId]["nickname"]}`;
		console.log(message);

		if(trackedUsersTrackers[trackedUserSocketId] == null ){
			trackedUsersTrackers[trackedUserSocketId] = []
		}

		trackedUsersTrackers[trackedUserSocketId].push(clientSocket);
	}
}

function disconnectTrackedUserTracker(trackedUserSocketId, clientSocketId) {
	if (trackedUsers[trackedUserSocketId] != null){
		let message = `User ${clientSocketId} has stopped tracking ${trackedUsers[trackedUserSocketId]["nickname"]}`;
		console.log(message);

		for(index in trackedUsersTrackers[trackedUserSocketId]) {
			if(trackedUsersTrackers[trackedUserSocketId][index] == clientSocketId){
				trackedUsersTrackers[trackedUserSocketId].splice(index, 1);
				break;
			}
		}
	}
}

function emitCoordinatesToTrackingUsers(clientSocketId, latitude, longitute){
	if(trackedUsers[clientSocketId] != null ){
		let message = `Coordinates of ${trackedUsers[clientSocketId]["nickname"]}: Latitude ${latitude}, Longitude ${longitude}`;
		console.log(message);

		for(index in trackedUsersTrackers[clientSocketId]){
			let socket = trackedUsersTrackers[clientSocketId][index];

			let message = `Sending to ${socket.id} ${socket.connected}`;
			console.log(message);

			let coordinates = {
				latitude: latitude,
				longitude: longitute
			}

			socket.emit("trackUserCoordinatesUpdate", coordinates);
		}
	}
}