import { getSettings } from "./actions"
import { SettingsForm } from "./settings-form"

export default async function SettingsPage() {
    const settings = await getSettings()

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>
            <SettingsForm initialSettings={settings} />
        </div>
    )
}
