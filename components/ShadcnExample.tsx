import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert } from "@/components/ui/alert";
import { PlusIcon, EditIcon, TrashIcon } from "lucide-react";

const ShadcnExample = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const sampleData = [
    { id: 1, name: "John Doe", email: "john@example.com", status: "Active" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", status: "Inactive" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", status: "Active" },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-foreground">
        shadcn/ui Components Demo
      </h1>

      {/* Alert Component */}
      <Alert>
        <div>
          <h4 className="font-medium">shadcn/ui Integration Complete!</h4>
          <p className="text-sm text-muted-foreground mt-1">
            All essential components are now available and ready to use.
          </p>
        </div>
      </Alert>

      {/* Button Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Button Variants</CardTitle>
          <CardDescription>
            Different button styles available in your application
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button>Default Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Destructive</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">
            <PlusIcon className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Form Example */}
      <Card>
        <CardHeader>
          <CardTitle>Form Components</CardTitle>
          <CardDescription>
            Input fields with proper labeling and styling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Enter your full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="Enter your email" />
            </div>
          </div>
          <Button className="w-full md:w-auto">Submit Form</Button>
        </CardContent>
      </Card>

      {/* Table Example */}
      <Card>
        <CardHeader>
          <CardTitle>Data Table</CardTitle>
          <CardDescription>
            Styled table component for displaying data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === "Active" ? "default" : "secondary"}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon">
                      <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Example */}
      <Card>
        <CardHeader>
          <CardTitle>Dialog Component</CardTitle>
          <CardDescription>
            Modal dialogs for user interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Item</DialogTitle>
                <DialogDescription>
                  Fill in the details below to create a new item.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dialog-name">Item Name</Label>
                  <Input id="dialog-name" placeholder="Enter item name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dialog-description">Description</Label>
                  <Input id="dialog-description" placeholder="Enter description" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Create Item</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Badges Example */}
      <Card>
        <CardHeader>
          <CardTitle>Badge Variants</CardTitle>
          <CardDescription>
            Different badge styles for status indicators
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge>Default Badge</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShadcnExample;