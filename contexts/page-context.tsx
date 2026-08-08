"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface PageContextType {
  title: string;
  setTitle: (title: string) => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export function PageProvider({ children }: { children: React.ReactNode }) {
  const [title, setTitle] = useState("Dashboard");

  return (
    <PageContext.Provider value={{ title, setTitle }}>
      {children}
    </PageContext.Provider>
  );
}

export function usePage() {
  const context = useContext(PageContext);
  if (context === undefined) {
    throw new Error("usePage must be used within a PageProvider");
  }
  return context;
}

// Helper component to set the title from Server Components
export function PageTitle({ title }: { title: string }) {
  const { setTitle } = usePage();
  
  useEffect(() => {
    setTitle(title);
  }, [title, setTitle]);

  return null;
}
