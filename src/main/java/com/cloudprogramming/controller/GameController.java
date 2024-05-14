package com.cloudprogramming.controller;

import com.cloudprogramming.exception.InvalidGameException;
import com.cloudprogramming.exception.NotFoundException;
import com.cloudprogramming.model.Game;
import com.cloudprogramming.model.GamePlay;
import com.cloudprogramming.model.Player;
import com.cloudprogramming.service.GameService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@Slf4j
@AllArgsConstructor
@RequestMapping("/game")
public class GameController {

    private final GameService gameService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @PostMapping("/join")
    public ResponseEntity<Game> join(@RequestBody Player player) throws NotFoundException {
        log.info("join game request: {}", player);
        return ResponseEntity.ok(gameService.joinGame(player));
    }

    @PostMapping("/gameplay")
    public ResponseEntity<Game> gamePlay(@RequestBody GamePlay request) throws NotFoundException, InvalidGameException {
        log.info("gameplay: {}", request);
        Game game = gameService.gamePlay(request);
        if(game == null) {
            return ResponseEntity.badRequest().build();
        } else {
            simpMessagingTemplate.convertAndSend("/topic/game-progress/" + game.getGameId(), game);
            return ResponseEntity.ok(game);
        }
    }

    @GetMapping("/hello")
    public ResponseEntity<String> hello() {
        return ResponseEntity.ok("Hello from public endpoint in Game Controller!");
    }

    @GetMapping("/secure")
    public ResponseEntity<String> secureHello() {
        return ResponseEntity.ok("Hello from secure endpoint in Game Controller!");
    }
}
