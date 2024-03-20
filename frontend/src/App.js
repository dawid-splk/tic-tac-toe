import React, { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import './App.css';


const url = 'http://localhost:8080';

function App() {
  const [gameId, setGameId] = useState('');
  const [playerType, setPlayerType] = useState('');
  const [gameOn, setGameOn] = useState(false);
  const [turns, setTurns] = useState([["", "", ""], ["", "", ""], ["", "", ""]]);
  const [opponent, setOpponent] = useState("")
  const [stompClient, setStompClient] = useState(null);

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
      const response = await fetch(url + "/game/gameplay", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

  const displayResponse = (data) => {
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
    setOpponent(data.player2.login)
    if (data.winner != null) {
      alert("Winner is " + data.winner);
      setGameOn(false);
      reset();
    }
  };

  const createGame = async () => {
    let login = document.getElementById("login").value;
    if (!login) {
      alert("Please enter username");
      return;
    }

    try {
      const response = await fetch(url + "/game/join", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      } else {
        console.error('Game creation failed');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Hier würde das JSX-Layout für Ihre Spieloberfläche gehen
  return (
    <div className="text-center" id="box">
    <header>
        <h1>Tic Tac Toe</h1>
    </header>
    <div className="text-center" id="usernameForm">
        <input  id="login" placeholder="Enter username"></input>
        <button id="joinButton" onClick={createGame}>Join new game</button>
    </div>
    <div id="message"></div>    
    <ul id="gameBoard">
    {turns.map((row, i) => (
    row.map((symbol, j) => (
      <li key={`${i}_${j}`} className="tic" onClick={() => playerTurn(playerType, i, j)}>{symbol}</li>
    ))
  ))}
    </ul>

    <div className="clearfix"></div>
    <footer>
        <span><span id="oponentLogin"></span></span>
    </footer>
    </div>
  );
}

export default App;