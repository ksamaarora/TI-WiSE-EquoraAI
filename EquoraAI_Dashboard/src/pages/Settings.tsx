import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/layout/PageTitle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BellRing, Monitor, Moon, Sun, Save, AlertTriangle, Trash, Download } from 'lucide-react';

const Settings = () => {
  return (
    <DashboardLayout>
      <PageTitle 
        title="Settings" 
        description="Configure your application preferences"
        className="mb-6"
      />

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="data">Data & Privacy</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">General Settings</CardTitle>
              <CardDescription>Manage your general application preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Time Zone</h3>
                <Select defaultValue="utc-5">
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Select time zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                    <SelectItem value="utc-7">Mountain Time (UTC-7)</SelectItem>
                    <SelectItem value="utc-6">Central Time (UTC-6)</SelectItem>
                    <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                    <SelectItem value="utc-0">GMT (UTC+0)</SelectItem>
                    <SelectItem value="utc+1">Central European Time (UTC+1)</SelectItem>
                    <SelectItem value="utc+2">Eastern European Time (UTC+2)</SelectItem>
                    <SelectItem value="utc+5:30">India (UTC+5:30)</SelectItem>
                    <SelectItem value="utc+8">China/Singapore (UTC+8)</SelectItem>
                    <SelectItem value="utc+9">Japan (UTC+9)</SelectItem>
                    <SelectItem value="utc+10">Australia Eastern (UTC+10)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-4">Language</h3>
                <Select defaultValue="en">
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="it">Italiano</SelectItem>
                    <SelectItem value="pt">Português</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-4">Accessibility</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="reduced-motion" className="font-medium">Reduce motion</Label>
                      <p className="text-sm text-muted-foreground">Minimize animations throughout the interface</p>
                    </div>
                    <Switch id="reduced-motion" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="screen-reader" className="font-medium">Optimize for screen readers</Label>
                      <p className="text-sm text-muted-foreground">Add additional context for screen readers</p>
                    </div>
                    <Switch id="screen-reader" defaultChecked />
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Appearance</CardTitle>
              <CardDescription>Customize the look and feel of the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Theme</h3>
                <RadioGroup defaultValue="system" className="space-y-3">
                  <div className="flex items-center space-x-3 rounded-md border p-3">
                    <RadioGroupItem value="light" id="theme-light" />
                    <Label htmlFor="theme-light" className="flex items-center gap-2 font-normal">
                      <Sun className="h-5 w-5" />
                      Light
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 rounded-md border p-3">
                    <RadioGroupItem value="dark" id="theme-dark" />
                    <Label htmlFor="theme-dark" className="flex items-center gap-2 font-normal">
                      <Moon className="h-5 w-5" />
                      Dark
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 rounded-md border p-3">
                    <RadioGroupItem value="system" id="theme-system" />
                    <Label htmlFor="theme-system" className="flex items-center gap-2 font-normal">
                      <Monitor className="h-5 w-5" />
                      System
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-4">Font Size</h3>
                <Select defaultValue="medium">
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="xl">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-4">Sidebar Preferences</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sidebar-compact" className="font-medium">Compact sidebar</Label>
                      <p className="text-sm text-muted-foreground">Use smaller icons and text in the sidebar</p>
                    </div>
                    <Switch id="sidebar-compact" />
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Appearance
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Notifications</CardTitle>
              <CardDescription>Control what notifications you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <BellRing className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div>
                        <Label htmlFor="price-alerts" className="font-medium">Price Alerts</Label>
                        <p className="text-sm text-muted-foreground">Get notified when stocks hit your price targets</p>
                      </div>
                    </div>
                    <Switch id="price-alerts" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <BellRing className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div>
                        <Label htmlFor="market-news" className="font-medium">Market News</Label>
                        <p className="text-sm text-muted-foreground">Get updates on major market movements and news</p>
                      </div>
                    </div>
                    <Switch id="market-news" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <BellRing className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div>
                        <Label htmlFor="security-alerts" className="font-medium">Security Alerts</Label>
                        <p className="text-sm text-muted-foreground">Get notified about account security events</p>
                      </div>
                    </div>
                    <Switch id="security-alerts" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <BellRing className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div>
                        <Label htmlFor="promotional" className="font-medium">Promotional</Label>
                        <p className="text-sm text-muted-foreground">Receive promotional offers and updates</p>
                      </div>
                    </div>
                    <Switch id="promotional" />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-4">Notification Methods</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications" className="font-medium">Email</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch id="email-notifications" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notifications" className="font-medium">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
                    </div>
                    <Switch id="push-notifications" defaultChecked />
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Data & Privacy</CardTitle>
              <CardDescription>Manage your data privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Data Collection</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="usage-analytics" className="font-medium">Usage Analytics</Label>
                      <p className="text-sm text-muted-foreground">Allow collection of anonymous usage data to improve the service</p>
                    </div>
                    <Switch id="usage-analytics" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="personalization" className="font-medium">Personalization</Label>
                      <p className="text-sm text-muted-foreground">Allow use of your data for personalized recommendations</p>
                    </div>
                    <Switch id="personalization" defaultChecked />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-4">Data Management</h3>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full md:w-auto">
                    <Download className="h-4 w-4 mr-2" />
                    Export My Data
                  </Button>
                  
                  <div className="rounded-md border border-destructive/10 bg-destructive/5 p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 mt-0.5 text-destructive" />
                      <div>
                        <h4 className="font-medium text-destructive">Danger Zone</h4>
                        <p className="text-sm text-muted-foreground mt-1 mb-3">These actions are permanent and cannot be undone.</p>
                        <Button variant="destructive" size="sm">
                          <Trash className="h-4 w-4 mr-2" />
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Settings; 