import type { GitHubStats } from '@/api/github-api';
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getContributionLevel = (stats?: GitHubStats | null) => {
  if (!stats) return "Loading...";

  // Gold : Has at least 3 merged PRs
  if (stats.merged >= 3) return "Gold";

  // Silver : Has at least 1 PR (open or closed)
  if (stats.prs >= 1) return "Silver";

  // Bronze : Has at least 1 issue opened
  if (stats.issues >= 3) return "Bronze";

  return "Newcomer";
};