package com.firemap.backend.controller;

import com.firemap.backend.dto.ChatRequest;
import com.firemap.backend.dto.ChatResponse;
import com.firemap.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ChatResponse ask(@RequestBody ChatRequest request) {
        String answer = chatService.askGpt(request.getQuestion());
        return new ChatResponse(answer);
    }
}