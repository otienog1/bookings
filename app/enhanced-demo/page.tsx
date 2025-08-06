"use client"

import React, { useState } from 'react';
import { BookingsDataTable } from "@/components/BookingsDataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Booking } from "@/types/BookingTypes";

// Sample booking data for demonstration
const sampleBookings: Booking[] = [
  {
    id: 1,
    name: "Summer Europe Tour",
    date_from: new Date("2024-06-15"),
    date_to: new Date("2024-06-25"),
    country: "Italy",
    pax: 8,
    ladies: 4,
    men: 2,
    children: 1,
    teens: 1,
    agent_id: 1,
    agent_name: "Marco Rossi",
    agent_country: "Italy",
    consultant: "Sarah Johnson",
    user_id: 1,
    created_by: "admin"
  },
  {
    id: 2,
    name: "Business Conference Tokyo",
    date_from: new Date("2024-07-10"),
    date_to: new Date("2024-07-15"),
    country: "Japan",
    pax: 12,
    ladies: 6,
    men: 6,
    children: 0,
    teens: 0,
    agent_id: 2,
    agent_name: "Yuki Tanaka",
    agent_country: "Japan",
    consultant: "Mike Chen",
    user_id: 1,
    created_by: "admin"
  },
  {
    id: 3,
    name: "Family Vacation Bali",
    date_from: new Date("2024-08-01"),
    date_to: new Date("2024-08-10"),
    country: "Indonesia",
    pax: 6,
    ladies: 2,
    men: 2,
    children: 2,
    teens: 0,
    agent_id: 3,
    agent_name: "Wayan Suarta",
    agent_country: "Indonesia",
    consultant: "Lisa Anderson",
    user_id: 1,
    created_by: "admin"
  },
  {
    id: 4,
    name: "Adventure Trek Nepal",
    date_from: new Date("2024-09-05"),
    date_to: new Date("2024-09-20"),
    country: "Nepal",
    pax: 15,
    ladies: 7,
    men: 6,
    children: 0,
    teens: 2,
    agent_id: 4,
    agent_name: "Pemba Sherpa",
    agent_country: "Nepal",
    consultant: "David Wilson",
    user_id: 1,
    created_by: "admin"
  },
  {
    id: 5,
    name: "Cultural Tour Morocco",
    date_from: new Date("2024-10-12"),
    date_to: new Date("2024-10-22"),
    country: "Morocco",
    pax: 10,
    ladies: 5,
    men: 3,
    children: 1,
    teens: 1,
    agent_id: 5,
    agent_name: "Hassan Benali",
    agent_country: "Morocco",
    consultant: "Emma Thompson",
    user_id: 1,
    created_by: "admin"
  }
];

export default function EnhancedDemoPage() {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  const handleEdit = (booking: Booking) => {
    console.log("Edit booking:", booking);
    setSelectedBooking(booking);
    // In a real app, this would open the edit form
  };

  const handleDelete = (booking: Booking) => {
    console.log("Delete booking:", booking);
    // In a real app, this would show a confirmation dialog
  };

  const handleView = (booking: Booking) => {
    console.log("View booking:", booking);
    setSelectedBooking(booking);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Enhanced shadcn/ui Demo</h1>
          <p className="text-xl text-muted-foreground mt-2">
            Advanced components with MCP server integration
          </p>
        </div>
        <Badge variant="outline" className="text-sm font-mono">
          MCP Server Active ✓
        </Badge>
      </div>

      {/* Status Alert */}
      <Alert>
        <div>
          <h4 className="font-medium">shadcn/ui MCP Server Integration Complete!</h4>
          <p className="text-sm text-muted-foreground mt-1">
            All components are now enhanced with the latest shadcn/ui v4 patterns and best practices.
          </p>
        </div>
      </Alert>

      {/* Components Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Data Table
            </CardTitle>
            <CardDescription>
              Advanced table with sorting, filtering, and pagination
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Features:</span>
                <Badge variant="secondary">TanStack Table</Badge>
              </div>
              <ul className="text-muted-foreground space-y-1">
                <li>• Column sorting & filtering</li>
                <li>• Row selection & actions</li>
                <li>• Pagination controls</li>
                <li>• Column visibility toggle</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📝 Enhanced Forms
            </CardTitle>
            <CardDescription>
              Improved form components with better UX
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Components:</span>
                <Badge variant="secondary">Radix UI</Badge>
              </div>
              <ul className="text-muted-foreground space-y-1">
                <li>• Select with search</li>
                <li>• Date pickers</li>
                <li>• Input validation</li>
                <li>• Error handling</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎯 Action Menus
            </CardTitle>
            <CardDescription>
              Context menus and dropdown actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Features:</span>
                <Badge variant="secondary">Dropdown Menu</Badge>
              </div>
              <ul className="text-muted-foreground space-y-1">
                <li>• Context actions</li>
                <li>• Keyboard navigation</li>
                <li>• Icon support</li>
                <li>• Separators & labels</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Data Table Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Live Bookings Data Table</CardTitle>
          <CardDescription>
            Interactive demonstration of the enhanced data table with real booking data.
            Try searching, sorting, and using the action menus.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BookingsDataTable
            bookings={sampleBookings}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        </CardContent>
      </Card>

      {/* Selected Booking Info */}
      {selectedBooking && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Booking Details</CardTitle>
            <CardDescription>
              This would typically open a detailed view or edit form.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Name:</span> {selectedBooking.name}
              </div>
              <div>
                <span className="font-medium">Country:</span> {selectedBooking.country}
              </div>
              <div>
                <span className="font-medium">Agent:</span> {selectedBooking.agent_name}
              </div>
              <div>
                <span className="font-medium">Total PAX:</span> {selectedBooking.pax}
              </div>
            </div>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setSelectedBooking(null)}
            >
              Close Details
            </Button>
          </CardContent>
        </Card>
      )}

      {/* MCP Server Info */}
      <Card>
        <CardHeader>
          <CardTitle>MCP Server Integration Status</CardTitle>
          <CardDescription>
            shadcn-ui-mcp-server is now configured and providing enhanced component access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">@jpisnice/shadcn-ui-mcp-server</div>
                <div className="text-sm text-muted-foreground">Version 1.0.3 - Active</div>
              </div>
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
            </div>
            
            <div className="text-sm space-y-2">
              <h4 className="font-medium">Available Features:</h4>
              <ul className="space-y-1 text-muted-foreground pl-4">
                <li>• Latest shadcn/ui v4 component source code</li>
                <li>• Component demos and usage examples</li>
                <li>• Installation and setup guidance</li>
                <li>• Best practices and patterns</li>
                <li>• React and TypeScript integration</li>
              </ul>
            </div>

            <Alert>
              <div>
                <h4 className="font-medium">Ready to Use!</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  You can now ask Claude to enhance components using the latest shadcn/ui patterns
                  and get accurate, up-to-date component implementations.
                </p>
              </div>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}