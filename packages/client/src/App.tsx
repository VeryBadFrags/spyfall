import ConnectBox from "@components/ConnectBox";
import ConnectionInfo from "@components/ConnectionInfo";
import ErrorBox, { useErrorMessageStore } from "@components/ErrorBox";
import Hero from "@components/Hero";
import Locations from "@components/Locations";
import Chat, { useChatStore } from "@components/modules/Chat/Chat";
import { useTimerStore } from "@components/modules/Chat/Timer";
import GameSettings from "@components/modules/GameSettings/GameSettings";
import PlayersList from "@components/PlayersList";
import Rules from "@components/Rules";
import Toast from "@components/Toast";
import {
	useCrossedStore,
	useLobbyStore,
	useSessionIdStore,
	useToastStore,
} from "@store/store";
import ConnectionManager from "@utils/connectionManager";
import { setCurrentLobby } from "@utils/lobbyHelper";
import { umamiTrackRoundStarted } from "@utils/umami";
import { useCallback, useEffect, useRef } from "react";
import type { GamePayload, ServerMessage } from "spyfall-protocol";

const connectionManager = new ConnectionManager();

export default function App() {
	const connectBoxRef = useRef<HTMLDivElement>(null);
	const setSessionId = useSessionIdStore((state) => state.setSessionId);
	const setIsConnected = useLobbyStore((state) => state.setIsConnected);
	const isInLobby = useLobbyStore((state) => state.isInLobby);
	const setIsInLobby = useLobbyStore((state) => state.setIsInLobby);
	const setGameStarted = useLobbyStore((state) => state.setGameStarted);
	const setIsPlayerReady = useLobbyStore((state) => state.setIsPlayerReady);
	const setPeers = useLobbyStore((state) => state.setPeers);
	const setLocations = useLobbyStore((state) => state.setLocations);
	const setCurrentLocation = useLobbyStore((state) => state.setCurrentLocation);
	const setChatContent = useChatStore((state) => state.setChatContent);
	const appendChat = useChatStore((state) => state.appendChat);
	const setServerTime = useTimerStore((state) => state.setServerTime);
	const setCrossedLocations = useCrossedStore(
		(state) => state.setCrossedLocations,
	);
	const setCrossedPeers = useCrossedStore((state) => state.setCrossedPeers);
	const setErrorMessage = useErrorMessageStore(
		(state) => state.setErrorMessage,
	);
	const showToast = useToastStore((state) => state.showToast);

	const handlePlayNowClick = useCallback(() => {
		connectBoxRef.current?.scrollIntoView({ behavior: "smooth" });
		// Focus on the player name input after scrolling and add highlight
		setTimeout(() => {
			const input = document.getElementById("player-name");
			if (input) {
				input.focus();
				input.classList.add("highlight-input");
				// Remove the class after animation completes
				setTimeout(() => input.classList.remove("highlight-input"), 1600);
			}
		}, 500);
	}, []);

	useEffect(() => {
		connectionManager.initSocket(setIsConnected);
	}, [setIsConnected]);

	const resetAll = useCallback(() => {
		setErrorMessage("");
		setChatContent([]);
		setIsInLobby(false);
		setIsPlayerReady(false);
		setSessionId("");
		setPeers([]);
		setCrossedLocations(new Set<number>());
		setCrossedPeers(new Set<number>());
		setGameStarted(false);
		window.scrollTo(0, 0);
	}, [
		setErrorMessage,
		setChatContent,
		setIsInLobby,
		setIsPlayerReady,
		setSessionId,
		setPeers,
		setCrossedLocations,
		setCrossedPeers,
		setGameStarted,
	]);

	const disconnectCallback = useCallback(() => {
		resetAll();
		connectionManager.disconnect();
	}, [resetAll]);

	const onDisconnectCallback = useCallback(() => {
		resetAll();
		setErrorMessage("Disconnected from Lobby");
	}, [resetAll, setErrorMessage]);

	const startGame = useCallback(
		(data: GamePayload) => {
			// TODO consolidate with resetAll?
			window.scrollTo(0, 0);
			setChatContent([]);
			setIsPlayerReady(false);
			setLocations(data.locations.map((loc) => ({ name: loc })));
			setCurrentLocation(data.location);
			setCrossedLocations(new Set<number>());
			setCrossedPeers(new Set<number>());
			appendChat({ message: "Game started" });
			setGameStarted(true);
			showToast("🕵 New round started!");
			umamiTrackRoundStarted();

			if (data.spy) {
				appendChat({
					message: "🕵️ You are the spy, try to guess the current location",
					color: "red",
				});
			} else {
				appendChat({
					message: `😇 You are not the spy, the location is ${data.location}`,
					color: "blue",
				});
			}

			appendChat({ message: `First player: ${data.first}` });
		},
		[
			appendChat,
			setChatContent,
			setIsPlayerReady,
			setLocations,
			setCurrentLocation,
			setCrossedLocations,
			setCrossedPeers,
			setGameStarted,
			showToast,
		],
	);

	const onMessageCallback = useCallback(
		({ type, data }: ServerMessage) => {
			switch (type) {
				case "chat-event":
					appendChat(data);
					break;
				case "session-broadcast":
					setSessionId(data.sessionId);
					setPeers(data.peers || []);
					break;
				case "start-game":
					startGame(data);
					break;
				case "session-created":
					setIsInLobby(true);
					setErrorMessage("");
					setSessionId(data.sessionId);
					setCurrentLobby(data.sessionId);
					break;
				case "time":
					setServerTime(data);
					break;
			}
		},
		[
			appendChat,
			startGame,
			setSessionId,
			setPeers,
			setIsInLobby,
			setErrorMessage,
			setServerTime,
		],
	);

	const sendChatCallBack = useCallback((message: string) => {
		connectionManager.send("chat-event", { message: message });
	}, []);

	return (
		<>
			{!isInLobby && <Hero onPlayNowClick={handlePlayNowClick} />}

			<main className="container-fluid h-100 pt-3">
				<ConnectionInfo />

				<ErrorBox />

				<div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xxl-4 gx-xl-5 gy-4">
					{isInLobby ? (
						<>
							<Chat sendChatCallBack={sendChatCallBack} />
							<Locations />
							<PlayersList />
							<GameSettings
								connectionManager={connectionManager}
								disconnectCallback={disconnectCallback}
							/>
						</>
					) : (
						<div ref={connectBoxRef}>
							<ConnectBox
								connectionManager={connectionManager}
								onDisconnect={onDisconnectCallback}
								onMessageCallback={onMessageCallback}
							/>
						</div>
					)}
					<Rules />
				</div>
			</main>

			<Toast />
		</>
	);
}
