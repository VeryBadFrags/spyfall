import type {
	ChatPayload,
	LobbyStatusPayload,
	TimePayload,
} from "spyfall-types";
import { allAvatars, roundDurationSeconds } from "./constants.ts";
import { LogField, logEvent, logger } from "./logger.ts";
import type { Player } from "./player.ts";
import type { GameServer } from "./socketio.ts";
import { getTimeInSeconds } from "./utils/time.ts";

/**
 * @class
 * @public
 */
export class Session {
	/** ID of the room */
	id;
	/** Socket.io Server */
	io: GameServer;
	players: Set<Player>;
	avatars;
	/** How many games have been started in this room */
	gamesPlayed = 0;
	/** EPOCH time the round started */
	roundStartTime = 0;

	constructor(id: string, io: GameServer) {
		this.id = id;
		this.io = io;
		this.players = new Set();
		this.avatars = [...allAvatars];
		// shuffleArray(this.avatars);
	}

	/**
	 * @param {Player} client
	 * @returns {boolean} true if the client was able to join
	 */
	join(client: Player): boolean {
		if (this.players.has(client)) {
			logger.error("Client already in session", { room: this.id });
			return false;
		}

		if (this.avatars.length === 0) {
			logger.error("The game is full", { room: this.id });
			return false;
		}

		this.players.add(client);
		// Join the socket.io room
		client.joinRoom(this.id);

		const avatar = this.avatars.shift();
		client.data.avatar = avatar ? avatar : "?";
		client.data.name = `${avatar} ${client.data.name}`; // TODO keep name and avatar separate

		client.sendSessionInfo("session-created", {
			sessionId: this.id,
			identity: avatar,
		} as LobbyStatusPayload);
		return true;
	}

	removeClient(client: Player): void {
		this.players.delete(client);
		this.avatars.push(client.data.avatar);
		this.broadcastPeers();
		logEvent({
			room: this.id,
			player: client.data.name,
			type: "disconnect",
			data: { [LogField.PlayersCount]: this.players.size },
		});
		this.broadcastChat({
			message: `${client.data.name} disconnected`,
		});
	}

	startGame() {
		this.broadcastPeers();
		this.gamesPlayed++;
		this.roundStartTime = getTimeInSeconds();
		logEvent({
			room: this.id,
			type: "start-game",
			data: {
				[LogField.PlayersCount]: this.players.size,
				[LogField.GamesPlayed]: this.gamesPlayed,
			},
		});
		this.broadcastTime();
	}

	getTimeLeftSeconds() {
		const currentTime = getTimeInSeconds();
		const elapsed = currentTime - this.roundStartTime;
		return roundDurationSeconds - elapsed;
	}

	/**
	 * Send a message to all players in the room.
	 */
	broadcastChat(chat: ChatPayload): void {
		this.io.to(this.id).emit("chat-event", chat);
	}

	broadcastPeers(): void {
		const clientsArray = Array.from(this.players);
		const payload = {
			sessionId: this.id,
			peers: clientsArray.map((cli) => cli.data),
		} as LobbyStatusPayload;
		this.io.to(this.id).emit("session-broadcast", payload);
	}

	broadcastTime(): void {
		const timeLeftSeconds = this.getTimeLeftSeconds();
		this.io.to(this.id).emit("time", {
			durationSec: roundDurationSeconds,
			timeLeftSec: timeLeftSeconds,
		} as TimePayload);
	}
}
