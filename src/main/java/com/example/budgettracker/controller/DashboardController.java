package com.example.budgettracker.controller;

import com.example.budgettracker.model.Transaction;
import com.example.budgettracker.model.User;
import com.example.budgettracker.service.TransactionService;
import com.example.budgettracker.service.UserService;
import com.example.budgettracker.util.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class DashboardController {

    private static final Logger logger = LoggerFactory.getLogger(DashboardController.class);

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    // Registration Endpoint
    @GetMapping("/register")
    public String showRegistrationForm(Model model) {
        model.addAttribute("user", new User());
        return "register"; // Renders register.html
    }

    @PostMapping("/api/register")
    @ResponseBody
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            userService.registerUser(user);
            return ResponseEntity.ok(new ApiResponse(true, "Registration successful! Please log in."));
        } catch (IllegalArgumentException e) {
            logger.error("Validation error during registration: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, "Registration failed: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Error during registration: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "An unexpected error occurred. Please try again."));
        }
    }

    // Login Endpoint
    @GetMapping("/login")
    public String showLoginForm() {
        return "login"; // Renders login.html
    }

    @PostMapping("/api/login")
    @ResponseBody
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        try {
            User authenticatedUser = userService.authenticateUser(loginRequest.getEmail(), loginRequest.getPassword());
            if (authenticatedUser != null) {
                String token = jwtUtil.generateToken(authenticatedUser);
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Login successful!",
                        "token", token,
                        "role", authenticatedUser.getRoles().stream().findFirst().orElse(null).getName()));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                        "success", false,
                        "message", "Invalid email or password"));
            }
        } catch (Exception ex) {
            logger.error("Error during login: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "An error occurred: " + ex.getMessage()));
        }
    }

    @GetMapping("/admin")
    public String adminDashboard() {
        return "admin"; // Corresponds to admin.html in templates
    }

    // Dashboard Endpoint (HTML)
    @GetMapping("/dashboard")
    public String showDashboard() {
        // Render the dashboard HTML without performing authentication checks here
        return "dashboard"; // This corresponds to `dashboard.html` in your templates
    }

    @GetMapping("/api/dashboard")
    @ResponseBody
    public ResponseEntity<?> getDashboardData() {
        try {
            // Retrieve authentication details from the security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated()
                    || !(authentication.getPrincipal() instanceof UserDetails)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
            }

            // Get the authenticated user's email
            String email = authentication.getName();

            // Fetch the user object from the database
            User user = userService.getUserByEmail(email);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not found"));
            }

            // Prepare the dashboard data with default values for null fields
            Map<String, Object> dashboardData = new HashMap<>();
            dashboardData.put("userName", user.getName());
            dashboardData.put("income", user.getIncome() != null ? user.getIncome() : 0.0);
            dashboardData.put("expenses", user.getExpenses() != null ? user.getExpenses() : 0.0);
            dashboardData.put("recurring", user.getRecurringCosts() != null ? user.getRecurringCosts() : 0.0);

            // Fetch user transactions or default to an empty list
            List<Transaction> transactions = transactionService.findTransactionsByUser(user);
            dashboardData.put("transactions", transactions != null ? transactions : List.of());

            return ResponseEntity.ok(dashboardData);
        } catch (Exception ex) {
            logger.error("Error fetching dashboard data: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An error occurred: " + ex.getMessage()));
        }
    }

    @DeleteMapping("/api/transactions/{transactionId}")
    @ResponseBody
    public ResponseEntity<?> deleteTransaction(@PathVariable Long transactionId) {
        try {
            // Retrieve authentication details from the security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()
                    || !(authentication.getPrincipal() instanceof UserDetails)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
            }

            // Get the email of the authenticated user
            String email = authentication.getName();
            User user = userService.getUserByEmail(email);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not found"));
            }

            // Find the transaction by ID
            Transaction transaction = transactionService.findTransactionById(transactionId);
            if (transaction == null || !transaction.getUser().equals(user)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Transaction not found or does not belong to the user"));
            }

            // Delete the transaction by ID
            transactionService.deleteTransaction(transactionId);

            return ResponseEntity.ok(Map.of("message", "Transaction deleted successfully"));
        } catch (Exception ex) {
            logger.error("Error deleting transaction: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An error occurred: " + ex.getMessage()));
        }
    }

    @GetMapping("/error")
    public String accessDenied() {
        return "error"; // Corresponds to access-denied.html
    }

    // Logout Endpoint
    @GetMapping("/logout")
    public String logout() {
        SecurityContextHolder.clearContext(); // Clear authentication context
        return "redirect:/login";
    }

    // Inner Class for API Responses
    public static class ApiResponse {
        private final boolean success;
        private final String message;

        public ApiResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
        }

        public boolean isSuccess() {
            return success;
        }

        public String getMessage() {
            return message;
        }
    }
}
