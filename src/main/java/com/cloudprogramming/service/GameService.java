package com.cloudprogramming.service;

import com.cloudprogramming.exception.InvalidGameException;
import com.cloudprogramming.exception.NotFoundException;
import com.cloudprogramming.model.Game;
import com.cloudprogramming.model.GamePlay;
import com.cloudprogramming.model.Player;
import com.cloudprogramming.model.TicToe;
import com.cloudprogramming.storage.GameStorage;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;
import software.amazon.awssdk.services.dynamodb.model.PutItemResponse;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static com.cloudprogramming.model.GameStatus.*;

@Service
@Slf4j
public class GameService {

    private final DynamoDbClient dynamoDbClient;

    @Autowired
    public GameService(DynamoDbClient dynamoDbClient) {
        this.dynamoDbClient = dynamoDbClient;
    }
    public void saveGameResult(String gameId, String winner, String loser) {
        Map<String, AttributeValue> item = new HashMap<>();
        item.put("game_id", AttributeValue.builder().s(gameId).build());
        item.put("timestamp", AttributeValue.builder().s(Instant.now().toString()).build());
        item.put("winner_username", AttributeValue.builder().s(winner).build());
        item.put("loser_username", AttributeValue.builder().s(loser).build());

        PutItemRequest request = PutItemRequest.builder()
                .tableName("game_results")
                .item(item)
                .build();

        PutItemResponse response = dynamoDbClient.putItem(request);
        log.debug(String.valueOf(response));
    }

    public Game createGame(Player player) {
        Game game = new Game();
        game.setBoard(new int[3][3]);
        game.setGameId(UUID.randomUUID().toString());
        game.setPlayer1(player);
        game.setStatus(NEW);
        game.setTurn(TicToe.X);
        GameStorage.getInstance().setGame(game);
        return game;
    }

    public Game joinGame(Player player) throws NotFoundException {

        Game game = GameStorage.getInstance().getGames().values().stream()
                .filter(it -> it.getStatus().equals(NEW))
                .findFirst().orElse(null);
        if (game == null) {
            game = createGame(player);
        } else {
            game.setPlayer2(player);
            game.setStatus(IN_PROGRESS);
            GameStorage.getInstance().setGame(game);
        }

        return game;
    }

    public Game gamePlay(GamePlay gamePlay) throws NotFoundException, InvalidGameException {
        if (!GameStorage.getInstance().getGames().containsKey(gamePlay.getGameId())) {
            throw new NotFoundException("Game not found");
        }

        Game game = GameStorage.getInstance().getGames().get(gamePlay.getGameId());
        if (game.getStatus().equals(FINISHED)) {
            throw new InvalidGameException("Game is already finished");
        }
        if(isPlayTypeInvalid(gamePlay, game)){
            return null;
        }


        int[][] board = game.getBoard();
        board[gamePlay.getCoordinateX()][gamePlay.getCoordinateY()] = gamePlay.getType().getValue();

        game.setTurn(gamePlay.getType().equals(TicToe.X) ? TicToe.O : TicToe.X);

        Boolean xWinner = checkWinner(game.getBoard(), TicToe.X);
        Boolean oWinner = checkWinner(game.getBoard(), TicToe.O);

        if (xWinner) {
            game.setWinner(TicToe.X);
            saveGameResult(game.getGameId(), game.getPlayer1().getLogin(), game.getPlayer2().getLogin());
        } else if (oWinner) {
            game.setWinner(TicToe.O);
            saveGameResult(game.getGameId(), game.getPlayer2().getLogin(), game.getPlayer1().getLogin());
        }

        GameStorage.getInstance().setGame(game);
        return game;
    }

    private static boolean isPlayTypeInvalid(GamePlay gamePlay, Game game) {
        return !game.getTurn().equals(gamePlay.getType());
    }

    private Boolean checkWinner(int[][] board, TicToe ticToe) {
        int[] boardArray = new int[9];
        int counterIndex = 0;
        for (int i = 0; i < board.length; i++) {
            for (int j = 0; j < board[i].length; j++) {
                boardArray[counterIndex] = board[i][j];
                counterIndex++;
            }
        }

        int[][] winCombinations = {{0, 1, 2}, {3, 4, 5}, {6, 7, 8}, {0, 3, 6}, {1, 4, 7}, {2, 5, 8}, {0, 4, 8}, {2, 4, 6}};
        for (int i = 0; i < winCombinations.length; i++) {
            int counter = 0;
            for (int j = 0; j < winCombinations[i].length; j++) {
                if (boardArray[winCombinations[i][j]] == ticToe.getValue()) {
                    counter++;
                    if (counter == 3) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}
