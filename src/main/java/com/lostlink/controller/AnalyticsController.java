package com.lostlink.controller;

import com.lostlink.service.ItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final ItemService itemService;

    public AnalyticsController(ItemService itemService) {
        this.itemService = itemService;
    }

    // GET /api/analytics
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        return ResponseEntity.ok(itemService.getAnalytics());
    }
}
