-- LostLink database schema (reference only).
-- With spring.jpa.hibernate.ddl-auto=update, Hibernate creates/updates these
-- tables automatically on startup. This script is provided for reference,
-- for manual setup, or if you switch ddl-auto to 'validate'/'none'.

CREATE DATABASE IF NOT EXISTS lostlink_db;
USE lostlink_db;

CREATE TABLE IF NOT EXISTS items (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_name         VARCHAR(150)  NOT NULL,
    category          VARCHAR(30)   NOT NULL,
    description       VARCHAR(1000),
    image_url         VARCHAR(255),
    building          VARCHAR(30)   NOT NULL,
    floor             VARCHAR(30),
    area              VARCHAR(150),
    current_location  VARCHAR(30)   NOT NULL,
    found_date        DATE          NOT NULL,
    found_time        TIME          NOT NULL,
    status            VARCHAR(20)   NOT NULL DEFAULT 'AVAILABLE',
    created_at        DATETIME      NOT NULL,
    updated_at        DATETIME      NOT NULL,
    claimed_at        DATETIME
);

CREATE TABLE IF NOT EXISTS reports (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id     BIGINT       NOT NULL,
    reason      VARCHAR(30)  NOT NULL,
    description VARCHAR(500),
    created_at  DATETIME     NOT NULL,
    status      VARCHAR(20)  NOT NULL DEFAULT 'OPEN'
);

CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_building ON items(building);
CREATE INDEX idx_reports_item_id ON reports(item_id);
