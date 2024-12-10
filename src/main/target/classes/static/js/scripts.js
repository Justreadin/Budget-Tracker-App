document.addEventListener("DOMContentLoaded", function () {
    const incomeEl = document.getElementById("income");
    const expensesEl = document.getElementById("expenses");
    const recurringEl = document.getElementById("recurring");
    const transactionListEl = document.getElementById("transactionList");
    const addTransactionBtn = document.getElementById("addTransaction");
    const toggleModeBtn = document.getElementById("toggleMode");

    let budgetData = { income: 0, expenses: 0, recurring: 0 };
    let transactions = [];

    // Fetch user-specific data from the server
    async function fetchData() {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("You are not logged in. Please log in.");
                window.location.href = "/login";
                return;
            }

            const response = await fetch("http://localhost:1200/api/dashboard", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`, // Include the JWT token
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    alert("Session expired. Please log in again.");
                    window.location.href = "/login";
                } else {
                    throw new Error("Failed to fetch data.");
                }
            }

            const data = await response.json();

            // Assuming the response contains 'budgetData' and 'transactions'
            budgetData = data.budgetData || budgetData;
            transactions = data.transactions || transactions;

            updateUI(); // Update UI with fetched data
        } catch (error) {
            console.error("Error fetching data:", error);
            alert("An error occurred. Please log in again.");
            window.location.href = "/login";
        }
    }


    // Update UI elements
    function updateUI() {
        incomeEl.textContent = `$${budgetData.income.toFixed(2)}`;
        expensesEl.textContent = `$${budgetData.expenses.toFixed(2)}`;
        recurringEl.textContent = `$${budgetData.recurring.toFixed(2)}`;
        displayTransactions();
        updateChart();
    }

    // Display transactions in the list
    function displayTransactions() {
        transactionListEl.innerHTML = ""; // Clear the list
        transactions.forEach(transaction => {
            const li = document.createElement("li");
            li.className = "list-group-item d-flex justify-content-between align-items-center";
            li.innerHTML = `
                <div>
                    <strong>${transaction.description}</strong><br>
                    <small>${transaction.date}</small>
                </div>
                <span>$${transaction.amount.toFixed(2)}</span>
            `;
            transactionListEl.appendChild(li);
        });
    }

    // Toggle Dark Mode
    toggleModeBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
    });

    // Chart setup and updates
    const ctx = document.getElementById("budgetChart").getContext("2d");
    let budgetChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Income", "Expenses", "Recurring Costs"],
            datasets: [{
                data: [budgetData.income, budgetData.expenses, budgetData.recurring],
                backgroundColor: ["#4caf50", "#ff9800", "#f44336"],
                borderWidth: 1,
            }],
        },
        options: { responsive: true },
    });

    function updateChart() {
        budgetChart.data.datasets[0].data = [budgetData.income, budgetData.expenses, budgetData.recurring];
        budgetChart.update();
    }

    // Add new transaction
    addTransactionBtn.addEventListener("click", async () => {
        const description = prompt("Enter transaction description:");
        const amount = parseFloat(prompt("Enter transaction amount:"));

        if (!description || isNaN(amount)) {
            alert("Invalid input. Please try again.");
            return;
        }

        const newTransaction = { description, amount };

        // Add the transaction to the local list
        transactions.push(newTransaction);

        // Send the transaction to the server
        try {
            const token = localStorage.getItem("jwtToken");
            if (!token) {
                alert("No token found. Please log in.");
                window.location.href = "/login";
                return;
            }

            const response = await fetch("http://localhost:1200/api/transactions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`, // Include JWT token
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newTransaction),
            });

            if (!response.ok) {
                throw new Error("Failed to add transaction.");
            }

            alert("Transaction added successfully!");
            updateBudget(); // Refresh budget data
            displayTransactions(); // Update transaction list in UI
        } catch (error) {
            console.error("Error adding transaction:", error);
            alert("Failed to add transaction.");
        }

        // Update budget values after adding a transaction
        function updateBudget() {
            budgetData.income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
            budgetData.expenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
            updateUI();
        }

        // Initialize data fetching
        fetchData();
    });
});