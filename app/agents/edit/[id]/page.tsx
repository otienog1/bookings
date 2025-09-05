"use client"

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AgentForm from '@/components/AgentForm';
import UILoader from '@/components/UILoader';
import { useAuth } from '@/components/auth/AuthContext';
import { api } from '@/utils/api';
import { API_ENDPOINTS } from '@/config/apiEndpoints';

export default function EditAgentPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;
  const { token } = useAuth();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgent = async () => {
      if (!agentId || !token) return;

      try {
        setLoading(true);
        const response = await api.get(API_ENDPOINTS.AGENTS.GET(agentId), token);
        setAgent(response.agent);
      } catch (err) {
        setError('Failed to load agent details');
        console.error('Error fetching agent:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [agentId, token]);

  const handleAgentSubmit = async (agentData: any) => {
    try {
      await api.put(API_ENDPOINTS.AGENTS.EDIT(agentId), agentData, token);
      console.log('Agent updated:', agentData);
      // Redirect to agents list after successful update
      router.push('/agents');
    } catch (err) {
      console.error('Error updating agent:', err);
      setError('Failed to update agent');
    }
  };

  const handleCancel = () => {
    router.push('/agents');
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-2 p-2 pt-0 sm:gap-4 sm:p-4">
        <div className="min-h-[calc(100vh-4rem)] flex-1 rounded-md p-3 sm:rounded-xl sm:p-4 md:p-6 flex items-center justify-center">
          <UILoader text="Loading agent details..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-2 p-2 pt-0 sm:gap-4 sm:p-4">
        <div className="min-h-[calc(100vh-4rem)] flex-1 rounded-md p-3 sm:rounded-xl sm:p-4 md:p-6 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-red-500">Error Loading Agent</h2>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
            <Button className="mt-4" asChild>
              <Link href="/agents">Back to Agents</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
              Edit Agent
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Update travel agent information.
            </p>
          </div>

          <AgentForm
            agent={agent}
            onSave={handleAgentSubmit}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}