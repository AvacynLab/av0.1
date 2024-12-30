-- Drop existing tables if they exist
DROP TABLE IF EXISTS executions;
DROP TABLE IF EXISTS agent_tools;
DROP TABLE IF EXISTS tools;
DROP TABLE IF EXISTS agents;

-- Create agents table
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    prompt TEXT
);

-- Create tools table
CREATE TABLE tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    parameters JSONB
);

-- Create agent_tools table
CREATE TABLE agent_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE
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
CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_agents_name ON agents(name);
CREATE INDEX idx_tools_user_id ON tools(user_id);
CREATE INDEX idx_tools_name ON tools(name);
CREATE INDEX idx_agent_tools_agent_id ON agent_tools(agent_id);
CREATE INDEX idx_agent_tools_tool_id ON agent_tools(tool_id);
CREATE INDEX idx_executions_agent_id ON executions(agent_id);
CREATE INDEX idx_executions_status ON executions(status);