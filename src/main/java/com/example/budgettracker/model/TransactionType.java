package com.example.budgettracker.model;

import com.fasterxml.jackson.annotation.JsonValue;

public enum TransactionType {
    INCOME("Income"),
    EXPENSE("Expense"),
    RECURRING("Recurring");

    private final String displayName;

    TransactionType(String displayName) {
        this.displayName = displayName;
    }

    @JsonValue
    public String getDisplayName() {
        return displayName;
    }

    public static TransactionType fromDisplayName(String displayName) {
        for (TransactionType type : values()) {
            if (type.getDisplayName().equals(displayName)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown display name: " + displayName);
    }
}
