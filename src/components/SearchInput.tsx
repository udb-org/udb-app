import React from "react"
import { Input } from "./ui/input"
import { cn } from "@/utils/tailwind"
import { SearchIcon } from "lucide-react"
export default function SearchInput({ className, ...props }: React.ComponentProps<"input">) {
    const [focused, setFocused] = React.useState(false);
    return <div
        className={cn(
            "flex items-center gap-2",
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-7 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            className,
            focused && "border-primary"
        )}
    >

        <div>
            <SearchIcon size={12} />
        </div>
        <input

            data-slot="input"
            className="border-none outline-none flex-1"
            {...props}
            onFocus={() => {
                setFocused(true);
            }}
            onBlur={() => {
                setFocused(false);
            }}



        />
    </div>
}