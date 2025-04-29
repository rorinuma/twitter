import { createContext, SetStateAction, useContext, useState } from "react"

interface AuthContextType {
  isAuthenticated: boolean | null;
  setIsAuthenticated: React.Dispatch<SetStateAction<boolean | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("Auth context must be within AuthProvider")
  }

  return context;
}
