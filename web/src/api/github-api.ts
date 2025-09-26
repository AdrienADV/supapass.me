import { getContributionLevel } from '@/lib/utils';

export interface GitHubResponseStats {
    stats: {
        prs: number;
        merged: number;
        issues: number;
        total: number;
    },
    isCoreMember: boolean;
    details: {
        [key: string]: {
            prs: number;
            merged: number;
            issues: number;
            total: number;
        };
    };
}
export interface GitHubStats {
    prs: number;
    merged: number;
    issues: number;
    total: number;
}

export interface PublicPassData {
    pass: {
        id: string;
        pull_requests_count: number;
        merged_pull_requests_count: number;
        issues_opened_count: number;
        total_contributions_count: number;
        created_at: string;
        user_id: string;
        is_core_member: boolean;
    };
    user: {
        userName: string;
        photo?: string;
        id: string;
    };
    level: string;
}

export async function getGitHubUserStats(
    username: string,
): Promise<GitHubResponseStats> {
    try {
        const res = await fetch(import.meta.env.VITE_SUPABASE_URL + `/functions/v1/github-stats`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ username }),
        });

        if (!res.ok) {
            const error = await res.json();
            console.error(`Failed to fetch stats: ${res.status}`, error);
            return { stats: { prs: 0, merged: 0, issues: 0, total: 0 }, isCoreMember: false, details: {} };
        }

        return res.json() as Promise<GitHubResponseStats>;
    } catch (error) {
        console.error('Error fetching GitHub stats:', error);
        return { stats: { prs: 0, merged: 0, issues: 0, total: 0 }, isCoreMember: false, details: {} };
    }
}

export async function getPublicPass(passId: string): Promise<PublicPassData> {
    try {
        const res = await fetch(import.meta.env.VITE_SUPABASE_URL + `/functions/v1/public-pass`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ passId }),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || `Failed to fetch pass: ${res.status}`);
        }

        const data = await res.json();
        const level = getContributionLevel({
            prs: data?.pass?.pull_requests_count,
            merged: data?.pass?.merged_pull_requests_count,
            issues: data?.pass?.issues_opened_count,
            total: data?.pass?.total_contributions_count,
        });
        return { ...data, level };

    } catch (error) {
        console.error('Error fetching public pass:', error);
        throw error;
    }
}
