"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useContactOperations } from "@/hooks/useContactOperations";

const ContactsContext = createContext({
  unreadCount: 0,
  refreshUnreadCount: () => {},
});

export function ContactsProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const { getAllContacts } = useContactOperations();

  const refreshUnreadCount = async () => {
    try {
      const contacts = await getAllContacts();
      const count = contacts.filter((c) => !c.isRead).length;
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  useEffect(() => {
    refreshUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(refreshUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ContactsContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}
    </ContactsContext.Provider>
  );
}

export function useContactsContext() {
  return useContext(ContactsContext);
}
