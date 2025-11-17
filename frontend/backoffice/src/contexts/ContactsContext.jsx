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
      // getAllContacts now returns a paginated response (Page<T>).
      // Request first page with a reasonably large size to include most items for counting.
      const data = await getAllContacts(0, 1000);

      // If the hook returns an array (legacy), handle it
      let contactsList = [];
      if (Array.isArray(data)) contactsList = data;
      else if (data && Array.isArray(data.content)) contactsList = data.content;
      else if (data && Array.isArray(data.items)) contactsList = data.items; // defensive

      const count = contactsList.filter((c) => !c.isRead).length;
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
