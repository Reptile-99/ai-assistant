# Deployment Guide - AI Study Assistant

Follow these steps to deploy the application to production.

## 1. Database Setup (MongoDB Atlas)
1.  Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Create a new Cluster (Shared/Free tier is fine).
3.  Go to **Network Access** and add `0.0.0.0/0` (Allow access from anywhere).
4.  Go to **Database Access** and create a user with read/write permissions.
5.  Get your **Connection String** (SRV) and replace the credentials.

## 2. Backend Deployment (Render)
1.  Connect your GitHub repository to [Render](https://render.com).
2.  Render will detect the `render.yaml` file and offer to create the services.
3.  Configure the following **Environment Variables** in the Render dashboard for the `server` service:
    - `MONGODB_URI`: Your Atlas connection string.
    - `OPENAI_API_KEY`: Your OpenAI API key.
    - `PINECONE_API_KEY`: Your Pinecone API key.
    - `PINECONE_ENVIRONMENT`: Your Pinecone environment.
    - `CLIENT_URL`: The URL of your Vercel frontend (once deployed).

## 3. Frontend Deployment (Vercel)
1.  Connect your GitHub repository to [Vercel](https://vercel.com).
2.  Select the `client` directory as the Root Directory.
3.  Vercel will automatically detect Next.js settings.
4.  Add the following **Environment Variable**:
    - `NEXT_PUBLIC_API_URL`: The URL of your Render backend (e.g., `https://your-app.onrender.com/api`).

## 4. Vector Database (Pinecone)
1.  Log in to [Pinecone](https://www.pinecone.io).
2.  Create an index named `study-assistant` with **1536 dimensions** (for `text-embedding-3-small`).
3.  Ensure the environment matches your `PINECONE_ENVIRONMENT` variable.

## 5. Docker (Optional)
To test the production build locally:
```bash
docker-compose up --build
```
The frontend will be at `http://localhost:3001` and the backend at `http://localhost:5000`.

## Security Notes
- Change `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` in production.
- Ensure `NODE_ENV` is set to `production`.
