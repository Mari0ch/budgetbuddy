// public/main.js

// ----------------------
// ENDPOINTS
// ----------------------
const EXPENSES_URL = '/api/expenses';
const AUTH_URL = '/api/auth';

// ----------------------
// ESTADO GLOBAL
// ----------------------
let authToken = null;
let currentUser = null;
let editingExpenseId = null;
let categoryChart = null;
let monthlyChart = null;

// ----------------------
// DOM ELEMENTS
// ----------------------
const form = document.getElementById('expense-form');
const formMessage = document.getElementById('form-message');
const tableBody = document.getElementById('expenses-tbody');
const tableMessage = document.getElementById('table-message');

const authMessage = document.getElementById('auth-message');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');

const userStatus = document.getElementById('user-status');
const appSection = document.getElementById('app-section');

const submitButton = document.querySelector(
  '#expense-form button[type="submit"]'
);

const totalAmountEl = document.getElementById('total-amount');
const totalCountEl = document.getElementById('total-count');
const averageAmountEl = document.getElementById('average-amount');

const themeToggleBtn = document.getElementById('theme-toggle');

// ----------------------
// HEADERS UTIL
// ----------------------
function getAuthHeaders(includeJson = false) {
  const headers = {};
  if (includeJson) headers['Content-Type'] = 'application/json';
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  return headers;
}

// ----------------------
// TEMA (CLARO / OSCURO)
// ----------------------
function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark');
    if (themeToggleBtn) themeToggleBtn.textContent = '☀️ Modo claro';
  } else {
    document.body.classList.remove('dark');
    if (themeToggleBtn) themeToggleBtn.textContent = '🌙 Modo oscuro';
  }
}

// ----------------------
// UI DE AUTENTICACIÓN
// ----------------------
function updateUIForAuth() {
  if (authToken && currentUser) {
    appSection.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
    userStatus.textContent = `Sesión iniciada como ${currentUser.email}`;
  } else {
    appSection.classList.add('hidden');
    logoutBtn.classList.add('hidden');
    userStatus.textContent = 'No has iniciado sesión';
  }
}

function saveSession(token, user) {
  authToken = token;
  currentUser = user;
  localStorage.setItem('authToken', token);
  localStorage.setItem('authUser', JSON.stringify(user));
  updateUIForAuth();
}

function clearSession() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
  updateUIForAuth();
  tableBody.innerHTML = '';
  tableMessage.textContent = 'Inicia sesión para ver tus gastos.';
  updateStats([]);
}

// ----------------------
// CARGA INICIAL
// ----------------------
document.addEventListener('DOMContentLoaded', () => {
  // Tema
  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);

  // Sesión
  const savedToken = localStorage.getItem('authToken');
  const savedUser = localStorage.getItem('authUser');

  if (savedToken && savedUser) {
    authToken = savedToken;
    currentUser = JSON.parse(savedUser);
  }

  // Fecha por defecto
  const dateInput = document.getElementById('date');
  if (dateInput) dateInput.value = new Date().toISOString().slice(0, 10);

  updateUIForAuth();

  if (authToken) {
    loadExpenses();
  } else {
    tableMessage.textContent = 'Inicia sesión para ver tus gastos.';
  }
});

// Toggle de tema
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark');
    const newTheme = isDark ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  });
}

// ----------------------
// LOGIN / REGISTRO
// ----------------------
async function handleAuth(mode) {
  authMessage.textContent = '';
  authMessage.classList.remove('error', 'success');

  const name = document.getElementById('auth-name').value.trim();
  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;

  if (!email || !password) {
    authMessage.textContent = 'Email y contraseña son obligatorios.';
    authMessage.classList.add('error');
    return;
  }

  const body = { email, password };
  if (mode === 'register') body.name = name || null;

  const url =
    mode === 'login' ? `${AUTH_URL}/login` : `${AUTH_URL}/register`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: getAuthHeaders(true)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Error en autenticación');
    }

    const data = await response.json();
    saveSession(data.token, data.user);

    authMessage.textContent =
      mode === 'login'
        ? 'Has iniciado sesión correctamente.'
        : 'Registro completado. Sesión iniciada.';
    authMessage.classList.add('success');

    loadExpenses();
  } catch (error) {
    authMessage.textContent = error.message;
    authMessage.classList.add('error');
  }
}

loginBtn.addEventListener('click', () => handleAuth('login'));
registerBtn.addEventListener('click', () => handleAuth('register'));
logoutBtn.addEventListener('click', () => {
  clearSession();
  authMessage.textContent = 'Has cerrado sesión.';
  authMessage.classList.add('success');
});

// ----------------------
// CARGAR GASTOS
// ----------------------
async function loadExpenses() {
  if (!authToken) {
    tableMessage.textContent = 'Inicia sesión para ver tus gastos.';
    updateStats([]);
    return;
  }

  tableMessage.textContent = 'Cargando gastos...';

  try {
    const response = await fetch(EXPENSES_URL, {
      headers: getAuthHeaders(false)
    });

    if (response.status === 401) {
      clearSession();
      return;
    }

    if (!response.ok) throw new Error('Error al cargar gastos');

    const expenses = await response.json();
    renderExpenses(expenses);
    updateStats(expenses);

    tableMessage.textContent =
      expenses.length === 0 ? 'Todavía no hay gastos registrados.' : '';
  } catch (error) {
    console.error(error);
    tableMessage.textContent = 'No se pudieron cargar los gastos.';
  }
}

