package com.lostlink.dto;

import com.lostlink.model.ReportReason;
import jakarta.validation.constraints.NotNull;

public class ReportRequest {

    @NotNull(message = "Item id is required")
    private Long itemId;

    @NotNull(message = "Reason is required")
    private ReportReason reason;

    private String description;

    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }

    public ReportReason getReason() { return reason; }
    public void setReason(ReportReason reason) { this.reason = reason; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
