import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'

export default function LoginPage({
    searchParams,
}: {
    searchParams: { message: string; error: string }
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-sm">

                <CardHeader className="text-center">
                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-border bg-white shadow-md p-2">
                        <Image
                            src="/logo.png"
                            alt="PrintPOS Logo"
                            width={96}
                            height={96}
                            className="object-contain w-full h-full"
                            priority
                        />
                    </div>
                    <CardTitle className="text-2xl">المهندس للطباعة</CardTitle>
                    <CardDescription>
                        Enter your credentials to access the system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form id="login-form">
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="admin@printpos.com"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" name="password" type="password" required />
                            </div>
                            {searchParams.error && (
                                <div className="text-sm font-medium text-destructive">
                                    {searchParams.error}
                                </div>
                            )}
                            {searchParams.message && (
                                <div className="text-sm font-medium text-green-600">
                                    {searchParams.message}
                                </div>
                            )}
                        </div>
                    </form>
                </CardContent>
                <CardFooter>
                    <Button form="login-form" formAction={login} className="w-full">
                        Sign in
                    </Button>
                </CardFooter>
            </Card >
        </div >
    )
}
