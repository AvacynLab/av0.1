'use client'

import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const safeJsonParse = (jsonString: string, fallback: any = {}) => {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('Error parsing JSON:', error)
    return fallback
  }
}

const handleError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  } else if (typeof error === 'string') {
    return error
  } else {
    return 'An unknown error occurred'
  }
}

export default function ApiTestPage() {
  const [agentId, setAgentId] = useState(uuidv4())
  const [agentName, setAgentName] = useState('')
  const [agentPrompt, setAgentPrompt] = useState('')
  const [agentTools, setAgentTools] = useState('')
  const [toolId, setToolId] = useState(uuidv4())
  const [toolName, setToolName] = useState('')
  const [toolType, setToolType] = useState('')
  const [toolDescription, setToolDescription] = useState('')
  const [toolParameters, setToolParameters] = useState('')
  const [executeInput, setExecuteInput] = useState('')
  const [result, setResult] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')

  const generateNewAgentId = () => setAgentId(uuidv4())
  const generateNewToolId = () => setToolId(uuidv4())

  const handleAgentAction = async (action: 'create' | 'get' | 'update' | 'delete' | 'list') => {
    try {
      let response
      let body
      switch (action) {
        case 'create':
          body = { id: agentId, name: agentName, prompt: agentPrompt, tools: safeJsonParse(agentTools, []) }
          console.log('Creating agent with body:', body)
          response = await fetch('/api/agents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
          break
        case 'get':
          response = await fetch(`/api/agents?id=${agentId}`)
          break
        case 'update':
          response = await fetch(`/api/agents?id=${agentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: agentName, prompt: agentPrompt, tools: safeJsonParse(agentTools, []) }),
          })
          break
        case 'delete':
          response = await fetch(`/api/agents?id=${agentId}`, { method: 'DELETE' })
          break
        case 'list':
          response = await fetch(`/api/agents?page=${page}&pageSize=${pageSize}&search=${search}`)
          break
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('Response data:', data)
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      console.error('Error in handleAgentAction:', error)
      setResult(JSON.stringify({ error: handleError(error) }, null, 2))
    }
  }

  const handleToolAction = async (action: 'create' | 'get' | 'update' | 'delete' | 'list') => {
    try {
      let response
      let body
      switch (action) {
        case 'create':
          body = { id: toolId, name: toolName, type: toolType, description: toolDescription, parameters: safeJsonParse(toolParameters) }
          response = await fetch('/api/tools', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
          break
        case 'get':
          response = await fetch(`/api/tools?id=${toolId}`)
          break
        case 'update':
          response = await fetch(`/api/tools?id=${toolId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: toolName, type: toolType, description: toolDescription, parameters: safeJsonParse(toolParameters) }),
          })
          break
        case 'delete':
          response = await fetch(`/api/tools?id=${toolId}`, { method: 'DELETE' })
          break
        case 'list':
          response = await fetch(`/api/tools?page=${page}&pageSize=${pageSize}&search=${search}`)
          break
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('Response data:', data)
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      console.error('Error in handleToolAction:', error)
      setResult(JSON.stringify({ error: handleError(error) }, null, 2))
    }
  }

  const handleExecute = async () => {
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, input: executeInput }),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('Response data:', data)
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      console.error('Error in handleExecute:', error)
      setResult(JSON.stringify({ error: handleError(error) }, null, 2))
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Agent Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input placeholder="Agent ID" value={agentId} onChange={(e) => setAgentId(e.target.value)} />
                <Button onClick={generateNewAgentId}>Generate New ID</Button>
              </div>
              <Input placeholder="Agent Name" value={agentName} onChange={(e) => setAgentName(e.target.value)} />
              <Textarea placeholder="Agent Prompt" value={agentPrompt} onChange={(e) => setAgentPrompt(e.target.value)} />
              <Textarea placeholder="Agent Tools (JSON)" value={agentTools} onChange={(e) => setAgentTools(e.target.value)} />
              <div className="flex space-x-2">
                <Button onClick={() => handleAgentAction('create')}>Create</Button>
                <Button onClick={() => handleAgentAction('get')}>Get</Button>
                <Button onClick={() => handleAgentAction('update')}>Update</Button>
                <Button onClick={() => handleAgentAction('delete')}>Delete</Button>
              </div>
              <div className="flex space-x-2 mt-4">
                <Input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
                <Input type="number" placeholder="Page" value={page} onChange={(e) => setPage(Number(e.target.value))} />
                <Input type="number" placeholder="Page Size" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} />
                <Button onClick={() => handleAgentAction('list')}>List Agents</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tool Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input placeholder="Tool ID" value={toolId} onChange={(e) => setToolId(e.target.value)} />
                <Button onClick={generateNewToolId}>Generate New ID</Button>
              </div>
              <Input placeholder="Tool Name" value={toolName} onChange={(e) => setToolName(e.target.value)} />
              <Input placeholder="Tool Type" value={toolType} onChange={(e) => setToolType(e.target.value)} />
              <Textarea placeholder="Tool Description" value={toolDescription} onChange={(e) => setToolDescription(e.target.value)} />
              <Textarea placeholder="Tool Parameters (JSON)" value={toolParameters} onChange={(e) => setToolParameters(e.target.value)} />
              <div className="flex space-x-2">
                <Button onClick={() => handleToolAction('create')}>Create</Button>
                <Button onClick={() => handleToolAction('get')}>Get</Button>
                <Button onClick={() => handleToolAction('update')}>Update</Button>
                <Button onClick={() => handleToolAction('delete')}>Delete</Button>
              </div>
              <div className="flex space-x-2 mt-4">
                <Input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
                <Input type="number" placeholder="Page" value={page} onChange={(e) => setPage(Number(e.target.value))} />
                <Input type="number" placeholder="Page Size" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} />
                <Button onClick={() => handleToolAction('list')}>List Tools</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Execute Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Input placeholder="Agent ID" value={agentId} onChange={(e) => setAgentId(e.target.value)} />
              <Textarea placeholder="Input" value={executeInput} onChange={(e) => setExecuteInput(e.target.value)} />
              <Button onClick={handleExecute}>Execute</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Result</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto whitespace-pre-wrap">{result}</pre>
        </CardContent>
      </Card>
    </div>
  )
}

