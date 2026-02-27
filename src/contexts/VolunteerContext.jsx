// contexts/VolunteerContext.jsx
import { createContext, useContext, useState } from 'react';

const VolunteerContext = createContext();

export function VolunteerProvider({ children }) {
  const [volunteers, setVolunteers] = useState([]);

  return (
    <VolunteerContext.Provider value={{ volunteers, setVolunteers }}>
      {children}
    </VolunteerContext.Provider>
  );
}

export const useVolunteers = () => useContext(VolunteerContext);
