import { LoginForm } from '@/components/login-form';
import supabaseLogo from '@/assets/supabase-logo-icon.svg';

export default function Login() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="flex min-h-screen items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <img src={supabaseLogo} alt="Supabase Logo" className="w-12 h-12" />
                            <span className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                                SupaPass
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold text-foreground mb-2">
                            Welcome to SupaPass
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Generate your Supabase contributor pass
                        </p>
                    </div>

                    <LoginForm />

                    <div className="text-center mt-8 pt-6 border-t border-border">
                        <p className="text-muted-foreground text-sm">
                            <span className="opacity-70">Powered by</span>{" "}
                            <strong>Adrien Villermois</strong>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}