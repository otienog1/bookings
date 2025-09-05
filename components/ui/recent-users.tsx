'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, MoreHorizontal, MapPin, Mail, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  location: string;
  joinDate: string;
  avatar?: string;
}

const getRoleColor = (role: string) => {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    case 'agent':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case 'user':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

interface RecentUsersProps {
  data?: RecentUser[] | null;
  onAddUser?: () => void;
}

export function RecentUsers({ data, onAddUser }: RecentUsersProps) {
  const recentUsers = data || [];
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Recent Users</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Latest user registrations and activity
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
              <span className="text-xs">📈</span>
              <span className="font-medium">+12%</span>
            </div>
            <Button size="sm" onClick={onAddUser} className="h-8 gap-1">
              <Plus className="h-3 w-3" />
              Add User
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentUsers.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recent users available</p>
            </div>
          </div>
        ) : (
          recentUsers.map((user) => (
          <div key={user.id} className="flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">{user.name}</span>
                <Badge variant="secondary" className={`text-xs px-2 py-0.5 ${getRoleColor(user.role)}`}>
                  {user.role}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{user.location}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{user.joinDate}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Profile</DropdownMenuItem>
                  <DropdownMenuItem>Send Message</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Remove User</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}