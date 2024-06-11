package com.cloudprogramming.controller;

import com.cloudprogramming.service.S3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
public class UserController {
    private final S3Service s3Service;

    @Autowired
    public UserController(S3Service s3Service) {
        this.s3Service = s3Service;
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadProfileImage(@RequestParam("file") MultipartFile file, @RequestParam("username") String username) {
        try {
            String key = s3Service.uploadFile(file, username);
            return ResponseEntity.ok(s3Service.getFileSignedUrl(username));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/image/{username}")
    public ResponseEntity<String> getUserImage(@PathVariable String username) {
        try {
            String imageUrl = s3Service.getFileSignedUrl(username);
//            String imageUrl = s3Service.getFileSignedUrl("test2");
            return ResponseEntity.ok(imageUrl);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}