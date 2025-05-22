/**
 * AirlockService.ts
 *
 * This service manages internet access for DataOps Terminal.
 * It provides functions to enable/disable internet access and check the current status.
 * When the airlock is active, all outbound HTTP requests are blocked.
 */

// Event names for airlock status changes
export const AIRLOCK_EVENTS = {
  AIRLOCK_ACTIVATED: 'airlock:activated',
  AIRLOCK_DEACTIVATED: 'airlock:deactivated',
  AIRLOCK_STATUS_CHANGED: 'airlock:status-changed'
};

// Airlock status
export type AirlockStatus = 'active' | 'inactive';

// Airlock configuration
export interface AirlockConfig {
  defaultStatus: AirlockStatus;
  logRequests: boolean;
  allowLocalRequests: boolean;
}

// Default configuration
const DEFAULT_CONFIG: AirlockConfig = {
  defaultStatus: 'inactive', // Airlock is inactive by default (internet allowed) for hackathon
  logRequests: true,         // Log all requests
  allowLocalRequests: true   // Allow requests to localhost
};

// Store for the original fetch function
let originalFetch: typeof fetch | null = null;

// Current airlock status
let airlockStatus: AirlockStatus = 'inactive';

// Current configuration
let config: AirlockConfig = DEFAULT_CONFIG;

/**
 * Initialize the airlock service
 * @param initialConfig - Initial configuration
 */
export const initAirlock = (initialConfig: Partial<AirlockConfig> = {}): void => {
  // Merge default config with provided config
  config = { ...DEFAULT_CONFIG, ...initialConfig };

  // Set initial status
  airlockStatus = config.defaultStatus;

  // Store original fetch function if not already stored
  if (!originalFetch && typeof window !== 'undefined') {
    originalFetch = window.fetch;
  }

  // Apply airlock if it should be active by default
  if (airlockStatus === 'active') {
    activateAirlock();
  }

  // Log initialization
  console.log(`Airlock initialized with status: ${airlockStatus}`);

  // Dispatch event
  dispatchAirlockEvent(airlockStatus);
};

/**
 * Activate the airlock (block internet access)
 */
export const activateAirlock = (): void => {
  if (typeof window === 'undefined') return;

  // Only proceed if we have the original fetch
  if (!originalFetch) {
    originalFetch = window.fetch;
  }

  // Replace fetch with our controlled version
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    // Get the URL from the input
    const url = typeof input === 'string' ? input : input.url;

    // Check if this is a local request
    const isLocalRequest = url.startsWith('http://localhost') ||
                          url.startsWith('http://127.0.0.1') ||
                          url.startsWith('/');

    // Log the request if configured to do so
    if (config.logRequests) {
      console.log(`Airlock: Request to ${url} ${isLocalRequest ? '(local)' : '(external)'}`);
    }

    // Allow local requests if configured to do so
    if (isLocalRequest && config.allowLocalRequests) {
      return originalFetch(input, init);
    }

    // Block external requests
    console.warn(`Airlock: Blocked request to ${url}`);

    // Return a mock response
    return new Response(JSON.stringify({
      error: 'Airlock active: Internet access is disabled',
      status: 'blocked',
      url
    }), {
      status: 403,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  };

  // Update status
  airlockStatus = 'active';

  // Dispatch event
  dispatchAirlockEvent(airlockStatus);

  console.log('Airlock activated: Internet access is now blocked');
};

/**
 * Deactivate the airlock (allow internet access)
 */
export const deactivateAirlock = (): void => {
  if (typeof window === 'undefined') return;

  // Restore original fetch if we have it
  if (originalFetch) {
    window.fetch = originalFetch;
  }

  // Update status
  airlockStatus = 'inactive';

  // Dispatch event
  dispatchAirlockEvent(airlockStatus);

  console.log('Airlock deactivated: Internet access is now allowed');
};

/**
 * Toggle the airlock status
 * @returns The new airlock status
 */
export const toggleAirlock = (): AirlockStatus => {
  if (airlockStatus === 'active') {
    deactivateAirlock();
  } else {
    activateAirlock();
  }

  return airlockStatus;
};

/**
 * Get the current airlock status
 * @returns The current airlock status
 */
export const getAirlockStatus = (): AirlockStatus => {
  return airlockStatus;
};

/**
 * Check if the airlock is active
 * @returns True if the airlock is active, false otherwise
 */
export const isAirlockActive = (): boolean => {
  return airlockStatus === 'active';
};

/**
 * Update the airlock configuration
 * @param newConfig - New configuration
 */
export const updateAirlockConfig = (newConfig: Partial<AirlockConfig>): void => {
  config = { ...config, ...newConfig };
  console.log('Airlock configuration updated:', config);
};

/**
 * Dispatch an airlock event
 * @param status - The current airlock status
 */
const dispatchAirlockEvent = (status: AirlockStatus): void => {
  if (typeof window === 'undefined') return;

  // Dispatch status changed event
  window.dispatchEvent(new CustomEvent(AIRLOCK_EVENTS.AIRLOCK_STATUS_CHANGED, {
    detail: { status }
  }));

  // Dispatch specific event based on status
  const eventName = status === 'active'
    ? AIRLOCK_EVENTS.AIRLOCK_ACTIVATED
    : AIRLOCK_EVENTS.AIRLOCK_DEACTIVATED;

  window.dispatchEvent(new CustomEvent(eventName, {
    detail: { status }
  }));
};

// Initialize the airlock service when this module is imported
if (typeof window !== 'undefined') {
  initAirlock();
}

export default {
  initAirlock,
  activateAirlock,
  deactivateAirlock,
  toggleAirlock,
  getAirlockStatus,
  isAirlockActive,
  updateAirlockConfig,
  AIRLOCK_EVENTS
};
