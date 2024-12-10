# BudgetTracker Web Application

```plaintext
# BudgetTracker is a web application designed to manage household budgets.
# It helps users track income, expenses, and recurring costs with robust analytics.

# Features:
# - Secure user registration and login using JWT authentication.
# - Add, edit, and delete income, expenses, and recurring costs.
# - Visualize data with charts and date range filters.
# - Fully responsive design for desktops and mobile devices.

# Project Structure:
BudgetTracker/
├── src/
│   ├── main/
│   │   ├── java/com/example/budgettracker/
│   │   │   ├── config/          # Security and JWT configuration
│   │   │   ├── controller/      # REST API endpoints for budget management
│   │   │   ├── model/           # Entities like User, Role, and Transactions
│   │   │   ├── repository/      # JPA repositories for database interactions
│   │   │   ├── service/         # Core business logic and services
│   │   │   ├── util/            # Utility classes (e.g., JwtUtil)
│   │   │   ├── filter/          # JWT Authentication filter
│   │   ├── resources/
│   │   │   ├── application.properties  # Application configuration
│   │   │   ├── static/          # Static assets like CSS, JS, images
│   │   │   ├── templates/       # Thymeleaf templates (HTML for views)
│   │   ├── webapp/
│   │   │   ├── public/          # Frontend resources (HTML, CSS, JS)
├── pom.xml                      # Maven dependencies for Spring Boot and MySQL

# Technologies Used:
# Backend:
# - Java Spring Boot: Handles REST APIs, security, and database integration.
# - MySQL: Relational database for data persistence.
# - JWT: Token-based authentication for secure sessions.
# Frontend:
# - HTML/CSS/JavaScript: User interface design and interaction.
# - Bootstrap: Ensures responsive design for all devices.

# Setup Instructions:
# Prerequisites:
# 1. Install Java 17 or later.
# 2. Install and configure MySQL.
# 3. Install Maven for dependency management.

# Steps:
1. Clone the repository:
   git clone https://github.com/Justreadin/BudgetTracker.git

2. Navigate to the project directory:
   cd BudgetTracker

3. Configure database settings in `src/main/resources/application.properties`:
   spring.datasource.url=jdbc:mysql://localhost:3306/budgettracker
   spring.datasource.username=your_mysql_username
   spring.datasource.password=your_mysql_password
   spring.jpa.hibernate.ddl-auto=update

4. Build the project:
   mvn clean install

5. Run the application:
   mvn spring-boot:run

6. Access the app at `http://localhost:1200`.

# API Endpoints:
# Authentication:
# - POST /api/auth/register: Register a new user.
# - POST /api/auth/login: Login and receive a JWT token.
# Budget Management:
# - GET /api/transactions: Retrieve all transactions.
# - POST /api/transactions: Add a new transaction.
# - PUT /api/transactions/{id}: Update an existing transaction.
# - DELETE /api/transactions/{id}: Delete a transaction.

# Contribution Guidelines:
# - Fork the repository.
# - Create a new branch for your feature or fix.
# - Submit a pull request with a description of your changes.

# Acknowledgment:
# Developed during the Flexisaf Internship program.

# Contact:
# For inquiries, email: dave.400g@gmail.com
