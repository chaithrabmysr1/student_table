# Students Table (Frontend Only)

React + Vite application for a full frontend CRUD assignment.

## Features

- Students table with columns: Name, Email, Age, Actions
- Add student with required field validation and email format validation
- Edit student with pre-filled values and same validations
- Delete student with confirmation dialog
- Simulated loading state for initial data and CRUD operations
- Filter/search by name, email, or age
- Excel download for filtered rows and full data
- Frontend-only data handling using in-memory state/local JSON seed

## Run locally

1. Install dependencies:

	```bash
	npm install
	```

2. Start dev server:

	```bash
	npm run dev
	```

3. Build production output:

	```bash
	npm run build
	```

## Deploy on Netlify

Netlify has a free tier and it is enough for this assignment.

1. Push this project to GitHub.
2. Login to Netlify and click **Add new site** → **Import an existing project**.
3. Select your GitHub repository.
4. Use these build settings:
	- Build command: `npm run build`
	- Publish directory: `dist`
5. Click **Deploy site**.

`netlify.toml` is included so Netlify can use the correct build output and SPA redirect.
