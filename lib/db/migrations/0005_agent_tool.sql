-- Create agents table
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    prompt TEXT,
    tools JSONB
);

-- Create tools table
CREATE TABLE tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    description TEXT,
    parameters JSONB
);

-- Create executions table
CREATE TABLE executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agents(id),
    input TEXT NOT NULL,
    output TEXT,
    status TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_agents_name ON agents(name);
CREATE INDEX idx_tools_name ON tools(name);
CREATE INDEX idx_executions_agent_id ON executions(agent_id);
CREATE INDEX idx_executions_status ON executions(status);

