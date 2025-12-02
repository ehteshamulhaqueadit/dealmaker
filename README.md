# Dealmaker - Modern Deal Management Platform

![Dealmaker](https://img.shields.io/badge/Status-Live-brightgreen) ![React](https://img.shields.io/badge/React-19.1.1-blue) ![Node.js](https://img.shields.io/badge/Node.js-Latest-green) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)

**Live Demo:** [https://dealmaker-client.netlify.app/](https://dealmaker-client.netlify.app/)

A full-stack web application that revolutionizes deal management by connecting deal creators with experienced dealmakers. Built with modern technologies and featuring real-time communication, secure transactions, and comprehensive project tracking.

## 🌟 Features

### Core Functionality

- **🤝 Deal Management**: Create, browse, and manage business deals with detailed descriptions, budgets, and timelines
- **👥 Dealmaker System**: Request experienced dealmakers to join deals or respond to dealmaker requests
- **💰 Bidding System**: Place bids on deals with comprehensive bid management and selection tools
- **📊 Progress Tracking**: Real-time progress updates and milestone tracking for active deals
- **💬 Real-time Messaging**: Live chat system using WebSocket for instant communication
- **🔐 Secure Wallet System**: Integrated wallet with escrow functionality for secure transactions
- **⚖️ Dispute Resolution**: Built-in dispute management system for deal conflicts
- **⭐ Review System**: Rate and review dealmakers and deal creators after completion
- **🔍 User Discovery**: Search and browse user profiles with public information

### Technical Features

- **🔒 JWT Authentication**: Secure login system with email verification
- **📱 Responsive Design**: Mobile-first design with Tailwind CSS
- **🎨 Modern UI/UX**: Smooth animations with Framer Motion
- **⚡ Real-time Updates**: Socket.IO integration for live notifications
- **📸 File Upload**: Profile picture upload with Multer
- **📧 Email Integration**: Nodemailer for transactional emails
- **🛡️ Error Handling**: Comprehensive error handling and validation

## 🏗️ Tech Stack

### Frontend

- **React 19.1.1** - Modern React with hooks and context
- **Vite** - Fast build tool and development server
- **React Router 7.7.0** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion 12.23.6** - Animation library
- **Socket.IO Client 4.8.1** - Real-time communication
- **Axios 1.10.0** - HTTP client
- **React Icons 5.5.0** - Icon library
- **js-cookie 3.0.5** - Cookie management

### Backend

- **Node.js** - JavaScript runtime
- **Express.js 5.1.0** - Web application framework
- **Socket.IO 4.8.1** - Real-time bidirectional communication
- **Sequelize 6.37.7** - PostgreSQL ORM
- **PostgreSQL** - Primary database
- **JWT (jsonwebtoken 9.0.2)** - Authentication tokens
- **Bcrypt 6.0.0** - Password hashing
- **Multer 2.0.2** - File upload middleware
- **Nodemailer 7.0.3** - Email service
- **CORS 2.8.5** - Cross-origin resource sharing
- **Dotenv 16.5.0** - Environment variable management

### Development Tools

- **ESLint** - Code linting
- **Nodemon** - Development server auto-reload
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 🚀 Live Application

- **Frontend**: [https://dealmaker-client.netlify.app/](https://dealmaker-client.netlify.app/)
- **Backend API**: Hosted on Render with PostgreSQL database

## 📋 Prerequisites

Before running this project locally, ensure you have:

- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

## ⚙️ Environment Variables

### Server Environment Variables (server/.env)

Create a `.env` file in the server directory:

```env
# Database Configuration
DB_HOST=your_postgres_host
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_PORT=5432
DB_DIALECT=postgres

# JWT Configuration
JWT_SECRET=your_very_secure_jwt_secret_key
JWT_EXPIRES_IN=24h

# Email Configuration (Gmail)
EMAIL=your_email@gmail.com
EMAIL_APP_PASSWORD=your_gmail_app_password

# Application Configuration
APP_NAME=dealmaker
CLIENT_URL=http://localhost:5173
DOMAIN=http://localhost:5173
PORT=8000
NODE_ENV=development
SALTROUNDS=12

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8000
```

### Client Environment Variables

Create environment files in the client directory:

**client/.env.local** (for development):

```env
VITE_API_URL=http://localhost:8000
```

**client/.env.production** (for production):

```env
VITE_API_URL=https://your-backend-url.com
```

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/dealmaker.git
cd dealmaker
```

### 2. Database Setup

#### PostgreSQL Setup

1. Install PostgreSQL on your system
2. Create a new database:

```sql
CREATE DATABASE dealmaker;
```

3. Create a database user:

```sql
CREATE USER dealmaker_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE dealmaker TO dealmaker_user;
```

### 3. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file with your configuration (see Environment Variables section)

# Edit .env with your actual values

# Start development server
npm run dev
```

The server will start on `http://localhost:8000`

### 4. Frontend Setup

```bash
# Navigate to client directory (from project root)
cd client

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your API URL

# Start development server
npm run dev
```

The client will start on `http://localhost:5173`

### 5. Email Configuration (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use this app password in your `EMAIL_APP_PASSWORD` environment variable

## 📚 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `GET /api/auth/register/:key` - Email verification
- `POST /api/auth/login` - User login
- `POST /api/auth/reset_password` - Request password reset
- `POST /api/auth/reset_password/:username/:token` - Reset password

### Deals Management

- `GET /api/deals/all` - Get all deals
- `GET /api/deals/all/:keyword` - Search deals
- `POST /api/deals/create-deal` - Create new deal
- `GET /api/deals/my-deals` - Get user's deals
- `GET /api/deals/dealmaker-deals` - Get dealmaker's assigned deals
- `PUT /api/deals/join-deal-as-dealer/:id` - Join deal as dealer

### Bidding System

- `POST /api/bidding/create` - Create bid
- `GET /api/bidding/deal/:dealId` - Get bids for deal
- `PUT /api/bid-management/select-bid/:dealId/:bidId` - Select winning bid

### Real-time Features

- `POST /api/messages/send` - Send message
- `GET /api/messages/deal/:dealId` - Get deal messages

### Wallet & Transactions

- `POST /api/wallet/deposit` - Deposit money
- `GET /api/wallet` - Get wallet info
- `POST /api/wallet/escrow/:dealId/lock` - Lock escrow

## 🏗️ Project Structure

```
dealmaker/
├── client/                     # React frontend
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── api/               # API service functions
│   │   ├── assets/            # Images and static files
│   │   ├── components/        # Reusable React components
│   │   ├── contexts/          # React context providers
│   │   ├── hooks/             # Custom React hooks
│   │   ├── pages/             # Page components
│   │   └── services/          # Service utilities
│   ├── package.json           # Frontend dependencies
│   ├── vite.config.js         # Vite configuration
│   └── tailwind.config.js     # Tailwind CSS config
├── server/                    # Node.js backend
│   ├── config/                # Configuration files
│   ├── src/
│   │   ├── features/          # Feature-based modules
│   │   │   ├── auth/          # Authentication
│   │   │   ├── deals/         # Deal management
│   │   │   ├── bidding/       # Bidding system
│   │   │   ├── messaging/     # Real-time messaging
│   │   │   ├── wallet/        # Payment system
│   │   │   └── ...           # Other features
│   │   ├── middleware/        # Express middleware
│   │   └── utils/            # Utility functions
│   ├── uploads/              # File uploads
│   └── package.json          # Backend dependencies
└── README.md                 # Project documentation
```

## 🔄 Database Models

The application uses several interconnected models:

- **Users** - User authentication and basic info
- **UserData** - Extended user profiles
- **Deals** - Deal postings and management
- **Bids** - Bidding system
- **Messages** - Real-time messaging
- **Progress** - Deal progress tracking
- **Disputes** - Dispute management
- **Reviews** - User rating system
- **Wallet** - Financial transactions
- **Escrow** - Secure payment holding

## 🌐 Deployment

### Frontend (Netlify)

1. Build the client:

```bash
cd client
npm run build
```

2. Deploy the `dist` folder to Netlify
3. Set environment variables in Netlify dashboard
4. Configure redirects for SPA routing

### Backend (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `cd server && npm install`
4. Set start command: `cd server && npm start`
5. Add environment variables in Render dashboard
6. Deploy PostgreSQL database on Render

### Environment Variables for Production

- Update `CLIENT_URL` and `DOMAIN` to your frontend URL
- Update `VITE_API_URL` to your backend URL
- Ensure CORS settings allow your frontend domain

## 👨‍💻 Developer

**Ehteshamul Haque Adit**

- Computer Science Graduate
- Full-Stack Developer passionate about creating innovative solutions
- Expertise in modern web technologies and system design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🐛 Known Issues & Support

If you encounter any issues during setup or deployment:

1. Ensure all environment variables are correctly set
2. Check that PostgreSQL is running and accessible
3. Verify that all dependencies are installed
4. Check the console for detailed error messages

For support, please create an issue on the GitHub repository.

---

**Built with ❤️ by Ehteshamul Haque Adit**
