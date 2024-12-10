INSERT INTO user (id, name, email, password) VALUES 
(1, 'John Doe', 'john.doe@example.com', 'password123');

INSERT INTO transactions (id, description, amount, type, user_id) VALUES 
(1, 'Grocery Shopping', 50.00, 'EXPENSE', 1),
(2, 'Salary', 1500.00, 'INCOME', 1);
