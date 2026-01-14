// Data model for Resolution Tracker
// Designed to be flexible for future changes while preserving data

export interface JournalEntry {
  id: string;
  createdAt: string; // ISO date string
  text: string;
}

export interface Milestone {
  id: string;
  title: string;
  targetDate?: string; // ISO date string, optional
  completed: boolean;
  completedAt?: string; // ISO date string
}

export interface Resolution {
  id: string;
  title: string;
  description: string;
  whatsNext: string; // The baby step thinking prompt
  milestones: Milestone[];
  journalEntries: JournalEntry[];
  createdAt: string; // ISO date string
  completedAt?: string; // ISO date string, set when all milestones done
}

// Storage schema with version for future migrations
export interface StorageSchema {
  version: number;
  resolutions: Resolution[];
}

// Helper to check if a resolution is complete
export function isResolutionComplete(resolution: Resolution): boolean {
  return (
    resolution.milestones.length > 0 &&
    resolution.milestones.every(m => m.completed)
  );
}

// Helper to get completion status
export type CompletionStatus = 'not_started' | 'in_progress' | 'complete';

export function getCompletionStatus(resolution: Resolution): CompletionStatus {
  if (resolution.milestones.length === 0) {
    return 'not_started';
  }
  const completedCount = resolution.milestones.filter(m => m.completed).length;
  if (completedCount === 0) {
    return 'not_started';
  }
  if (completedCount === resolution.milestones.length) {
    return 'complete';
  }
  return 'in_progress';
}

// Generate unique IDs
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
