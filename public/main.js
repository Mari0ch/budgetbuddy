// public/main.js

// Endpoints base
const EXPENSES_URL = '/api/expenses';
const AUTH_URL = '/api/auth';

// Estado de autenticación en el frontend
let authToken = null;
let currentUser = null;
let editingExpenseId = null;


// Elementos del DOM
const form = document.getElementById('expense-form');
const formMessage = document.getElementById('form-message');
const tableBody = document.getElementById('expenses-tbody');
const tableMessage = document.getElementById('table-message');

const authForm = document.getElementById('auth-form');
const authMessage = document.getElementById('auth-message');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');

const userStatus = document.getElementById('user-status');
const appSection = document.getElementById('app-section');
const authSection = document.getElementById('auth-section');

const submitButton = document.querySelector('#expense-form button[type="submit"]');

// Utilidad: construir headers con token
function getAuthHeaders(includeJson = false) {
  const headers = {};
  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

// Actualizar la UI según haya token o no
function updateUIForAuth() {
  if (authToken && currentUser) {
    authSection.classList.remove('hidden');
    appSection.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
    userStatus.textContent = `Sesión iniciada como ${currentUser.email}`;
  } else {
    appSection.classList.add('hidden');
    logoutBtn.classList.add('hidden');
    userStatus.textContent = 'No has iniciado sesión';
    // No borramos el formulario de auth: siempre visible
  }
}

// Guardar sesión
function saveSession(token, user) {
  authToken = token;
  currentUser = user;
  localStorage.setItem('authToken', token);
  localStorage.setItem('authUser', JSON.stringify(user));
  updateUIForAuth();
}

// Limpiar sesión
function clearSession() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
  updateUIForAuth();
  // Limpiar tabla de gastos
  tableBody.innerHTML = '';
  tableMessage.textContent = 'Inicia sesión para ver tus gastos.';
}

// 1) Al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  // Cargar token si ya habíamos iniciado sesión antes
  const storedToken = localStorage.getItem('authToken');
  const storedUser = localStorage.getItem('authUser');

  if (storedToken && storedUser) {
    try {
      authToken = storedToken;
      currentUser = JSON.parse(storedUser);
    } catch (e) {
      clearSession();
    }
  }

  // Pre-rellenar fecha de hoy en el formulario de gastos
  const dateInput = document.getElementById('date');
  if (dateInput) {
    dateInput.value = new Date().toISOString().slice(0, 10);
  }

  updateUIForAuth();

  // Si hay sesión, cargar gastos
  if (authToken) {
    loadExpenses();
  } else {
    tableMessage.textContent = 'Inicia sesión para ver tus gastos.';
  }
});

// 2) Función para registrar o hacer login
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

  const body = {
    email,
    password
  };
  if (mode === 'register') {
    body.name = name || null;
  }

  const url = mode === 'login' ? `${AUTH_URL}/login` : `${AUTH_URL}/register`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg =
        errorData.message ||
        (mode === 'login'
          ? 'Error en el inicio de sesión.'
          : 'Error en el registro.');
      throw new Error(msg);
    }

    const data = await response.json();
    saveSession(data.token, data.user);

    authMessage.textContent =
      mode === 'login'
        ? 'Has iniciado sesión correctamente.'
        : 'Registro completado. Sesión iniciada.';
    authMessage.classList.add('success');

    // Cargar gastos una vez logueado
    loadExpenses();
  } catch (error) {
    console.error(error);
    authMessage.textContent = error.message;
    authMessage.classList.add('error');
  }
}

// Botones login / registro / logout
loginBtn.addEventListener('click', () => handleAuth('login'));
registerBtn.addEventListener('click', () => handleAuth('register'));
logoutBtn.addEventListener('click', () => {
  clearSession();
  authMessage.textContent = 'Has cerrado sesión.';
  authMessage.classList.add('success');
});

