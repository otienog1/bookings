'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Save,
  Camera,
  Mail,
  Phone
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function SettingsPage() {
  const { user, isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [profile, setProfile] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: '',
    bio: ''
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    bookingUpdates: true,
    systemAlerts: false,
    marketingEmails: false
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'private',
    dataSharing: false,
    analytics: true
  });

  const handleProfileSave = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Show success message or handle error
    }, 1000);
  };

  const handleNotificationsSave = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handlePrivacySave = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-1 flex-col gap-2 p-2 pt-0 sm:gap-4 sm:p-4">
      <div className="min-h-[calc(100vh-4rem)] flex-1 rounded-md p-3 sm:rounded-xl sm:p-4 md:p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src="" />
                <AvatarFallback className="text-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {user?.username?.substring(0, 2).toUpperCase() || "UN"}
                </AvatarFallback>
              </Avatar>
              <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0">
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">
                {user?.first_name || user?.username || 'User'}
              </h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={isAdmin ? "default" : "secondary"}>
                  {isAdmin ? "Administrator" : "User"}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Settings Tabs */}
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Privacy</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Appearance</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profile.firstName}
                        onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profile.lastName}
                        onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-9"
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        className="pl-9"
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleProfileSave} disabled={isLoading}>
                      <Save className="mr-2 h-4 w-4" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, emailNotifications: checked})
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications in browser
                      </p>
                    </div>
                    <Switch
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, pushNotifications: checked})
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Booking Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about booking changes
                      </p>
                    </div>
                    <Switch
                      checked={notifications.bookingUpdates}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, bookingUpdates: checked})
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">System Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Important system notifications
                      </p>
                    </div>
                    <Switch
                      checked={notifications.systemAlerts}
                      onCheckedChange={(checked) => 
                        setNotifications({...notifications, systemAlerts: checked})
                      }
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleNotificationsSave} disabled={isLoading}>
                      <Save className="mr-2 h-4 w-4" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy & Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Data Sharing</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow anonymous data collection for improvement
                      </p>
                    </div>
                    <Switch
                      checked={privacy.dataSharing}
                      onCheckedChange={(checked) => 
                        setPrivacy({...privacy, dataSharing: checked})
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Help improve the platform with usage analytics
                      </p>
                    </div>
                    <Switch
                      checked={privacy.analytics}
                      onCheckedChange={(checked) => 
                        setPrivacy({...privacy, analytics: checked})
                      }
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handlePrivacySave} disabled={isLoading}>
                      <Save className="mr-2 h-4 w-4" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Theme</Label>
                      <p className="text-sm text-muted-foreground">
                        Choose your preferred theme
                      </p>
                    </div>
                    <ThemeToggle />
                  </div>

                  <div className="space-y-2">
                    <Label>Language</Label>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">English (US)</span>
                      <Badge variant="outline">Default</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}