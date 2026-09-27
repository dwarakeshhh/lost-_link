package com.lostlink.service;

import com.lostlink.dto.ItemRequest;
import com.lostlink.dto.ItemResponse;
import com.lostlink.exception.ConflictException;
import com.lostlink.exception.ResourceNotFoundException;
import com.lostlink.model.*;
import com.lostlink.repository.ItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ItemService {

    private final ItemRepository itemRepository;
    private final FileStorageService fileStorageService;

    public ItemService(ItemRepository itemRepository, FileStorageService fileStorageService) {
        this.itemRepository = itemRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public ItemResponse createItem(ItemRequest request, MultipartFile image) {
        // Image is validated and stored first - if this fails, no database row is created.
        String imageUrl = fileStorageService.store(image);

        Item item = new Item();
        item.setItemName(request.getItemName().trim());
        item.setCategory(request.getCategory());
        item.setDescription(request.getDescription());
        item.setImageUrl(imageUrl);
        item.setBuilding(request.getBuilding());
        item.setFloor(request.getFloor());
        item.setArea(request.getArea());
        item.setCurrentLocation(request.getCurrentLocation());
        item.setStatus(ItemStatus.AVAILABLE);

        Item saved = itemRepository.save(item);
        return ItemResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<ItemResponse> getAvailableItems() {
        return itemRepository.findByStatusOrderByCreatedAtDesc(ItemStatus.AVAILABLE)
                .stream().map(ItemResponse::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public ItemResponse getItemById(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));
        return ItemResponse.fromEntity(item);
    }

    @Transactional(readOnly = true)
    public List<ItemResponse> search(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return getAvailableItems();
        }
        return itemRepository.search(keyword.trim(), ItemStatus.AVAILABLE)
                .stream().map(ItemResponse::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public List<ItemResponse> filter(Category category, Building building, String floor, LocalDate foundDate) {
        return itemRepository.filter(ItemStatus.AVAILABLE, category, building, floor, foundDate)
                .stream().map(ItemResponse::fromEntity).toList();
    }

    @Transactional
    public ItemResponse claimItem(Long id) {
        // Atomic conditional update: only flips AVAILABLE -> CLAIMED, and only once.
        int rowsUpdated = itemRepository.claimIfAvailable(id);

        if (rowsUpdated == 0) {
            // Either the item doesn't exist, or it was already claimed - tell them which.
            Item item = itemRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));
            if (item.getStatus() == ItemStatus.CLAIMED) {
                throw new ConflictException("This item has already been claimed.");
            }
        }

        Item updated = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));
        return ItemResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteItem(Long id) {
        if (!itemRepository.existsById(id)) {
            throw new ResourceNotFoundException("Item not found with id: " + id);
        }
        itemRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAnalytics() {
        Map<String, Object> analytics = new LinkedHashMap<>();
        LocalDate today = LocalDate.now();

        analytics.put("totalItems", itemRepository.count());
        analytics.put("availableItems", itemRepository.countByStatus(ItemStatus.AVAILABLE));
        analytics.put("claimedItems", itemRepository.countByStatus(ItemStatus.CLAIMED));
        analytics.put("itemsFoundToday", itemRepository.countByFoundDate(today));
        analytics.put("itemsClaimedToday", itemRepository.countClaimedOnDate(today));

        Map<String, Long> byCategory = new LinkedHashMap<>();
        for (Object[] row : itemRepository.countByCategoryGrouped()) {
            byCategory.put(String.valueOf(row[0]), (Long) row[1]);
        }
        analytics.put("itemsByCategory", byCategory);

        Map<String, Long> byLocation = new LinkedHashMap<>();
        for (Object[] row : itemRepository.countByBuildingGrouped()) {
            byLocation.put(String.valueOf(row[0]), (Long) row[1]);
        }
        analytics.put("itemsByLocation", byLocation);

        List<ItemResponse> recentlyClaimed = itemRepository
                .findTop10ByStatusOrderByClaimedAtDesc(ItemStatus.CLAIMED)
                .stream().map(ItemResponse::fromEntity).toList();
        analytics.put("recentlyClaimed", recentlyClaimed);

        return analytics;
    }
}
