import * as React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Badge from "@/components/ui/badge";
import {
  Card,
  CardBody,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const logoSrc = "/logo/logo_shanverse.png";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-10 px-6 py-16">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
          Component check
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          UI component preview
        </h1>
        <p className="text-muted-foreground">
          Kiểm tra nhanh Button, Avatar, Badge và Card bằng asset logo của
          Shanverse.
        </p>
      </header>

      {/* Button preview section */}
      <section className="grid gap-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="space-y-3">
          <h2 className="font-semibold">Variants</h2>
          <div className="flex flex-wrap gap-3">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-semibold">Sizes and states</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">Extra large</Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-semibold">Full width</h2>
          <Button fullWidth>Continue</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Avatar</h2>
        <div className="flex flex-wrap items-center gap-8 rounded-2xl border border-border bg-surface-elevated p-6 shadow-sm">
          <div className="flex flex-col items-center gap-2">
            <Avatar src={logoSrc} alt="Shanverse logo" className="h-20 w-20" />
            <span className="text-xs text-muted-foreground">Logo image</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar
              src={logoSrc}
              alt="Shanverse logo"
              className="h-14 w-14 rounded-xl ring-2 ring-primary ring-offset-2"
            />
            <span className="text-xs text-muted-foreground">
              Rounded square
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-14 w-14 rounded-xl ring-2 ring-emerald-500 ring-offset-2">
              <AvatarImage src={logoSrc} alt="Shanverse logo" />
            </Avatar>
            <span className="text-xs text-muted-foreground">
              Compound image
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-14 w-14 bg-primary text-lg font-semibold text-white">
              <AvatarFallback>SV</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">Fallback text</span>
          </div>
          <div className="relative flex flex-col items-center gap-2">
            <Avatar src={logoSrc} alt="Shanverse logo" className="h-10 w-10" />
            <Badge
              variant="success"
              className="absolute -right-8 -top-2 px-1.5 py-0 text-[10px]"
            >
              ON
            </Badge>
            <span className="text-xs text-muted-foreground">With badge</span>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Badge</h2>
        <div className="rounded-2xl border border-border bg-surface-elevated p-6 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <Avatar src={logoSrc} alt="Shanverse logo" className="h-10 w-10" />
            <div>
              <p className="font-medium">Shanverse</p>
              <p className="text-sm text-muted-foreground">Personal website</p>
            </div>
            <Badge variant="success" className="ml-auto">
              Published
            </Badge>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Card</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Shanverse profile</CardTitle>
              <CardDescription>
                Card với đầy đủ các phần cấu thành.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Avatar
                src={logoSrc}
                alt="Shanverse logo"
                className="h-16 w-16 rounded-xl"
              />
              <div>
                <p className="font-medium">Logo preview</p>
                <p className="text-sm text-muted-foreground">
                  Local asset rendered inside a card.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <Badge variant="outline">UI kit</Badge>
              <Button size="sm">View</Button>
            </CardFooter>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex items-center gap-4 bg-primary px-6 py-5 text-white">
              <Avatar
                src={logoSrc}
                alt="Shanverse logo"
                className="h-14 w-14 rounded-xl bg-white p-1"
              />
              <div>
                <p className="font-semibold">Featured card</p>
                <p className="text-sm text-white/75">Logo-led compact layout</p>
              </div>
            </div>
            <CardBody>
              <p className="text-sm text-muted-foreground">
                CardBody cũng có thể dùng cho nội dung gọn, không cần compound
                đầy đủ.
              </p>
            </CardBody>
          </Card>
        </div>
      </section>
    </main>
  );
}
