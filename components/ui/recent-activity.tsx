'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  Download, 
  Settings, 
  UserPlus,
  LogIn
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'login' | 'export' | 'settings' | 'user_registered';
  title: string;
  description: string;
  user: string;
  timestamp: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

const activities: ActivityItem[] = [
  {
    id: '1',
    type: 'user_registered',
    title: 'New booking created',
    description: 'Emma Rodriguez - 7-day Masai Mara Safari',
    user: 'Emma',
    timestamp: '5 min ago',
    icon: UserPlus,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100 dark:bg-green-900/20'
  },
  {
    id: '2',
    type: 'settings',
    title: 'Agent registration',
    description: 'James Mitchell joined as safari guide',
    user: 'James',
    timestamp: '12 min ago',
    icon: Settings,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100 dark:bg-blue-900/20'
  },
  {
    id: '3',
    type: 'export',
    title: 'Payment processed',
    description: 'Lisa Thompson - $4,250 Serengeti Adventure',
    user: 'Lisa',
    timestamp: '28 min ago',
    icon: Download,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100 dark:bg-purple-900/20'
  },
  {
    id: '4',
    type: 'login',
    title: 'Booking modified',
    description: 'Ahmed Hassan updated client itinerary',
    user: 'Ahmed',
    timestamp: '1 hr ago',
    icon: LogIn,
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100 dark:bg-orange-900/20'
  },
  {
    id: '5',
    type: 'user_registered',
    title: 'New inquiry',
    description: 'Maria Santos - Group safari for 12 people',
    user: 'Maria',
    timestamp: '2 hrs ago',
    icon: UserPlus,
    iconColor: 'text-cyan-600',
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/20'
  },
];

export function RecentActivity() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`rounded-full p-2 ${activity.iconBg} flex-shrink-0`}>
                  <Icon className={`h-3 w-3 ${activity.iconColor}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{activity.title}</span>
                    <User className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activity.description}
                  </p>
                </div>
                
                <div className="text-xs text-muted-foreground flex-shrink-0">
                  {activity.timestamp}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}