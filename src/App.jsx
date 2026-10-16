import React from 'react';
import { Navigate } from 'react-router-dom';

// App.jsx now redirects to the home page.
// All logic has been moved to src/pages/AcademyApp.jsx and src/pages/HomePage.jsx
export function App() {
  return <Navigate to="/" replace />;
}

export default App;
