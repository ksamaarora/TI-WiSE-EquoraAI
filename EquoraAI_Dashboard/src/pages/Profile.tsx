import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/layout/PageTitle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Pencil, Clock, Shield, Check, AlertCircle, Bell, ChevronRight, User, Mail, Key, Eye, EyeOff, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAccessibility } from '@/lib/accessibility';
import { cn } from '@/lib/utils';
import { updateUserPassword } from '../lib/firebase';

const Profile = () => {
  const { user } = useAuth();
  const { theme } = useAccessibility();
  
  // Profile edit state
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    displayName: '',
    photoURL: '',
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    notifications: true,
    marketAlerts: true,
    newsletterSubscription: true,
    dataRefreshRate: '5min',
    defaultView: 'dashboard',
    theme: 'system'
  });

  // Security state
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: true,
    passwordLastChanged: '14 days ago',
    loginNotifications: true,
    suspiciousActivityAlerts: true
  });

  // Subscription state
  const [subscription, setSubscription] = useState({
    plan: 'Premium',
    billingCycle: 'Monthly',
    nextBillingDate: '2023-12-15',
    amount: '$15.99',
    status: 'Active'
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setProfile({
        displayName: user.displayName || 'User',
        photoURL: user.photoURL || '',
      });
    }
  }, [user]);

  // Mock activity data
  const recentActivity = [
    { id: 1, type: 'login', description: 'Logged in from India, IN', date: '2 hours ago', icon: <Clock size={16} /> },
    { id: 2, type: 'portfolio', description: 'Added AAPL to watchlist', date: '1 day ago', icon: <Check size={16} /> },
    { id: 3, type: 'alert', description: 'Created price alert for TSLA', date: '3 days ago', icon: <Bell size={16} /> },
    { id: 4, type: 'security', description: 'Changed account password', date: '1 week ago', icon: <Shield size={16} /> },
    { id: 5, type: 'portfolio', description: 'Updated investment strategy', date: '2 weeks ago', icon: <Check size={16} /> },
  ];

  // Handle profile update
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would call an API to update the user's profile
    toast.success('Profile updated successfully');
    setIsEditing(false);
  };

  // Handle preference changes
  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    toast.success(`${key} preference updated`);
  };

  // Handle security setting changes
  const handleSecurityChange = (key: string, value: any) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
    toast.success(`${key} setting updated`);
  };

  // Handle subscription change
  const handleSubscriptionChange = (plan: string) => {
    setSubscription(prev => ({ ...prev, plan }));
    toast.success(`Subscription updated to ${plan}`);
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to change your password');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setPasswordLoading(true);
    
    try {
      await updateUserPassword(user, currentPassword, newPassword);
      toast.success('Password changed successfully');
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Failed to change password:', error);
      if (error.code === 'auth/wrong-password') {
        toast.error('Current password is incorrect');
      } else if (error.code === 'auth/requires-recent-login') {
        toast.error('Please log in again before changing your password');
      } else {
        toast.error('Failed to change password');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageTitle 
        title="Profile" 
        description="View and manage your account information"
        className="mb-6"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl">Account Overview</CardTitle>
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Update your profile information
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleProfileUpdate} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Full Name</Label>
                    <Input 
                      id="displayName" 
                      value={profile.displayName}
                      onChange={(e) => setProfile({...profile, displayName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="photoURL">Profile Image URL</Label>
                    <Input 
                      id="photoURL" 
                      value={profile.photoURL}
                      onChange={(e) => setProfile({...profile, photoURL: e.target.value})}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save Changes</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col items-center mb-6">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={profile.photoURL || ''} alt={profile.displayName} />
                <AvatarFallback>
                  {profile.displayName ? profile.displayName.charAt(0) : user?.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-medium">{profile.displayName || 'User'}</h3>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex items-center mt-2">
                <Badge variant="secondary" className="mr-2">{subscription.plan} Subscriber</Badge>
                {user?.emailVerified && (
                  <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                    Verified
                  </Badge>
                )}
              </div>
            </div>

            <Separator className="my-4" />
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Member since</span>
                <span className="font-medium">
                  {user?.metadata?.creationTime ? 
                    new Date(user.metadata.creationTime).toLocaleDateString() : 
                    'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Last login</span>
                <span className="font-medium">
                  {user?.metadata?.lastSignInTime ? 
                    new Date(user.metadata.lastSignInTime).toLocaleDateString() : 
                    'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Two-factor auth</span>
                <span className="font-medium flex items-center">
                  {securitySettings.twoFactorEnabled ? (
                    <>
                      <Check size={16} className="text-green-500 mr-1" />
                      Enabled
                    </>
                  ) : (
                    <>
                      <AlertCircle size={16} className="text-amber-500 mr-1" />
                      Disabled
                    </>
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Recent Activity</CardTitle>
                  <CardDescription>Your account activity from the past 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="mr-3 mt-0.5 flex-shrink-0">
                          {activity.icon}
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium">{activity.description}</p>
                          <p className="text-sm text-muted-foreground">{activity.date}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="flex-shrink-0">
                          <ChevronRight size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <Button variant="outline">View All Activity</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">User Preferences</CardTitle>
                  <CardDescription>Customize your dashboard experience</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Notifications</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <Label className="font-medium">Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive email updates and alerts</p>
                          </div>
                          <Switch 
                            checked={preferences.notifications}
                            onCheckedChange={(checked) => handlePreferenceChange('notifications', checked)}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <Label className="font-medium">Market Alerts</Label>
                            <p className="text-sm text-muted-foreground">Price changes and important market updates</p>
                          </div>
                          <Switch 
                            checked={preferences.marketAlerts}
                            onCheckedChange={(checked) => handlePreferenceChange('marketAlerts', checked)}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <Label className="font-medium">Newsletter Subscription</Label>
                            <p className="text-sm text-muted-foreground">Weekly market insights and analysis</p>
                          </div>
                          <Switch 
                            checked={preferences.newsletterSubscription}
                            onCheckedChange={(checked) => handlePreferenceChange('newsletterSubscription', checked)}
                          />
                        </div>
                      </div>
                    </div>
                      
                    <Separator />

                    <div className="space-y-4">
                      <h3 className="font-medium">Display Settings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="dataRefreshRate">Data Refresh Rate</Label>
                          <Select 
                            value={preferences.dataRefreshRate} 
                            onValueChange={(value) => handlePreferenceChange('dataRefreshRate', value)}
                          >
                            <SelectTrigger id="dataRefreshRate">
                              <SelectValue placeholder="Select refresh rate" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1min">Every 1 minute</SelectItem>
                              <SelectItem value="5min">Every 5 minutes</SelectItem>
                              <SelectItem value="15min">Every 15 minutes</SelectItem>
                              <SelectItem value="30min">Every 30 minutes</SelectItem>
                              <SelectItem value="manual">Manual refresh only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="defaultView">Default Dashboard View</Label>
                          <Select 
                            value={preferences.defaultView} 
                            onValueChange={(value) => handlePreferenceChange('defaultView', value)}
                          >
                            <SelectTrigger id="defaultView">
                              <SelectValue placeholder="Select default view" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dashboard">Market Overview</SelectItem>
                              <SelectItem value="portfolio">Portfolio</SelectItem>
                              <SelectItem value="watchlist">Watchlist</SelectItem>
                              <SelectItem value="news">News Feed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t">
                  <div className="w-full flex justify-end">
                    <Button onClick={() => toast.success('Preferences saved')}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="subscriptions">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Subscription Management</CardTitle>
                  <CardDescription>Manage your subscription plans and billing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-muted/40 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-lg">{subscription.plan} Plan</h3>
                          <p className="text-sm text-muted-foreground">
                            {subscription.billingCycle} billing at {subscription.amount}
                          </p>
                        </div>
                        <Badge>{subscription.status}</Badge>
                      </div>
                      <div className="mt-4 text-sm">
                        <div className="flex justify-between mb-1">
                          <span>Next billing date:</span>
                          <span className="font-medium">{subscription.nextBillingDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payment method:</span>
                          <span className="font-medium">Visa ending in 4242</span>
                        </div>
                      </div>
                    </div>
                      
                    <div className="space-y-4">
                      <h3 className="font-medium">Available Plans</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card className={cn(
                          "cursor-pointer hover:border-primary/50 transition-colors",
                          subscription.plan === 'Basic' ? "border-primary/70 bg-primary/5" : ""
                        )}>
                          <CardHeader className="pb-3">
                            <CardTitle>Basic</CardTitle>
                            <CardDescription>For casual investors</CardDescription>
                          </CardHeader>
                          <CardContent className="pb-3">
                            <div className="text-3xl font-bold mb-2">$5.99<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                            <ul className="space-y-2 text-sm mb-4">
                              <li className="flex items-center"><Check size={16} className="text-green-500 mr-2" /> Basic market data</li>
                              <li className="flex items-center"><Check size={16} className="text-green-500 mr-2" /> Limited watchlists</li>
                              <li className="flex items-center"><Check size={16} className="text-green-500 mr-2" /> Daily market summary</li>
                            </ul>
                          </CardContent>
                          <CardFooter>
                            <Button 
                              variant={subscription.plan === 'Basic' ? "secondary" : "outline"} 
                              className="w-full"
                              onClick={() => handleSubscriptionChange('Basic')}
                            >
                              {subscription.plan === 'Basic' ? 'Current Plan' : 'Select Plan'}
                            </Button>
                          </CardFooter>
                        </Card>
                          
                        <Card className={cn(
                          "cursor-pointer hover:border-primary/50 transition-colors",
                          subscription.plan === 'Premium' ? "border-primary/70 bg-primary/5" : ""
                        )}>
                          <CardHeader className="pb-3">
                            <CardTitle>Premium</CardTitle>
                            <CardDescription>For active traders</CardDescription>
                          </CardHeader>
                          <CardContent className="pb-3">
                            <div className="text-3xl font-bold mb-2">$15.99<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                            <ul className="space-y-2 text-sm mb-4">
                              <li className="flex items-center"><Check size={16} className="text-green-500 mr-2" /> Real-time market data</li>
                              <li className="flex items-center"><Check size={16} className="text-green-500 mr-2" /> Unlimited watchlists</li>
                              <li className="flex items-center"><Check size={16} className="text-green-500 mr-2" /> Advanced charts</li>
                              <li className="flex items-center"><Check size={16} className="text-green-500 mr-2" /> Portfolio analysis</li>
                            </ul>
                          </CardContent>
                          <CardFooter>
                            <Button 
                              variant={subscription.plan === 'Premium' ? "secondary" : "outline"} 
                              className="w-full"
                              onClick={() => handleSubscriptionChange('Premium')}
                            >
                              {subscription.plan === 'Premium' ? 'Current Plan' : 'Select Plan'}
                            </Button>
                          </CardFooter>
                        </Card>
                          
                        <Card className={cn(
                          "cursor-pointer hover:border-primary/50 transition-colors",
                          subscription.plan === 'Enterprise' ? "border-primary/70 bg-primary/5" : ""
                        )}>
                          <CardHeader className="pb-3">
                            <CardTitle>Enterprise</CardTitle>
                            <CardDescription>For professionals</CardDescription>
                          </CardHeader>
                          <CardContent className="pb-3">
                            <div className="text-3xl font-bold mb-2">$39.99<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                            <ul className="space-y-2 text-sm mb-4">
                              <li className="flex items-center"><Check size={16} className="text-green-500 mr-2" /> Everything in Premium</li>
                              <li className="flex items-center"><Check size={16} className="text-green-500 mr-2" /> AI-powered insights</li>
                              <li className="flex items-center"><Check size={16} className="text-green-500 mr-2" /> Custom alerts</li>
                              <li className="flex items-center"><Check size={16} className="text-green-500 mr-2" /> Premium research</li>
                            </ul>
                          </CardContent>
                          <CardFooter>
                            <Button 
                              variant={subscription.plan === 'Enterprise' ? "secondary" : "outline"} 
                              className="w-full"
                              onClick={() => handleSubscriptionChange('Enterprise')}
                            >
                              {subscription.plan === 'Enterprise' ? 'Current Plan' : 'Select Plan'}
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Security Settings</CardTitle>
                  <CardDescription>Manage your account security options</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Change Password</h3>
                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <div className="relative">
                            <Input 
                              id="currentPassword" 
                              type="password" 
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <div className="relative">
                            <Input 
                              id="newPassword" 
                              type="password" 
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <div className="relative">
                            <Input 
                              id="confirmPassword" 
                              type="password" 
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <Button type="submit" disabled={passwordLoading}>
                          {passwordLoading ? 'Updating...' : 'Update Password'}
                        </Button>
                      </form>
                    </div>
                      
                    <Separator />
                      
                    <div className="space-y-4">
                      <h3 className="font-medium">Security Options</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <Label className="font-medium">Two-Factor Authentication</Label>
                            <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                          </div>
                          <Switch 
                            checked={securitySettings.twoFactorEnabled}
                            onCheckedChange={(checked) => handleSecurityChange('twoFactorEnabled', checked)}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <Label className="font-medium">Login Notifications</Label>
                            <p className="text-sm text-muted-foreground">Get notified when someone logs into your account</p>
                          </div>
                          <Switch 
                            checked={securitySettings.loginNotifications}
                            onCheckedChange={(checked) => handleSecurityChange('loginNotifications', checked)}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <Label className="font-medium">Suspicious Activity Alerts</Label>
                            <p className="text-sm text-muted-foreground">Be alerted about suspicious account activity</p>
                          </div>
                          <Switch 
                            checked={securitySettings.suspiciousActivityAlerts}
                            onCheckedChange={(checked) => handleSecurityChange('suspiciousActivityAlerts', checked)}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="font-medium">Active Sessions</h3>
                      <div className="bg-muted/40 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Current Session</p>
                            <p className="text-sm text-muted-foreground">
                              {navigator.userAgent.includes('Windows') ? 'Windows' : 
                               navigator.userAgent.includes('Mac') ? 'Mac OS' : 
                               navigator.userAgent.includes('Linux') ? 'Linux' : 'Unknown OS'}
                               {" • "}
                              {navigator.userAgent.includes('Chrome') ? 'Chrome' :
                               navigator.userAgent.includes('Firefox') ? 'Firefox' :
                               navigator.userAgent.includes('Safari') ? 'Safari' :
                               navigator.userAgent.includes('Edge') ? 'Edge' : 'Unknown Browser'}
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                            Active Now
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" className="text-destructive hover:text-destructive">
                        Sign Out Of All Sessions
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile; 