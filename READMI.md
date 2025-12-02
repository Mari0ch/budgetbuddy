BudgetBuddy es una API REST desarrollada en Node.js + Express + MySQL para gestionar gastos personales.
Está diseñada para ser sencilla al principio, pero fácilmente escalable y mantenible.

Tecnologías usadas
Node.js
Express
MySQL
MySQL2 (driver)
dotenv
cors
nodemon (dev)

Estructura del proyecto:
budgetbuddy/
├── server.js
├── package.json
├── .env
├── src/
│   ├── app.js
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   └── expense.model.js
│   ├── controllers/
│   │   └── expense.controller.js
│   └── routes/
│       └── expense.routes.js

Instalación:
1. Clonar el repositorio:
git clone https://github.com/Mari0ch/budgetbuddy.git
cd budgetbuddy
2. Instalar dependencias:
npm install

Configuración del entorno:
Crea un archivo .env en la raíz del proyecto::
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=budgetbuddy

Crear la base de datos:
Ejecuta en MySQL:
CREATE DATABASE IF NOT EXISTS budgetbuddy
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE budgetbuddy;

CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

Ejecutar el servidor:
Modo desarrollo:
    npm run dev
Modo producción:
    npm start
El servidor se iniciará en:
    http://localhost:3000

Endpoints:
    Ruta base:
        GET /
    Respuesta:
        {
        "message": "BudgetBuddy API está funcionando 🧾"
        }

Test de conexión a la BD:
GET /db-test
Devuelve el número total de gastos almacenados.

Rutas de gastos:
    Obtener todos los gastos:
        GET /api/expenses
    Respuesta:
        [
            {
                "id": 1,
                "description": "Compra supermercado",
                "amount": 45.6,
                "category": "Comida",
                "date": "2025-11-30",
                "created_at": "2025-11-30T18:30:00.000Z"
            }
        ]

Crear un gasto:
POST /api/expenses
Body JSON:
{
  "description": "Cena con amigos",
  "amount": 32.50,
  "category": "Ocio",
  "date": "2025-12-01"
}

Obtener un gasto por ID:
GET /api/expenses/:id

Eliminar un gasto:
DELETE /api/expenses/:id

Próximas mejoras (roadmap):
    Autenticación (JWT)
    Filtros por fecha y categoría
    Actualizar gastos (PUT)
    Categorías predefinidas
    Exportar a CSV o PDF
    Dashboard con estadísticas
    Interfaz web (frontend)
    Dockerizar el proyecto

Autor:
Mario Chavarri Gutiérrez
Enlace gitHub: https://github.com/Mari0ch


