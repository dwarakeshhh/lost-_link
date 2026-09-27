# LostLink — Campus Lost & Found System

A frictionless Lost & Found system for college campuses. No login required.
Found something? Snap a photo and post its location in seconds.
Lost something? Search or filter the feed, find it, and see exactly where to collect it.

## Tech Stack

- **Frontend:** Plain HTML5, CSS3, JavaScript — no frameworks, served directly by Spring Boot
- **Backend:** Spring Boot 3, Spring Web, Spring Data JPA, Hibernate, Maven
- **Database:** MySQL

Since the frontend is served from `src/main/resources/static` by the same Spring Boot app,
everything runs on **one port (8080)** — no separate frontend server, no CORS setup needed.

## Prerequisites

- Java 17+ (tested against Java 25 runtime; compiled for Java 21 bytecode for tooling compatibility)
- Maven
- MySQL 8+ running locally

## Setup

1. **Create the database** (or let Hibernate auto-create it on first run):
   ```sql
   CREATE DATABASE lostlink_db;
   ```
   `schema.sql` in this folder has the full reference schema if you want to create tables manually.

2. **Set your MySQL credentials** in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   ```

3. **Run it:**
   ```bash
   mvn spring-boot:run
   ```

4. Open **http://localhost:8080** in your browser. That's it — frontend and backend both run
   from this one command.

Camera capture requires either `localhost` or HTTPS — browsers block camera access on plain
HTTP for any host other than localhost. If you test from a phone on the same Wi-Fi, you'll
need HTTPS (e.g. a tunneling tool like ngrok) for the camera to work; the app falls back to a
plain file picker (which still opens the phone's camera app via `capture="environment"`) when
`getUserMedia` isn't available.

## Project Structure

```
lostlink-vanilla/
├── pom.xml
├── schema.sql                     Reference SQL schema
├── src/main/java/com/lostlink/
│   ├── LostLinkApplication.java
│   ├── controller/                 ItemController, ReportController, AnalyticsController
│   ├── service/                    ItemService, ReportService, FileStorageService
│   ├── repository/                 ItemRepository, ReportRepository
│   ├── model/                      Item, Report, and enums (Category, Building, etc.)
│   ├── dto/                        ItemRequest, ItemResponse, ReportRequest
│   ├── exception/                  Custom exceptions + GlobalExceptionHandler
│   └── config/                     WebConfig (serves uploaded photos as static files)
└── src/main/resources/
    ├── application.properties
    └── static/                     The whole frontend
        ├── index.html               Home page: hero + feed
        ├── post.html                Camera-first found-item posting
        ├── item.html                Item details, claim, report
        ├── search.html              Search & filter
        ├── analytics.html           Dashboard
        ├── css/style.css
        └── js/
            ├── app.js                Shared constants + fetch helpers
            ├── items.js              Feed card rendering
            ├── camera.js             getUserMedia capture + fallback
            ├── post.js               Wires camera + form together
            ├── claim.js              Item details: claim confirm + report modal
            ├── search.js             Search/filter page logic
            └── analytics.js          Dashboard (plain CSS bar charts, no libraries)
```

## API Reference

| Method | Endpoint                     | Description                              |
|--------|-------------------------------|-------------------------------------------|
| POST   | `/api/items`                  | Create a found item (multipart: `item` JSON part + `image` file part) |
| GET    | `/api/items`                  | All AVAILABLE items, newest first         |
| GET    | `/api/items/{id}`              | Get one item                              |
| GET    | `/api/items/search?keyword=`   | Case-insensitive keyword search           |
| GET    | `/api/items/filter?...`        | Filter by category/building/floor/date    |
| PUT    | `/api/items/{id}/claim`        | Mark item as CLAIMED                      |
| DELETE | `/api/items/{id}`              | Admin cleanup (does not affect claim logic) |
| POST   | `/api/reports`                 | Report a post                             |
| GET    | `/api/reports`                 | List all reports (admin)                  |
| GET    | `/api/analytics`               | Dashboard stats                           |

## Business Rules Implemented

- New items start as `AVAILABLE`; only `AVAILABLE` items appear in the public feed.
- Claiming sets `CLAIMED` + `claimed_at` via an **atomic conditional UPDATE**
  (`WHERE status = 'AVAILABLE'`) — this is what makes the claim operation safe against
  duplicate/concurrent requests without needing an extra version column.
- Claiming an already-claimed item returns `409 Conflict` with a clear message.
- Claimed items are never deleted; only a separate admin `DELETE` endpoint removes records.
- Image uploads are validated by content type (JPG/PNG/WEBP) and size (5MB max); filenames
  are always server-generated — the original filename is never trusted.
- Search is case-insensitive across name, category, description, building, and area.
- No login, registration, JWT, or student profiles anywhere in the system.
- All backend validation is enforced server-side (`@Valid` + `GlobalExceptionHandler`),
  not just in the frontend JavaScript.
- Errors return clean JSON (`timestamp`, `status`, `message`) — no stack traces are ever
  sent to the browser.

## Testing with Postman

Suggested order, matching the phased build:

1. `POST /api/items` (multipart, with `item` and `image` parts) → confirm `201 Created`
2. `GET /api/items` → confirm the new item appears
3. `GET /api/items/{id}` → confirm details match
4. `GET /api/items/search?keyword=...` → confirm case-insensitive match
5. `GET /api/items/filter?category=...&building=...` → confirm combined filters work
6. `PUT /api/items/{id}/claim` → confirm status flips to `CLAIMED`
7. `PUT /api/items/{id}/claim` again → confirm `409 Conflict`
8. `GET /api/items/999999` → confirm clean `404` JSON, no stack trace
9. `POST /api/reports` → confirm report is recorded
10. `GET /api/analytics` → confirm counts match what you've created

## Notes on Java 25

The Maven POM targets Java 21 bytecode (an LTS version) for maximum compatibility with
Spring Boot's tooling. Your installed Java 25 JDK compiles and runs this without issue,
since newer JDKs run older-targeted bytecode fine.
