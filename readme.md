# Mini Web App - Gestión de Usuarios y Misiones

## 🚀 Descripción

Esta es una mini aplicación web desarrollada para gestionar usuarios y misiones dentro de una comunidad. Permite crear, listar, actualizar y eliminar usuarios y misiones, además de asignar misiones a usuarios.

Incluye una funcionalidad de inteligencia artificial que mejora  la descripción de las misiones si el usuario quiere.

---

## 🛠️ Tecnologías utilizadas

* Node.js
* Express.js
* fs-extra
* UUID
* dotenv
* API de Gemini (Google AI)

---

## ⚙️ Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/DiazKilian/mini-app
cd mini-app
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

agregar api de gemini o crear el archivo .env

```env
echo PORT=3000 > .env
echo GEMINI_API_KEY=aqui se agrega el api >> .env
```

### 4. Ejecutar la aplicación

```bash
npm start
```

Servidor disponible en:

```
http://localhost:3000
```

---

## 📌 Endpoints principales

### 👤 Usuarios

* `GET /users` → listar usuarios
* `POST /users` → crear usuario
* `PUT /users/:id` → actualizar usuario
* `DELETE /users/:id` → eliminar usuario

### 🎯 Misiones

* `GET /missions` → listar misiones
* `POST /missions` → crear misión
* `PUT /missions/:id` → actualizar misión
* `DELETE /missions/:id` → eliminar misión

---

## 🤖 Funcionalidad AI

Endpoint:

```
POST /missions/improve-description
```

Permite mejorar ala descripción de una misión utilizando IA (Gemini).

