package com.lostlink.controller;

import com.lostlink.dto.ItemRequest;
import com.lostlink.dto.ItemResponse;
import com.lostlink.model.Building;
import com.lostlink.model.Category;
import com.lostlink.service.ItemService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    // POST /api/items  (multipart/form-data: "item" = JSON part, "image" = file part)
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ItemResponse> createItem(
            @RequestPart("item") @Valid ItemRequest request,
            @RequestPart("image") MultipartFile image) {
        ItemResponse created = itemService.createItem(request, image);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // GET /api/items -> all AVAILABLE items, newest first
    @GetMapping
    public ResponseEntity<List<ItemResponse>> getAllAvailableItems() {
        return ResponseEntity.ok(itemService.getAvailableItems());
    }

    // GET /api/items/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ItemResponse> getItemById(@PathVariable Long id) {
        return ResponseEntity.ok(itemService.getItemById(id));
    }

    // GET /api/items/search?keyword=wallet
    @GetMapping("/search")
    public ResponseEntity<List<ItemResponse>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(itemService.search(keyword));
    }

    // GET /api/items/filter?category=&building=&floor=&date=
    @GetMapping("/filter")
    public ResponseEntity<List<ItemResponse>> filter(
            @RequestParam(required = false) Category category,
            @RequestParam(required = false) Building building,
            @RequestParam(required = false) String floor,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(itemService.filter(category, building, floor, date));
    }

    // PUT /api/items/{id}/claim
    @PutMapping("/{id}/claim")
    public ResponseEntity<ItemResponse> claimItem(@PathVariable Long id) {
        return ResponseEntity.ok(itemService.claimItem(id));
    }

    // DELETE /api/items/{id}  (admin cleanup - separate from claiming, never triggered by claim flow)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        itemService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }
}
