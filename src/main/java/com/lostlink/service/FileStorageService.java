package com.lostlink.service;

import com.lostlink.exception.InvalidImageException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${lostlink.upload.dir}")
    private String uploadDir;

    private static final List<String> ALLOWED_TYPES = List.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp"
    );

    private static final long MAX_SIZE_BYTES = 5L * 1024 * 1024; // 5MB

    /**
     * Validates and stores an uploaded image, returning a public URL path.
     * The original filename is never trusted - a new random filename is always generated.
     */
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidImageException("A photo is required to post a found item.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            throw new InvalidImageException("Unsupported image type. Use JPG, PNG, or WEBP.");
        }

        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new InvalidImageException("Image is too large. Maximum size is 5MB.");
        }

        String extension = switch (contentType.toLowerCase()) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };

        String generatedFilename = UUID.randomUUID() + extension;

        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path targetPath = uploadPath.resolve(generatedFilename).normalize();

            if (!targetPath.startsWith(uploadPath)) {
                throw new InvalidImageException("Invalid file path.");
            }

            try (InputStream in = file.getInputStream()) {
                Files.copy(in, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }

        } catch (IOException e) {
            throw new InvalidImageException("Failed to store image. Please try again.");
        }

        return "/uploads/" + generatedFilename;
    }
}
