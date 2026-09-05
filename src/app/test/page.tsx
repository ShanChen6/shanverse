"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  Heart,
  Mail,
  Search,
  Settings,
  Share2,
  Sparkles,
  User,
} from "lucide-react";

import { LandingLayout } from "@/components/layout/LandingLayout";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Pagination } from "@/components/layout/pagination";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { IconButton } from "@/components/icons/icon-button";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Badge from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Callout } from "@/components/common/markdown/callout";
import { CodeBlock } from "@/components/common/markdown/code-block";
import { Heading } from "@/components/common/markdown/heading";
import { Image as MarkdownImage } from "@/components/common/markdown/image";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableElement,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/common/markdown/table";

const logoSrc = "/logo/logo_shanverse.png";

export default function ComponentTestPage() {
  const [currentPage, setCurrentPage] = React.useState(1);

  return (
    <LandingLayout>
      <div className="container mx-auto px-4 py-10 space-y-16">
        {/* Page Header */}
        <header className="space-y-4 border-b border-border pb-8">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Design System", href: "/test" },
              { label: "All Components Preview" },
            ]}
          />
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Component Test Gallery
                </h1>
                <Badge variant="success">All Components</Badge>
              </div>
              <p className="mt-2 text-foreground-secondary">
                Trang test riêng biệt xem trước tất cả UI components, layout
                elements và markdown components của Shanverse.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button asChild variant="outline">
                <Link href="/">← Trở về Home</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* 1. BUTTON & ICON BUTTON */}
        <section id="buttons" className="space-y-6 scroll-mt-24">
          <div className="border-b border-border pb-2">
            <h2 className="text-2xl font-bold text-foreground">
              1. Button & Icon Button
            </h2>
            <p className="text-sm text-foreground-secondary">
              Biến thể nút bấm, kích thước và biểu tượng.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Button Variants</CardTitle>
                <CardDescription>
                  Default, Secondary, Outline, Ghost, Destructive, Link
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Button Sizes & States</CardTitle>
                <CardDescription>
                  Sizes sm, md, lg, xl & disabled state
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
                <Button disabled>Disabled</Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Icon Buttons & Full Width</CardTitle>
                <CardDescription>
                  IconButton wrapper component & Full Width option
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <IconButton
                    icon={<Search className="h-4 w-4" />}
                    label="Search"
                    variant="default"
                  />
                  <IconButton
                    icon={<Bell className="h-4 w-4" />}
                    label="Notifications"
                    variant="secondary"
                  />
                  <IconButton
                    icon={<Settings className="h-4 w-4" />}
                    label="Settings"
                    variant="outline"
                  />
                  <IconButton
                    icon={<Heart className="h-4 w-4 text-red-500" />}
                    label="Like"
                    variant="ghost"
                  />
                  <IconButton
                    icon={<Sparkles className="h-4 w-4" />}
                    label="AI Assist"
                    variant="destructive"
                  />
                </div>
                <Button
                  fullWidth
                  variant="default"
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  Full Width Action Button
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 2. AVATAR, BADGE & CARD */}
        <section id="media-cards" className="space-y-6 scroll-mt-24">
          <div className="border-b border-border pb-2">
            <h2 className="text-2xl font-bold text-foreground">
              2. Avatar, Badge & Card
            </h2>
            <p className="text-sm text-foreground-secondary">
              Hiển thị đại diện người dùng, nhãn thông báo và thẻ nội dung.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Avatar Demos */}
            <Card>
              <CardHeader>
                <CardTitle>Avatar Variations</CardTitle>
                <CardDescription>
                  Sử dụng logo `/logo/logo_shanverse.png`
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-4">
                <div className="flex flex-col items-center gap-1">
                  <Avatar
                    src={logoSrc}
                    alt="Shanverse Logo"
                    className="h-14 w-14"
                  />
                  <span className="text-xs text-muted-foreground">
                    Logo Default
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Avatar className="h-14 w-14 rounded-xl ring-2 ring-primary ring-offset-2">
                    <AvatarImage src={logoSrc} alt="Shanverse Logo" />
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    Rounded Box
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Avatar className="h-14 w-14 bg-primary text-white font-semibold">
                    <AvatarFallback>SV</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    Text Fallback
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Badge Demos */}
            <Card>
              <CardHeader>
                <CardTitle>Badge Variants</CardTitle>
                <CardDescription>
                  Các mức độ cảnh báo và trạng thái
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2.5">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
              </CardContent>
            </Card>

            {/* Combined Profile Card */}
            <Card>
              <CardHeader className="flex-row items-center gap-3">
                <Avatar src={logoSrc} alt="Profile" className="h-12 w-12" />
                <div>
                  <CardTitle className="p-0 text-base">
                    ShanDev Profile
                  </CardTitle>
                  <CardDescription className="p-0 text-xs">
                    Shanverse Creator
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-foreground-secondary">
                  Thành viên phát triển hệ thống giao diện Shanverse UI.
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Badge variant="success">Active Now</Badge>
                <Button size="sm" variant="outline">
                  Follow
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* 3. INPUT, TEXTAREA & FORM CONTROL */}
        <section id="forms" className="space-y-6 scroll-mt-24">
          <div className="border-b border-border pb-2">
            <h2 className="text-2xl font-bold text-foreground">
              3. Form Controls
            </h2>
            <p className="text-sm text-foreground-secondary">
              Input, Textarea và các ô nhập liệu.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Input & Textarea Preview</CardTitle>
              <CardDescription>
                Các dạng kích thước và variant cho form
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium">
                    Input Small (sm)
                  </label>
                  <Input inputSize="sm" placeholder="Search small..." />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">
                    Input Medium (md - Default)
                  </label>
                  <Input
                    inputSize="md"
                    placeholder="Enter your email address..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">
                    Input Large (lg) & Ghost
                  </label>
                  <Input
                    inputSize="lg"
                    variant="ghost"
                    placeholder="Large ghost input..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium">
                    Textarea (Resizable)
                  </label>
                  <Textarea placeholder="Write your message or comment here..." />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Disabled Input</label>
                  <Input disabled placeholder="Cannot edit this field" />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 4. OVERLAYS: DIALOG, DRAWER, SHEET, POPOVER, DROPDOWN, TOOLTIP */}
        <section id="overlays" className="space-y-6 scroll-mt-24">
          <div className="border-b border-border pb-2">
            <h2 className="text-2xl font-bold text-foreground">
              4. Overlays & Interactive Popups
            </h2>
            <p className="text-sm text-foreground-secondary">
              Dialog, Drawer, Sheet, Popover, Dropdown Menu, Tooltip.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Dialog Demo */}
            <Card>
              <CardHeader>
                <CardTitle>Dialog Component</CardTitle>
                <CardDescription>
                  Hộp thoại popup modal chính giữa màn hình
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="default">Open Dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Shanverse Dialog Test</DialogTitle>
                      <DialogDescription>
                        Đây là hộp thoại Dialog modal được thiết kế bằng Radix
                        UI Dialog.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-3">
                      <Input placeholder="Nhập xác nhận..." />
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Hủy</Button>
                      </DialogClose>
                      <Button variant="default">Xác nhận</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Sheet Demo */}
            <Card>
              <CardHeader>
                <CardTitle>Sheet Component</CardTitle>
                <CardDescription>
                  Bảng trượt từ lề bên phải / trái
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="secondary">Open Side Sheet</Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <SheetHeader>
                      <SheetTitle>Navigation Sheet</SheetTitle>
                      <SheetDescription>
                        Nội dung bổ sung trượt ra từ bên phải màn hình.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-6 space-y-4">
                      <p className="text-sm text-foreground-secondary">
                        Menu item 1
                      </p>
                      <p className="text-sm text-foreground-secondary">
                        Menu item 2
                      </p>
                      <p className="text-sm text-foreground-secondary">
                        Menu item 3
                      </p>
                    </div>
                    <SheetFooter>
                      <SheetClose asChild>
                        <Button variant="outline">Đóng</Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </CardContent>
            </Card>

            {/* Drawer Demo */}
            <Card>
              <CardHeader>
                <CardTitle>Drawer Component</CardTitle>
                <CardDescription>
                  Bảng kéo trượt từ dưới lên (Bottom Drawer)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button variant="outline">Open Bottom Drawer</Button>
                  </DrawerTrigger>
                  <DrawerContent direction="bottom">
                    <DrawerHeader>
                      <DrawerTitle>Bottom Drawer Sheet</DrawerTitle>
                      <DrawerDescription>
                        Thích hợp hiển thị action sheet trên thiết bị di động.
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="py-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        Kéo xuống hoặc nhấn Đóng để thoát.
                      </p>
                    </div>
                    <DrawerFooter>
                      <DrawerClose asChild>
                        <Button variant="default">Đóng Drawer</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </CardContent>
            </Card>

            {/* Popover Demo */}
            <Card>
              <CardHeader>
                <CardTitle>Popover Component</CardTitle>
                <CardDescription>
                  Khung thông tin popup neo theo phần tử kích hoạt
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost">Click for Popover</Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Popover Header</h4>
                      <p className="text-xs text-muted-foreground">
                        Chứa thông tin chi tiết hoặc bộ lọc nhanh.
                      </p>
                      <Button size="sm" className="w-full mt-2">
                        Action
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>

            {/* Dropdown Menu Demo */}
            <Card>
              <CardHeader>
                <CardTitle>Dropdown Menu</CardTitle>
                <CardDescription>
                  Menu lựa chọn tác vụ theo danh sách
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Open Dropdown ▾</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                      <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Mail className="mr-2 h-4 w-4" />
                      <span>Messages</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-500">
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>

            {/* Tooltip Demo */}
            <Card>
              <CardHeader>
                <CardTitle>Tooltip Component</CardTitle>
                <CardDescription>
                  Chú thích nhỏ khi di chuột qua phần tử
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="secondary" size="icon">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Chia sẻ thông tin này</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Hover on me</Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Tooltip hỗ trợ giải thích rõ hơn</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 5. FEEDBACK: SKELETON, SPINNER, SEPARATOR */}
        <section id="feedback" className="space-y-6 scroll-mt-24">
          <div className="border-b border-border pb-2">
            <h2 className="text-2xl font-bold text-foreground">
              5. Feedback & Utilities
            </h2>
            <p className="text-sm text-foreground-secondary">
              Skeleton, Spinner, Separator, Pagination.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Skeleton Card */}
            <Card>
              <CardHeader>
                <CardTitle>Skeleton Loading</CardTitle>
                <CardDescription>
                  Trạng thái tải dữ liệu giả định
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full rounded-lg" />
              </CardContent>
            </Card>

            {/* Spinner Card */}
            <Card>
              <CardHeader>
                <CardTitle>Spinner Loader</CardTitle>
                <CardDescription>Các kích thước sm, md, lg, xl</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-around py-4">
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
                <Spinner size="xl" />
              </CardContent>
            </Card>

            {/* Separator Card */}
            <Card>
              <CardHeader>
                <CardTitle>Separator Utility</CardTitle>
                <CardDescription>Đường phân cách ngang & dọc</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-xs">Phần trên đường phân cách</div>
                <Separator />
                <div className="flex h-5 items-center space-x-4 text-xs">
                  <div>Cột 1</div>
                  <Separator orientation="vertical" />
                  <div>Cột 2</div>
                  <Separator orientation="vertical" />
                  <div>Cột 3</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pagination Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Pagination Layout Component</CardTitle>
              <CardDescription>Điều hướng phân trang danh sách</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-2">
              <Pagination
                currentPage={currentPage}
                totalPages={10}
                hrefBuilder={(p) => `#page-${p}`}
              />
            </CardContent>
          </Card>
        </section>

        {/* 6. MARKDOWN & CONTENT COMPONENTS */}
        <section id="markdown" className="space-y-6 scroll-mt-24">
          <div className="border-b border-border pb-2">
            <h2 className="text-2xl font-bold text-foreground">
              6. Markdown & Document Components
            </h2>
            <p className="text-sm text-foreground-secondary">
              Callout, CodeBlock, Heading, Image, Table.
            </p>
          </div>

          <div className="space-y-6">
            {/* Callouts */}
            <div className="grid gap-4 md:grid-cols-2">
              <Callout variant="info" title="Thông tin (Info Callout)">
                Đây là khối ghi chú thông tin với tone màu xanh dương primary.
              </Callout>
              <Callout variant="success" title="Thành công (Success Callout)">
                Tác vụ đã hoàn tất và lưu thành công trên hệ thống.
              </Callout>
              <Callout variant="warning" title="Cảnh báo (Warning Callout)">
                Vui lòng kiểm tra lại thiết lập trước khi tiếp tục.
              </Callout>
              <Callout variant="danger" title="Lỗi (Danger Callout)">
                Đã xảy ra sự cố phát sinh trong quá trình thực thi.
              </Callout>
            </div>

            {/* Headings Demo */}
            <Card>
              <CardHeader>
                <CardTitle>Markdown Headings (H1 - H6)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <Heading as={1}>Heading Level 1</Heading>
                <Heading as={2}>Heading Level 2</Heading>
                <Heading as={3}>Heading Level 3</Heading>
                <Heading as={4}>Heading Level 4</Heading>
              </CardContent>
            </Card>

            {/* CodeBlock */}
            <CodeBlock
              fileName="button.tsx"
              language="tsx"
              code={`import * as React from "react";
import { Button } from "@/components/ui/button";

export function Example() {
  return <Button variant="primary">Click Me</Button>;
}`}
            />

            {/* Markdown Image */}
            <MarkdownImage
              src={logoSrc}
              alt="Shanverse Logo Preview"
              caption="Ảnh Logo Shanverse hiển thị trong MarkdownImage component"
              width={600}
              height={300}
            />

            {/* Table */}
            <Table>
              <TableElement>
                <TableCaption>
                  Danh sách kiểm thử các UI components
                </TableCaption>
                <TableHead>
                  <TableRow>
                    <TableHeader>Component</TableHeader>
                    <TableHeader>Category</TableHeader>
                    <TableHeader>Status</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold">
                      Button / IconButton
                    </TableCell>
                    <TableCell>UI Basic</TableCell>
                    <TableCell>
                      <Badge variant="success">Passed</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">
                      Avatar / Badge / Card
                    </TableCell>
                    <TableCell>UI Data</TableCell>
                    <TableCell>
                      <Badge variant="success">Passed</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">
                      Dialog / Sheet / Drawer
                    </TableCell>
                    <TableCell>UI Overlay</TableCell>
                    <TableCell>
                      <Badge variant="success">Passed</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </TableElement>
            </Table>
          </div>
        </section>
      </div>
    </LandingLayout>
  );
}
