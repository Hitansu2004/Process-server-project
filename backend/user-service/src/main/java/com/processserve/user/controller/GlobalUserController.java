package com.processserve.user.controller;

import com.processserve.user.entity.GlobalUser;
import com.processserve.user.repository.GlobalUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class GlobalUserController {

    private final GlobalUserRepository globalUserRepository;

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable String id) {
        return globalUserRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
