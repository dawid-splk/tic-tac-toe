const url = 'http://3.234.112.184:8080';
let stompClient;
let gameId;
let playerType;

function connectToSocket(gameId) {

    console.log("connecting to the game");
    let socket = new SockJS(url + "/gameplay");
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        console.log("connected to the frame: " + frame);
        stompClient.subscribe("/topic/game-progress/" + gameId, function (response) {
            let data = JSON.parse(response.body);
            console.log(data);
            displayResponse(data);
        })
    })
}

function create_game() {
    let login = document.getElementById("login").value;
    if (login == null || login === '') {
        alert("Please enter username");
    } else {
        $.ajax({
            url: url + "/game/join",
            type: 'POST',
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify({
                "login": login
            }),
            success: function (data) {
                gameId = data.gameId;
                playerType = data.status === 'NEW' ? 'X' : 'O';
                reset();
                connectToSocket(gameId);
                alert(data.status === 'NEW' ? "You created a game. Game id is: " + data.gameId : "You joined a game. Game id is: " + data.gameId);
                gameOn = true;  //TODO wtf is this
            },
            error: function (error) {
                console.log(error);
            }
        })
    }
}


