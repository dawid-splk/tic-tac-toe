package com.cloudprogramming.model;

import lombok.Data;

@Data
public class Game {

    private String gameId;
    private Player player1;
    private Player player2;
    private TicToe turn;
    private GameStatus status;
    private int[][] board;
    private TicToe winner;

}
