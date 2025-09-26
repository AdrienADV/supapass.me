import { Spinner } from './spinner';

export interface ProgressStepProps {
    icon: React.ReactNode;
    text: string;
    status: 'completed' | 'loading' | 'pending';
}

export function ProgressStep({ icon, text, status }: ProgressStepProps) {
    const getStatusClasses = () => {
        switch (status) {
            case 'completed':
                return 'text-primary bg-primary/10 border-primary/20';
            case 'loading':
                return 'text-primary bg-primary/5 border-primary/20';
            case 'pending':
                return 'text-muted-foreground bg-muted border-border';
        }
    };

    return (
        <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 animate-slide-in-left ${getStatusClasses()}`}>
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border">
                {status === 'loading' ? <Spinner size="sm" /> : icon}
            </div>
            <span className="text-sm font-medium">{text}</span>
        </div>
    );
}
