import type { Socket } from "socket.io";
import type {
	ChatPayload,
	ClientData,
	ClientToServerEvents,
	GamePayload,
	LobbyStatusPayload,
	ServerToClientEvents,
} from "spyfall-protocol";

export type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

/**
 * @class
 * @public
 */
export class Player {
	/** The socket.io client socket */
	socket: GameSocket;
	data: ClientData;

	/**
	 * @param {GameSocket} socket The socket.io client socket
	 */
	constructor(socket: GameSocket) {
		this.socket = socket;
		this.data = { avatar: "", name: "New Player", ready: false };
	}

	joinRoom(id: string) {
		this.socket.join(id);
	}

	sendSessionInfo(
		type: "session-created" | "session-broadcast",
		data: LobbyStatusPayload,
	) {
		this.socket.emit(type, data);
	}

	sendStartGame(data: GamePayload) {
		this.socket.emit("start-game", data);
	}

	/**
	 * Send a chat event to the player
	 * @param data
	 */
	sendChat(data: ChatPayload) {
		this.socket.emit("chat-event", data);
	}
}
