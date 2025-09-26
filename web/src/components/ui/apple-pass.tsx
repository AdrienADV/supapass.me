import { getContributionLevel } from '@/lib/utils';
import { Card, CardContent } from './card';
import { Spinner } from './spinner';
import supabaseLogo from '@/assets/supabase-logo-icon.svg';

export interface ApplePassProps {
    userName?: string;
    stats?: {
        prs: number;
        merged: number;
        issues: number;
        total: number;
    };
    isLoading: boolean;
    isCoreMember?: boolean;
}

export function ApplePass({ userName, stats, isLoading, isCoreMember }: ApplePassProps) {

    const currentLevel = getContributionLevel(stats);

    return (
        <div className="w-80 mx-auto">
            <Card className="overflow-hidden bg-black text-white border-gray-800 shadow-xl rounded-xl">
                <CardContent className="space-y-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            <img src={supabaseLogo} alt="Supabase Logo" className="w-6 h-6" />
                            <span className="text-sm font-medium">
                                {isLoading ? (
                                    <Spinner size="sm" />
                                ) : (
                                    isCoreMember ? "Supabase Core Member" : "Supabase Contributor"
                                )}
                            </span>
                        </div>
                        <div className="text-right">
                            <div className="text-xs font-medium text-gray-300 mb-1">LEVEL</div>
                            <div className="text-sm font-bold">
                                {isLoading ? <Spinner size="sm" /> : currentLevel}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="text-xs font-medium text-gray-300 tracking-wide">{"CONTRIBUTOR"}</div>
                        <div className="text-xl font-bold">
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <Spinner size="sm" />
                                </div>
                            ) : (
                                userName || "Your Name"
                            )}
                        </div>
                    </div>

                    {/* Stats section */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                            <div className="text-xs font-medium text-gray-300 mb-1">PRS CREATED</div>
                            <div className="text-lg font-bold">
                                {isLoading ? (
                                    <Spinner size="sm" />
                                ) : (
                                    stats?.prs || "0"
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs font-medium text-gray-300 mb-1">PRS MERGED</div>
                            <div className="text-lg font-bold">
                                {isLoading ? (
                                    <Spinner size="sm" />
                                ) : (
                                    stats?.merged || "0"
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs font-medium text-gray-300 mb-1">CREATED ISSUES</div>
                            <div className="text-lg font-bold">
                                {isLoading ? (
                                    <Spinner size="sm" />
                                ) : (
                                    stats?.issues || "0"
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs font-medium text-gray-300 mb-1">TOTAL CONTRIBUTIONS</div>
                            <div className="text-lg font-bold">
                                {isLoading ? (
                                    <Spinner size="sm" />
                                ) : (
                                    stats?.total || "0"
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
