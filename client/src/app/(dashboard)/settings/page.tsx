"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import {
  User,
  Bell,
  Shield,
  Palette,
  Moon,
  Sun,
  Monitor,
  Save,
  Camera,
  Mail,
  Globe,
  Lock,
  Trash2,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/useAuthStore";
import { getInitials } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const themes = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

const languages = ["English (US)", "Spanish", "French", "German", "Japanese", "Chinese"];

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((res) => setTimeout(res, 1000));
    updateUser({ name, email });
    toast({ title: "Settings saved!", description: "Your profile has been updated." });
    setIsSaving(false);
  };

  const notifications = [
    { id: "daily-reminder", label: "Daily study reminder", desc: "Get reminded to study at your optimal time", defaultOn: true },
    { id: "streak-alert", label: "Streak alerts", desc: "Notifications when your streak is at risk", defaultOn: true },
    { id: "exam-alerts", label: "Exam countdown alerts", desc: "Reminders as exam dates approach", defaultOn: true },
    { id: "ai-insights", label: "AI insights", desc: "Weekly performance reports from AI", defaultOn: false },
    { id: "new-features", label: "Product updates", desc: "News about new features and improvements", defaultOn: false },
  ];

  const [notifState, setNotifState] = useState<Record<string, boolean>>(
    Object.fromEntries(notifications.map((n) => [n.id, n.defaultOn]))
  );

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-black mb-1">Settings</h2>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="w-full sm:w-auto flex">
          <TabsTrigger value="profile" className="flex-1 sm:flex-none gap-2" id="tab-profile">
            <User className="w-4 h-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex-1 sm:flex-none gap-2" id="tab-appearance">
            <Palette className="w-4 h-4" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex-1 sm:flex-none gap-2" id="tab-notifications">
            <Bell className="w-4 h-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex-1 sm:flex-none gap-2" id="tab-security">
            <Shield className="w-4 h-4" /> Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-5">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="text-xl">
                      {user?.name ? getInitials(user.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm" id="change-avatar-btn">
                      <Camera className="w-4 h-4" />
                      Change photo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">JPG, GIF or PNG. Max 5MB.</p>
                  </div>
                </div>

                <Separator />

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="settings-name">Full name</Label>
                    <Input
                      id="settings-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      icon={<User className="w-4 h-4" />}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settings-email">Email address</Label>
                    <Input
                      id="settings-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      icon={<Mail className="w-4 h-4" />}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="settings-lang">Language</Label>
                    <select
                      id="settings-lang"
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {languages.map((lang) => (
                        <option key={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Plan</Label>
                    <div className="flex items-center gap-2 h-10">
                      <Badge variant={user?.plan === "pro" ? "default" : "secondary"} className="capitalize">
                        {user?.plan || "free"}
                      </Badge>
                      {user?.plan !== "pro" && (
                        <Button variant="outline" size="sm">Upgrade to Pro</Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={isSaving} id="save-profile-btn">
                    {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save changes</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how StudyAI looks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base mb-4 block">Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  {themes.map((t) => (
                    <motion.button
                      key={t.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setTheme(t.id)}
                      id={`theme-option-${t.id}`}
                      className={cn(
                        "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                        theme === t.id
                          ? "border-violet-500 bg-violet-500/10"
                          : "border-border hover:border-violet-500/40"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        theme === t.id ? "gradient-primary" : "bg-secondary"
                      )}>
                        <t.icon className={cn("w-5 h-5", theme === t.id ? "text-white" : "text-muted-foreground")} />
                      </div>
                      <span className={cn("text-sm font-medium", theme === t.id ? "text-violet-400" : "text-muted-foreground")}>
                        {t.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Compact mode</p>
                  <p className="text-xs text-muted-foreground">Reduce spacing and padding</p>
                </div>
                <Switch id="compact-mode-toggle" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Animations</p>
                  <p className="text-xs text-muted-foreground">Enable motion effects and transitions</p>
                </div>
                <Switch id="animations-toggle" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Choose what you want to be notified about.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications.map((notif, i) => (
                <div key={notif.id}>
                  <div className="flex items-start justify-between gap-4 py-2">
                    <div>
                      <p className="text-sm font-medium">{notif.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{notif.desc}</p>
                    </div>
                    <Switch
                      id={`notif-${notif.id}`}
                      checked={notifState[notif.id]}
                      onCheckedChange={(checked) =>
                        setNotifState((prev) => ({ ...prev, [notif.id]: checked }))
                      }
                    />
                  </div>
                  {i < notifications.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Change your account password.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current password</Label>
                  <Input id="current-password" type="password" icon={<Lock className="w-4 h-4" />} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New password</Label>
                  <Input id="new-password" type="password" icon={<Lock className="w-4 h-4" />} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-new-password">Confirm new password</Label>
                  <Input id="confirm-new-password" type="password" icon={<Lock className="w-4 h-4" />} />
                </div>
                <Button id="change-password-btn">Update password</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Enable 2FA</p>
                    <p className="text-xs text-muted-foreground">Use an authenticator app</p>
                  </div>
                  <Button variant="outline" size="sm" id="enable-2fa-btn">
                    Set up <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" size="sm" id="delete-account-btn">
                  <Trash2 className="w-4 h-4" />
                  Delete account
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  This will permanently delete your account and all data.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
