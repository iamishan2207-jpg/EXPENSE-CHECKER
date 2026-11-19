var year = new Date().getFullYear();
var monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
var incomeCategories = ["Pocket Money", "Scholarship", "Salary", "Other"];
var expenseCategories = ["Food", "Transport", "Rent & Bills", "Shopping", "Entertainment", "Education", "Other"];
var colors = ["#6366f1", "#f59e0b", "#15803d", "#6b7280", "#3b82f6", "#ec4899", "#a3a3a3"];

// Get elements
var themeBtn = document.getElementById("theme-btn");
var form = document.getElementById("form");
var typeSelect = document.getElementById("type");
var categorySelect = document.getElementById("category");

// Load saved data (starts empty: everything is 0 until the user adds something)
var transactions = JSON.parse(localStorage.getItem("transactions"));
if (transactions === null) transactions = [];

// Remove the old demo transactions (ids 1-13) that earlier versions saved in the browser, once
if (localStorage.getItem("samplesRemoved") !== "yes") {
  transactions = transactions.filter(function (t) { return t.id > 13; });
  localStorage.setItem("samplesRemoved", "yes");
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function save() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function money(n) {
  return "\u20B9" + n.toLocaleString("en-IN");
}

// ---------- Summary cards ----------
function showSummary() {
  var income = 0, expense = 0;
  for (var i = 0; i < transactions.length; i++) {
    if (transactions[i].type === "income") income += transactions[i].amount;
    else expense += transactions[i].amount;
  }
  var balance = income - expense;
  document.getElementById("total-income").textContent = money(income);
  document.getElementById("total-expense").textContent = money(expense);
  document.getElementById("balance").textContent = money(balance);
  document.getElementById("welcome-text").textContent =
    balance >= 0 ? "You have " + money(balance) + " left. Keep it up!" : "You have spent " + money(-balance) + " more than you earned.";
}

// ---------- Monthly bar chart ----------
function showBars() {
  var inc = [], exp = [], max = 1;
  for (var m = 0; m < 12; m++) { inc[m] = 0; exp[m] = 0; }

  for (var i = 0; i < transactions.length; i++) {
    var t = transactions[i];
    if (Number(t.date.slice(0, 4)) === year) {
      var month = Number(t.date.slice(5, 7)) - 1;
      if (t.type === "income") inc[month] += t.amount;
      else exp[month] += t.amount;
    }
  }
  for (var m = 0; m < 12; m++) {
    if (inc[m] > max) max = inc[m];
    if (exp[m] > max) max = exp[m];
  }

  var html = "";
  for (var m = 0; m < 12; m++) {
    html += '<div class="month" title="' + monthNames[m] + ' | Income ' + money(inc[m]) + ' | Expenses ' + money(exp[m]) + '">' +
      '<div class="pair">' +
      '<div class="b-inc" style="height:' + (inc[m] / max * 100) + '%"></div>' +
      '<div class="b-exp" style="height:' + (exp[m] / max * 100) + '%"></div>' +
      '</div><span>' + monthNames[m] + '</span></div>';
  }
  document.getElementById("bars").innerHTML = html;
}

// ---------- Donut chart (spending by category) ----------
function showDonut() {
  var totals = {}, total = 0;
  for (var i = 0; i < transactions.length; i++) {
    var t = transactions[i];
    if (t.type === "expense") {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
      total += t.amount;
    }
  }

  var gradient = [], legend = "", start = 0, c = 0;
  for (var name in totals) {
    var percent = totals[name] / total * 100;
    var color = colors[c % colors.length];
    gradient.push(color + " " + start + "% " + (start + percent) + "%");
    start += percent;
    legend += '<li><span class="dot" style="background:' + color + '"></span>' +
      '<span class="name">' + name + '</span><span>' + money(totals[name]) + '</span>' +
      '<span class="pct">' + percent.toFixed(0) + '%</span></li>';
    c++;
  }

  var donut = document.getElementById("donut");
  if (total === 0) {
    donut.style.background = "";
    legend = '<li class="muted">No expenses yet</li>';
  } else {
    donut.style.background = "conic-gradient(" + gradient.join(", ") + ")";
  }
  document.getElementById("legend").innerHTML = legend;
}

// ---------- Transactions table (with search and filter) ----------
function showTable() {
  var search = document.getElementById("search").value.toLowerCase();
  var filter = document.getElementById("type-filter").value;

  // newest first
  transactions.sort(function (a, b) { return a.date < b.date ? 1 : -1; });

  var rows = "", count = 0;
  for (var i = 0; i < transactions.length; i++) {
    var t = transactions[i];
    if (filter !== "all" && t.type !== filter) continue;
    if (t.desc.toLowerCase().indexOf(search) === -1 && t.category.toLowerCase().indexOf(search) === -1) continue;

    var sign = t.type === "income" ? "+" : "-";
    var cls = t.type === "income" ? "amt-inc" : "amt-exp";
    rows += "<tr><td>" + t.date + "</td><td>" + t.desc + "</td><td>" + t.category + "</td>" +
      '<td class="' + cls + '">' + sign + money(t.amount) + "</td>" +
      '<td><button class="del" onclick="deleteTransaction(' + t.id + ')">Delete</button></td></tr>';
    count++;
  }
  if (count === 0) rows = '<tr><td colspan="5" class="empty">No transactions found.</td></tr>';
  document.getElementById("table-body").innerHTML = rows;
}

// ---------- Budget, savings and debt ----------
function pad(n) { return n < 10 ? "0" + n : "" + n; }

function dateText(d) {
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

function showBudget() {
  var box = document.getElementById("budget-result");
  var budget = JSON.parse(localStorage.getItem("budget"));
  var noBudget = budget === null;
  if (noBudget) budget = { period: "month", amount: 0 };

  var now = new Date();
  var todayText = dateText(now);
  var start, totalDays;
  if (budget.period === "week") {
    var weekday = (now.getDay() + 6) % 7; // Monday = 0
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - weekday);
    totalDays = 7;
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  }
  var average = budget.amount / totalDays;

  // go through each day from the start of the period up to today
  var net = 0, rows = [], todaySpent = 0, todaySaving = 0, todayDebt = 0, daysPassed = 0;
  for (var i = 0; i < totalDays; i++) {
    var day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    var dayText = dateText(day);
    if (dayText > todayText) break;

    var spent = 0, earned = 0;
    for (var j = 0; j < transactions.length; j++) {
      var t = transactions[j];
      if (t.date !== dayText) continue;
      if (t.type === "income") earned += t.amount;
      else spent += t.amount;
    }
    // Rules for the day:
    // - expense within the daily average: no debt, saving = daily average - expense (plus any income)
    // - expense above the daily average: debt = expense - income, saving = income - expense
    //   (whichever of the two is below 0 is not counted)
    var daySaving = 0, dayDebt = 0;
    if (spent <= average) {
      daySaving = average - spent + earned;
    } else if (spent > earned) {
      dayDebt = spent - earned;
    } else {
      daySaving = earned - spent;
    }
    net += daySaving - dayDebt; // income lowers debt / raises savings, expenses do the opposite
    if (dayText === todayText) { todaySpent = spent; todaySaving = daySaving; todayDebt = dayDebt; }
    rows.unshift({ date: dayText, spent: spent, earned: earned, saving: daySaving, debt: dayDebt });
    daysPassed++;
  }

  var savings = net > 0 ? net : 0;
  var debt = net < 0 ? -net : 0;

  var todayText2 = todayDebt > 0
    ? '<p class="muted red">Debt today: ' + money(Math.round(todayDebt)) + '</p>'
    : '<p class="muted green">Saved today: ' + money(Math.round(todaySaving)) + '</p>';

  // savings and debt cards are only shown when they are above 0
  var html = '<div class="stats">' +
    '<div class="stat"><p class="muted">Daily average</p><h4>' + money(Math.round(average)) + '</h4></div>' +
    '<div class="stat"><p class="muted">Spent today</p><h4>' + money(todaySpent) + '</h4>' + todayText2 + '</div>';
  if (debt > 0) {
    html += '<div class="stat"><p class="muted">Total debt</p><h4 class="red">' + money(Math.round(debt)) + '</h4></div>';
  } else {
    html += '<div class="stat"><p class="muted">Total savings</p><h4 class="green">' + money(Math.round(savings)) + '</h4></div>';
  }
  html += '</div>';
  html += '<p class="muted budget-note">' + (budget.period === "week" ? "Weekly" : "Monthly") + ' budget ' +
    money(budget.amount) + ' over ' + totalDays + ' days. Day ' + daysPassed + ' of ' + totalDays + '.</p>';

  html += '<div class="table-wrap budget-table"><table><thead><tr><th>Date</th><th>Spent</th><th>Income</th><th>Saving / Debt</th></tr></thead><tbody>';
  for (var k = 0; k < rows.length; k++) {
    var r = rows[k];
    var status = "-";
    if (r.debt > 0) status = '<span class="amt-exp">Debt ' + money(Math.round(r.debt)) + '</span>';
    else if (r.saving > 0) status = '<span class="amt-inc">Saved ' + money(Math.round(r.saving)) + '</span>';
    html += '<tr><td>' + r.date + '</td><td>' + money(r.spent) + '</td><td>' +
      (r.earned > 0 ? '<span class="amt-inc">+' + money(r.earned) + '</span>' : '-') + '</td><td>' + status + '</td></tr>';
  }
  html += '</tbody></table></div>';
  if (noBudget) html = '<p class="muted budget-note">Set your expected expenditure above to start tracking.</p>' + html;
  box.innerHTML = html;
}

document.getElementById("budget-save").addEventListener("click", function () {
  var amount = Number(document.getElementById("budget-amount").value);
  var error = document.getElementById("budget-error");
  if (!(amount > 0)) { error.textContent = "Enter an expected expenditure greater than 0."; return; }
  error.textContent = "";
  localStorage.setItem("budget", JSON.stringify({
    period: document.getElementById("budget-period").value,
    amount: amount
  }));
  showBudget();
});

function loadBudgetInputs() {
  var budget = JSON.parse(localStorage.getItem("budget"));
  if (budget !== null) {
    document.getElementById("budget-period").value = budget.period;
    document.getElementById("budget-amount").value = budget.amount;
  }
}

function showAll() {
  showSummary();
  showBars();
  showDonut();
  showBudget();
  showTable();
}

// ---------- Add / delete ----------
function fillCategories() {
  var list = typeSelect.value === "income" ? incomeCategories : expenseCategories;
  var html = "";
  for (var i = 0; i < list.length; i++) html += "<option>" + list[i] + "</option>";
  categorySelect.innerHTML = html;
}

function deleteTransaction(id) {
  transactions = transactions.filter(function (t) { return t.id !== id; });
  save();
  showAll();
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  var desc = document.getElementById("desc").value.trim();
  var amount = Number(document.getElementById("amount").value);
  var date = document.getElementById("date").value;
  var error = document.getElementById("error");

  if (desc === "") { error.textContent = "Please enter a description."; return; }
  if (!(amount > 0)) { error.textContent = "Amount must be greater than 0."; return; }
  if (date === "") { error.textContent = "Please choose a date."; return; }

  error.textContent = "";
  transactions.push({
    id: Date.now(), desc: desc, amount: amount,
    type: typeSelect.value, category: categorySelect.value, date: date
  });
  save();
  form.reset();
  document.getElementById("date").value = today();
  fillCategories();
  showAll();
});

typeSelect.addEventListener("change", fillCategories);
document.getElementById("search").addEventListener("input", showTable);
document.getElementById("type-filter").addEventListener("change", showTable);

// ---------- Light / dark mode ----------
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeBtn.textContent = "Light mode";
}
themeBtn.addEventListener("click", function () {
  document.body.classList.toggle("dark");
  var dark = document.body.classList.contains("dark");
  themeBtn.textContent = dark ? "Light mode" : "Dark mode";
  localStorage.setItem("theme", dark ? "dark" : "light");
});

function today() {
  return dateText(new Date()); // local date (toISOString gives the UTC date, which can be off by a day in India)
}

// Start
loadBudgetInputs();
document.getElementById("date").value = today();
fillCategories();
showAll();
