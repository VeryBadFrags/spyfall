/**
 * Websocket types shared by the Spyfall client and server.
 *
 * This package must only contain types: it is imported with `import type`,
 * so nothing from it exists at runtime. That keeps it usable by the server,
 * which runs TypeScript directly with Node's type stripping.
 */

export type ClientData = {
	avatar: string;
	name: string;
	ready: boolean;
};

export type JoinSessionPayload = {
	/** The lobby to join, empty to create a new one */
	sessionId: string;
	playerName: string;
	game: "spy";
};

export type PlayerReadyPayload = {
	ready: boolean;
};

export type ChatPayload = {
	/** The message to send */
	message: string;
	/** The color of the message */
	color?: string;
	/** The author of the message */
	author?: ClientData;
};

export type LobbyStatusPayload = {
	/** The ID of the room */
	sessionId: string;
	/** The identity of the current player */
	identity?: string;
	/** List of other players */
	peers?: Array<ClientData>;
};

export type GamePayload = {
	/** The player who goes first */
	first: string;
	/** If the player is the spy */
	spy: boolean;
	/** The current location */
	location: string;
	/** List of all locations */
	locations: Array<string>;
};

export type TimePayload = {
	/** The total length of a round in seconds */
	durationSec: number;
	/** The time left in the round in seconds */
	timeLeftSec: number;
};

/** Events sent by the client, handled by the server */
export interface ClientToServerEvents {
	"join-session": (payload: JoinSessionPayload) => void;
	"player-ready": (payload: PlayerReadyPayload) => void;
	"start-game": () => void;
	"chat-event": (payload: Pick<ChatPayload, "message">) => void;
}

/** Events sent by the server, handled by the client */
export interface ServerToClientEvents {
	"session-created": (payload: LobbyStatusPayload) => void;
	"session-broadcast": (payload: LobbyStatusPayload) => void;
	"start-game": (payload: GamePayload) => void;
	"chat-event": (payload: ChatPayload) => void;
	time: (payload: TimePayload) => void;
}

export type ClientEventName = keyof ClientToServerEvents;
export type ServerEventName = keyof ServerToClientEvents;

/** Any server event as a `{ type, data }` pair, narrowed by `type` */
export type ServerMessage = {
	[E in ServerEventName]: {
		type: E;
		data: Parameters<ServerToClientEvents[E]>[0];
	};
}[ServerEventName];
