# Expense Tracker

**Author:** Ishan Srivastava
**Course:** B.Tech Computer Science (1st Year), KIET Group of Institutions

## About the Project
An expense management website to record income and expenses, categorise transactions, calculate the balance and see a summary with charts. It has a dashboard-style layout with light and dark mode. Built with HTML, CSS and JavaScript only.

## Features
- Add income and expense transactions with description, amount, category and date
- Form validation with error messages
- Delete transactions
- Categories for income and expenses
- Summary cards: total income, total expenses and balance
- Monthly income vs expenses bar chart
- Spending distribution donut chart with category totals and percentages
- Budget planner: enter expected monthly or weekly expenditure to get a daily average
- Savings and debt tracking: if a day's expense is within the daily average there is no debt and saving = daily average - expense; if it goes above, debt = expense - income and saving = income - expense (a value below 0 is not shown). Income reduces debt first, then raises savings
- Contact the developer link in the footer
- Search transactions and filter by income or expense
- Data saved with `localStorage`
- Light and dark mode (choice is remembered)
- Responsive layout for mobile, tablet and desktop

## Technologies Used
- HTML5
- CSS3 (variables, grid, flexbox, `conic-gradient` for the donut chart)
- JavaScript (arrays, objects, functions, loops, DOM, localStorage)

## Files
| File | Purpose |
|------|---------|
| `index.html` | Page structure |
| `style.css` | Styling and light/dark themes |
| `script.js` | Transactions, charts, summary and localStorage |

## How to Run
1. Keep all three files in the same folder.
2. Double-click `index.html` to open it in any web browser.
