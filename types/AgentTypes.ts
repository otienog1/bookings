export interface Agent {
    id: string | number;
    name: string;
    company?: string;
    email: string;
    phone?: string;
    country: string;
    address?: string;
    notes?: string;
    is_active: boolean;
    user_id: string | number;
}

export interface AgentFormProps {
    agent: Agent | null;
    onSave: (agent: Agent) => void;
    onCancel: () => void;
}

export interface AgentsResponse {
    agents: Agent[];
}