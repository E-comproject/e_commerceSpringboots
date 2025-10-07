package com.ecommerce.EcommerceApplication.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    public static final String DIR_PRODUCTS = "products";
    public static final String DIR_PROFILES = "profiles";
    public static final String DIR_SHOPS    = "shops";
    public static final String DIR_CHAT     = "chat";

    private static final Set<String> ALLOWED_DIRS = Set.of(
            DIR_PRODUCTS, DIR_PROFILES, DIR_SHOPS, DIR_CHAT
    );

    private final Path root;

    /**
     * ใช้ file.upload.root เป็นหลัก (ดีฟอลต์ /data/uploads).
     * ถ้ามี file.upload-dir อยู่เดิม จะถูกใช้แทนเพื่อ compatibility.
     */
    public FileStorageService(
            @Value("${file.upload.root:/data/uploads}") String uploadRoot,
            @Value("${file.upload-dir:}") String legacyUploadDir
    ) {
        String base = (legacyUploadDir != null && !legacyUploadDir.isBlank())
                ? legacyUploadDir
                : uploadRoot;

        try {
            this.root = Paths.get(base).toAbsolutePath().normalize();
            // โฟลเดอร์หลัก
            Files.createDirectories(this.root);
            // โฟลเดอร์ย่อยที่ต้องใช้
            for (String d : ALLOWED_DIRS) {
                Files.createDirectories(this.root.resolve(d));
            }
        } catch (Exception e) {
            throw new RuntimeException("Could not create upload directory: " + base, e);
        }
    }

    /** เก็บไฟล์ลงโฟลเดอร์ย่อยที่กำหนด (เช่น "profiles") และคืนค่า path แบบ relative (profiles/xxx.png) */
    public String storeFile(MultipartFile file, String subdir) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        if (!ALLOWED_DIRS.contains(subdir)) {
            throw new IllegalArgumentException("Invalid sub-directory: " + subdir);
        }

        // ตรวจชนิดไฟล์
        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        // สร้างชื่อไฟล์แบบสุ่ม + นามสกุลเดิม (ถ้ามี)
        String original = file.getOriginalFilename();
        String ext = "";
        if (original != null) {
            int dot = original.lastIndexOf('.');
            if (dot >= 0 && dot < original.length() - 1) {
                ext = original.substring(dot).replaceAll("[^A-Za-z0-9.]", ""); // sanitize
            }
        }
        String filename = UUID.randomUUID().toString() + ext;

        // ป้องกัน path traversal
        filename = filename.replace("..", "");

        try {
            Path targetDir = this.root.resolve(subdir);
            Files.createDirectories(targetDir);
            Path target = targetDir.resolve(filename).normalize();
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            // คืนค่าเป็นเส้นทางสัมพัทธ์ เพื่อง่ายต่อการเสิร์ฟ/บันทึกใน DB
            return subdir + "/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    // ช็อตคัตยอดนิยม
    public String storeProfileImage(MultipartFile file) { return storeFile(file, DIR_PROFILES); }
    public String storeProductImage(MultipartFile file) { return storeFile(file, DIR_PRODUCTS); }
    public String storeShopImage(MultipartFile file)    { return storeFile(file, DIR_SHOPS); }
    public String storeChatImage(MultipartFile file)    { return storeFile(file, DIR_CHAT); }

    /** ลบไฟล์โดยรับ path แบบ relative เช่น "profiles/xxx.png" */
    public void deleteFile(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) return;
        try {
            Path p = this.root.resolve(relativePath).normalize();
            // กันลบข้ามโฟลเดอร์
            if (!p.startsWith(this.root)) {
                throw new SecurityException("Illegal path");
            }
            Files.deleteIfExists(p);
        } catch (IOException ignored) { /* log ได้ตามต้องการ */ }
    }

    public Path getRoot() { return root; }
}