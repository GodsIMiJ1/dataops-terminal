/**
 * Scroll Manager
 *
 * This module manages the storage and retrieval of scroll data (operation logs)
 * for the DataOps Terminal system.
 */

import { v4 as uuidv4 } from 'uuid';

// Types
export interface Scroll {
  id: string;
  operation: string;
  timestamp: string;
  data: any;
  nodeId: string;
}

// In-memory storage for scrolls (in a real app, this would be persisted)
let scrolls: Scroll[] = [];

/**
 * Create a new scroll
 * @param operation Operation type
 * @param data Operation data
 * @returns Created scroll
 */
export const createScroll = (operation: string, data: any): Scroll => {
  const scroll: Scroll = {
    id: uuidv4(),
    operation,
    timestamp: new Date().toISOString(),
    data,
    nodeId: 'DATAOPS_NODE'
  };

  scrolls.push(scroll);

  // Limit the number of scrolls to prevent memory issues
  if (scrolls.length > 100) {
    scrolls = scrolls.slice(-100);
  }

  return scroll;
};

/**
 * Get all scrolls
 * @returns All scrolls
 */
export const getAllScrolls = (): Scroll[] => {
  return [...scrolls];
};

/**
 * Get scrolls by operation
 * @param operation Operation type
 * @returns Scrolls matching the operation
 */
export const getScrollsByOperation = (operation: string): Scroll[] => {
  return scrolls.filter(scroll => scroll.operation === operation);
};

/**
 * Get a scroll by ID
 * @param id Scroll ID
 * @returns Scroll with the given ID, or undefined if not found
 */
export const getScrollById = (id: string): Scroll | undefined => {
  return scrolls.find(scroll => scroll.id === id);
};

/**
 * Delete a scroll by ID
 * @param id Scroll ID
 * @returns True if the scroll was deleted, false otherwise
 */
export const deleteScrollById = (id: string): boolean => {
  const initialLength = scrolls.length;
  scrolls = scrolls.filter(scroll => scroll.id !== id);
  return scrolls.length < initialLength;
};

/**
 * Clear all scrolls
 */
export const clearScrolls = (): void => {
  scrolls = [];
};

/**
 * Export scrolls to JSON
 * @returns JSON string of all scrolls
 */
export const exportScrolls = (): string => {
  return JSON.stringify(scrolls, null, 2);
};

/**
 * Import scrolls from JSON
 * @param json JSON string of scrolls
 * @returns Number of scrolls imported
 */
export const importScrolls = (json: string): number => {
  try {
    const importedScrolls = JSON.parse(json) as Scroll[];
    scrolls = [...scrolls, ...importedScrolls];
    return importedScrolls.length;
  } catch (error) {
    console.error('Error importing scrolls:', error);
    return 0;
  }
};

export default {
  createScroll,
  getAllScrolls,
  getScrollsByOperation,
  getScrollById,
  deleteScrollById,
  clearScrolls,
  exportScrolls,
  importScrolls
};
