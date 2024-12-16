document.addEventListener("DOMContentLoaded", function () {
    const incomeEl = document.getElementById("income");
    const expensesEl = document.getElementById("expenses");
    const recurringEl = document.getElementById("recurring");
    const transactionListEl = document.getElementById("transactionList");
    const transactionHistoryEl = document.getElementById("transactionHistory");
    const addTransactionBtn = document.getElementById("addTransaction");
    const showMoreBtnId = "showMoreBtn";
    const showLessBtnId = "showLessBtn";

    let budgetData = { income: 0, expenses: 0, recurring: 0 };
    let transactions = [];
    const budgetTrends = [];
    const token = localStorage.getItem("token");

    async function fetchData() {
        try {
            console.debug("Fetching dashboard data...");

            if (!token) {
                console.warn("No token found. Redirecting to login...");
                alert("You are not logged in. Please log in.");
                window.location.href = "/login";
                return;
            }

            // Check localStorage for saved budget data and transactions
            const savedBudgetData = localStorage.getItem("budgetData");
            const savedTransactions = localStorage.getItem("transactions");

            if (savedBudgetData) {
                budgetData = JSON.parse(savedBudgetData);
            }

            transactions = savedTransactions ? JSON.parse(savedTransactions) : [];

            if (!savedTransactions) {
                const response = await fetch("http://localhost:1200/api/dashboard", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
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

                budgetData = {
                    income: data.income || 0,
                    expenses: data.expenses || 0,
                    recurring: data.recurring || 0,
                };

                transactions = data.transactions || [];
            }

            // Update UI after data fetch
            updateUI();
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            alert("An error occurred. Please log in again.");
            window.location.href = "/login";
        }
    }

    function updateUI() {
        localStorage.setItem("budgetData", JSON.stringify(budgetData));
        localStorage.setItem("transactions", JSON.stringify(transactions));

        // Update displayed values for budget
        incomeEl.textContent = `$${budgetData.income.toFixed(2)}`;
        expensesEl.textContent = `$${budgetData.expenses.toFixed(2)}`;
        recurringEl.textContent = `$${budgetData.recurring.toFixed(2)}`;
    
        // Display the latest transaction list
        displayTransactionList();
        // Display transaction history (show the first 4 by default)
        displayTransactionHistory();
        // Update the charts
        updateCharts();
    }

    function displayTransactionList() {
        transactionListEl.innerHTML = "";
        const latestTransactions = transactions.slice(-4); // Get the last 4 transactions
        latestTransactions.forEach(transaction => {
            const li = createTransactionListItem(transaction, "list");
            transactionListEl.appendChild(li);
        });
    }

    function displayTransactionHistory(showAll = false) {
        transactionHistoryEl.innerHTML = "";

        const historyToShow = showAll ? transactions : transactions.slice(-4);

        historyToShow.forEach(transaction => {
            const li = createTransactionListItem(transaction, "history");
            transactionHistoryEl.appendChild(li);
        });

        const toggleBtn = document.getElementById(showAll ? showLessBtnId : showMoreBtnId);
        if (!toggleBtn) {
            const btn = document.createElement("button");
            btn.id = showAll ? showLessBtnId : showMoreBtnId;
            btn.textContent = showAll ? "Show Less" : "Show More";
            btn.className = "text-blue-500 mt-2";
            btn.addEventListener("click", () => displayTransactionHistory(!showAll));
            transactionHistoryEl.appendChild(btn);
        }
    }

    function createTransactionListItem(transaction, type) {
        const li = document.createElement("li");
        li.className = "flex justify-between items-center p-4 rounded";
        li.innerHTML = `
            <div>
                <p class="font-bold">${transaction.description}</p>
                <small class="text-gray-400">${transaction.date}</small>
            </div>
            <span class="font-bold text-${transaction.type === 'income' ? 'green' : 'red'}-400">
                ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
            </span>
            <button class="text-red-500 hover:text-red-700 ml-2" id="${type}DeleteBtn-${transaction.id}">
                <i class="fas fa-trash"></i> Delete
            </button>
        `;

        const deleteButton = li.querySelector(`#${type}DeleteBtn-${transaction.id}`);
        deleteButton.addEventListener("click", () => deleteTransaction(transaction.id));

        return li;
    }

    async function deleteTransaction(transactionId) {
        try {
            const response = await fetch(`http://localhost:1200/api/transactions/${transactionId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.error || "Failed to delete transaction.");
                return;
            }

            transactions = transactions.filter(t => t.id !== transactionId);
            localStorage.setItem("transactions", JSON.stringify(transactions));

            updateBudget();
            updateUI();
        } catch (error) {
            alert("Error deleting transaction: " + error.message);
        }
    }

    function updateBudget() {
        // Calculate income and expenses dynamically
        budgetData.income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        budgetData.expenses = transactions.filter(t => t.type === 'expenses').reduce((sum, t) => sum + t.amount, 0);
    
        // Recurring costs as the remaining balance
        budgetData.recurring = budgetData.income - budgetData.expenses;
    
        // Ensure recurring costs are non-negative
        budgetData.recurring = Math.max(budgetData.recurring, 0);
    
        // Save updated data to localStorage
        localStorage.setItem("budgetData", JSON.stringify(budgetData));
    }

    
    const pieCtx = document.getElementById("pieChart").getContext("2d");
    const lineCtx = document.getElementById("lineChart").getContext("2d");

    const pieChart = new Chart(pieCtx, {
        type: "pie",
        data: {
            labels: ["Income", "Expenses", "Recurring Costs"],
            datasets: [
                {
                    data: [budgetData.income, budgetData.expenses, budgetData.recurring],
                    backgroundColor: ["#4caf50", "#ff9800", "#f44336"],
                    borderWidth: 1,
                },
            ],
        },
        options: { responsive: true },
    });

    const lineChart = new Chart(lineCtx, {
        type: "line",
        data: {
            labels: [],
            datasets: [
                {
                    label: "Total Budget Trend",
                    data: [],
                    borderColor: "#4caf50",
                    fill: false,
                    tension: 0.1,
                },
            ],
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: "Date" } },
                y: { title: { display: true, text: "Amount ($)" } },
            },
        },
    });

    function updateCharts() {
        // Update pie chart
        pieChart.data.datasets[0].data = [budgetData.income, budgetData.expenses, budgetData.recurring];
        pieChart.update();
    
        // Update line chart for total budget trends
        const currentDate = new Date().toLocaleDateString();
        budgetTrends.push({
            date: currentDate,
            total: budgetData.income - budgetData.expenses
        });
    
        lineChart.data.labels = budgetTrends.map(t => t.date);
        lineChart.data.datasets[0].data = budgetTrends.map(t => t.total);
        lineChart.update();
    }
    
    function updateUI() {
        localStorage.setItem("budgetData", JSON.stringify(budgetData));
        localStorage.setItem("transactions", JSON.stringify(transactions));

        // Update displayed values
        incomeEl.textContent = `$${budgetData.income.toFixed(2)}`;
        expensesEl.textContent = `$${budgetData.expenses.toFixed(2)}`;
        recurringEl.textContent = `$${budgetData.recurring.toFixed(2)}`;
    
        displayTransactionList();
        displayTransactionHistory();
        updateCharts();
    }
    
    

    addTransactionBtn.addEventListener("click", function () {
        const modal = document.getElementById("transactionModal");
        modal.classList.remove("hidden");
    });

    document.getElementById("cancelTransaction").addEventListener("click", function () {
        const modal = document.getElementById("transactionModal");
        modal.classList.add("hidden");
    });

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    document.getElementById("transactionDate").value = formattedDate;

    document.getElementById("transactionForm").addEventListener("submit", async function (e) {
        e.preventDefault();
        const type = document.getElementById("transactionType").value;
        const description = document.getElementById("transactionDescription").value;
        const amount = parseFloat(document.getElementById("transactionAmount").value);
        const date = formattedDate;
        const user_id = localStorage.getItem("userId");

        const newTransaction = { amount, date, description, type, user_id };

        try {
            const response = await fetch("http://localhost:1200/api/transactions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newTransaction),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.error || "Failed to add transaction.");
                return;
            }

            const addedTransaction = await response.json();
            transactions.push(addedTransaction);
            localStorage.setItem("transactions", JSON.stringify(transactions));

            updateBudget();
            updateUI();
            document.getElementById("transactionModal").classList.add("hidden");
        } catch (error) {
            alert("Error adding transaction: " + error.message);
        }
    });

    document.getElementById("resetBudget").addEventListener("click", function () {
        if (confirm("Are you sure you want to reset your budget?")) {
            budgetData = { income: 0, expenses: 0, recurring: 0 };
            transactions = [];
            localStorage.removeItem("budgetData");
            localStorage.removeItem("transactions");
            updateUI();
            alert("Budget data has been reset.");
        }
    });

    document.getElementById("logoutBtn").addEventListener("click", handleLogout);

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("budgetData");
        localStorage.removeItem("transactions");
        localStorage.removeItem("userId");

        alert("You have been logged out.");
        window.location.href = "/login";
    }

    fetchData();
});
