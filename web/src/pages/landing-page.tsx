import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ApplePass } from "@/components/ui/apple-pass"
import { useSession } from '@/context/SessionContext';
import { useNavigate } from 'react-router';
import xLogo from '@/assets/x_logo.svg';
import { getGitHubUserStats, type GitHubResponseStats } from '../api/github-api'
import { useState, useEffect } from 'react';

export default function LandingPage() {
    const [exempleStats, setExempleStats] = useState<{ riderxStats: GitHubResponseStats, kiwicoppleStats: GitHubResponseStats, saltcodStats: GitHubResponseStats } | null>(null);
    const [exempleLoading, setExempleLoading] = useState<boolean>(false);
    const { session } = useSession();
    const navigate = useNavigate();

    const steps = [
        {
            number: "01",
            title: "Connect GitHub",
            description: "Link your GitHub account to analyze your Supabase contributions automatically.",
        },
        {
            number: "02",
            title: "Get Analyzed",
            description: "We scan your PRs, issues, and commits to calculate your contribution level.",
        },
        {
            number: "03",
            title: "Download Pass",
            description: "Receive your personalized Apple Wallet pass instantly - Bronze, Silver, or Gold.",
        },
    ]

    const faqs = [
        {
            question: "How are contributions calculated?",
            answer:
                "We analyze your GitHub activity on Supabase repositories, including merged PRs, opened issues, code reviews, and documentation contributions. The calculation is updated each week.",
        },
        {
            question: "Can I update my pass ?",
            answer:
                "Yes! Your pass will be updated each week if you have new contributions!",
        },
        {
            question: "Is this officially endorsed by Supabase?",
            answer:
                "Supapass is a community project built by contributors, for contributors. While not officially endorsed, it celebrates the amazing Supabase community.",
        },
    ]


    const getExemplesStats = async () => {
        setExempleLoading(true);
        const [riderxStats, kiwicoppleStats, saltcodStats] = await Promise.all([
            getGitHubUserStats('riderx'),
            getGitHubUserStats('kiwicopple'),
            getGitHubUserStats('saltcod'),
        ]);
        const newStats = { riderxStats, kiwicoppleStats, saltcodStats };
        setExempleStats(newStats);

        setExempleLoading(false);
    }

    useEffect(() => {
        getExemplesStats();
    }, []);

    return (
        <div className="min-h-screen">
            <div className="bg-primary text-primary-foreground text-center py-2 px-4">
                <p className="text-sm font-medium">
                    🏆 Leaderboard coming soon! Compare your contributions with other Supabase contributors
                </p>
            </div>

            <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div onClick={() => navigate('/')} className="flex items-center space-x-2 cursor-pointer">
                        <img src="/supabase.svg" alt="SupaPass" className="w-8 h-8" />
                        <span className="font-bold text-xl">SupaPass</span>
                    </div>

                    <nav className="hidden md:flex items-center space-x-8">
                        <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                            How it works
                        </a>
                        <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">
                            FAQ
                        </a>
                    </nav>
                    <div className="flex items-center gap-3">
                        <a
                            href="https://github.com/adrienadv/supapass.me"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-muted rounded-md transition-colors"
                            aria-label="View source on GitHub"
                        >
                            <img
                                src="https://www.svgrepo.com/show/361509/github-logo.svg"
                                alt="GitHub Logo"
                                className="w-5 h-5"
                            />
                        </a>
                        {session ? (
                            <Button onClick={() => navigate('/pass-generator')}>Dashboard</Button>
                        ) : (
                            <Button onClick={() => navigate('/login')}>Get Started</Button>
                        )}
                    </div>
                </div>
            </header>

            <main>
                <section className="py-20 px-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent"></div>

                    <div className="container mx-auto max-w-4xl text-center relative">
                        <Badge>
                            🎉 Supporting Apple Wallet integration
                        </Badge>

                        <div className="relative">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl text-balance tracking-tight font-bold text-foreground mb-6 mt-4">
                                Your Supabase contributions <span className="underline decoration-primary decoration-dashed underline-offset-5">deserve recognition</span>
                            </h1>

                            <p className="text-lg text-balance mb-8 max-w-2xl mx-auto">
                                Get your personalized Apple Wallet pass based on your GitHub contributions to Supabase. Silver, Gold, or
                                Bronze - wear your open source impact with pride.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                                <Button onClick={() => session ? navigate('/pass-generator') : navigate('/login')} size="lg" className="">
                                    Get Your Wallet Pass
                                </Button>
                                <Button variant="outline" size="lg" className="" asChild>
                                    <a href="#pass-showcase">
                                        <span className="font-normal">View Examples</span>
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="how-it-works" className="py-20 px-4 bg-muted/30">
                    <div className="container mx-auto max-w-4xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
                            <p className="text-xl text-muted-foreground text-balance">
                                Get your contributor pass in three simple steps
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {steps.map((step, index) => (
                                <Card key={index} className="relative">
                                    <CardContent className="p-8 text-center">
                                        <div className="text-4xl font-bold text-primary mb-4">{step.number}</div>
                                        <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                                        <p className="text-muted-foreground">{step.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pass Showcase */}
                <section id="pass-showcase" className="py-20 px-4">
                    <div className="container mx-auto max-w-4xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Beautiful pass designs</h2>
                            <p className="text-xl text-muted-foreground text-balance">
                                Each pass is uniquely crafted to showcase your contribution level
                            </p>
                        </div>

                        <div className="flex flex-col md:flex-row justify-center gap-8">
                            <div className="flex flex-col items-center gap-4">
                                <Badge variant="outline" className="flex items-center gap-3 px-4 py-2 rounded-full bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/70 transition-colors">
                                    <img alt='X' src={xLogo} className="w-4 h-4 opacity-70" />
                                    <img src='https://pbs.twimg.com/profile_images/1664343166630109202/xcBMGPSE_400x400.jpg' className='w-8 h-8 rounded-full border-2 border-border' />
                                    <span className="text-sm font-medium">@kiwicopple</span>
                                </Badge>
                                <ApplePass
                                    userName="kiwicopple"
                                    stats={exempleStats?.kiwicoppleStats?.stats}
                                    isLoading={exempleLoading}
                                    isCoreMember={exempleStats?.kiwicoppleStats?.isCoreMember}
                                />
                            </div>

                            <div className="flex flex-col items-center gap-4">
                                <Badge variant="outline" className="flex items-center gap-3 px-4 py-2 rounded-full bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/70 transition-colors">
                                    <img alt='X' src={xLogo} className="w-4 h-4 opacity-70" />
                                    <img src='https://pbs.twimg.com/profile_images/1603462822423416832/Rck3-3Ov_400x400.png' className='w-8 h-8 rounded-full border-2 border-border' />
                                    <span className="text-sm font-medium">@riderx</span>
                                </Badge>
                                <ApplePass
                                    userName="riderx"
                                    stats={exempleStats?.riderxStats?.stats}
                                    isLoading={exempleLoading}
                                    isCoreMember={exempleStats?.riderxStats?.isCoreMember}
                                />
                            </div>

                            <div className="flex flex-col items-center gap-4">
                                <Badge variant="outline" className="flex items-center gap-3 px-4 py-2 rounded-full bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/70 transition-colors">
                                    <img alt='X' src={xLogo} className="w-4 h-4 opacity-70" />
                                    <img src='https://pbs.twimg.com/profile_images/197092604/pict_400x400.jpg' className='w-8 h-8 rounded-full border-2 border-border' />
                                    <span className="text-sm font-medium">@saltcod</span>
                                </Badge>
                                <ApplePass
                                    userName="saltcod"
                                    isCoreMember={exempleStats?.saltcodStats?.isCoreMember}
                                    stats={exempleStats?.saltcodStats?.stats}
                                    isLoading={exempleLoading}
                                />
                            </div>
                        </div>
                        <div className="flex justify-center mt-12">
                            <Button
                                size="lg"
                                className="text-lg px-8 py-3"
                                onClick={() => session ? navigate('/pass-generator') : navigate('/login')}
                            >
                                {session ? "Generate my pass" : "Get mine now"}
                            </Button>
                        </div>
                    </div>
                </section>

                <section id="faq" className="bg-muted/30 py-20 px-4">
                    <div className="container mx-auto max-w-3xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently asked questions</h2>
                            <p className="text-xl text-muted-foreground">Everything you need to know about Supapass</p>
                        </div>
                        <Accordion type="multiple" className="space-y-4">
                            {faqs.map((faq, index) => (
                                <AccordionItem
                                    key={index}
                                    value={`item-${index}`}
                                    className="bg-card border border-border rounded-lg px-6 border-b-1 border-b-border last:border-b-1"
                                >
                                    <AccordionTrigger className="text-left hover:no-underline">{faq.question}</AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </section>
            </main>

            <footer className="border-t border-border py-12 px-4">
                <div className="container mx-auto max-w-4xl">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="md:col-span-2">
                            <div className="flex items-center space-x-2 mb-4">
                                <img src="/supabase.svg" alt="SupaPass" className="w-8 h-8" />
                                <span className="font-bold text-xl">SupaPass</span>
                            </div>
                            <p className="text-muted-foreground mb-4">
                                Celebrating Supabase contributors with beautiful Apple Wallet passes. Built by the community, for the
                                community.
                            </p>
                            <p className="text-sm text-muted-foreground">Not officially affiliated with Supabase Inc.</p>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Product</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>
                                    <a href="#" className="hover:text-foreground transition-colors">
                                        How it works
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-foreground transition-colors">
                                        Examples
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-foreground transition-colors">
                                        FAQ
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Community</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>
                                    <a href="#" className="hover:text-foreground transition-colors">
                                        GitHub
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-foreground transition-colors">
                                        Twitter
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-foreground transition-colors">
                                        Discord
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
                        <p>&copy; 2025 Supapass. Made with 💚 by <span onClick={() => window.open('https://github.com/adrienadv', '_blank')} className="cursor-pointer font-bold">Adrien Villermois</span></p>
                    </div>
                </div>
            </footer>
        </div>
    )
}