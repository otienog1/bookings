"use client"

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AgentForm from '@/components/AgentForm';

export default function NewAgentPage() {
  const router = useRouter();

  const handleAgentSubmit = (agentData: any) => {
    console.log('New agent data:', agentData);
    // Handle agent creation here
    // Redirect to agents list after successful creation
    router.push('/agents');
  };

  const handleCancel = () => {
    router.push('/agents');
  };

  return (
    <div className="flex flex-1 flex-col gap-2 p-2 pt-0 sm:gap-4 sm:p-4">
      <div className="min-h-[calc(100vh-4rem)] flex-1 rounded-md p-3 pt-1 sm:rounded-xl sm:p-4 sm:pt-2 md:p-6 md:pt-2">
        <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
          {/* Back Button */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/agents" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Agents
              </Link>
            </Button>
          </div>

          {/* Page Title */}
          <div className="px-2 sm:px-0">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              New Agent
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Create a new travel agent profile.
            </p>
          </div>

          <AgentForm
            agent={null}
            onSave={handleAgentSubmit}
            onCancel={handleCancel}
          />

        </div>
      </div>
    </div>
  );
}