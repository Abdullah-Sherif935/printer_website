import Image from 'next/image'

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm transition-colors duration-500">
            <div className="relative flex flex-col items-center justify-center p-8">
                {/* Logo Container with Animations */}
                <div className="relative w-48 h-48 md:w-64 md:h-64 animate-[logo-reveal_1.5s_ease-out_forwards]">
                    <div className="absolute inset-0 flex items-center justify-center animate-[shimmer-glow_3s_ease-in-out_infinite]">
                        <Image
                            src="/loader-logo-user.png"
                            alt="Loading Application"
                            fill
                            className="object-contain invert mix-blend-multiply opacity-90 dark:invert-0 dark:mix-blend-screen dark:opacity-100 transition-all duration-500"
                            priority
                        />
                    </div>
                </div>

                {/* Optional Loading Status Text or Spinner if needed, but user asked for Logo ONLY */}
                {/* <div className="mt-8 h-1 w-32 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-primary animate-progress origin-left" />
                </div> */}
            </div>
        </div>
    )
}
