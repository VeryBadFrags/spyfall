import { createServer } from "node:http";
import { LogField, logEvent, logger } from "./logger.ts";
import { type GameSocket, Player } from "./player.ts";
import { Session } from "./session.ts";
import { initSocketIO } from "./socketio.ts";
import { startGame } from "./spy.ts";
import { createId } from "./utils/random.ts";

const server = createServer();

const io = initSocketIO(server);
const sessions = new Map();

function createClient(socket: GameSocket): Player {
	return new Player(socket);
}

function createSession(id = createId(4)): Session {
	while (sessions.has(id)) {
		logger.error("Session already exists", { room: id });
		id = createId();
	}
	const session = new Session(id, io);
	sessions.set(id, session);
	return session;
}

function getSession(id: string): Session {
	return sessions.get(id);
}

io.on("connection", (socket) => {
	const client = createClient(socket);
	let session: Session;

	socket.on("join-session", (data) => {
		if (session) {
			leaveSession(session, client);
		}
		if (data.sessionId) {
			session = getSession(data.sessionId) || createSession(data.sessionId);
		} else {
			session = createSession();
		}
		// TODO event SessionCreated is sent twice?
		client.sendSessionInfo("session-created", {
			sessionId: session.id,
		});
		if (session) {
			client.data.name = data.playerName;
			logEvent({
				room: session.id,
				player: client.data.name,
				type: "join-session",
				data: { [LogField.TotalRooms]: sessions.size },
			});
			if (session.join(client)) {
				session.broadcastPeers();
			} else {
				socket.disconnect();
			}
		}
	});

	socket.on("chat-event", (data) => {
		if (!session) {
			socket.disconnect();
		} else {
			logEvent({
				room: session.id,
				player: client.data.name,
				type: "chat-event",
				data: { [LogField.Msg]: data.message },
			});
			session.broadcastChat({
				author: client.data,
				message: data.message,
			});
		}
	});

	socket.on("player-ready", (data) => {
		if (!session) {
			socket.disconnect();
		} else {
			client.data.ready = data.ready;
			session.broadcastPeers();
		}
	});

	socket.on("start-game", () => {
		if (!session) {
			socket.disconnect();
		} else {
			const allReady = Array.from(session.players).reduce(
				(acc: boolean, player: Player): boolean => acc && player.data.ready,
				true,
			);
			if (allReady) {
				const customLocations = new Set<string>(); // TODO add support for custom locations
				startGame(session, customLocations);
			} else {
				client.sendChat({
					message: "All players must be ready",
					color: "red",
				});
			}
		}
	});

	socket.on("disconnect", () => {
		leaveSession(session, client);
	});
});

function leaveSession(session: Session, client: Player) {
	if (session) {
		session.removeClient(client);
		if (session.players.size === 0) {
			sessions.delete(session.id);
			logEvent({
				room: session.id,
				type: "session-deleted",
				data: { [LogField.TotalRooms]: sessions.size },
			});
		}
	}
}

const defaultPort = 8081;
const actualPort = process.env.PORT || defaultPort;
server.listen(actualPort, () => {
	logger.info("Listening for requests", { port: actualPort });
});
