package com.cloudprogramming.controller.dto;

import com.cloudprogramming.model.Player;
import lombok.Data;

@Data
public class ConnectRequest {
    private Player player;
    private String gameId;
}
