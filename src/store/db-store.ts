import { ConnectionConfig } from "@/types/db";
import { create } from "zustand";

// Interface defining the database store structure and operations
export interface DbStore {
    // Current database connection configuration (null when not connected)
    connection: ConnectionConfig | null;
    // Function to update the connection configuration
    setConnection: (connection: ConnectionConfig) => void;
    
    // Currently selected database name (null when none selected)
    database: string | null;
    // Function to update the selected database
    setDatabase: (database: string) => void;
}

/**
 * Creates and exports the Zustand store instance for database-related state management
 * @returns A Zustand store instance with defined state and actions
 */
export const useDbStore = create<DbStore>((set) => ({
    // Initial state: no connection established
    connection: null,
    // Action to update connection state
    setConnection: (connection: ConnectionConfig) => {
        set((state) => ({
            connection: connection  // Replace entire connection object
        }));
    },
    
    // Initial state: no database selected
    database: null,
    // Action to update selected database
    setDatabase: (database: string) => {
        set((state) => ({
            database: database  // Update current database name
        }));
    },
}));