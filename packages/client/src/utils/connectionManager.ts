import type { Socket } from "socket.io-client";
import io from "socket.io-client";
import type {
	ClientEventName,
	ClientToServerEvents,
	ServerMessage,
	ServerToClientEvents,
} from "spyfall-types";

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export default class ConnectionManager {
	socket: GameSocket | null;

	constructor() {
		this.socket = null;
		// this.initSocket();
	}

	initSocket(setConnectedToServer: (connected: boolean) => void) {
		if (!this.socket) {
			this.socket = io(import.meta.env.VITE_API_URL);
		}

		this.socket.on("connect", () => {
			setConnectedToServer(this.socket?.connected ?? false);
		});
		this.socket.on("disconnect", () => {
			// TODO show error instead
			// setConnectedToServer(this.socket.connected);
		});

		this.socket.connect();
	}

	joinLobby(
		playerName: string,
		sessionId: string,
		connectionClosedCallback: () => void,
		onMessageCallback: (message: ServerMessage) => void,
		setConnectedToServer: (connected: boolean) => void,
	) {
		this.initSocket(setConnectedToServer);
		this.send("join-session", {
			sessionId: sessionId,
			playerName: playerName,
			game: "spy",
		});

		this.socket?.on("disconnect", () => {
			// this.socket = null;
			connectionClosedCallback();
		});

		this.socket?.on("start-game", (data) => {
			onMessageCallback({ type: "start-game", data });
		});

		this.socket?.on("session-broadcast", (data) => {
			onMessageCallback({ type: "session-broadcast", data });
		});

		this.socket?.on("session-created", (data) => {
			onMessageCallback({ type: "session-created", data });
		});

		this.socket?.on("chat-event", (data) => {
			onMessageCallback({ type: "chat-event", data });
		});

		this.socket?.on("time", (data) => {
			onMessageCallback({ type: "time", data });
		});
	}

	disconnect() {
		this.socket?.disconnect();
		// this.socket = null;
	}

	send<E extends ClientEventName>(
		type: E,
		...args: Parameters<ClientToServerEvents[E]>
	) {
		this.socket?.emit(type, ...args);
	}
}
