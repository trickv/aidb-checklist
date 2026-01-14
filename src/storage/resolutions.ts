import AsyncStorage from '@react-native-async-storage/async-storage';
import {Resolution, StorageSchema, generateId} from '../types';

const STORAGE_KEY = '@resolution_tracker_data';
const CURRENT_VERSION = 1;

// Initialize empty storage schema
function createEmptySchema(): StorageSchema {
  return {
    version: CURRENT_VERSION,
    resolutions: [],
  };
}

// Migrate data from older versions if needed
function migrateIfNeeded(data: any): StorageSchema {
  // If no version, it's legacy data or corrupted - start fresh but preserve what we can
  if (!data || typeof data !== 'object') {
    return createEmptySchema();
  }

  // If it's an array (old format), wrap it
  if (Array.isArray(data)) {
    return {
      version: CURRENT_VERSION,
      resolutions: data,
    };
  }

  // Current version, return as-is
  if (data.version === CURRENT_VERSION) {
    return data as StorageSchema;
  }

  // Future: add migration logic here for version upgrades
  // For now, just update version and hope for the best
  return {
    ...data,
    version: CURRENT_VERSION,
  };
}

// Load all resolutions from storage
export async function loadResolutions(): Promise<Resolution[]> {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue === null) {
      return [];
    }
    const data = JSON.parse(jsonValue);
    const schema = migrateIfNeeded(data);
    return schema.resolutions;
  } catch (e) {
    console.error('Failed to load resolutions:', e);
    return [];
  }
}

// Save all resolutions to storage
export async function saveResolutions(resolutions: Resolution[]): Promise<void> {
  try {
    const schema: StorageSchema = {
      version: CURRENT_VERSION,
      resolutions,
    };
    const jsonValue = JSON.stringify(schema);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error('Failed to save resolutions:', e);
    throw e;
  }
}

// Create a new resolution
export function createResolution(
  title: string,
  description: string = '',
): Resolution {
  return {
    id: generateId(),
    title,
    description,
    whatsNext: '',
    milestones: [],
    journalEntries: [],
    createdAt: new Date().toISOString(),
  };
}

// Create a new milestone
export function createMilestone(title: string, targetDate?: string): {
  id: string;
  title: string;
  targetDate?: string;
  completed: boolean;
} {
  return {
    id: generateId(),
    title,
    targetDate,
    completed: false,
  };
}

// Create a new journal entry
export function createJournalEntry(text: string): {
  id: string;
  createdAt: string;
  text: string;
} {
  return {
    id: generateId(),
    createdAt: new Date().toISOString(),
    text,
  };
}
