/* ═══════════════════════════════════════════════
   AI CHAT — APPLICATION LOGIC
   ═══════════════════════════════════════════════ */

(() => {
  'use strict';

  // ── DOM REFERENCES ──
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const dom = {
    app: $('#app'),
    sidebar: $('#sidebar'),
    sidebarOverlay: $('#sidebar-overlay'),
    sidebarToggle: $('#sidebar-toggle'),
    newChatBtn: $('#new-chat-btn'),
    searchInput: $('#search-input'),
    chatList: $('#chat-list'),
    chatArea: $('#chat-area'),
    welcomeScreen: $('#welcome-screen'),
    messagesEl: $('#messages'),
    userInput: $('#user-input'),
    sendBtn: $('#send-btn'),
    stopBtn: $('#stop-btn'),
    themeToggle: $('#theme-toggle'),
    themeIconMoon: $('#theme-icon-moon'),
    themeIconSun: $('#theme-icon-sun'),
    themeLabel: $('#theme-label'),
    modelDropdown: $('#model-dropdown'),
    modelLabel: $('#model-label'),
    skillDropdown: $('#skill-dropdown'),
    skillLabel: $('#skill-label'),
    providerSelector: $('#provider-selector'),
    clearChatBtn: $('#clear-chat-btn'),
    // Prompt Panel DOM
    promptPanelToggle: $('#prompt-panel-toggle'),
    promptPanelBody: $('#prompt-panel-body'),
    ppTemperature: $('#pp-temperature'),
    ppTempVal: $('#pp-temp-val'),
    ppMaxTokens: $('#pp-max-tokens'),
    ppOutputFormat: $('#pp-output-format'),
    ppContext: $('#pp-context'),
    ppConstraints: $('#pp-constraints'),
  };

  // ── STATE ──
  const state = {
    chats: [],          // { id, title, messages: [{role, content}], createdAt }
    activeChatId: null,
    selectedModel: 'gemini-flash-latest',
    selectedSkill: 'prompt-engineer',
    selectedProvider: 'gemini',
    isGenerating: false,
    abortController: null,
    // Prompt settings
    temperature: 0.7,
    maxTokens: 1024,
    outputFormat: 'markdown',
  };

  // ── FAKE AI RESPONSES ──
  const fakeResponses = {
    general: [
      `That's a great question! Let me break it down for you.\n\n**Key Points:**\n\n1. **Context matters** — Understanding the broader context helps frame the answer correctly.\n2. **Evidence-based reasoning** — I'll rely on established knowledge and best practices.\n3. **Practical application** — Let's make sure the answer is actionable.\n\nWould you like me to dive deeper into any of these points?`,

      `Here's my analysis:\n\n## Overview\n\nThis is a fascinating topic that spans multiple domains. Let me walk you through the essential aspects.\n\n### Important Considerations\n\n- Start with the fundamentals before moving to advanced concepts\n- Consider the trade-offs involved in each approach\n- Real-world examples often reveal nuances that theory alone cannot\n\n> "The best way to predict the future is to create it." — Peter Drucker\n\nLet me know if you'd like a more detailed exploration!`,

      `Great question! Here's what I think:\n\nThe answer depends on several factors, but I can outline the **most common approach**:\n\n1. First, identify the core problem\n2. Break it down into smaller, manageable parts\n3. Address each part systematically\n4. Validate the solution against your requirements\n\n**Pro tip:** Always document your reasoning — it makes revisiting decisions much easier later.\n\nShall I elaborate on any specific step?`,
    ],

    code: [
      "Sure! Here's a clean implementation:\n\n```python\ndef merge_sort(arr):\n    \"\"\"Sort a list using the merge sort algorithm.\"\"\"\n    if len(arr) <= 1:\n        return arr\n\n    mid = len(arr) // 2\n    left = merge_sort(arr[:mid])\n    right = merge_sort(arr[mid:])\n\n    return merge(left, right)\n\n\ndef merge(left, right):\n    \"\"\"Merge two sorted lists into one.\"\"\"\n    result = []\n    i = j = 0\n\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            result.append(left[i])\n            i += 1\n        else:\n            result.append(right[j])\n            j += 1\n\n    result.extend(left[i:])\n    result.extend(right[j:])\n    return result\n```\n\n**Time Complexity:** O(n log n) — consistently efficient.\n\n**Space Complexity:** O(n) — requires additional memory for merging.\n\nWant me to optimize this for in-place sorting?",

      "Here's a modern solution using clean architecture principles:\n\n```javascript\nclass EventEmitter {\n  #listeners = new Map();\n\n  on(event, callback) {\n    if (!this.#listeners.has(event)) {\n      this.#listeners.set(event, new Set());\n    }\n    this.#listeners.get(event).add(callback);\n    return () => this.off(event, callback);\n  }\n\n  off(event, callback) {\n    this.#listeners.get(event)?.delete(callback);\n  }\n\n  emit(event, ...args) {\n    this.#listeners.get(event)?.forEach(cb => cb(...args));\n  }\n}\n```\n\n**Key Design Decisions:**\n- Private field `#listeners` for encapsulation\n- `Set` prevents duplicate subscriptions\n- `on()` returns an unsubscribe function\n\nThis pattern is widely used in frameworks like Node.js and Vue.",
    ],

    creative: [
      `# The Last Lighthouse Keeper\n\nThe sea whispered secrets that only Elara could understand. For thirty years, she had tended the lighthouse on the edge of the world, watching ships emerge from fog like ghosts finding their way home.\n\n*"One more night,"* she told herself every evening.\n\nBut tonight was different. The beam of light cut through the darkness and found something it had never illuminated before — a shore that shouldn't exist, glimmering with bioluminescent blue.\n\n> She gripped the railing. The impossible shore beckoned.\n\n---\n\nWant me to continue the story? I can explore different genres or tones.`,

      `Here are **5 creative startup ideas for 2026:**\n\n🌱 **1. BioSync** — Personalized nutrition plans generated from gut microbiome analysis delivered as meal kits.\n\n🎨 **2. DreamFrame** — AI-generated artwork that evolves based on your room's ambient light, mood, and time of day.\n\n🏥 **3. MediMirror** — Smart bathroom mirrors that perform daily health screenings using computer vision.\n\n📚 **4. StoryForge** — Collaborative AI storytelling platform where communities build interactive fiction worlds together.\n\n🌍 **5. CarbonTrace** — Consumer app that visualizes the real carbon footprint of every purchase in real-time.\n\nEach idea addresses a growing market gap. Want me to develop a lean canvas for any of them?`,
    ],

    analysis: [
      `## Data Analysis Results\n\nHere's a summary of the key findings:\n\n| Metric | Q1 2026 | Q2 2026 | Change |\n|--------|---------|---------|--------|\n| Revenue | $2.4M | $3.1M | +29.2% |\n| Users | 45,200 | 62,800 | +38.9% |\n| Churn | 4.2% | 3.1% | -26.2% |\n| NPS | 42 | 56 | +33.3% |\n\n### Key Insights\n\n1. **Revenue growth** is accelerating, driven primarily by enterprise adoption\n2. **User retention** improved significantly after the onboarding redesign\n3. **NPS score** crossed the "excellent" threshold (50+)\n\n**Recommendation:** Double down on enterprise features and expand the sales team by Q3.\n\nWant me to create visualizations or drill into specific segments?`,
    ],

    translate: [
      `Here's the translation:\n\n---\n\n🇺🇸 **English:** "The only way to do great work is to love what you do."\n\n🇪🇸 **Spanish:** "La única forma de hacer un gran trabajo es amar lo que haces."\n\n🇫🇷 **French:** "La seule façon de faire du bon travail est d'aimer ce que vous faites."\n\n🇩🇪 **German:** "Der einzige Weg, großartige Arbeit zu leisten, ist zu lieben, was man tut."\n\n🇯🇵 **Japanese:** "素晴らしい仕事をする唯一の方法は、自分のしていることを愛することだ。"\n\n🇸🇦 **Arabic:** "الطريقة الوحيدة للقيام بعمل رائع هي أن تحب ما تفعله."\n\n---\n\n*— Steve Jobs*\n\nWould you like me to translate something else or into additional languages?`,
    ],
  };

  // ── HELPERS ──
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /** Very lightweight Markdown → HTML (covers bold, italic, headings, code blocks, inline code, lists, blockquotes, tables, hr) */
  function markdownToHtml(md) {
    let html = escapeHtml(md);

    // Code blocks with language
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
      const langLabel = lang || 'code';
      return `<div class="code-block-header"><span>${langLabel}</span><button class="copy-code-btn" onclick="window.__copyCode(this)">Copy</button></div><pre><code>${code.trim()}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headings
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr/>');

    // Bold & Italic
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Blockquotes
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

    // Tables
    html = html.replace(/^(\|.+\|)\n(\|[-| :]+\|)\n((?:\|.+\|\n?)+)/gm, (_, header, _sep, body) => {
      const ths = header.split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('');
      const rows = body.trim().split('\n').map(row => {
        const tds = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('');
        return `<tr>${tds}</tr>`;
      }).join('');
      return `<table><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>`;
    });

    // Unordered list
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

    // Ordered list
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Paragraphs — wrap remaining loose lines
    html = html.split('\n\n').map(block => {
      block = block.trim();
      if (!block) return '';
      if (/^<[a-z]/.test(block)) return block;
      return `<p>${block}</p>`;
    }).join('\n');

    // Clean up stray newlines within paragraphs
    html = html.replace(/\n/g, '<br/>');
    // Remove double <br/> inside block elements
    html = html.replace(/(<\/(?:h[1-6]|li|tr|table|thead|tbody|pre|blockquote|hr|ul|ol)>)<br\/>/g, '$1');
    html = html.replace(/<br\/>(<(?:h[1-6]|li|tr|table|thead|tbody|pre|blockquote|hr|ul|ol|div))/g, '$1');

    return html;
  }

  /** Markdown table styling injection */
  function injectTableStyles() {
    if ($('#ai-table-styles')) return;
    const style = document.createElement('style');
    style.id = 'ai-table-styles';
    style.textContent = `
      .message-content table {
        width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 0.84rem;
      }
      .message-content th, .message-content td {
        padding: 8px 12px; text-align: left;
        border: 1px solid var(--border);
      }
      .message-content th {
        background: var(--bg-glass); font-weight: 600; color: var(--text-primary);
      }
      .message-content td { color: var(--text-secondary); }
      .message-content blockquote {
        border-left: 3px solid var(--accent);
        padding: 4px 14px; margin: 8px 0;
        color: var(--text-secondary); font-style: italic;
        background: var(--bg-glass); border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
      }
      .message-content h1, .message-content h2, .message-content h3 {
        margin: 14px 0 6px; font-weight: 600;
      }
      .message-content h1 { font-size: 1.15rem; }
      .message-content h2 { font-size: 1.05rem; }
      .message-content h3 { font-size: 0.95rem; }
      .message-content hr {
        border: none; border-top: 1px solid var(--border); margin: 14px 0;
      }
    `;
    document.head.appendChild(style);
  }
  injectTableStyles();

  // ── COPY CODE HELPER ──
  window.__copyCode = function (btn) {
    const code = btn.closest('.code-block-header').nextElementSibling?.querySelector('code');
    if (!code) return;
    navigator.clipboard.writeText(code.textContent).then(() => {
      const orig = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = orig; }, 1500);
    });
  };

  // ═══════════════════════════════════════════════
  //  THEME
  // ═══════════════════════════════════════════════
  function initTheme() {
    const saved = localStorage.getItem('ai-chat-theme') || 'dark';
    applyTheme(saved);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ai-chat-theme', theme);
    if (theme === 'dark') {
      dom.themeIconMoon.classList.remove('hidden');
      dom.themeIconSun.classList.add('hidden');
      dom.themeLabel.textContent = 'Dark';
    } else {
      dom.themeIconMoon.classList.add('hidden');
      dom.themeIconSun.classList.remove('hidden');
      dom.themeLabel.textContent = 'Light';
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  // ═══════════════════════════════════════════════
  //  SIDEBAR
  // ═══════════════════════════════════════════════
  function toggleSidebar() {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      dom.sidebar.classList.toggle('open');
      dom.sidebarOverlay.classList.toggle('active');
    } else {
      dom.sidebar.style.display = dom.sidebar.style.display === 'none' ? '' : 'none';
    }
  }

  function closeSidebarMobile() {
    dom.sidebar.classList.remove('open');
    dom.sidebarOverlay.classList.remove('active');
  }

  // ═══════════════════════════════════════════════
  //  CHAT MANAGEMENT
  // ═══════════════════════════════════════════════
  function createChat(firstMessage) {
    const chat = {
      id: generateId(),
      title: firstMessage ? firstMessage.slice(0, 40) : 'New Chat',
      messages: [],
      createdAt: Date.now(),
    };
    state.chats.unshift(chat);
    state.activeChatId = chat.id;
    saveChats();
    renderChatList();
    renderMessages();
    return chat;
  }

  function deleteChat(id) {
    state.chats = state.chats.filter(c => c.id !== id);
    if (state.activeChatId === id) {
      state.activeChatId = state.chats[0]?.id || null;
    }
    saveChats();
    renderChatList();
    renderMessages();
  }

  function getActiveChat() {
    return state.chats.find(c => c.id === state.activeChatId) || null;
  }

  function clearActiveChat() {
    const chat = getActiveChat();
    if (!chat || state.isGenerating) return;
    chat.messages = [];
    saveChats();
    renderMessages();
  }

  function switchChat(id) {
    state.activeChatId = id;
    renderChatList();
    renderMessages();
    closeSidebarMobile();
  }

  function saveChats() {
    localStorage.setItem('ai-chat-history', JSON.stringify(state.chats));
  }

  function loadChats() {
    try {
      const data = localStorage.getItem('ai-chat-history');
      if (data) state.chats = JSON.parse(data);
      if (state.chats.length) state.activeChatId = state.chats[0].id;
    } catch (_) {
      state.chats = [];
    }
  }

  // ═══════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════
  function renderChatList() {
    const filter = dom.searchInput.value.trim().toLowerCase();
    const filtered = filter
      ? state.chats.filter(c => c.title.toLowerCase().includes(filter))
      : state.chats;

    dom.chatList.innerHTML = filtered.map(chat => `
      <div class="chat-item ${chat.id === state.activeChatId ? 'active' : ''}" data-id="${chat.id}">
        <svg class="chat-item-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span class="chat-item-text">${escapeHtml(chat.title)}</span>
        <button class="chat-item-delete" data-delete="${chat.id}" title="Delete chat" aria-label="Delete chat">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    `).join('');
  }

  function renderMessages() {
    const chat = getActiveChat();
    if (!chat || chat.messages.length === 0) {
      dom.welcomeScreen.classList.remove('hidden');
      dom.messagesEl.innerHTML = '';
      return;
    }
    dom.welcomeScreen.classList.add('hidden');
    dom.messagesEl.innerHTML = chat.messages.map((msg, i) => buildMessageHtml(msg, i)).join('');
    forceScrollToBottom();
  }

  function buildMessageHtml(msg, index) {
    const isUser = msg.role === 'user';
    const avatarText = isUser ? 'You' : 'AI';
    const roleText = isUser ? 'You' : 'AI Chat';
    const contentHtml = isUser ? `<p>${escapeHtml(msg.content)}</p>` : markdownToHtml(msg.content);

    return `
      <div class="message ${msg.role}" data-index="${index}">
        <div class="message-avatar">${avatarText}</div>
        <div class="message-body">
          <div class="message-role">${roleText}</div>
          <div class="message-content">${contentHtml}</div>
          <div class="message-actions">
            <button class="msg-action-btn" title="Copy" aria-label="Copy message" onclick="window.__copyMsg(this)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </button>
            ${!isUser ? `
            <button class="msg-action-btn" title="Regenerate" aria-label="Regenerate response" onclick="window.__regenerate(${index})">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
            </button>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  function appendMessage(msg) {
    dom.welcomeScreen.classList.add('hidden');
    const idx = getActiveChat().messages.length - 1;
    const html = buildMessageHtml(msg, idx);
    dom.messagesEl.insertAdjacentHTML('beforeend', html);
    forceScrollToBottom();
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      // Only auto-scroll if we are near the bottom (within 150px)
      const el = dom.chatArea;
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
      if (isNearBottom) {
        el.scrollTop = el.scrollHeight;
      }
    });
  }

  function forceScrollToBottom() {
    requestAnimationFrame(() => {
      dom.chatArea.scrollTop = dom.chatArea.scrollHeight;
    });
  }

  // ── COPY MESSAGE ──
  window.__copyMsg = function (btn) {
    const msgEl = btn.closest('.message');
    const contentEl = msgEl.querySelector('.message-content');
    navigator.clipboard.writeText(contentEl.textContent).then(() => {
      btn.title = 'Copied!';
      setTimeout(() => { btn.title = 'Copy'; }, 1500);
    });
  };

  // ── REGENERATE ──
  window.__regenerate = function (index) {
    const chat = getActiveChat();
    if (!chat || state.isGenerating) return;
    // Remove the AI message at `index` and regenerate
    chat.messages.splice(index, 1);
    saveChats();
    renderMessages();
    // Find the last user message
    const lastUserMsg = [...chat.messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      generateAIResponse(lastUserMsg.content);
    }
  };

  // ═══════════════════════════════════════════════
  //  FAKE AI RESPONSE (streaming simulation)
  // ═══════════════════════════════════════════════
  function pickFakeResponse(userMsg) {
    const skill = state.selectedSkill;
    const pool = fakeResponses[skill] || fakeResponses.general;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  async function generateAIResponse(userMsg) {
    if (state.isGenerating) return;
    state.isGenerating = true;
    dom.sendBtn.classList.add('hidden');
    dom.stopBtn.classList.remove('hidden');

    const chat = getActiveChat();

    // Output Format Instruction mapping
    const outputInstructions = {
      markdown: '',
      plain:    'Return the response as plain text only. Do not use Markdown formatting.',
      json:     'Return the response as valid JSON.',
      bullets:  'Return the response as a bullet list only. Use - for each point.'
    };

    // System Prompt Construction: Base + Context + Constraints + Output Format
    let systemPrompt = `You are a ${state.selectedSkill.replace(/-/g, ' ')}. You are highly capable and professional.`;

    const contextText = dom.ppContext ? dom.ppContext.value.trim() : '';
    if (contextText) {
      systemPrompt += `\n\nContext:\n${contextText}`;
    }

    const constraintsText = dom.ppConstraints ? dom.ppConstraints.value.trim() : '';
    if (constraintsText) {
      systemPrompt += `\n\nConstraints:\n${constraintsText}`;
    }

    const formatInstr = outputInstructions[state.outputFormat] || '';
    if (formatInstr) {
      systemPrompt += `\n\n${formatInstr}`;
    }

    // Build context-prepended messages if context is provided
    let payloadMessages = chat.messages.map(m => ({ role: m.role, content: m.content }));
    if (contextText && payloadMessages.length > 0) {
      payloadMessages[0] = {
        role: payloadMessages[0].role,
        content: `[Context]\n${contextText}\n\n${payloadMessages[0].content}`
      };
    }

    const payload = {
      provider: state.selectedProvider,
      model: state.selectedModel,
      systemPrompt,
      messages: payloadMessages,
      context: contextText,
      constraints: constraintsText,
      outputFormat: state.outputFormat,
      temperature: state.temperature,
      maxTokens: state.maxTokens
    };

    // Add an empty AI message
    const aiMsg = { role: 'assistant', content: '' };
    chat.messages.push(aiMsg);
    saveChats();
    appendMessage(aiMsg);

    // Get the last rendered assistant message content element
    const allMsgEls = dom.messagesEl.querySelectorAll('.message.assistant');
    const lastMsgEl = allMsgEls[allMsgEls.length - 1];
    const contentEl = lastMsgEl.querySelector('.message-content');

    // Show typing indicator
    contentEl.innerHTML = `<div class="typing-indicator"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>`;
    forceScrollToBottom();

    // Wait a beat before streaming
    await sleep(600);

    // Fetch from backend
    let fullText = '';
    try {
      const response = await fetch('http://localhost:3000/api/chat/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        fullText = `**Error:** ${data.message || data.error || 'Failed to generate response.'}`;
      } else {
        fullText = data.content;
      }
    } catch (error) {
      fullText = `**Network Error:** Could not reach the backend server. Please make sure it is running on port 3000.\n\nDetails: ${error.message}`;
    }

    // Abort support
    let aborted = false;
    state.abortController = { abort: () => { aborted = true; } };

    // Stream characters
    let streamed = '';
    const chars = fullText.split('');
    for (let i = 0; i < chars.length; i++) {
      if (aborted) break;
      streamed += chars[i];
      contentEl.innerHTML = markdownToHtml(streamed);
      // Variable speed for realism
      const delay = chars[i] === '\n' ? 30 : chars[i] === ' ' ? 15 : 8;
      scrollToBottom();
      await sleep(delay);
    }

    // Finalize
    aiMsg.content = streamed;
    saveChats();
    contentEl.innerHTML = markdownToHtml(aiMsg.content);

    // Syntax Highlight code blocks with Highlight.js
    if (window.hljs) {
      contentEl.querySelectorAll('pre code').forEach(block => {
        hljs.highlightElement(block);
      });
    }

    // Re-render the actions bar
    const actionsHtml = `
      <div class="message-actions" style="opacity:1">
        <button class="msg-action-btn" title="Copy" aria-label="Copy message" onclick="window.__copyMsg(this)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
        <button class="msg-action-btn" title="Regenerate" aria-label="Regenerate response" onclick="window.__regenerate(${chat.messages.length - 1})">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        </button>
      </div>`;
    const existingActions = lastMsgEl.querySelector('.message-actions');
    if (existingActions) existingActions.remove();
    lastMsgEl.querySelector('.message-body').insertAdjacentHTML('beforeend', actionsHtml);

    state.isGenerating = false;
    state.abortController = null;
    dom.stopBtn.classList.add('hidden');
    dom.sendBtn.classList.remove('hidden');
    updateSendBtn();
    forceScrollToBottom();
  }

  function stopGeneration() {
    if (state.abortController) {
      state.abortController.abort();
    }
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ═══════════════════════════════════════════════
  //  SEND MESSAGE
  // ═══════════════════════════════════════════════
  function sendMessage() {
    const text = dom.userInput.value.trim();
    if (!text || state.isGenerating) return;

    // If no active chat, create one
    let chat = getActiveChat();
    if (!chat) {
      chat = createChat(text);
    }

    // Update title if this is the first message
    if (chat.messages.length === 0) {
      chat.title = text.slice(0, 40) + (text.length > 40 ? '…' : '');
      renderChatList();
    }

    // Add user message
    const userMsg = { role: 'user', content: text };
    chat.messages.push(userMsg);
    saveChats();
    appendMessage(userMsg);

    // Clear input
    dom.userInput.value = '';
    autoResizeTextarea();
    updateSendBtn();

    // Generate fake AI response
    generateAIResponse(text);
  }

  // ═══════════════════════════════════════════════
  //  INPUT HANDLING
  // ═══════════════════════════════════════════════
  function autoResizeTextarea() {
    const el = dom.userInput;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }

  function updateSendBtn() {
    dom.sendBtn.disabled = !dom.userInput.value.trim() || state.isGenerating;
  }

  // ═══════════════════════════════════════════════
  //  DROPDOWNS
  // ═══════════════════════════════════════════════
  function setupDropdown(containerEl, labelEl, stateKey) {
    const trigger = containerEl.querySelector('.dropdown-trigger');
    const menu = containerEl.querySelector('.dropdown-menu');

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close other dropdowns
      $$('.dropdown.open').forEach(d => { if (d !== containerEl) d.classList.remove('open'); });
      containerEl.classList.toggle('open');
      trigger.setAttribute('aria-expanded', containerEl.classList.contains('open'));
    });

    menu.addEventListener('click', (e) => {
      const li = e.target.closest('li');
      if (!li) return;
      const value = li.dataset.value;
      state[stateKey] = value;
      labelEl.textContent = li.textContent;
      menu.querySelectorAll('li').forEach(item => item.classList.remove('active'));
      li.classList.add('active');
      containerEl.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    });
  }

  // Close dropdowns on outside click
  document.addEventListener('click', () => {
    $$('.dropdown.open').forEach(d => {
      d.classList.remove('open');
      d.querySelector('.dropdown-trigger').setAttribute('aria-expanded', 'false');
    });
  });

  // ── MODELS MAPPING ──
  const modelsByProvider = {
    gemini: [
      { value: 'gemini-flash-latest', label: 'Gemini Flash' },
      { value: 'gemini-1.5-pro', label: 'Gemini Pro' }
    ],
    openai: [
      { value: 'gpt-4o', label: 'GPT-4o' },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini' }
    ],
    pollinations: [
      { value: 'openai', label: 'Pollinations (OpenAI)' },
      { value: 'mistral', label: 'Pollinations (Mistral)' },
      { value: 'claude', label: 'Pollinations (Claude)' }
    ]
  };

  // ═══════════════════════════════════════════════
  //  APP INITIALIZATION & THEME
  // ═══════════════════════════════════════════════
  // ═══════════════════════════════════════════════
  //  APP INITIALIZATION & THEME
  // ═══════════════════════════════════════════════
  function updateModelDropdown(provider) {
    const models = modelsByProvider[provider];
    if (!models) return;
    const menu = dom.modelDropdown.querySelector('.dropdown-menu');
    menu.innerHTML = models.map((m, i) => 
      `<li role="option" data-value="${m.value}" class="${i === 0 ? 'active' : ''}">${m.label}</li>`
    ).join('');
    
    // Update state and label to the first model
    state.selectedModel = models[0].value;
    dom.modelLabel.textContent = models[0].label;
  }

  function bindEvents() {
    // Theme
    dom.themeToggle.addEventListener('click', toggleTheme);

    // Sidebar
    dom.sidebarToggle.addEventListener('click', toggleSidebar);
    dom.sidebarOverlay.addEventListener('click', closeSidebarMobile);

    // New chat
    dom.newChatBtn.addEventListener('click', () => {
      createChat();
      closeSidebarMobile();
      dom.userInput.focus();
    });

    // Chat list click delegation
    dom.chatList.addEventListener('click', (e) => {
      // Delete button
      const delBtn = e.target.closest('[data-delete]');
      if (delBtn) {
        e.stopPropagation();
        deleteChat(delBtn.dataset.delete);
        return;
      }
      // Chat item
      const item = e.target.closest('.chat-item');
      if (item) switchChat(item.dataset.id);
    });

    // Search
    dom.searchInput.addEventListener('input', renderChatList);

    // Input
    dom.userInput.addEventListener('input', () => {
      autoResizeTextarea();
      updateSendBtn();
    });
    dom.userInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Send & Stop & Clear
    dom.sendBtn.addEventListener('click', sendMessage);
    dom.stopBtn.addEventListener('click', stopGeneration);
    dom.clearChatBtn.addEventListener('click', clearActiveChat);

    // Welcome chips
    $$('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        dom.userInput.value = chip.dataset.prompt;
        autoResizeTextarea();
        updateSendBtn();
        sendMessage();
      });
    });

    // Dropdowns
    setupDropdown(dom.modelDropdown, dom.modelLabel, 'selectedModel');
    setupDropdown(dom.skillDropdown, dom.skillLabel, 'selectedSkill');

    // Provider selector
    dom.providerSelector.addEventListener('click', (e) => {
      const btn = e.target.closest('.provider-btn');
      if (!btn) return;
      dom.providerSelector.querySelectorAll('.provider-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      state.selectedProvider = btn.dataset.provider;
      updateModelDropdown(state.selectedProvider);
    });

    // Prompt Panel Toggle (Class-based toggle + localStorage)
    const promptPanel = $('#prompt-panel');
    const promptPanelToggle = $('#prompt-panel-toggle');

    if (promptPanel && promptPanelToggle) {
      // Restore state (Default: collapsed)
      const isSavedOpen = localStorage.getItem('ai-chat-prompt-panel-open') === 'true';
      if (isSavedOpen) {
        promptPanel.classList.add('expanded');
        promptPanelToggle.setAttribute('aria-expanded', 'true');
      } else {
        promptPanel.classList.remove('expanded');
        promptPanelToggle.setAttribute('aria-expanded', 'false');
      }

      promptPanelToggle.addEventListener('click', () => {
        const isExpanded = promptPanel.classList.toggle('expanded');
        promptPanelToggle.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
        localStorage.setItem('ai-chat-prompt-panel-open', isExpanded ? 'true' : 'false');
      });
    }

    // Temperature Slider
    if (dom.ppTemperature) {
      dom.ppTemperature.addEventListener('input', () => {
        state.temperature = parseFloat(dom.ppTemperature.value);
        if (dom.ppTempVal) dom.ppTempVal.textContent = state.temperature.toFixed(1);
      });
    }

    // Max Tokens Input
    if (dom.ppMaxTokens) {
      dom.ppMaxTokens.addEventListener('change', () => {
        const val = parseInt(dom.ppMaxTokens.value, 10);
        state.maxTokens = isNaN(val) || val < 1 ? 1024 : val;
        dom.ppMaxTokens.value = state.maxTokens;
      });
    }

    // Output Format Select
    if (dom.ppOutputFormat) {
      dom.ppOutputFormat.addEventListener('change', () => {
        state.outputFormat = dom.ppOutputFormat.value;
      });
    }

    // Responsive sidebar reset
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        dom.sidebar.classList.remove('open');
        dom.sidebarOverlay.classList.remove('active');
        dom.sidebar.style.display = '';
      }
    });
  }

  // ═══════════════════════════════════════════════
  //  INIT
  // ═══════════════════════════════════════════════
  function init() {
    initTheme();
    updateModelDropdown(state.selectedProvider);
    loadChats();
    renderChatList();
    renderMessages();
    bindEvents();
    updateSendBtn();
    dom.userInput.focus();
  }

  init();
})();
