package com.example.budgettracker.controller;

import com.example.budgettracker.model.Transaction;
import com.example.budgettracker.model.User;
import com.example.budgettracker.service.TransactionService;
import com.example.budgettracker.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private UserService userService;

    // Endpoint to add a new transaction
    @PostMapping
    public Transaction addTransaction(@RequestBody Transaction transaction) {
        // Ensure userId exists in the request
        Long userId = transaction.getUserId();
        if (userId == null) {
            throw new IllegalArgumentException("User ID is required for the transaction.");
        }

        // Fetch the User entity from the userId
        User user = userService.findUserById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found!"));

        // Set the User entity in the Transaction
        transaction.setUser(user);

        // Save and return the transaction
        return transactionService.addTransaction(transaction);
    }

}
