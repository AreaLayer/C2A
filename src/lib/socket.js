import { rate, user, ws } from '$lib/store';

const token =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImJvYiIsImlhdCI6MTY1ODc5NDkxMX0._zFTEADrbLffcXa5sIMrJtJ483VdIiYmsdt2ofibxu4';

let interval, socket;

export const messages = (data) => ({
	rate() {
		rate.set(data);
	},

	payment() {
		console.log(data);
	},

	connected() {
		socket.send(JSON.stringify({ type: 'login', data: token }));
	},

  login() {
    user.set(data);
  } 
});

const initialReconnectDelay = 1000;
const maxReconnectDelay = 16000;

let currentReconnectDelay = initialReconnectDelay;

export function connect() {
	clearInterval(interval);

	socket = new WebSocket('ws://localhost:3119/ws');
	socket.addEventListener('open', onWebsocketOpen);
	socket.addEventListener('close', onWebsocketClose);
	socket.addEventListener('message', onWebsocketMessage);

	interval = setInterval(
		() => socket.readyState === 1 && socket.send(JSON.stringify({ type: 'heartbeat' })),
		5000
	);

	ws.set(socket);
}

function onWebsocketMessage(msg) {
	let { type, data } = JSON.parse(msg.data);
	messages(data)[type] && messages(data)[type]();
}

function onWebsocketOpen() {
	currentReconnectDelay = initialReconnectDelay;
}

function onWebsocketClose() {
	ws.set(null);
	setTimeout(() => {
		reconnectToWebsocket();
	}, currentReconnectDelay + Math.floor(Math.random() * 3000));
}

function reconnectToWebsocket() {
	if (currentReconnectDelay < maxReconnectDelay) {
		currentReconnectDelay *= 2;
	}
	connect();
}
