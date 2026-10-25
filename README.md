# BookLeaf Author Support Portal

A full-stack author support and ticket management platform built with React, Node.js, Express, and MongoDB. Authors can view their book and royalty information, submit support requests, and communicate with the BookLeaf support team. Administrators can manage tickets, assign priorities, override AI classifications, and generate AI-assisted reply drafts.

## Features

### Author Portal
- Secure authentication and role-based access.
- Dashboard showing book, royalty, and support-ticket summaries.
- View book details, ISBN, publication date, copies sold, and royalty information.
- Submit support tickets and track their status.
- View ticket conversations and support responses.

### Admin Portal
- View and filter support tickets by status, category, priority, and date.
- Assign tickets to support agents.
- Update ticket status.
- Manually override AI-generated ticket categories and priorities.
- Add private internal notes hidden from authors.
- Generate AI-assisted reply drafts and edit them before sending.
- Communicate with authors through ticket replies.

### AI Integration
- Automatic ticket classification using the configured Groq AI service.
- Initial priority assignment: Critical, High, Medium, or Low.
- AI-generated reply drafts for support agents.
- Fallback classification values when AI classification is unavailable.

## Technology Stack

**Frontend**
- React 19
- Vite
- React Router
- Axios

**Backend**
- Node.js
- Express 5
- MongoDB and Mongoose
- JSON Web Tokens (JWT)
- bcryptjs
- Groq SDK

**Development and testing**
- Git and GitHub
- Postman
- ESLint
- Nodemon

## Project Structure

```text
BookLeaf-Portal/
├── frontend/
│   ├── src/
│   ├── package.json
│   └── .env
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── server.js
│   └── package.json
└── README.md
```

The structure above illustrates the main project organization. Some directories may vary depending on the implementation.

## Prerequisites

- Node.js and npm
- MongoDB Atlas account or a local MongoDB instance
- Groq API key for AI functionality
- Git

## Local Installation

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd BookLeaf-Portal
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory.

Example configuration:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
CLIENT_URL=http://localhost:5173
GROQ_API_KEY=your_groq_api_key
```

Use the exact environment variable names referenced in your backend source code. If a variable has a different name in your implementation, update this example accordingly.

Never commit real API keys, database credentials, or JWT secrets.

### 3. Start the backend

For development:

```bash
npm run dev
```

For normal execution:

```bash
npm start
```

The backend uses `nodemon server.js` for development and `node server.js` for normal execution.

### 4. Configure the frontend

Open a second terminal:

```bash
cd frontend
npm install
```

If the frontend uses the `VITE_API_URL` environment variable, create a `.env` file inside the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

The frontend API configuration should point to the running backend.

### 5. Start the frontend

```bash
npm run dev
```

Open the local URL shown by Vite, usually `http://localhost:5173`.

## API Documentation

The ticket API is mounted under `/api/tickets`. The following endpoints are implemented in the ticket routes.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/tickets` | Retrieve tickets with supported filters |
| POST | `/api/tickets` | Create a support ticket |
| PATCH | `/api/tickets/:ticketId/status` | Update ticket status |
| PATCH | `/api/tickets/:ticketId/assign` | Assign a ticket to an agent |
| PATCH | `/api/tickets/:ticketId/classification` | Override category and/or priority |
| POST | `/api/tickets/:ticketId/internal-notes` | Add an admin-only internal note |
| POST | `/api/tickets/:ticketId/replies` | Add a ticket reply |
| POST | `/api/tickets/:ticketId/ai-draft` | Generate an AI reply draft |

These endpoints use the authentication and authorization middleware configured in the backend. Administrative actions require an authorized admin account.

## AI Workflow

1. An author submits a support ticket.
2. The backend calls the AI service to classify the ticket and assign an initial priority.
3. If AI classification fails, the backend uses fallback values.
4. An administrator reviews the classification and can override the category or priority.
5. The administrator can request an AI-generated reply draft.
6. The administrator reviews and edits the draft before sending it to the author.

AI-generated output should be reviewed before being used in customer communication.

## Database and Seed Data

The assignment specifies seed data for 10 authors and 18 books.

Use the project's existing seed procedure, if available, to populate the database. Verify the configured database name and confirm the expected author and book records are present.

The current backend `package.json` does not define a seed command.

## Security Considerations

- Protect private endpoints with authentication middleware.
- Enforce role-based authorization for administrative operations.
- Restrict authors to their own book and ticket records.
- Keep internal notes private to administrators.
- Validate incoming data and ticket IDs.
- Store secrets in environment variables.
- Never expose the Groq API key in frontend code or commit it to GitHub.

## Testing and Quality Checks

Manually verify the following workflows before submission:

- Author login and book access.
- Ticket creation and ticket history.
- Admin filtering and ticket assignment.
- Status updates and persistence.
- Manual category and priority overrides.
- Internal-note privacy.
- AI classification and reply drafting.
- Error handling when authentication or AI services fail.

The backend's current `npm test` command is a placeholder; automated tests should be added if time permits.

Run the frontend lint check with:

```bash
cd frontend
npm run lint
```

Build the frontend for production with:

```bash
npm run build
```

## Deployment

Add your deployed application URLs before submitting:

- **Frontend:** <YOUR_FRONTEND_DEPLOYMENT_URL>
- **Backend:** <YOUR_BACKEND_DEPLOYMENT_URL>
- **GitHub Repository:** <YOUR_GITHUB_REPOSITORY_URL>

Configure production environment variables in the hosting provider's dashboard.

## Known Limitations

Document any features that remain incomplete in the final implementation, such as attachment uploads or automated real-time ticket updates.

## Author

**Anurag Gautam**  
Full-Stack Developer | MERN Stack
