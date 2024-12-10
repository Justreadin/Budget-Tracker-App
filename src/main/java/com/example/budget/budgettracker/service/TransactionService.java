package com.example.budgettracker.service;

import com.example.budgettracker.model.Transaction;
import com.example.budgettracker.model.User;
import com.example.budgettracker.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
}
