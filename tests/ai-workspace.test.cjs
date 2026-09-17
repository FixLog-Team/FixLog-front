const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const axios = require('axios');

function load(file, imports) {
  const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(output, { exports, require: (name) => imports[name] });
  return exports;
}

test('all six chat APIs pin the workspace and pass cancellation signals', async () => {
  let workspaceId = 'workspace-a';
  const calls = [];
  const http = axios.create({
    baseURL: '/fixlog',
    adapter: async (config) => {
      calls.push(config);
      return { data: { result: {} }, status: 200, statusText: 'OK', headers: {}, config };
    },
  });
  const { aiApi, chatConfig } = load('src/domains/ai/api/ai.api.ts', {
    '@/shared/lib/http/client': { http, unwrap: (res) => res.data.result },
    '@/shared/lib/workspace/workspace-storage': { workspaceStorage: { get: () => workspaceId } },
  });
  const controller = new AbortController();
  const scope = chatConfig(workspaceId, controller.signal);
  workspaceId = 'workspace-b';
  await aiApi.createConversation('title', scope);
  await aiApi.getConversations(0, 5, scope);
  await aiApi.getConversation('conversation-a', scope);
  await aiApi.deleteConversation('conversation-a', scope);
  await aiApi.getChatMessages('conversation-a', undefined, 100, scope);
  await aiApi.sendChatMessage('conversation-a', 'hello', scope);
  assert.equal(calls.length, 6);
  for (const call of calls) {
    assert.equal(call.headers.get('X-Workspace-Id'), 'workspace-a');
    assert.equal(call.signal, controller.signal);
    assert.ok(http.getUri(call).startsWith('/fixlog/api/ai/conversations'));
  }
  await aiApi.getConversations();
  assert.equal(calls.at(-1).headers.get('X-Workspace-Id'), 'workspace-b');
  workspaceId = null;
  await aiApi.getConversations();
  assert.equal(calls.at(-1).headers.has('X-Workspace-Id'), true);
  assert.equal('X-Workspace-Id' in calls.at(-1).headers.toJSON(), false);
  controller.abort();
  await assert.rejects(aiApi.sendChatMessage('conversation-a', 'late', scope), axios.isCancel);
  assert.equal(calls.length, 8);
});

test('conversation list caches are isolated for A → B → A', async () => {
  let workspaceId = 'workspace-a';
  const { useConversations } = load('src/domains/ai/hooks/use-conversations.ts', {
    '@tanstack/react-query': { useQuery: (options) => options },
    '@/domains/ai': { aiApi: { getConversations: (...args) => args } },
    '@/domains/ai/api/ai.api': { chatConfig: (id, signal) => ({ id, signal }) },
    '@/shared/lib/workspace/workspace-storage': { workspaceStorage: { get: () => workspaceId } },
  });
  const a = useConversations();
  workspaceId = 'workspace-b';
  const b = useConversations();
  assert.notEqual(JSON.stringify(a.queryKey), JSON.stringify(b.queryKey));
  assert.equal(a.queryFn({}).at(-1).id, 'workspace-a');
  workspaceId = 'workspace-a';
  assert.equal(JSON.stringify(a.queryKey), JSON.stringify(useConversations().queryKey));
});

test('HTTP retries preserve both explicit and personal workspace headers', () => {
  let workspaceId = 'workspace-b';
  const { http } = load('src/shared/lib/http/client.ts', {
    axios: { ...axios, default: axios },
    '@/app/config/env': { ENV: { API_BASE_URL: '/fixlog' } },
    '@/shared/constants/routes': { ROUTES: {} },
    '@/shared/lib/auth/token-storage': { tokenStorage: { getAccessToken: () => null } },
    '@/shared/lib/workspace/workspace-storage': { workspaceStorage: { get: () => workspaceId } },
  });
  const intercept = http.interceptors.request.handlers[0].fulfilled;
  const a = { headers: new axios.AxiosHeaders({ 'X-Workspace-Id': 'workspace-a' }) };
  const personal = { headers: new axios.AxiosHeaders({ 'X-Workspace-Id': null }) };
  assert.equal(intercept(a).headers.get('X-Workspace-Id'), 'workspace-a');
  assert.equal(intercept(personal).headers.get('X-Workspace-Id'), null);
  const automatic = intercept({ headers: new axios.AxiosHeaders() });
  workspaceId = 'workspace-c';
  assert.equal(intercept(automatic).headers.get('X-Workspace-Id'), 'workspace-b');
});
