/**
 * GitHubReconService.ts
 *
 * This service provides GitHub reconnaissance capabilities for DataOps Terminal.
 * It includes repository crawling, organization analysis, and other GitHub-related functions.
 */

import { isAirlockActive } from './AirlockService';
import { logEntry } from './ScrollLoggerService';

// Types for GitHub data
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  license: {
    key: string;
    name: string;
    url: string;
  } | null;
  topics: string[];
  visibility: string;
  default_branch: string;
}

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  type: string;
  site_admin: boolean;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubOrganization {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  description: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  members?: GitHubUser[];
  repositories?: GitHubRepository[];
}

export interface GitHubReconResult {
  target: string;
  timestamp: string;
  type: 'user' | 'organization';
  data: GitHubUser | GitHubOrganization;
  error?: string;
}

/**
 * Fetch GitHub user information
 * @param username - The GitHub username
 * @returns Promise<GitHubUser> - The user information
 */
export const fetchGitHubUser = async (username: string): Promise<GitHubUser> => {
  // Check if airlock is active
  if (isAirlockActive()) {
    throw new Error('Airlock is active. Internet access is disabled.');
  }

  try {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'DataOps-Terminal-Recon/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching GitHub user:', error);
    throw error;
  }
};

/**
 * Fetch GitHub organization information
 * @param org - The GitHub organization name
 * @returns Promise<GitHubOrganization> - The organization information
 */
export const fetchGitHubOrganization = async (org: string): Promise<GitHubOrganization> => {
  // Check if airlock is active
  if (isAirlockActive()) {
    throw new Error('Airlock is active. Internet access is disabled.');
  }

  try {
    const response = await fetch(`https://api.github.com/orgs/${org}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'DataOps-Terminal-Recon/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching GitHub organization:', error);
    throw error;
  }
};

/**
 * Fetch repositories for a GitHub user or organization
 * @param owner - The GitHub username or organization name
 * @param type - The type of owner ('user' or 'org')
 * @param maxPages - Maximum number of pages to fetch (default: 3)
 * @returns Promise<GitHubRepository[]> - The repositories
 */
export const fetchGitHubRepositories = async (
  owner: string,
  type: 'user' | 'org',
  maxPages: number = 3
): Promise<GitHubRepository[]> => {
  // Check if airlock is active
  if (isAirlockActive()) {
    throw new Error('Airlock is active. Internet access is disabled.');
  }

  try {
    const repositories: GitHubRepository[] = [];
    let page = 1;
    let hasMorePages = true;

    while (hasMorePages && page <= maxPages) {
      const endpoint = type === 'user'
        ? `https://api.github.com/users/${owner}/repos`
        : `https://api.github.com/orgs/${owner}/repos`;

      const response = await fetch(`${endpoint}?page=${page}&per_page=100`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'DataOps-Terminal-Recon/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const repos = await response.json();

      if (repos.length === 0) {
        hasMorePages = false;
      } else {
        repositories.push(...repos);
        page++;
      }
    }

    return repositories;
  } catch (error) {
    console.error('Error fetching GitHub repositories:', error);
    throw error;
  }
};

/**
 * Perform a comprehensive GitHub reconnaissance on a target
 * @param target - The GitHub username or organization name
 * @returns Promise<GitHubReconResult> - The reconnaissance results
 */
export const performGitHubRecon = async (target: string): Promise<GitHubReconResult> => {
  // Check if airlock is active
  if (isAirlockActive()) {
    throw new Error('Airlock is active. Internet access is disabled.');
  }

  // Log the recon
  logEntry('system', `Starting GitHub reconnaissance for ${target}`);

  try {
    // First, try to fetch as organization
    try {
      const orgData = await fetchGitHubOrganization(target);

      // Fetch repositories
      const repositories = await fetchGitHubRepositories(target, 'org');
      orgData.repositories = repositories;

      // Log the result
      logEntry('response', `GitHub reconnaissance completed for organization: ${target}`, orgData);

      return {
        target,
        timestamp: new Date().toISOString(),
        type: 'organization',
        data: orgData
      };
    } catch (orgError) {
      // If not an organization, try as user
      try {
        const userData = await fetchGitHubUser(target);

        // Fetch repositories
        const repositories = await fetchGitHubRepositories(target, 'user');

        // Create result with repositories
        const result = {
          target,
          timestamp: new Date().toISOString(),
          type: 'user' as const,
          data: {
            ...userData,
            repositories
          }
        };

        // Log the result
        logEntry('response', `GitHub reconnaissance completed for user: ${target}`, result.data);

        return result;
      } catch (userError) {
        throw new Error(`Target "${target}" not found as organization or user`);
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Log the error
    logEntry('error', `GitHub reconnaissance failed for ${target}: ${errorMessage}`);

    return {
      target,
      timestamp: new Date().toISOString(),
      type: 'organization', // Default type, will be ignored due to error
      data: {} as any,
      error: errorMessage
    };
  }
};

export default {
  fetchGitHubUser,
  fetchGitHubOrganization,
  fetchGitHubRepositories,
  performGitHubRecon
};
