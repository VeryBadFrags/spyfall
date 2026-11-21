import type { Server as HttpServer } from "node:http";
import process from "node:process";
import { Server, type ServerOptions } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "spyfall-types";
import { logger } from "./logger.ts";

export type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;

export function initSocketIO(server: HttpServer) {
	const corsOrigins = process.env.CORS_ALLOW?.split(",");
	logger.info("Allowing cors", { origins: corsOrigins });
	const serverOptions: Partial<ServerOptions> = {
		cors: {
			origin: corsOrigins,
			methods: ["GET", "POST"],
		},
	};

	return new Server<ClientToServerEvents, ServerToClientEvents>(
		server,
		serverOptions,
	);
}
