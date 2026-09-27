package com.lostlink.dto;

import com.lostlink.model.Building;
import com.lostlink.model.Category;
import com.lostlink.model.CurrentLocation;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ItemRequest {

    @NotBlank(message = "Item name is required")
    private String itemName;

    @NotNull(message = "Category is required")
    private Category category;

    private String description;

    @NotNull(message = "Building is required")
    private Building building;

    @NotBlank(message = "Floor is required")
    private String floor;

    private String area;

    @NotNull(message = "Current location is required")
    private CurrentLocation currentLocation;

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Building getBuilding() { return building; }
    public void setBuilding(Building building) { this.building = building; }

    public String getFloor() { return floor; }
    public void setFloor(String floor) { this.floor = floor; }

    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }

    public CurrentLocation getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(CurrentLocation currentLocation) { this.currentLocation = currentLocation; }
}
