import { Globe, Github } from "lucide-react"
import Link from "next/link"

export const Footer = () => {
    return (
        <footer className="border-t py-4 fixed bottom-0 w-full bg-white dark:bg-zinc-900 z-50">
            <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
                <div className="flex justify-center gap-4 items-center mb-1">
                    <div className="flex items-center gap-1 ">
                        <Github className="h-4 w-4" />
                        <Link
                            href="https://github.com/Pranavtej/crt-xplorer"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-500 dark:hover:text-blue-400 hover:underline transition-colors"
                        >
                            Star us on GitHub
                        </Link>
                    </div>
                </div>

            </div>
        </footer>
    )
}