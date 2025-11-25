import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ReportsStatCardProps {
    title: string
    value: string | number
    description?: string
    icon: React.ReactNode
    color: "green" | "purple" | "orange" | "blue"
    trend?: {
        value: number
        isPositive: boolean
    }
}

export function ReportsStatCard({ title, value, description, icon, color, trend }: ReportsStatCardProps) {
    const colorStyles = {
        green: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
        purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
        orange: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
        blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    }

    return (
        <Card className="border-none shadow-sm">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className={cn("p-3 rounded-xl", colorStyles[color])}>
                        {icon}
                    </div>
                    {trend && (
                        <div className={cn(
                            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                            trend.isPositive
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                        )}>
                            {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
                        </div>
                    )}
                </div>
                <div className="mt-4">
                    <h3 className="text-2xl font-bold text-foreground">{value}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{title}</p>
                    {description && <p className="text-xs text-muted-foreground mt-1 opacity-70">{description}</p>}
                </div>
            </CardContent>
        </Card>
    )
}
