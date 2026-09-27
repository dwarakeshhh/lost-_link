package com.lostlink.dto;

import com.lostlink.model.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class ItemResponse {

    private Long id;
    private String itemName;
    private Category category;
    private String description;
    private String imageUrl;
    private Building building;
    private String floor;
    private String area;
    private CurrentLocation currentLocation;
    private LocalDate foundDate;
    private LocalTime foundTime;
    private ItemStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime claimedAt;

    public static ItemResponse fromEntity(Item item) {
        ItemResponse res = new ItemResponse();
        res.id = item.getId();
        res.itemName = item.getItemName();
        res.category = item.getCategory();
        res.description = item.getDescription();
        res.imageUrl = item.getImageUrl();
        res.building = item.getBuilding();
        res.floor = item.getFloor();
        res.area = item.getArea();
        res.currentLocation = item.getCurrentLocation();
        res.foundDate = item.getFoundDate();
        res.foundTime = item.getFoundTime();
        res.status = item.getStatus();
        res.createdAt = item.getCreatedAt();
        res.claimedAt = item.getClaimedAt();
        return res;
    }

    public Long getId() { return id; }
    public String getItemName() { return itemName; }
    public Category getCategory() { return category; }
    public String getDescription() { return description; }
    public String getImageUrl() { return imageUrl; }
    public Building getBuilding() { return building; }
    public String getFloor() { return floor; }
    public String getArea() { return area; }
    public CurrentLocation getCurrentLocation() { return currentLocation; }
    public LocalDate getFoundDate() { return foundDate; }
    public LocalTime getFoundTime() { return foundTime; }
    public ItemStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getClaimedAt() { return claimedAt; }
}
