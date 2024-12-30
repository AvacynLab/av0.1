'use client'

import React from 'react';
import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const safeJsonParse = (jsonString: string, fallback: any = {}) => {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('Error parsing JSON:', error)
    return fallback
  }
}

const handleError = (error: unknown): string => {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'An unknown error occurred'
}

const ApiTestPage: React.FC = () => {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState('agents')
  const [id, setId] = useState(uuidv4())
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('')
  const [parameters, setParameters] = useState('')
  const [prompt, setPrompt] = useState('')
  const [executeInput, setExecuteInput] = useState('')
  const [result, setResult] = useState<any>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')

  const generateNewId = () => setId(uuidv4())

  const handleAction = async (action: 'create' | 'get' | 'update' | 'delete' | 'list' | 'execute') => {
    if (status !== "authenticated") {
      setResult({ error: 'Not authenticated' })
      return
    }

    try {
      let response
      let body
      const endpoint = activeTab === 'agents' ? '/api/agents' : '/api/tools'

      switch (action) {
        case 'create':
          body = activeTab === 'agents'
            ? { id, name, prompt }
            : { id, name, type, description, parameters: safeJsonParse(parameters) }
          response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
          break
        case 'get':
          response = await fetch(`${endpoint}?id=${id}`)
          break
        case 'update':
          body = activeTab === 'agents'
            ? { name, prompt }
            : { name, type, description, parameters: safeJsonParse(parameters) }
          response = await fetch(`${endpoint}?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
          break
        case 'delete':
          response = await fetch(`${endpoint}?id=${id}`, { method: 'DELETE' })
          break
        case 'list':
          response = await fetch(`${endpoint}?page=${page}&pageSize=${pageSize}&search=${search}`)
          break
        case 'execute':
          response = await fetch('/api/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agentId: id, input: executeInput }),
          })
          break
      }

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error(`Error in handle${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}Action:`, error)
      setResult({ error: handleError(error) })
    }
  }

  const renderTable = (data: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          {Object.keys(data[0]).map((key) => (
            <TableHead key={key}>{key}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={index}>
            {Object.values(item).map((value: any, i) => (
              <TableCell key={i}>
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  if (status === "loading") return <div>Loading...</div>
  if (status === "unauthenticated") return <div>Please sign in to access this page.</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>
        <TabsContent value="agents">
          <Card>
            <CardHeader>
              <CardTitle>Agent Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input placeholder="Agent ID" value={id} onChange={(e) => setId(e.target.value)} />
                  <Button onClick={generateNewId}>Generate New ID</Button>
                </div>
                <Input placeholder="Agent Name" value={name} onChange={(e) => setName(e.target.value)} />
                <Textarea placeholder="Agent Prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
                <div className="flex space-x-2">
                  <Button onClick={() => handleAction('create')}>Create</Button>
                  <Button onClick={() => handleAction('get')}>Get</Button>
                  <Button onClick={() => handleAction('update')}>Update</Button>
                  <Button onClick={() => handleAction('delete')}>Delete</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tools">
          <Card>
            <CardHeader>
              <CardTitle>Tool Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input placeholder="Tool ID" value={id} onChange={(e) => setId(e.target.value)} />
                  <Button onClick={generateNewId}>Generate New ID</Button>
                </div>
                <Input placeholder="Tool Name" value={name} onChange={(e) => setName(e.target.value)} />
                <Input placeholder="Tool Type" value={type} onChange={(e) => setType(e.target.value)} />
                <Textarea placeholder="Tool Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                <Textarea placeholder="Tool Parameters (JSON)" value={parameters} onChange={(e) => setParameters(e.target.value)} />
                <div className="flex space-x-2">
                  <Button onClick={() => handleAction('create')}>Create</Button>
                  <Button onClick={() => handleAction('get')}>Get</Button>
                  <Button onClick={() => handleAction('update')}>Update</Button>
                  <Button onClick={() => handleAction('delete')}>Delete</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>List and Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <Input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Input type="number" placeholder="Page" value={page} onChange={(e) => setPage(Number(e.target.value))} />
            <Input type="number" placeholder="Page Size" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} />
            <Button onClick={() => handleAction('list')}>List {activeTab}</Button>
          </div>
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Execute Agent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Input placeholder="Agent ID" value={id} onChange={(e) => setId(e.target.value)} />
            <Textarea placeholder="Input" value={executeInput} onChange={(e) => setExecuteInput(e.target.value)} />
            <Button onClick={() => handleAction('execute')}>Execute</Button>
          </div>
        </CardContent>
      </Card>
      {result && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            {result.error ? (
              <pre className="bg-red-100 p-4 rounded-md overflow-auto whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            ) : Array.isArray(result.data) ? (
              renderTable(result.data)
            ) : (
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ApiTestPage;

