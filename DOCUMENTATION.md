# Verkstads Insikt Documentation

## Project Overview

This document provides a comprehensive overview of the folder structure and key files within the "Verkstads Insikt" project. The project is a modern web application built with React, Vite, TypeScript, and Supabase, designed for managing reports in a workshop environment.

## Visual Folder Structure

```
/
├── .env
├── .gitignore
├── CLAUDE.md
├── README.md
├── bun.lockb
├── components.json
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── public/
│   └── ... (static assets)
├── src/
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── vite-env.d.ts
│   ├── components/
│   │   ├── ui/
│   │   └── Layout.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   ├── integrations/
│   │   └── supabase.ts
│   ├── lib/
│   │   └── utils.ts
│   └── pages/
│       ├── Auth.tsx
│       ├── NyRapport.tsx
│       ├── Oversikt.tsx
│       ├── AllaRapporter.tsx
│       ├── Anvandare.tsx
│       ├── Kategorier.tsx
│       ├── Tekniker.tsx
│       ├── Reporter.tsx
│       └── NotFound.tsx
├── supabase/
│   └── ... (supabase migrations, etc.)
├── tailwind.config.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Root Directory

The root directory contains configuration files and the main project folders.

-   `.env`: Stores environment variables for the project, such as API keys and database connection strings.
-   `.gitignore`: Specifies which files and folders should be ignored by Git.
-   `components.json`: Configuration file for `shadcn-ui`, defining component paths and styles.
-   `index.html`: The main HTML file that serves as the entry point for the application.
-   `package.json`: Lists project dependencies, scripts, and metadata.
-   `postcss.config.js`: Configuration file for PostCSS, a tool for transforming CSS with JavaScript.
-   `tailwind.config.ts`: Configuration file for Tailwind CSS, allowing for customization of the design system.
-   `tsconfig.json`: The main TypeScript configuration file for the project.
-   `vite.config.ts`: Configuration file for Vite, the build tool used for this project.

## `src` Directory

The `src` directory contains the application's source code, organized into the following subdirectories:

### `src/components`

This folder contains reusable UI components that are used throughout the application. It is further divided into:

-   `src/components/AppSidebar.tsx`: The sidebar component for application navigation.
-   `src/components/Layout.tsx`: The main layout component that wraps the application's pages, providing a consistent structure. It includes the sidebar and a main content area.
-   `src/components/ThemeToggle.tsx`: A component that allows users to switch between light and dark themes.
-   `src/components/forms`: A directory containing various form components used in the application.
-   `src/components/overview`: A directory containing components related to the overview/dashboard page.
-   `src/components/ui`: Contains UI components from `shadcn-ui`, such as buttons, forms, and dialogs.

### `src/contexts`

This folder contains React Context providers for managing global state.

-   `src/contexts/AuthContext.tsx`: Manages user authentication state, providing user information and loading status to the application.

### `src/hooks`

This folder contains custom React hooks that encapsulate reusable logic.

-   `src/hooks/use-mobile.tsx`: A hook to detect if the user is on a mobile device.
-   `src/hooks/use-toast.ts`: A hook for displaying toast notifications.
-   `src/hooks/useCategories.ts`: A hook for fetching and managing category data.
-   `src/hooks/useErrorHandler.ts`: A hook for handling errors in a consistent way.
-   `src/hooks/useReporters.ts`: A hook for fetching and managing reporter data.
-   `src/hooks/useReports.ts`: A hook for fetching and managing report data.
-   `src/hooks/useTechnicians.ts`: A hook for fetching and managing technician data.

### `src/integrations`

This folder contains modules for integrating with external services.

-   `src/integrations/supabase.ts`: Initializes the Supabase client and exports it for use throughout the application.

### `src/lib`

This folder contains utility functions and helper modules.

-   `src/lib/utils.ts`: A collection of utility functions used across the application.

### `src/pages`

This folder contains the main pages of the application, each corresponding to a specific route.

-   `src/pages/Auth.tsx`: The authentication page, containing the login and registration forms.
-   `src/pages/NyRapport.tsx`: This page provides a form for creating a new report. It includes fields for selecting a technician, entering registration numbers, specifying the number of days the repair has taken, describing the problem, and suggesting improvements. The form uses custom selector components (`TechnicianSelector`, `CategorySelector`, `ReviewerSelector`) and standard `shadcn-ui` components like `Input` and `Textarea`. The `useReports` hook is used to handle the creation of the report, and the `useErrorHandler` hook provides feedback to the user on success or failure.
-   `src/pages/Oversikt.tsx`: This is the main dashboard page, providing a high-level overview and analysis of the report data. It features Key Performance Indicators (KPIs) such as total reports, average repair time, and the maximum time taken. The page includes several charts to visualize data, including the distribution of repair times, performance of technicians, and monthly trends. It also provides analysis of frequently reported registration numbers and problem categories. The page is built with a variety of custom components from the `src/components/overview` directory and uses the `useReports` hook to fetch and process the data.
-   `src/pages/AllaRapporter.tsx`: This page displays a comprehensive list of all reports. It includes features for searching, filtering by technician and category, and sorting by date or the number of days taken to resolve the issue. The page uses various UI components from `shadcn-ui` such as `Input`, `Select`, `Card`, `Table`, `Button`, `Dialog`, and `AlertDialog` to create a user-friendly interface. It fetches data from Supabase and manages state with React's `useState` and `useEffect` hooks. Users can view, edit, and delete reports, with appropriate permissions handled by the `useAuth` hook.
-   `src/pages/Anvandare.tsx`: This page is for user management and is accessible only to administrators. It displays a list of all users with their roles and join dates. Admins can invite new users by providing a name and email address, and they can change the roles of existing users between 'admin' and 'user'. The page uses `shadcn-ui` components like `Button`, `Input`, `Dialog`, `Table`, and `Badge` to create the interface. It fetches user profiles from Supabase and uses the `useAuth` hook to ensure that only admins can access the page.
-   `src/pages/Kategorier.tsx`: This page allows users to manage categories for reports. Users can create, edit, and delete categories. Each category has a name, description, and a color for easy identification. The page displays a list of all categories in a table on desktop and as cards on mobile. It uses `shadcn-ui` components like `Button`, `Dialog`, `Input`, `Textarea`, `Table`, and `Badge`. The page fetches category data from Supabase and handles user permissions, allowing users to edit or delete only the categories they have created.
-   `src/pages/Tekniker.tsx`: This page is dedicated to managing technicians. It allows users to create, edit, and delete technician profiles. Each technician has a name and an optional description. The page displays all technicians in a table for desktop users and in a card-based layout for mobile users. It utilizes `shadcn-ui` components like `Button`, `Card`, `Dialog`, `AlertDialog`, `Input`, and `Table`. Data is fetched from and persisted to the `technicians` table in Supabase. The `useAuth` hook is used to manage permissions, ensuring that users can only modify technicians they have created.
-   `src/pages/Reporter.tsx`: This page allows for the management of reporters. Users can create, edit, and delete reporter profiles, which consist of a name and an optional description. The interface is built with `shadcn-ui` components, including `Button`, `Card`, `Dialog`, `AlertDialog`, `Input`, and `Table`, and it provides a responsive layout that adapts to different screen sizes. All data is managed through Supabase, and the `useAuth` hook is utilized to ensure that users can only modify the reporters they have created.
-   `src/pages/NotFound.tsx`: The 404 page, displayed when a route is not found.

### Other Important Files in `src`

-   `src/App.tsx`: The main application component, which sets up routing and global providers.
-   `src/main.tsx`: The entry point of the application, where the React app is rendered into the DOM.
-   `src/index.css`: Global CSS styles for the application.

## `public` Directory

The `public` directory contains static assets that are served directly by the web server, such as images, fonts, and icons.

## `supabase` Directory

This folder contains Supabase-specific files, such as database migrations and functions.
