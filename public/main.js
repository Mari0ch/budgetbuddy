// public/app.js

const API_BASE_URL = '/api/expenses'; // como tu backend está en el mismo dominio/puerto, no hace falta más

const form = document.getElementById('expense-form');
const formMessage = document.getElementById('form-message');
const tableBody = document.getElementById('expenses-tbody');
const tableMessage = document.getElementById('table-message');

// 1) Cargar la lista de gastos al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  // Por comodidad, pre-rellenamos la fecha con hoy
  const dateInput = document.getElementById('date');
  if (dateInput) {
    dateInput.value = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  }

  loadExpenses();
});

// 2) Función para cargar gastos desde la API
async function loadExpenses() {
  tableMessage.textContent = 'Cargando gastos...';

  try {
    const response = await fetch(API_BASE_URL);
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

// 3) Pintar la tabla de gastos
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
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Eliminar';
    deleteBtn.classList.add('action-button');
    deleteBtn.addEventListener('click', () => handleDelete(expense.id));
    actionsCell.appendChild(deleteBtn);

    tr.appendChild(dateCell);
    tr.appendChild(descriptionCell);
    tr.appendChild(categoryCell);
    tr.appendChild(amountCell);
    tr.appendChild(actionsCell);

    tableBody.appendChild(tr);
  });
}

// 4) Manejar el submit del formulario (crear gasto)
form.addEventListener('submit', async (event) => {
  event.preventDefault(); // evita recargar la página

  formMessage.textContent = '';
  formMessage.classList.remove('error', 'success');

  const description = document.getElementById('description').value.trim();
  const amount = document.getElementById('amount').value;
  const category = document.getElementById('category').value.trim();
  const date = document.getElementById('date').value;

  if (!description || !amount || !date) {
    formMessage.textContent = 'Por favor, rellena descripción, importe y fecha.';
    formMessage.classList.add('error');
    return;
  }

  const body = {
    description,
    amount: Number(amount),
    category: category || null,
    date
  };

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error('Error al crear el gasto');
    }

    // Limpiamos los campos (menos la fecha, opcional)
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('category').value = '';

    formMessage.textContent = 'Gasto guardado correctamente.';
    formMessage.classList.add('success');

    // Recargar la lista de gastos
    loadExpenses();
  } catch (error) {
    console.error(error);
    formMessage.textContent = 'No se pudo guardar el gasto.';
    formMessage.classList.add('error');
  }
});

// 5) Eliminar gasto
async function handleDelete(id) {
  const confirmDelete = confirm('¿Seguro que quieres eliminar este gasto?');
  if (!confirmDelete) return;

  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE'
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

// Utilidad: formatear fecha (simple)
function formatDate(dateString) {
  if (!dateString) return '';
  // A veces viene como "2025-12-01T00:00:00.000Z"
  const d = new Date(dateString);
  if (isNaN(d.getTime())) {
    // Por si ya vino en formato YYYY-MM-DD
    return dateString;
  }
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