// ----------------------
// RENDER TABLA
// ----------------------
function renderExpenses(expenses) {
  tableBody.innerHTML = '';

  expenses.forEach((exp) => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${formatDate(exp.date)}</td>
      <td>${exp.description}</td>
      <td>${exp.category || '-'}</td>
      <td>${Number(exp.amount).toFixed(2)}</td>
      <td>
        <button class="action-button edit-btn">Editar</button>
        <button class="action-button delete-btn">Eliminar</button>
      </td>
    `;

    tr.querySelector('.edit-btn').addEventListener('click', () =>
      startEdit(exp)
    );
    tr.querySelector('.delete-btn').addEventListener('click', () =>
      handleDelete(exp.id)
    );

    tableBody.appendChild(tr);
  });
}

// ----------------------
// ESTADÍSTICAS + GRÁFICOS
// ----------------------
function updateStats(expenses) {
  if (!Array.isArray(expenses) || expenses.length === 0) {
    totalAmountEl.textContent = '0,00 €';
    totalCountEl.textContent = '0';
    averageAmountEl.textContent = '0,00 €';
    renderCategoryChart({});
    renderMonthlyChart({});
    return;
  }

  const total = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const count = expenses.length;
  const avg = total / count;

  totalAmountEl.textContent = `${total.toFixed(2)} €`;
  totalCountEl.textContent = String(count);
  averageAmountEl.textContent = `${avg.toFixed(2)} €`;

  const byCategory = {};
  const byMonth = {};

  expenses.forEach((e) => {
    const cat = e.category?.trim() || 'Sin categoría';
    byCategory[cat] = (byCategory[cat] || 0) + Number(e.amount || 0);

    if (e.date) {
      const d = new Date(e.date);
      if (!isNaN(d)) {
        const key = `${d.getFullYear()}-${String(
          d.getMonth() + 1
        ).padStart(2, '0')}`;
        byMonth[key] = (byMonth[key] || 0) + Number(e.amount || 0);
      }
    }
  });

  renderCategoryChart(byCategory);
  renderMonthlyChart(byMonth);
}

function renderCategoryChart(dataObj) {
  const canvas = document.getElementById('category-chart');
  if (!canvas) return;

  if (categoryChart) categoryChart.destroy();

  const labels = Object.keys(dataObj);
  const data = Object.values(dataObj);

  if (labels.length === 0) {
    categoryChart = null;
    return;
  }

  categoryChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'Gasto por categoría', data }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

function renderMonthlyChart(dataObj) {
  const canvas = document.getElementById('monthly-chart');
  if (!canvas) return;

  if (monthlyChart) monthlyChart.destroy();

  const labels = Object.keys(dataObj).sort();
  const data = labels.map((l) => dataObj[l]);

  if (labels.length === 0) {
    monthlyChart = null;
    return;
  }

  monthlyChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{ label: 'Gasto por mes', data, tension: 0.3 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// ----------------------
// EDICIÓN
// ----------------------
function startEdit(expense) {
  editingExpenseId = expense.id;

  document.getElementById('description').value = expense.description;
  document.getElementById('amount').value = expense.amount;
  document.getElementById('category').value = expense.category || '';
  document.getElementById('date').value = new Date(expense.date)
    .toISOString()
    .slice(0, 10);

  formMessage.textContent = `Editando gasto #${expense.id}`;
  formMessage.classList.remove('error');
  formMessage.classList.add('success');

  submitButton.textContent = 'Actualizar gasto';
}

// ----------------------
// CREAR / ACTUALIZAR
// ----------------------
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!authToken) {
    formMessage.textContent = 'Debes iniciar sesión para guardar gastos.';
    formMessage.classList.add('error');
    return;
  }

  const description = document.getElementById('description').value.trim();
  const amount = document.getElementById('amount').value;
  const category = document.getElementById('category').value.trim();
  const date = document.getElementById('date').value;

  if (!description || !amount || !date) {
    formMessage.textContent =
      'Por favor, rellena descripción, importe y fecha.';
    formMessage.classList.add('error');
    return;
  }

  const body = {
    description,
    amount: Number(amount),
    category: category || null,
    date
  };

  const isEditing = editingExpenseId !== null;
  const url = isEditing
    ? `${EXPENSES_URL}/${editingExpenseId}`
    : EXPENSES_URL;
  const method = isEditing ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method,
      headers: getAuthHeaders(true),
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(
        isEditing ? 'Error al actualizar el gasto' : 'Error al crear el gasto'
      );
    }

    formMessage.textContent = isEditing
      ? 'Gasto actualizado correctamente.'
      : 'Gasto guardado correctamente.';
    formMessage.classList.remove('error');
    formMessage.classList.add('success');

    editingExpenseId = null;
    submitButton.textContent = 'Guardar gasto';
    form.reset();

    const dateInput = document.getElementById('date');
    if (dateInput) dateInput.value = new Date().toISOString().slice(0, 10);

    loadExpenses();
  } catch (error) {
    console.error(error);
    formMessage.textContent = error.message;
    formMessage.classList.add('error');
  }
});

// ----------------------
// ELIMINAR
// ----------------------
async function handleDelete(id) {
  if (!authToken) {
    alert('Debes iniciar sesión para eliminar gastos.');
    return;
  }

  const confirmDelete = confirm('¿Seguro que quieres eliminar este gasto?');
  if (!confirmDelete) return;

  try {
    const response = await fetch(`${EXPENSES_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(false)
    });

    if (!response.ok) {
      throw new Error('Error al eliminar el gasto');
    }

    loadExpenses();
  } catch (error) {
    console.error(error);
    alert('No se pudo eliminar el gasto.');
  }
}

// ----------------------
// FORMATEAR FECHA
// ----------------------
function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
