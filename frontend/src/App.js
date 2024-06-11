import React, { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import './App.css';
import Register from "./Register";
import Login from "./Login";
import Logout from "./Logout";
import {refreshToken} from "./refreshToken";

const hostIp = process.env.REACT_APP_HOST_IP || 'localhost';
const url = `http://${hostIp}:8080`;

function App() {
  const [gameId, setGameId] = useState('');
  const [playerType, setPlayerType] = useState('');
  const [gameOn, setGameOn] = useState(false);
  const [turns, setTurns] = useState([["", "", ""], ["", "", ""], ["", "", ""]]);
  const [opponent, setOpponent] = useState("")
  const [stompClient, setStompClient] = useState(null);
  const [playerXImage, setPlayerXImage] = useState('');
  const [playerOImage, setPlayerOImage] = useState('');

  const connectToWebSocket = (gameId) => {
    const socket = new SockJS(url + "/gameplay");
    const stompClient = Stomp.over(socket);
    stompClient.connect({}, frame => {
      console.log("Connected: " + frame);
      stompClient.subscribe("/topic/game-progress/" + gameId, message => {
        if (message.body) {
          const response = JSON.parse(message.body);
          displayResponse(response);
        }
      });
    });
    setStompClient(stompClient);
  };

  // useEffect(() => {
  //   if (gameId) {
  //     connectToWebSocket(gameId);
  //   }

  //   // Cleanup on unmount
  //   return () => {
  //     if (stompClient) {
  //       stompClient.disconnect();
  //       console.log("Disconnected");
  //     }
  //   };
  // }, [gameId]);


  const reset = () => {
    setTurns([["", "", ""], ["", "", ""], ["", "", ""]]);
  };

  const playerTurn = (turn, x, y) => {
    if (gameOn) {
      if (turns[x][y] === "") {
        makeAMove(playerType, x, y);
      }
    }
  };

  const makeAMove = async (type, xCoordinate, yCoordinate) => {
    try {
      await refreshToken();

      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        throw new Error('Access token not available');
      }

      const response = await fetch(url + "/game/gameplay", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          "type": type,
          "coordinateX": xCoordinate,
          "coordinateY": yCoordinate,
          "gameId": gameId
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGameOn(false);
        displayResponse(data);
      } else {
        alert("Wait for your turn");
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const displayResponse = async (data) => {
    let newTurns = [...turns];
    let board = data.board;
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] === 1) {
          newTurns[i][j] = 'X';
        } else if (board[i][j] === 2) {
          newTurns[i][j] = 'O';
        }
      }
    }
    setTurns(newTurns);
    setGameOn(true);
    if (data.player2 != null) {
      setOpponent(data.player2.login);
      const player2Image = await fetchPlayerImage(data.player2.login);
      setPlayerOImage(player2Image); // Fetch and set player O image only when player2 is available
    }
    if (data.winner != null) {
      alert("Winner is " + data.winner);
      setPlayerXImage('');
      setPlayerOImage('');
      setGameOn(false);
      reset();
    }
  };


  const fetchPlayerImage = async (username) => {
    try {

      // const testImageUrl = 'https://via.placeholder.com/150';
      // return testImageUrl;
      const accessToken = localStorage.getItem('accessToken');


      const response = await fetch(`${url}/image/${username}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
      });
      if (response.ok) {
        const imageUrl = await response.text();
        return imageUrl;
      } else {
        console.error('Failed to fetch user image');
        return null;
      }
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  const createGame = async () => {
    // let login = document.getElementById("login").value;
    const login = localStorage.getItem('username');
    if (!login) {
      // alert("Please enter username");
      alert("We're having trouble authenticating you");
      return;
    }

    await refreshToken();

    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
        throw new Error('Access token not available');
    }

    try {
      const response = await fetch(url + "/game/join", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          "login": login
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGameId(data.gameId);
        setPlayerType(data.status === 'NEW' ? 'X' : 'O');
        reset();
        connectToWebSocket(data.gameId);
        alert(data.status === 'NEW' ? "You created a game." : "You joined a game.");
        setGameOn(true);


        let newTurns = [["", "", ""], ["", "", ""], ["", "", ""]];
        let board = data.board;
        for (let i = 0; i < board.length; i++) {
          for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === 1) {
              newTurns[i][j] = 'X';
            } else if (board[i][j] === 2) {
              newTurns[i][j] = 'O';
            }
          }
        }
        setTurns(newTurns);

        const player1Image = await fetchPlayerImage(data.player1.login);
        setPlayerXImage(player1Image);

      } else {
        console.error('Game creation failed');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
      <div>
        {localStorage.getItem('accessToken') ? (
            <div className="text-center" id="box">
              <header>
                <h1>IP: {hostIp}</h1>
              </header>
              <div className="text-center" id="usernameForm">
                <button id="joinButton" onClick={createGame}>Join new game</button>
              </div>
              <div id="message"></div>
              <div className="game-area">
                <div id="player-images">
                  {playerXImage && <img src={playerXImage} alt="Player X" className="player-image" />}
                  {playerXImage && playerOImage && <h1>vs</h1>}
                  {playerOImage && <img src={playerOImage} alt="Player O" className="player-image" />}
                </div>
                <ul id="gameBoard">
                  {turns.map((row, i) => (
                      row.map((symbol, j) => (
                          <li key={`${i}_${j}`} className="tic" onClick={() => playerTurn(playerType, i, j)}>{symbol}</li>
                      ))
                  ))}
                </ul>
              </div>
              <div className="clearfix"></div>
              <footer>
                <span><span id="oponentLogin"></span></span>
              </footer>
              <Logout />
            </div>
        ) : (
            <>
              <Register />
              <Login />
            </>
        )}
      </div>
  );
}

export default App;