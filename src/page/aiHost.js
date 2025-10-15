// Runs in the page's main world (not the extension isolated world).
// Provides a minimal RPC bridge to Chrome's preview AI Text API via postMessage.

(() => {
  console.log('[AI Host] AI host script loaded in MAIN world');
  console.log('[AI Host] window.ai available:', typeof window.ai, window.ai);
  
  const SESSIONS = new Map();
  let nextId = 1;

  const ok = (reqId, data) => ({ source: 'chrome-ai-overlay', type: 'ai:resp', ok: true, reqId, data });
  const err = (reqId, message, code) => ({ source: 'chrome-ai-overlay', type: 'ai:resp', ok: false, reqId, error: { message, code } });

  async function handle(event) {
    // Only accept messages from same window
    if (event.source !== window) return;
    const msg = event.data;
    if (!msg || msg.source !== 'chrome-ai-overlay' || msg.type !== 'ai:req') return;
    const { reqId, op, payload } = msg;

    console.log('[AI Host] Received request:', { reqId, op, payload });

    try {
      if (op === 'canCreate') {
        console.log('[AI Host] Checking canCreateTextSession...');
        const status = typeof window.ai?.canCreateTextSession === 'function'
          ? await window.ai.canCreateTextSession()
          : 'no';
        console.log('[AI Host] canCreateTextSession result:', status);
        window.postMessage(ok(reqId, status), '*');
        return;
      }

      if (op === 'create') {
        if (!window.ai?.createTextSession) {
          window.postMessage(err(reqId, 'AI not available', 'ai-unavailable'), '*');
          return;
        }
        const session = await window.ai.createTextSession(payload?.options || {});
        const id = String(nextId++);
        SESSIONS.set(id, session);
        window.postMessage(ok(reqId, { id }), '*');
        return;
      }

      if (op === 'prompt') {
        const { id, prompt } = payload || {};
        const session = SESSIONS.get(String(id));
        if (!session) {
          window.postMessage(err(reqId, 'Invalid session', 'invalid-session'), '*');
          return;
        }
        const out = await session.prompt(String(prompt || ''));
        window.postMessage(ok(reqId, { text: String(out || '') }), '*');
        return;
      }

      if (op === 'destroy') {
        const { id } = payload || {};
        const session = SESSIONS.get(String(id));
        if (session && typeof session.destroy === 'function') {
          try { session.destroy(); } catch {}
        }
        SESSIONS.delete(String(id));
        window.postMessage(ok(reqId, { ok: true }), '*');
        return;
      }

      window.postMessage(err(reqId, 'Unknown op', 'unknown-op'), '*');
    } catch (e) {
      window.postMessage(err(reqId, e?.message || 'Host error', 'host-error'), '*');
    }
  }

  window.addEventListener('message', handle, false);
})();