// 3) Cargar lista de gastos
async function loadExpenses() {
  if (!authToken) {
    tableMessage.textContent = 'Inicia sesión para ver tus gastos.';
    return;
  }

  tableMessage.textContent = 'Cargando gastos...';

  try {
    const response = await fetch(EXPENSES_URL, {
      headers: getAuthHeaders(false)
    });

    if (response.status === 401) {
      // Sesión caducada o token inválido
      clearSession();
      tableMessage.textContent = 'Sesión caducada. Inicia sesión de nuevo.';
      return;
    }

    if (!response.ok) {
      throw new Error('Error al cargar gastos');
    }

    const expenses = await response.json();
    renderExpenses(expenses);
    if (expenses.length === 0) {
      tableMessage.textContent = 'Todavía no hay gastos registrados.';
    } else {
      tableMessage.textContent = '';
    }
  } catch (error) {
    console.error(error);
    tableMessage.textContent = 'No se pudieron cargar los gastos.';
    tableMessage.classList.add('error');
  }
}

// Pintar tabla
function renderExpenses(expenses) {
  tableBody.innerHTML = '';

  expenses.forEach((expense) => {
    const tr = document.createElement('tr');

    const dateCell = document.createElement('td');
    dateCell.textContent = formatDate(expense.date);

    const descriptionCell = document.createElement('td');
    descriptionCell.textContent = expense.description;

    const categoryCell = document.createElement('td');
    categoryCell.textContent = expense.category || '-';

    const amountCell = document.createElement('td');
    amountCell.textContent = Number(expense.amount).toFixed(2);

    const actionsCell = document.createElement('td');

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Editar';
    editBtn.classList.add('action-button');
    editBtn.style.marginRight = '0.5rem';
    editBtn.addEventListener('click', () => startEdit(expense));

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Eliminar';
    deleteBtn.classList.add('action-button');
    deleteBtn.addEventListener('click', () => handleDelete(expense.id));

    actionsCell.appendChild(editBtn);
    actionsCell.appendChild(deleteBtn);

    tr.appendChild(dateCell);
    tr.appendChild(descriptionCell);
    tr.appendChild(categoryCell);
    tr.appendChild(amountCell);
    tr.appendChild(actionsCell);

    tableBody.appendChild(tr);
  });
}

function startEdit(expense) {
  editingExpenseId = expense.id;

  document.getElementById('description').value = expense.description;
  document.getElementById('amount').value = expense.amount;
  document.getElementById('category').value = expense.category || '';
  document.getElementById('date').value = expense.date
    ? new Date(expense.date).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  formMessage.textContent = `Editando gasto #${expense.id}`;
  formMessage.classList.remove('error');
  formMessage.classList.add('success');

  if (submitButton) {
    submitButton.textContent = 'Actualizar gasto';
  }
}


// 4) Guardar nuevo gasto
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!authToken) {
    formMessage.textContent = 'Debes iniciar sesión para guardar gastos.';
    formMessage.classList.add('error');
    return;
  }

  formMessage.textContent = '';
  formMessage.classList.remove('error', 'success');

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

  // Si estamos editando, usamos PUT
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

    if (response.status === 401) {
      clearSession();
      formMessage.textContent = 'Sesión caducada. Inicia sesión de nuevo.';
      formMessage.classList.add('error');
      return;
    }

    if (!response.ok) {
      throw new Error(
        isEditing ? 'Error al actualizar el gasto' : 'Error al crear el gasto'
      );
    }

    // Limpiar campos
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('category').value = '';
    // La fecha la dejamos como está

    if (isEditing) {
      formMessage.textContent = 'Gasto actualizado correctamente.';
    } else {
      formMessage.textContent = 'Gasto guardado correctamente.';
    }
    formMessage.classList.add('success');

    // Reset de modo edición
    editingExpenseId = null;
    if (submitButton) {
      submitButton.textContent = 'Guardar gasto';
    }

    loadExpenses();
  } catch (error) {
    console.error(error);
    formMessage.textContent = isEditing
      ? 'No se pudo actualizar el gasto.'
      : 'No se pudo guardar el gasto.';
    formMessage.classList.add('error');
  }
});


// 5) Eliminar gasto
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

    if (response.status === 401) {
      clearSession();
      alert('Sesión caducada. Inicia sesión de nuevo.');
      return;
    }

    if (!response.ok) {
      throw new Error('Error al eliminar el gasto');
    }

    loadExpenses();
  } catch (error) {
    console.error(error);
    alert('No se pudo eliminar el gasto.');
  }
}

// Utilidad: formatear fecha
function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) {
    return dateString;
  }
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
