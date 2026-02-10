import { getSettings } from "./actions"
import { SettingsForm } from "./settings-form"

export default async function SettingsPage() {
    const settings = await getSettings()

    return (
        <div className="flex-1 space-y-6">
            <div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-800">إعدادات النظام</h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">تعديل تكاليف الطباعة وهامش الربح الافتراضي.</p>
            </div>
            <SettingsForm initialSettings={settings} />
        </div>
    )
}

