package com.lostlink.repository;

import com.lostlink.model.Building;
import com.lostlink.model.Category;
import com.lostlink.model.Item;
import com.lostlink.model.ItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {

    // Public feed: only AVAILABLE items, newest first
    List<Item> findByStatusOrderByCreatedAtDesc(ItemStatus status);

    // Case-insensitive keyword search across name, category, description, building, area
    @Query("""
        SELECT i FROM Item i
        WHERE i.status = :status
        AND (
            LOWER(i.itemName) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(CAST(i.category AS string)) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(i.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(CAST(i.building AS string)) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(i.area) LIKE LOWER(CONCAT('%', :keyword, '%'))
        )
        ORDER BY i.createdAt DESC
        """)
    List<Item> search(@Param("keyword") String keyword, @Param("status") ItemStatus status);

    // Multi-filter query - any parameter may be null, meaning "don't filter on this"
    @Query("""
        SELECT i FROM Item i
        WHERE i.status = :status
        AND (:category IS NULL OR i.category = :category)
        AND (:building IS NULL OR i.building = :building)
        AND (:floor IS NULL OR i.floor = :floor)
        AND (:foundDate IS NULL OR i.foundDate = :foundDate)
        ORDER BY i.createdAt DESC
        """)
    List<Item> filter(
            @Param("status") ItemStatus status,
            @Param("category") Category category,
            @Param("building") Building building,
            @Param("floor") String floor,
            @Param("foundDate") LocalDate foundDate
    );

    // Atomic claim: only succeeds if the item is still AVAILABLE.
    // Returns the number of rows updated (0 or 1) - safe against duplicate/concurrent claim requests
    // without needing an extra version column.
    @Modifying
    @Query("UPDATE Item i SET i.status = 'CLAIMED', i.claimedAt = CURRENT_TIMESTAMP WHERE i.id = :id AND i.status = 'AVAILABLE'")
    int claimIfAvailable(@Param("id") Long id);

    long countByStatus(ItemStatus status);

    long countByFoundDate(LocalDate date);

    @Query("SELECT COUNT(i) FROM Item i WHERE i.status = 'CLAIMED' AND CAST(i.claimedAt AS date) = :date")
    long countClaimedOnDate(@Param("date") LocalDate date);

    @Query("SELECT i.category, COUNT(i) FROM Item i GROUP BY i.category ORDER BY COUNT(i) DESC")
    List<Object[]> countByCategoryGrouped();

    @Query("SELECT i.building, COUNT(i) FROM Item i GROUP BY i.building ORDER BY COUNT(i) DESC")
    List<Object[]> countByBuildingGrouped();

    List<Item> findTop10ByStatusOrderByClaimedAtDesc(ItemStatus status);
}
