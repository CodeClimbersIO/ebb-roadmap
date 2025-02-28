// Constants for localStorage keys
const KEYS = {
  LAST_VISIT: 'ebb_last_visit_time'
};

/**
 * Updates the last visit timestamp to the current time
 */
export const updateLastVisitTime = (): void => {
  try {
    localStorage.setItem(KEYS.LAST_VISIT, new Date().toISOString());
  } catch (error) {
    console.error('Error updating last visit time:', error);
  }
};

/**
 * Gets the last visit timestamp
 * @returns The last visit Date object or a default date if not set
 */
export const getLastVisitTime = (): Date => {
  try {
    const lastVisit = localStorage.getItem(KEYS.LAST_VISIT);
    if (lastVisit) {
      return new Date(lastVisit);
    }
  } catch (error) {
    console.error('Error retrieving last visit time:', error);
  }
  
  // If no last visit time or error, return a date from 24 hours ago
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() - 1);
  return defaultDate;
}; 