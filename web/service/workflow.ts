import type { Fetcher } from 'swr'
import { get, post } from './base'
import type { CommonResponse } from '@/models/common'
import type {
  ChatRunHistoryResponse,
  ConversationVariableResponse,
  FetchWorkflowDraftResponse,
  NodesDefaultConfigsResponse,
  WorkflowRunHistoryResponse,
} from '@/types/workflow'
import type { BlockEnum } from '@/app/components/workflow/types'
import type { VarInInspect } from '@/types/workflow'

export const fetchWorkflowDraft = (url: string) => {
  return get(url, {}, { silent: true }) as Promise<FetchWorkflowDraftResponse>
}

export const syncWorkflowDraft = ({ url, params }: {
  url: string
  params: Pick<FetchWorkflowDraftResponse, 'graph' | 'features' | 'environment_variables' | 'conversation_variables'>
}) => {
  return post<CommonResponse & { updated_at: number; hash: string }>(url, { body: params }, { silent: true })
}

export const fetchNodesDefaultConfigs: Fetcher<NodesDefaultConfigsResponse, string> = (url) => {
  return get<NodesDefaultConfigsResponse>(url)
}

export const fetchWorkflowRunHistory: Fetcher<WorkflowRunHistoryResponse, string> = (url) => {
  return get<WorkflowRunHistoryResponse>(url)
}

export const fetchChatRunHistory: Fetcher<ChatRunHistoryResponse, string> = (url) => {
  return get<ChatRunHistoryResponse>(url)
}

export const singleNodeRun = (appId: string, nodeId: string, params: object) => {
  return post(`apps/${appId}/workflows/draft/nodes/${nodeId}/run`, { body: params })
}

export const getIterationSingleNodeRunUrl = (isChatFlow: boolean, appId: string, nodeId: string) => {
  return `apps/${appId}/${isChatFlow ? 'advanced-chat/' : ''}workflows/draft/iteration/nodes/${nodeId}/run`
}

export const getLoopSingleNodeRunUrl = (isChatFlow: boolean, appId: string, nodeId: string) => {
  return `apps/${appId}/${isChatFlow ? 'advanced-chat/' : ''}workflows/draft/loop/nodes/${nodeId}/run`
}

export const fetchPublishedWorkflow: Fetcher<FetchWorkflowDraftResponse, string> = (url) => {
  return get<FetchWorkflowDraftResponse>(url)
}

export const stopWorkflowRun = (url: string) => {
  return post<CommonResponse>(url)
}

export const fetchNodeDefault = (appId: string, blockType: BlockEnum, query = {}) => {
  return get(`apps/${appId}/workflows/default-workflow-block-configs/${blockType}`, {
    params: { q: JSON.stringify(query) },
  })
}

// TODO: archived
export const updateWorkflowDraftFromDSL = (appId: string, data: string) => {
  return post<FetchWorkflowDraftResponse>(`apps/${appId}/workflows/draft/import`, { body: { data } })
}

export const fetchCurrentValueOfConversationVariable: Fetcher<ConversationVariableResponse, {
  url: string
  params: { conversation_id: string }
}> = ({ url, params }) => {
  return get<ConversationVariableResponse>(url, { params })
}

const fetchAllInspectVarsOnePage = async (appId: string, page: number): Promise<{ total: number, items: VarInInspect[] }> => {
  return get(`apps/${appId}/workflows/draft/variables`, {
    params: { page, limit: 100 },
  })
}
export const fetchAllInspectVars = async (appId: string): Promise<VarInInspect[]> => {
  const res = await fetchAllInspectVarsOnePage(appId, 1)
  const { items, total } = res
  if (total <= 100)
    return items

  const pageCount = Math.ceil(total / 100)
  const promises = []
  for (let i = 2; i <= pageCount; i++)
    promises.push(fetchAllInspectVarsOnePage(appId, i))

  const restData = await Promise.all(promises)
  restData.forEach(({ items: item }) => {
    items.push(...item)
  })
  return items
}

export const fetchNodeInspectVars = async (appId: string, nodeId: string): Promise<VarInInspect[]> => {
  const { items } = (await get(`apps/${appId}/workflows/draft/nodes/${nodeId}/variables`)) as { items: VarInInspect[] }
  return items
}
