package com.codestride.admin.controller;

import com.codestride.admin.dto.AdminStatsResponse;
import com.codestride.admin.dto.AdminUserResponse;
import com.codestride.admin.service.AdminService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public Map<String, String> dashboard() {
        return Map.of("message", "Welcome to Admin Dashboard");
    }

    @GetMapping("/stats")
    public AdminStatsResponse getStats() {
        return adminService.getStats();
    }

    @GetMapping("/users")
    public List<AdminUserResponse> getAllUsers() {
        return adminService.getAllUsers();
    }

    @PutMapping("/users/{userId}/role")
    public AdminUserResponse updateUserRole(
            @PathVariable String userId,
            @RequestBody Map<String, String> body) {
        String role = body.getOrDefault("role", "USER");
        return adminService.updateUserRole(userId, role);
    }

    @DeleteMapping("/users/{userId}")
    public Map<String, String> deleteUser(@PathVariable String userId) {
        adminService.deleteUser(userId);
        return Map.of("message", "User deleted successfully");
    }

    @PostMapping("/seed")
    public Map<String, Object> seedCatalog() {
        return adminService.seedCatalogIfEmpty();
    }
}
