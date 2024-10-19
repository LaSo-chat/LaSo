# Development Setup

Follow these steps to set up the development environment for both the frontend and backend of the application.

## Prerequisites

Ensure you have the necessary tools installed:
- Node.js
- npm (Node Package Manager)
- Prisma

## Setup Instructions

1. **Environment Variables**
   - Copy the `.env` files into both the `frontend` and `backend` directories.
   - Access Request for this Folder
   https://drive.google.com/drive/folders/1BV09aOENtK2SJR6MnvX9rhmb6eUxFCl0?usp=sharing

2. **Frontend Setup**
   ```bash
   cd apps/frontend
   npm install

3. **Backend Setup**
    ```bash
    cd app/backend
    npm install
    npx prisma generate

4. **Run the Application**
    In the root folder
    ```bash
    npm run dev