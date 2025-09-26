import { cn } from "@/lib/utils";

interface SpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12"
    };

    return (
        <div
            className={cn(
                "animate-spin rounded-full border-2 border-primary/20 border-t-primary",
                sizeClasses[size],
                className
            )}
        />
    );
}
