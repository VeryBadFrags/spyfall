import Card from "@components/Card";
import {
	useLobbyStore,
	usePlayerNameStore,
	useSessionIdStore,
} from "@store/store";
import type ConnectionManager from "@utils/connectionManager";
import { retrieveCurrentLobby } from "@utils/lobbyHelper";
import { umamiIdentify } from "@utils/umami";
import { useEffect, useState } from "react";
import { FaDice, FaUser } from "react-icons/fa";
import type { ServerMessage } from "spyfall-protocol";

interface ConnectProps {
	connectionManager: ConnectionManager;
	onDisconnect: () => void;
	onMessageCallback: (message: ServerMessage) => void;
}

export default function ConnectBox(props: ConnectProps) {
	const [buttonText, setButtonText] = useState("🏠 Create Lobby");

	const sessionId = useSessionIdStore((state) => state.sessionId);
	const playerName = usePlayerNameStore((state) => state.playerName);
	const setPlayerName = usePlayerNameStore((state) => state.setPlayerName);
	const setSessionId = useSessionIdStore((state) => state.setSessionId);
	const setIsConnected = useLobbyStore((state) => state.setIsConnected);
	const setIsInLobby = useLobbyStore((state) => state.setIsInLobby);

	const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsInLobby(true);

		const wrappedCallback = (message: ServerMessage) => {
			if (message.type === "session-created") {
				umamiIdentify(playerName, message.data.sessionId);
			}
			props.onMessageCallback(message);
		};

		props.connectionManager.joinLobby(
			playerName,
			sessionId,
			props.onDisconnect,
			wrappedCallback,
			setIsConnected,
		);
	};

	const handleLobbyCodeChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const target = event.target as HTMLInputElement;
		const value = target.value;
		if (target.value) {
			setButtonText("🔌 Join Lobby");
			setSessionId(value.toUpperCase());
		} else {
			setButtonText("🏠 Create Lobby");
			setSessionId(value);
		}
	};

	// Add Lobby ID to URL
	useEffect(() => {
		const lobbyCode = retrieveCurrentLobby();
		if (lobbyCode) {
			setButtonText("🔌 Join Lobby");
			setSessionId(lobbyCode);
		}
	}, [setSessionId]);

	return (
		<Card>
			<form onSubmit={handleSubmit}>
				<div className="mb-3">
					<label htmlFor="player-name" className="form-label">
						<FaUser /> <span>Player name</span>
					</label>
					<input
						id="player-name"
						type="text"
						className="form-control"
						required
						autoComplete="on"
						maxLength={16}
						value={playerName}
						onChange={(e) => setPlayerName(e.target.value)}
					/>
				</div>
				{/* Lobby input */}
				<div className="mb-3">
					<label htmlFor="lobby-input" className="form-label">
						<FaDice /> <span>Lobby code</span>
					</label>
					<input
						id="lobby-input"
						type="text"
						className="form-control"
						pattern="[A-Za-z0-9]*"
						title="Lobby Code (alphanumeric)"
						placeholder="(Optional)"
						minLength={0}
						maxLength={8}
						autoComplete="off"
						value={sessionId}
						onChange={handleLobbyCodeChange}
					/>
				</div>
				<div className="d-grid">
					<button type="submit" className="btn btn-primary">
						{buttonText}
					</button>
				</div>
			</form>
		</Card>
	);
}
