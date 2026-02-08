"use client"

import { useState } from "react"
import { SettingsMap, updateSettings } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export function SettingsForm({ initialSettings }: { initialSettings: SettingsMap }) {
    const [settings, setSettings] = useState<SettingsMap>(initialSettings)

    async function handleSubmit() {
        const result = await updateSettings(settings)
        if (result.success) {
            toast.success("Settings updated successfully")
        } else {
            toast.error("Failed to update settings: " + result.error)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pricing Configuration</CardTitle>
                <CardDescription>
                    Set your default costs and operational margins.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Default B&W Cost ($)</Label>
                        <Input
                            type="number" step="0.01"
                            value={settings.default_bw_cost}
                            onChange={(e) => setSettings({ ...settings, default_bw_cost: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Default Color Cost ($)</Label>
                        <Input
                            type="number" step="0.01"
                            value={settings.default_color_cost}
                            onChange={(e) => setSettings({ ...settings, default_color_cost: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Default Profit Margin (%)</Label>
                        <Input
                            type="number"
                            value={settings.default_margin_percent}
                            onChange={(e) => setSettings({ ...settings, default_margin_percent: parseFloat(e.target.value) })}
                        />
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSubmit}>Save Changes</Button>
            </CardFooter>
        </Card>
    )
}
