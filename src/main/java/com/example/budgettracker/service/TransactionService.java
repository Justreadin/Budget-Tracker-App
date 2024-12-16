package com.example.budgettracker.service;

import com.example.budgettracker.model.Transaction;
import com.example.budgettracker.model.User;
import com.example.budgettracker.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    /**
     * Adds a new transaction for a user.
     *
     * @param transaction the transaction to be added
     * @return the saved transaction
     */
    public Transaction addTransaction(Transaction transaction) {
        if ("Recurring".equalsIgnoreCase(transaction.getType())) {
            // Handle the recurring logic
            processRecurringTransaction(transaction);
        }
        return transactionRepository.save(transaction);
    }

    /**
     * Retrieves all transactions associated with a specific user.
     *
     * @param user the user whose transactions are to be retrieved
     * @return a list of transactions for the given user
     */
    public List<Transaction> findTransactionsByUser(User user) {
        return transactionRepository.findByUser(user);
    }

    /**
     * Finds a transaction by its ID.
     *
     * @param transactionId the ID of the transaction to retrieve
     * @return the transaction, or null if not found
     */
    public Transaction findTransactionById(Long transactionId) {
        return transactionRepository.findById(transactionId)
                .orElse(null); // Returns null if transaction not found
    }

    /**
     * Deletes a transaction by its ID.
     *
     * @param transactionId the ID of the transaction to delete
     */
    public void deleteTransaction(Long transactionId) {
        transactionRepository.deleteById(transactionId);
    }

    /**
     * Updates an existing transaction.
     *
     * @param transaction the transaction with updated data
     * @return the updated transaction
     */
    public Transaction updateTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    /**
     * Processes a recurring transaction and schedules the next occurrence.
     *
     * @param transaction the recurring transaction to process
     */
    private void processRecurringTransaction(Transaction transaction) {
        // Process the current recurring transaction (save to DB, etc.)
        transactionRepository.save(transaction);

        // Generate the next transaction based on recurrence
        Transaction nextTransaction = createNextRecurringTransaction(transaction);

        // Save the next recurring transaction to the database
        transactionRepository.save(nextTransaction);
    }

    /**
     * Creates the next recurring transaction based on the original transaction's date and frequency.
     *
     * @param currentTransaction the original recurring transaction
     * @return the next recurring transaction
     */
    private Transaction createNextRecurringTransaction(Transaction currentTransaction) {
        Transaction nextTransaction = new Transaction();
        
        // Copy properties from the current transaction (except the date)
        nextTransaction.setAmount(currentTransaction.getAmount());
        nextTransaction.setDescription(currentTransaction.getDescription());
        nextTransaction.setType(currentTransaction.getType());
        nextTransaction.setUser(currentTransaction.getUser());

        // Logic to calculate the next due date
        LocalDate nextDate = calculateNextDueDate(currentTransaction.getDate(), "Monthly"); // You can change this to handle "Daily", "Weekly"
        nextTransaction.setDate(nextDate);

        return nextTransaction;
    }

    /**
     * Calculates the next due date based on the recurrence frequency.
     *
     * @param currentDate the current transaction's date
     * @param recurrenceFrequency the recurrence frequency (e.g., "Daily", "Weekly", "Monthly")
     * @return the next due date
     */
    private LocalDate calculateNextDueDate(LocalDate currentDate, String recurrenceFrequency) {
        switch (recurrenceFrequency) {
            case "Daily":
                return currentDate.plus(1, ChronoUnit.DAYS);
            case "Weekly":
                return currentDate.plus(1, ChronoUnit.WEEKS);
            case "Monthly":
                return currentDate.plus(1, ChronoUnit.MONTHS);
            default:
                throw new IllegalArgumentException("Invalid recurrence frequency: " + recurrenceFrequency);
        }
    }
}
