# Drive Clone - Cloud Storage Application

A modern cloud storage application built with Next.js that replicates core Google Drive functionality. This full-stack application provides secure file storage, sharing, and management capabilities.

## Features

- **File Management**: Upload, organize, and manage files and folders
- **Multiple View Modes**: Grid and list views for optimal file browsing
- **File Preview**: Preview images and documents directly in the browser
- **Authentication**: Secure Google OAuth integration with Better Auth
- **Storage Views**: My Drive, Recent files, Starred items, and Trash
- **Context Menus**: Right-click functionality for file operations
- **Drag & Drop**: Intuitive file upload with progress tracking
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with Google OAuth
- **File Storage**: Cloudinary integration
- **State Management**: TanStack Query (React Query)
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Google OAuth credentials
- Cloudinary account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd drive-clone-web
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with:
```env
DATABASE_URL=your_postgresql_url
BETTER_AUTH_SECRET=your_auth_secret
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

4. Set up the database:
```bash
npm run db:push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Database Commands

- `npm run db:push` - Push schema changes to database
- `npm run db:pull` - Pull schema from database
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate migration files

## Authentication Commands

- `npm run better-auth:generate` - Generate auth configuration
- `npm run better-auth:migrate` - Run auth migrations

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components
│   ├── file-grid.tsx   # File display grid
│   ├── upload-modal.tsx # File upload interface
│   └── sidebar.tsx     # Navigation sidebar
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configs
└── shared/             # Database schema and types
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.