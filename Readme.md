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

In main.ts, Comment 
<!-- <StrictMode> -->
.....
...
<!-- </StrictMode> -->

3. **Backend Setup**
    ```bash
    cd app/backend
    npm install
    npx prisma generate

In the above drive link, there would be "semiotic-quasar-439415-p9-80a5a47062e7.json", download and store that file in /backend folder

and set GOOGLE_APPLICATION_CREDENTIALS to the file path 

right click on the file and copy path 
and run
      ```cmd
      set GOOGLE_APPLICATION_CREDENTIALS=\path\to\sile.json

      ```bash
      export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-file.json"

repeat this in root folder also


4. **Run the Application**
    In the root folder
    ```bash
    npm run dev
