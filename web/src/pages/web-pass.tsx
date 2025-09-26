import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ApplePass } from '@/components/ui/apple-pass';
import { getPublicPass, type PublicPassData } from '../api/github-api';
import { useSession } from '@/context/SessionContext';
import supabaseLogo from '@/assets/supabase-logo-icon.svg';
import xLogo from '@/assets/x_logo.svg';
import { toast } from 'sonner';
import { useRef } from "react";
import { toPng } from "html-to-image";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Copy, Download } from 'lucide-react';

export default function WebPass() {
    const { passId } = useParams<{ passId: string }>();
    const navigate = useNavigate();
    const { session } = useSession();
    const [passData, setPassData] = useState<PublicPassData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const previewCaptureRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState<boolean>(false);

    console.log(passData);
    useEffect(() => {
        if (!passId) {
            setError('Missing Pass ID');
            setLoading(false);
            return;
        }

        fetchPassData();
    }, [passId]);

    const fetchPassData = async () => {
        setLoading(true);
        try {
            const data = await getPublicPass(passId!);
            setPassData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error loading pass');
        } finally {
            setLoading(false);
        }

    };

    const handleShareTwitter = () => {
        if (!passData) return;

        const tweetText = `🎉 I'm a ${passData.level} contributor to @supabase! 

📊 My contributions:
• ${passData.pass.pull_requests_count} PRs created
• ${passData.pass.merged_pull_requests_count} PRs merged  
• ${passData.pass.issues_opened_count} issues opened
• ${passData.pass.total_contributions_count} total contributions

Check out my contributor pass! 👇`;

        const url = window.location.href;
        const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`;
        window.open(twitterUrl, '_blank');
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        } catch (err) {
            toast.error('Failed to copy link');
        }
    };

    const exportPng = async () => {
        const node = previewCaptureRef.current;
        if (!node) return;

        const dataUrl = await toPng(node, {
            pixelRatio: Math.max(2, window.devicePixelRatio || 1) * 1.5,
            cacheBust: true,
            backgroundColor: "#f8f9fa",
        });

        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "apple-pass.png";
        a.click();
        a.remove();
    };

    if (loading) {
        return (
            <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
                <div className="text-center space-y-4 flex flex-col items-center">
                    <div className="flex items-center space-x-2 mb-6">
                        <img src="/supabase.svg" alt="SupaPass" className="w-8 h-8" />
                        <span className="font-bold text-xl">SupaPass</span>
                    </div>
                    <p className="text-muted-foreground">Loading pass...</p>
                    <Spinner size='md' className="mx-auto" />
                </div>
            </div>
        );
    }

    if (error) {
        navigate('/');
    }

    if (!passData) return null;

    const stats = {
        prs: passData.pass.pull_requests_count,
        merged: passData.pass.merged_pull_requests_count,
        issues: passData.pass.issues_opened_count,
        total: passData.pass.total_contributions_count
    };

    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <img src={supabaseLogo} alt="Supabase Logo" className="w-8 h-8" />
                        <span className="text-xl font-extrabold">SupaPass</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate('/pass-generator')}>
                        Create my pass
                    </Button>
                </div>
            </div>

            <div className="container mx-auto px-4 pb-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            {passData.user.userName}
                        </h1>
                        <p className="text-xl text-muted-foreground mb-2">
                            <span className="font-semibold text-primary">{passData.level}</span> Contributor at Supabase
                        </p>
                    </div>

                    <div className="flex justify-center mb-12">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#34b27b]/20 via-[#11181c]/10 to-[#34b27b]/20 blur-3xl scale-125 rounded-full"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-[#34b27b]/15 to-[#34b27b]/10 blur-2xl scale-115 rounded-full"></div>

                            <div className="relative z-10">
                                <ApplePass
                                    userName={passData.user.userName}
                                    stats={stats}
                                    isCoreMember={passData.pass.is_core_member}
                                    isLoading={false}
                                />
                            </div>
                        </div>
                    </div>
                    {session?.user?.id !== passData.user.id && (
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={handleShareTwitter}
                                className="flex items-center gap-2"
                                size="sm"
                            >
                                <img src={xLogo} alt="X (Twitter)" className="w-4 h-4" />
                                Share on X
                            </Button>

                            <Button
                                onClick={handleCopyLink}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Copy className="w-4 h-4" />
                                Copy link
                            </Button>

                            <Button
                                onClick={() => setOpen(true)}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Download in PNG
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            <AlertDialog open={open} onOpenChange={(isOpen) => setOpen(isOpen)}>
                <AlertDialogContent>
                    <AlertDialogDescription>
                        <div className="flex justify-center">
                            <div
                                ref={previewCaptureRef}
                                className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center bg-white rounded-2xl overflow-hidden p-4"
                                style={{
                                    width: 'min(320px, calc(100vw - 120px))',
                                    height: 'min(320px, calc(100vw - 120px))',
                                    minWidth: '280px',
                                    minHeight: '280px'
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#34b27b]/20 via-[#11181c]/10 to-[#34b27b]/20 blur-3xl scale-125"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-[#34b27b]/15 to-[#34b27b]/10 blur-2xl scale-115"></div>

                                <div className="relative z-10 transform scale-75 flex flex-col items-center justify-center">
                                    <ApplePass
                                        userName={passData.user.userName}
                                        stats={stats}
                                        isLoading={false}
                                        isCoreMember={passData.pass.is_core_member}
                                    />

                                    <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
                                        <span>made with</span>
                                        <img src={supabaseLogo} alt="Supabase" className="w-3 h-3" />
                                        <span className="font-semibold">supaPass</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={exportPng}>Download</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
