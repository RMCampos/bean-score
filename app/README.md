# Bean Score

A Progressive Web App (PWA) for tracking and rating your favorite coffee places.

## Features

- **Rate Coffee Places**: Score coffee quality and ambiance on a 5-star scale
- **Filter & Search**: Find places with vegan food, plant milk, gluten-free options, and more
- **Distance Sorting**: Sort by distance to discover coffee spots near you
- **Offline Support**: Works offline as a PWA
- **Private & Secure**: Your data is stored locally in your browser

## Tech Stack

- **React** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling (dark mode only)
- **React Router** for navigation
- **Vite PWA** for Progressive Web App features
- **Google Maps API** for geocoding and distance calculation

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. (Optional) Configure Google Maps API:
```bash
cp .env.example .env
```
Then edit `.env` and add your Google Maps API key:
```
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

> **Note**: The app works without a Google Maps API key, but distance sorting will be disabled.

### Development

Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

Build the app:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Usage

### Authentication

For demo purposes, the app uses mock authentication:
- **Register**: Create an account with any email and password
- **Login**: Use any registered email with password "password"

### Adding Coffee Places

1. Click "Add Place" in the navigation
2. Fill in the coffee place details:
   - Name and address (required)
   - Instagram handle (optional)
   - Coffee quality rating (1-5 stars)
   - Ambient rating (1-5 stars)
   - Available options (gluten-free, veg milk, vegan food, sugar-free)
3. Click "Add Place"

The app will automatically geocode the address (if online) for distance sorting.

### Searching and Filtering

On the home page:
- Use the search box to find places by name or address
- Check the filter boxes to find places with specific options
- Filters use AND logic (all selected filters must match)

### Sorting

Places are sorted by:
1. **Distance** (if geolocation is enabled and you're online)
2. **Rating** (average of coffee quality + ambient)

### PWA Installation

The app can be installed as a Progressive Web App:

1. Open the app in a supported browser (Chrome, Edge, Safari)
2. Look for the "Install" prompt or option in your browser
3. Click "Install" to add the app to your home screen/desktop

The app will work offline after installation, though distance sorting requires an internet connection.

## Project Structure

```
src/
├── components/       # Reusable React components
│   ├── Navigation.tsx
│   ├── ProtectedRoute.tsx
│   └── StarRating.tsx
├── contexts/         # React contexts
│   └── AuthContext.tsx
├── pages/            # Page components
│   ├── About.tsx
│   ├── AddEditPlace.tsx
│   ├── Home.tsx
│   ├── Landing.tsx
│   ├── Login.tsx
│   └── Register.tsx
├── services/         # API and service functions
│   ├── geocoding.ts
│   └── serverApi.ts
├── types/            # TypeScript type definitions
│   └── index.ts
├── utils/            # Utility functions
│   └── helpers.ts
├── App.tsx           # Main app component with routing
└── main.tsx          # App entry point
```

## API Integration

<!-- add information about the API with Quarkus -->


## Icons

The app includes placeholder PWA icons. For production, replace:
- `public/icon-192x192.png`
- `public/icon-512x512.png`

with proper PNG icons of your app.

## Known Limitations

- Mock authentication (password is always "password")
- Data is stored in localStorage (not persistent across devices)
- Requires Google Maps API key for full distance sorting functionality
- Icons are placeholders (SVG files renamed to PNG)

## Future Improvements

- Real backend integration with REST API
- User account sync across devices
- Photo uploads for coffee places
- Social features (share places with friends)
- Export/import data
- Advanced filtering and sorting options
- Reviews and comments

## License

MIT
