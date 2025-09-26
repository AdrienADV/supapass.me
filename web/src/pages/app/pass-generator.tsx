import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ProgressStep } from '@/components/ui/progress-step';
import { ApplePass } from '@/components/ui/apple-pass';
import { useSession } from '@/context/SessionContext';
import { getGitHubUserStats, type GitHubResponseStats } from '../../api/github-api';
import supabase from '@/supabase';
import supabaseLogo from '@/assets/supabase-logo-icon.svg';
import appleWalletIcon from '@/assets/apple_wallet.svg';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import confetti from "canvas-confetti";
import { type Session } from '@supabase/supabase-js';
import { getContributionLevel } from '@/lib/utils';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';

interface PassData {
    id: string;
    pull_requests_count: number;
    merged_pull_requests_count: number;
    issues_opened_count: number;
    total_contributions_count: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export default function PassGenerator() {
    const navigate = useNavigate();
    const { session } = useSession();
    const [githubProfil, setGithubProfil] = useState<GitHubResponseStats | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [passUrl, setPassUrl] = useState<string | null>(null);
    const [hasActivePass, setHasActivePass] = useState<boolean | null>(null);
    const [currentPass, setCurrentPass] = useState<PassData | null>(null);
    const [regenerating, setRegenerating] = useState<boolean>(false);
    const steps = [
        { icon: "✓", text: "Verifying GitHub profile" },
        { icon: "✓", text: "Analyzing contributions" },
        { icon: "⚡", text: "Determining contribution level" },
        { icon: "📱", text: "Generating Apple Wallet pass" }
    ];

    useEffect(() => {
        checkExistingActivePass();
    }, []);

    const getStepStatus = (index: number) => {
        if (index < currentStep - 1) return 'completed';
        if (index === currentStep - 1) return 'loading';
        return 'pending';
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    const checkExistingActivePass = async () => {
        const { data: pass } = await supabase.from('passes').select('*').eq('user_id', session?.user?.id).single();
        if (pass?.is_active) {
            setHasActivePass(true);
            setCurrentPass(pass);
            return pass
        }
        generatePass();
        return
    }

    const generatePass = async () => {
        if (!session) return;
        setCurrentStep(1);
        const githubProfil = await getGitHubUserStats(
            session?.user?.user_metadata?.user_name
        );
        setCurrentStep(2);
        await new Promise((r) => setTimeout(r, 1000));
        setGithubProfil(githubProfil);
        setCurrentStep(3);
        const pass = await getOrCreatePass(session, githubProfil);
        setCurrentPass(pass);
        setCurrentStep(4);
        const passUrl = await getPkPass();
        setPassUrl(passUrl!);

        handleConfetti();
        setCurrentStep(5);
    };


    const handleDownloadPass = (url: string) => {
        const link = document.createElement('a')
        link.href = url
        link.download = `${session?.user?.user_metadata?.user_name}.pkpass`
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        setPassUrl(null);
    };

    const getOrCreatePass = async (session: Session, githubProfil: GitHubResponseStats) => {
        const { data: existingPass, error: existingPassError } = await supabase
            .from('passes')
            .select('id, pull_requests_count, merged_pull_requests_count, issues_opened_count, total_contributions_count, is_active, created_at, updated_at, is_core_member')
            .eq('user_id', session.user.id)
            .single();
        if (existingPassError) {
            console.error('Error checking for existing pass:', existingPassError);
        }

        if (existingPass) {
            await supabase.from('passes').update({
                pull_requests_count: githubProfil?.stats?.prs,
                merged_pull_requests_count: githubProfil?.stats?.merged,
                issues_opened_count: githubProfil?.stats?.issues,
                total_contributions_count: githubProfil?.stats?.total,
                is_core_member: githubProfil?.isCoreMember,
            }).eq('id', existingPass.id).select('pull_requests_count, merged_pull_requests_count, issues_opened_count, total_contributions_count, is_active, created_at, updated_at').single();
            return existingPass;
        }
        const { data: createdPass, error: createdPassError } = await supabase
            .from('passes')
            .insert({
                user_id: session.user.id,
                pass_type_identifier: import.meta.env.VITE_PASS_TYPE_IDENTIFIER,
                pull_requests_count: githubProfil?.stats?.prs,
                merged_pull_requests_count: githubProfil?.stats?.merged,
                issues_opened_count: githubProfil?.stats?.issues,
                total_contributions_count: githubProfil?.stats?.total,
                is_core_member: githubProfil?.isCoreMember,
            })
            .select('*')
            .single();

        if (createdPassError) {
            console.error('Error creating pass:', createdPassError);
            return null;
        }

        return createdPass;
    };


    const getPkPass = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/pass/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`,
                    'Cache-Control': 'no-store'
                },
                cache: 'no-store',
            })

            if (response.status === 200) {
                const data = await response.arrayBuffer()
                const blob = new Blob([data], { type: 'application/vnd.apple.pkpass' })
                const url = window.URL.createObjectURL(blob)
                return url
            }
        } catch (error) {
            console.error('Error downloading pass:', error)
            toast.error('Error downloading pass')
        }
    }

    const handleAddToWallet = async () => {
        setRegenerating(true);
        if (passUrl) {
            handleDownloadPass(passUrl);
        } else {
            const passUrl = await getPkPass();
            handleDownloadPass(passUrl!);
        }
        setRegenerating(false);
    }

    const handleConfetti = () => {
        const end = Date.now() + 2 * 1000;
        const colors = ["#34b27b", "#f8f9fa", "#11181c",];
        const frame = () => {
            if (Date.now() > end) return;
            confetti({
                particleCount: 1,
                angle: 60,
                spread: 55,
                startVelocity: 60,
                origin: { x: 0, y: 0.5 },
                colors: colors,
            });
            confetti({
                particleCount: 1,
                angle: 120,
                spread: 55,
                startVelocity: 60,
                origin: { x: 1, y: 0.5 },
                colors: colors,
            });
            requestAnimationFrame(frame);
        };
        frame();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div onClick={() => navigate('/')} className="flex items-center gap-3 cursor-pointer">
                            <img src={supabaseLogo} alt="Supabase Logo" className="w-10 h-10" />
                            <span className="text-lg font-extrabold">SupaPass</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleLogout}>
                            Logout
                        </Button>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-8 items-start">
                        <div className="space-y-6">
                            <ApplePass
                                userName={session?.user?.user_metadata?.user_name}
                                stats={hasActivePass ? {
                                    prs: currentPass?.pull_requests_count || 0,
                                    merged: currentPass?.merged_pull_requests_count || 0,
                                    issues: currentPass?.issues_opened_count || 0,
                                    total: currentPass?.total_contributions_count || 0
                                } : githubProfil?.stats}
                                isLoading={!hasActivePass && currentStep < 4}
                            />
                        </div>

                        <div className="space-y-6">
                            {hasActivePass ? (
                                <div className="text-center lg:text-left">
                                    <div className="flex justify-center lg:justify-start mb-4">
                                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-6 animate-fade-in">
                                            <Button
                                                disabled={regenerating}
                                                variant={'ghost'}
                                                className='hover:bg-transparent'
                                                onClick={handleAddToWallet}
                                            >
                                                <img
                                                    src={appleWalletIcon}
                                                    alt="Add to Apple Wallet"
                                                    className="w-auto h-12 cursor-pointer hover:opacity-80 transition-opacity"
                                                />
                                            </Button>
                                            <Button
                                                size='sm'
                                                variant='outline'
                                                onClick={() => window.open(`/web-pass/${currentPass?.id}`, '_blank')}
                                                disabled={!currentPass?.id}
                                            >
                                                Web Version
                                            </Button>
                                        </div>
                                    </div>
                                    <h1 className="text-3xl font-bold mb-4">
                                        Your Pass is Already in Your Wallet
                                    </h1>
                                    <p className="text-muted-foreground text-lg">
                                        You already have an active Supabase contributor pass. You can access it in your Apple Wallet or view it on the web.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="text-center lg:text-left">
                                        <div className="flex justify-center lg:justify-start mb-4">
                                            {currentStep < 5 ? <Spinner size="md" /> : (
                                                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-6 animate-fade-in">
                                                    <img
                                                        src={appleWalletIcon}
                                                        alt="Add to Apple Wallet"
                                                        className="w-auto h-12 cursor-pointer hover:opacity-80 transition-opacity"
                                                        onClick={handleAddToWallet}
                                                    />
                                                    <Button
                                                        size='sm'
                                                        variant='outline'
                                                        onClick={() => window.open(`/web-pass/${currentPass?.id}`, '_blank')}
                                                        disabled={!currentPass?.id}
                                                    >
                                                        Web Version
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                        <h1 className="text-3xl font-bold mb-4">
                                            {currentStep < 5 ? "Generating Your Contributor Pass" : "Your Pass is Ready!"}
                                        </h1>
                                        {currentStep === 5 && (
                                            <h2 className="text-2xl font-bold mb-4">
                                                You are a <AnimatedGradientText
                                                    speed={2}
                                                    colorFrom="oklch(0.8348 0.1302 160.9080)"
                                                    colorTo='oklch(0.6959 0.1491 162.4796)'
                                                > {getContributionLevel(githubProfil?.stats)}</AnimatedGradientText> contributor
                                            </h2>
                                        )}
                                        <p className="text-muted-foreground text-lg">
                                            {currentStep < 5
                                                ? "We're analyzing your contributions to Supabase and creating your personalized Apple Wallet pass. This may take a few moments..."
                                                : "Your Supabase contributor pass has been generated successfully!"
                                            }
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        {steps.map((step, index) => (
                                            <ProgressStep
                                                key={index}
                                                icon={step.icon}
                                                text={step.text}
                                                status={getStepStatus(index)}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="text-center mt-16 pt-8 border-t border-border">
                    <p className="text-muted-foreground">
                        <span className="opacity-70">Powered by</span>{" "}
                        <strong onClick={() => window.open('https://github.com/adrienadv', '_blank')} className="cursor-pointer">Adrien Villermois</strong>
                    </p>
                </div>
            </div>
        </div >
    );
}
