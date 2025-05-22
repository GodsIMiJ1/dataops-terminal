/**
 * Mission Memory Service
 *
 * This service handles tracking mission states and metadata.
 */

export interface MissionState {
  mission: string;
  initiated: string;
  lastCommand?: string;
  objective?: string;
  status: 'Active' | 'Dormant' | 'Completed' | 'Failed';
  metadata?: Record<string, any>;
}

// In-memory storage for missions
let missions: MissionState[] = [];
let currentMission: MissionState | null = null;

/**
 * Initialize a new mission
 */
export const initMission = (
  name: string,
  objective?: string
): MissionState => {
  const newMission: MissionState = {
    mission: name,
    initiated: new Date().toISOString().split('T')[0],
    objective,
    status: 'Active'
  };

  missions.push(newMission);
  currentMission = newMission;

  // Persist to localStorage if available
  try {
    if (typeof localStorage !== 'undefined') {
      const storedMissions = JSON.parse(localStorage.getItem('dataops_terminal_missions') || '[]');
      storedMissions.push(newMission);
      localStorage.setItem('dataops_terminal_missions', JSON.stringify(storedMissions));
    }
  } catch (error) {
    console.error('Failed to save mission to localStorage:', error);
  }

  return newMission;
};

/**
 * Get the current mission or create one if none exists
 */
export const getCurrentMission = (): MissionState => {
  if (!currentMission) {
    return initMission('AWAITING ORDERS');
  }
  return currentMission;
};

/**
 * Get the current mission status
 */
export const getMissionStatus = (): { currentObjective?: string } => {
  const mission = getCurrentMission();
  return {
    currentObjective: mission.objective
  };
};

/**
 * Update the current mission
 */
export const updateCurrentMission = (
  updates: Partial<MissionState>
): MissionState => {
  if (!currentMission) {
    return initMission(updates.mission || 'AWAITING ORDERS', updates.objective);
  }

  const updatedMission = {
    ...currentMission,
    ...updates
  };

  // Update in-memory mission
  currentMission = updatedMission;

  // Update in missions array
  const index = missions.findIndex(m => m.mission === currentMission?.mission);
  if (index !== -1) {
    missions[index] = updatedMission;
  }

  // Persist to localStorage if available
  try {
    if (typeof localStorage !== 'undefined') {
      const storedMissions = JSON.parse(localStorage.getItem('dataops_terminal_missions') || '[]');
      const storedIndex = storedMissions.findIndex((m: MissionState) => m.mission === updatedMission.mission);

      if (storedIndex !== -1) {
        storedMissions[storedIndex] = updatedMission;
      } else {
        storedMissions.push(updatedMission);
      }

      localStorage.setItem('dataops_terminal_missions', JSON.stringify(storedMissions));
    }
  } catch (error) {
    console.error('Failed to update mission in localStorage:', error);
  }

  return updatedMission;
};

/**
 * Set the current mission by name
 */
export const setCurrentMission = (name: string): MissionState => {
  // Check if mission already exists
  const existingMission = missions.find(m => m.mission === name);

  if (existingMission) {
    currentMission = existingMission;
    return existingMission;
  }

  // Create new mission
  return initMission(name);
};

/**
 * Update the last command for the current mission
 */
export const updateLastCommand = (command: string): void => {
  if (currentMission) {
    updateCurrentMission({ lastCommand: command });
  }
};

/**
 * Update the mission objective
 */
export const updateMissionObjective = (objective: string): void => {
  if (currentMission) {
    updateCurrentMission({ objective });
  }
};

/**
 * Get all missions
 */
export const getAllMissions = (): MissionState[] => {
  return missions;
};

/**
 * Load missions from localStorage
 */
export const loadMissions = (): void => {
  try {
    if (typeof localStorage !== 'undefined') {
      const storedMissions = JSON.parse(localStorage.getItem('dataops_terminal_missions') || '[]');
      missions = storedMissions;

      if (storedMissions.length > 0) {
        // Set the last active mission as current
        const activeMission = storedMissions.find((m: MissionState) => m.status === 'Active');
        currentMission = activeMission || storedMissions[storedMissions.length - 1];
      }
    }
  } catch (error) {
    console.error('Failed to load missions from localStorage:', error);
  }
};

/**
 * Clear all missions
 */
export const clearMissions = (): void => {
  missions = [];
  currentMission = null;

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('dataops_terminal_missions');
    }
  } catch (error) {
    console.error('Failed to clear missions from localStorage:', error);
  }
};
