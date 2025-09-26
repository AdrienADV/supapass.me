import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"

export default function LoadingPage() {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    return 0
                }
                return prev + 2
            })
        }, 60)

        return () => clearInterval(timer)
    }, [])

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="flex flex-col items-center space-y-8">

                <div className="relative">
                    <div className="flex items-center space-x-2">
                        <img src="/supabase.svg" alt="SupaPass" className="w-8 h-8" />
                        <span className="text-lg font-extrabold">SupaPass</span>
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-foreground">Loading...</h1>
                    <p className="text-muted-foreground">Please wait while we prepare everything for you</p>
                </div>


                <Progress value={progress} className="w-64" />
            </div>

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/5 rounded-full blur-xl animate-pulse animation-delay-1000"></div>
                <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-primary/5 rounded-full blur-xl animate-pulse animation-delay-2000"></div>
                <div className="absolute top-3/4 left-1/2 w-16 h-16 bg-primary/5 rounded-full blur-xl animate-pulse animation-delay-3000"></div>
            </div>
        </div>
    )
}