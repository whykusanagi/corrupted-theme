/**
 * Celeste AI Custom Agent
 * A custom implementation that integrates with context schemas
 * Provides contextual assistance based on the current page
 * Based on union raid implementation
 */

class CelesteAgent {
    constructor(config = {}) {
        // Agent configuration
        // With backend proxy pattern (secure mode): credentials NOT needed in browser
        // Widget calls /api/chat endpoint, backend proxy handles authentication
        // Browser never sees API key - it stays on server

        this.agentKey = config.agentKey || window.CELESTE_AGENT_KEY;
        this.agentId = config.agentId || window.CELESTE_AGENT_ID;
        this.agentBaseUrl = config.agentBaseUrl || window.CELESTE_AGENT_BASE_URL;
        
        // Proxy URL configuration (for local development)
        // Defaults to localhost:5000, but can be overridden via CELESTE_PROXY_URL
        // or detected from current page origin (for Docker port mapping scenarios)
        this.proxyUrl = config.proxyUrl || window.CELESTE_PROXY_URL || this.detectProxyUrl();

        // Note: With backend proxy, credentials are optional in browser
        // They're only used if making direct API calls (legacy mode)
        // The /api/chat endpoint will validate credentials server-side


        this.isInitialized = false;
        this.isOpen = false;
        this.currentContext = null;
        this.conversationHistory = [];
        this.sessionId = this.generateSessionId();
        this.contextSchemas = null;
        this.celesteEssence = null;
        this.routingRules = null;

        // UI Elements
        this.chatContainer = null;
        this.chatButton = null;
        this.chatWindow = null;
        this.messageContainer = null;
        this.inputField = null;
        this.sendButton = null;

        // Lifecycle tracking (inline — this file uses IIFE-style globals, not ES imports)
        this._trackedListeners = [];
        this._styleElement = null;
    }

    /**
     * Track an event listener for cleanup in destroy()
     * @private
     */
    _trackListener(target, event, handler, options) {
        target.addEventListener(event, handler, options);
        this._trackedListeners.push({ target, event, handler, options });
    }

    /**
     * Remove all tracked event listeners
     * @private
     */
    _removeAllListeners() {
        for (const { target, event, handler, options } of this._trackedListeners) {
            target.removeEventListener(event, handler, options);
        }
        this._trackedListeners = [];
    }

    /**
     * Tear down the widget: remove DOM, listeners, and global references.
     * Safe to call multiple times.
     */
    destroy() {
        this._removeAllListeners();

        if (this.chatButton && this.chatButton.parentNode) {
            this.chatButton.parentNode.removeChild(this.chatButton);
        }
        if (this.chatWindow && this.chatWindow.parentNode) {
            this.chatWindow.parentNode.removeChild(this.chatWindow);
        }
        if (this._styleElement && this._styleElement.parentNode) {
            this._styleElement.parentNode.removeChild(this._styleElement);
        }

        this.chatButton = null;
        this.chatWindow = null;
        this._styleElement = null;
        this.isInitialized = false;
        this.isOpen = false;
        this.conversationHistory = [];

        if (window.CelesteAgent === this) {
            delete window.CelesteAgent;
        }
    }

    /**
     * Update page context without re-creating UI.
     * Used on SPA navigation (popstate).
     */
    async updateContext() {
        if (!this.isInitialized) return;
        this.currentContext = await this.getPageContext();
        this.loadContextualPrompt();
    }

    /**
     * Static method: Check if Celeste is properly configured
     * Call this to verify environment variables are set before initializing
     * @returns {Object} Configuration status with details
     */
    static checkConfiguration() {
        const status = {
            hasKey: !!window.CELESTE_AGENT_KEY,
            hasId: !!window.CELESTE_AGENT_ID,
            hasUrl: !!window.CELESTE_AGENT_BASE_URL,
            isConfigured: !!(window.CELESTE_AGENT_KEY && window.CELESTE_AGENT_ID && window.CELESTE_AGENT_BASE_URL),
            missing: []
        };

        if (!window.CELESTE_AGENT_KEY) status.missing.push('CELESTE_AGENT_KEY');
        if (!window.CELESTE_AGENT_ID) status.missing.push('CELESTE_AGENT_ID');
        if (!window.CELESTE_AGENT_BASE_URL) status.missing.push('CELESTE_AGENT_BASE_URL');

        return status;
    }

    /**
     * Initialize Celeste Agent
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            // Load context schemas
            await this.loadContextSchemas();

            // Get current page context
            this.currentContext = await this.getPageContext();

            // Create UI elements
            this.createUI();

            // Set initial prompt from schemas
            this.loadContextualPrompt();

            this.isInitialized = true;
            console.log('🎭 Celeste Agent initialized with context:', this.currentContext);
        } catch (error) {
            console.error('❌ Failed to initialize Celeste Agent:', error);
        }
    }

    /**
     * Load context schemas and configuration from local sources
     */
    async loadContextSchemas() {
        try {
            // Load local context schemas
            const schemaResponse = await fetch('/static/data/celeste-context-schemas.json');
            if (schemaResponse.ok) {
                this.contextSchemas = await schemaResponse.json();
                console.log('📋 Context schemas loaded');
            } else {
                this.contextSchemas = null;
            }

            // Load local capabilities
            const capResponse = await fetch('/static/data/celeste-capabilities.json');
            if (capResponse.ok) {
                this.capabilities = await capResponse.json();
                console.log('🎭 Celeste capabilities loaded');
            } else {
                this.capabilities = null;
            }
        } catch (error) {
            console.warn('⚠️ Error loading data files:', error);
            this.contextSchemas = null;
            this.capabilities = null;
        }
    }

    /**
     * Get contextual information about the current page
     */
    async getPageContext() {
        const path = window.location.pathname;
        const context = {
            page: this.getPageName(path),
            path: path,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };

        // Add page-specific context
        switch (context.page) {
            case 'home':
                context.data = await this.getHomeContext();
                break;
            case 'art':
                context.data = await this.getArtContext();
                break;
            case 'celeste':
                context.data = await this.getCelesteContext();
                break;
            case 'references':
                context.data = await this.getReferencesContext();
                break;
            case 'doujin':
                context.data = await this.getDoujinContext();
                break;
            case 'links':
                context.data = await this.getLinksContext();
                break;
            case 'tools':
                context.data = await this.getToolsContext();
                break;
            case 'privacy':
                context.data = await this.getPrivacyContext();
                break;
            default:
                context.data = await this.getGeneralContext();
        }

        return context;
    }

    /**
     * Get page name from path
     */
    getPageName(path) {
        if (path === '/' || path === '/index.html') return 'home';
        if (path.includes('art')) return 'art';
        if (path.includes('celeste')) return 'celeste';
        if (path.includes('reference')) return 'references';
        if (path.includes('kirara') || path.includes('bastard') || path.includes('doujin')) return 'doujin';
        if (path.includes('link')) return 'links';
        if (path.includes('tool') || path.includes('calc') || path.includes('countdown')) return 'tools';
        if (path.includes('privacy')) return 'privacy';
        return 'unknown';
    }

    /**
     * Get home-specific context
     */
    async getHomeContext() {
        return {
            purpose: 'Portfolio landing page and introduction',
            features: [
                'Portfolio overview',
                'Navigation to all sections',
                'About whykusanagi',
                'Celeste introduction'
            ],
            dataTypes: ['portfolio_overview', 'section_navigation'],
            suggestions: [
                'What can I find on this site?',
                'Who is whykusanagi?',
                'Show me your art',
                'What tools are available?'
            ]
        };
    }

    /**
     * Get art-specific context
     */
    async getArtContext() {
        return {
            purpose: 'Digital art showcase and gallery',
            features: [
                'Art gallery showcase',
                'Artistic style discussion',
                'Design techniques',
                'Character design exploration'
            ],
            dataTypes: ['art_gallery', 'design_analysis', 'artistic_style'],
            suggestions: [
                'What is your artistic style?',
                'How do you approach character design?',
                'Tell me about this piece',
                'What software do you use?'
            ]
        };
    }

    /**
     * Get Celeste character context
     */
    async getCelesteContext() {
        return {
            purpose: 'Character page about Celeste AI',
            features: [
                'Character information',
                'Personality exploration',
                'Background story',
                'Character showcase'
            ],
            dataTypes: ['character_info', 'personality', 'background'],
            suggestions: [
                'Who are you really?',
                'What is your personality like?',
                'Are you actually an AI?',
                'Tell me something weird about yourself'
            ]
        };
    }

    /**
     * Get references context
     */
    async getReferencesContext() {
        return {
            purpose: 'Character design references and anatomy',
            features: [
                'Character references',
                'Design inspiration',
                'Anatomy studies',
                'Color palettes'
            ],
            dataTypes: ['character_references', 'design_inspiration', 'anatomy'],
            suggestions: [
                'Explain the character design',
                'What is the design inspiration?',
                'How did you choose colors?',
                'Tell me about the anatomy'
            ]
        };
    }

    /**
     * Get doujin context
     */
    async getDoujinContext() {
        return {
            purpose: 'Manga and doujinshi projects',
            features: [
                'Manga project information',
                'Story summaries',
                'Character discussions',
                'Publication information'
            ],
            dataTypes: ['manga_projects', 'storylines', 'characters'],
            suggestions: [
                'Tell me about Fall of Kirara',
                'What is the plot?',
                'Where can I read it?',
                'When is it available?'
            ]
        };
    }

    /**
     * Get links context
     */
    async getLinksContext() {
        return {
            purpose: 'Social media and external links',
            features: [
                'Social media links',
                'Platform connections',
                'External resources',
                'Contact information'
            ],
            dataTypes: ['social_links', 'platforms', 'connections'],
            suggestions: [
                'Where can I find whykusanagi?',
                'What is your Twitch?',
                'Do you have a Discord?',
                'Where is your shop?'
            ]
        };
    }

    /**
     * Get tools context
     */
    async getToolsContext() {
        return {
            purpose: 'Interactive tools and utilities',
            features: [
                'Countdown timers',
                'Utility calculators',
                'Resource downloads',
                'Interactive tools'
            ],
            dataTypes: ['tools', 'utilities', 'resources'],
            suggestions: [
                'How do I use this tool?',
                'What is the calculator for?',
                'Can you help me with the countdown?',
                'How does this work?'
            ]
        };
    }

    /**
     * Get privacy context
     */
    async getPrivacyContext() {
        return {
            purpose: 'Privacy policy and legal information',
            features: [
                'Privacy policy',
                'Legal information',
                'Terms of service',
                'Data practices'
            ],
            dataTypes: ['legal', 'privacy', 'terms'],
            suggestions: [
                'What is your privacy policy?',
                'How is my data used?',
                'What are your terms?',
                'Do you track users?'
            ]
        };
    }

    /**
     * Get general context for unknown pages
     */
    async getGeneralContext() {
        return {
            purpose: 'Portfolio and personal website',
            features: [
                'Art and creative work',
                'Portfolio showcase',
                'Character and tools',
                'Social connections'
            ],
            dataTypes: ['general_portfolio'],
            suggestions: [
                'Tell me about your work',
                'Show me your art',
                'What tools do you offer?'
            ]
        };
    }

    /**
     * Load contextual prompt from schemas and capabilities
     */
    loadContextualPrompt() {
        try {
            if (!this.contextSchemas) {
                this.contextualPrompt = this.getDefaultPrompt();
                return;
            }

            const pageType = this.currentContext?.page || 'unknown';
            const pageConfig = this.contextSchemas.page_types?.[pageType];

            if (pageConfig) {
                // Start with page-specific prompt
                let prompt = pageConfig.system_prompt;

                // Add capability information if available
                if (this.capabilities) {
                    const pageCapabilities = this.capabilities.page_specific_capabilities?.[pageType];
                    if (pageCapabilities) {
                        prompt += `\n\nOn this page (${pageType}), you can help with: ${pageCapabilities.can_help_with.join(', ')}`;
                    }
                    // Add general capabilities reference
                    prompt += `\n\nYour core capabilities include: ${Object.keys(this.capabilities.core_capabilities).join(', ')}`;
                    prompt += `\n\nWhen users ask "what can you do" or "what are your abilities", refer to these capabilities and the current page context.`;
                }

                this.contextualPrompt = prompt;
                this.suggestedQueries = pageConfig.suggested_queries;
                console.log('🎭 Context loaded from schemas for page:', pageType);
            } else {
                this.contextualPrompt = this.getDefaultPrompt();
            }
        } catch (error) {
            console.error('❌ Error loading context prompt:', error);
            this.contextualPrompt = this.getDefaultPrompt();
        }
    }

    /**
     * Get default prompt if schemas fail
     */
    getDefaultPrompt() {
        const pageType = this.currentContext?.page || 'unknown';
        const prompts = {
            'home': "Hello! I'm Celeste, your AI assistant. I can help you explore the art gallery, learn about my character, discover tools, or find social media links. What would you like to know?",
            'art': "Hello! I'm Celeste, here to help you explore the art gallery. I can discuss artistic styles, techniques, and help you discover pieces that interest you. What would you like to know?",
            'celeste': "Hello! I'm Celeste AI, your chaotic Onee-san assistant. Ask me anything about who I am, my personality, or what makes me unique. What's on your mind?",
            'references': "Hello! I'm here to explain character designs and artistic references. I can discuss anatomy, color theory, and design inspiration. What would you like to know?",
            'doujin': "Hello! I'm Celeste, guiding you through manga and doujinshi projects. I can summarize stories, discuss characters, and provide information on where to read. What interests you?",
            'links': "Hello! I'm here to help you find and connect on social media. I know all the platforms where whykusanagi can be found. What platform are you looking for?",
            'tools': "Hello! I'm ready to help you understand and use available tools. I can explain how calculators work and help you get the most out of them. What do you need?",
            'privacy': "Hello! I'm here to clarify privacy policies and legal information. I can explain data practices and terms of service. What do you need to know?",
            'default': "Hello, I am CelesteAI. Is there something I can help you with or are you just gonna stare?"
        };
        return prompts[pageType] || prompts.default;
    }

    /**
     * Create UI elements
     */
    createUI() {
        // Create chat button (safe DOM construction — no innerHTML with interpolation)
        this.chatButton = document.createElement('div');
        this.chatButton.className = 'celeste-chat-button';
        const avatarUrl = this.getAssetUrl('https://s3.whykusanagi.xyz/Celeste_Vel_Icon.png');

        const buttonContent = document.createElement('div');
        buttonContent.className = 'celeste-button-content';

        const avatarImg = document.createElement('img');
        avatarImg.src = avatarUrl;
        avatarImg.alt = 'Celeste AI';
        avatarImg.className = 'celeste-avatar';
        avatarImg.addEventListener('error', function() {
            this.style.display = 'none';
            this.parentElement.style.background = 'linear-gradient(135deg, #d94f90 0%, #b61b70 100%)';
        });

        const buttonText = document.createElement('span');
        buttonText.className = 'celeste-button-text';
        buttonText.textContent = 'Chat with Celeste';

        buttonContent.appendChild(avatarImg);
        buttonContent.appendChild(buttonText);
        this.chatButton.appendChild(buttonContent);
        this._trackListener(this.chatButton, 'click', () => this.toggleChat());

        // Create chat window (safe DOM construction — no innerHTML with interpolation)
        this.chatWindow = document.createElement('div');
        this.chatWindow.className = 'celeste-chat-window';
        const headerAvatarUrl = this.getAssetUrl('https://s3.whykusanagi.xyz/Celeste_Vel_Icon.png');

        // Header
        const chatHeader = document.createElement('div');
        chatHeader.className = 'celeste-chat-header';

        const headerContent = document.createElement('div');
        headerContent.className = 'celeste-header-content';

        const headerAvatar = document.createElement('img');
        headerAvatar.src = headerAvatarUrl;
        headerAvatar.alt = 'Celeste AI';
        headerAvatar.className = 'celeste-header-avatar';
        headerAvatar.addEventListener('error', function() { this.style.display = 'none'; });

        const headerInfo = document.createElement('div');
        headerInfo.className = 'celeste-header-info';
        const h3 = document.createElement('h3');
        const h3Strong = document.createElement('strong');
        h3Strong.textContent = 'CelesteAI';
        h3.appendChild(h3Strong);
        const p = document.createElement('p');
        const pStrong = document.createElement('strong');
        pStrong.textContent = 'Your helpful Onee-san assistant';
        p.appendChild(pStrong);
        headerInfo.appendChild(h3);
        headerInfo.appendChild(p);

        headerContent.appendChild(headerAvatar);
        headerContent.appendChild(headerInfo);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'celeste-close-btn';
        closeBtn.textContent = '\u00D7';

        chatHeader.appendChild(headerContent);
        chatHeader.appendChild(closeBtn);

        // Messages container
        const messagesDiv = document.createElement('div');
        messagesDiv.className = 'celeste-chat-messages';

        // Input area
        const inputDiv = document.createElement('div');
        inputDiv.className = 'celeste-chat-input';
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.placeholder = 'Ask Celeste anything...';
        inputField.className = 'celeste-input-field';
        const sendBtn = document.createElement('button');
        sendBtn.className = 'celeste-send-btn';
        sendBtn.textContent = 'Send';
        inputDiv.appendChild(inputField);
        inputDiv.appendChild(sendBtn);

        this.chatWindow.appendChild(chatHeader);
        this.chatWindow.appendChild(messagesDiv);
        this.chatWindow.appendChild(inputDiv);

        // Add event listeners (tracked for cleanup)
        this._trackListener(this.chatWindow.querySelector('.celeste-close-btn'), 'click', () => this.closeChat());
        this._trackListener(this.chatWindow.querySelector('.celeste-send-btn'), 'click', () => this.sendMessage());
        this._trackListener(this.chatWindow.querySelector('.celeste-input-field'), 'keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Add to page
        document.body.appendChild(this.chatButton);
        document.body.appendChild(this.chatWindow);

        // Add CSS
        this.addStyles();
    }

    /**
     * Add CSS styles
     */
    addStyles() {
        // Reuse existing style element if re-initializing
        if (this._styleElement) return;
        const style = document.createElement('style');
        this._styleElement = style;
        style.textContent = `
            .celeste-chat-button {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #0a0a0a 0%, #2d1b4e 50%, #d94f90 100%);
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(217, 79, 144, 0.4);
                transition: all 0.3s ease;
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid rgba(217, 79, 144, 0.3);
            }

            .celeste-chat-button:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 25px rgba(217, 79, 144, 0.6);
                background: linear-gradient(135deg, #2d1b4e 0%, #0a0a0a 50%, #ff69b4 100%);
            }

            .celeste-button-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                color: white;
                text-align: center;
            }

            .celeste-avatar {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                object-fit: cover;
                display: block;
                background: rgba(217, 79, 144, 0.2);
                border: 1px solid rgba(217, 79, 144, 0.4);
            }

            .celeste-button-text {
                font-size: 8px;
                font-weight: bold;
                margin-top: 2px;
            }

            .celeste-chat-window {
                position: fixed;
                bottom: 90px;
                right: 20px;
                width: 350px;
                height: 500px;
                background: linear-gradient(145deg, #0a0a0a 0%, #1a0f2e 100%);
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(217, 79, 144, 0.3);
                display: none;
                flex-direction: column;
                z-index: 1001;
                overflow: hidden;
                border: 1px solid rgba(217, 79, 144, 0.2);
            }

            .celeste-chat-window.open {
                display: flex;
            }

            .celeste-chat-header {
                background: linear-gradient(135deg, #d94f90 0%, #b61b70 50%, #8b1a59 100%);
                color: white;
                padding: 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .celeste-header-content {
                display: flex;
                align-items: center;
            }

            .celeste-header-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                object-fit: cover;
                margin-right: 10px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
            }

            .celeste-header-info h3 {
                margin: 0;
                font-size: 16px;
            }

            .celeste-header-info p {
                margin: 0;
                font-size: 12px;
                opacity: 0.8;
            }

            .celeste-close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .celeste-chat-messages {
                flex: 1;
                padding: 15px;
                overflow-y: auto;
                background: linear-gradient(145deg, #1a0f2e 0%, #0a0a0a 100%);
            }

            .celeste-message {
                margin-bottom: 15px;
                display: flex;
                align-items: flex-start;
            }

            .celeste-message.user {
                justify-content: flex-end;
            }

            .celeste-message-bubble {
                max-width: 80%;
                padding: 10px 15px;
                border-radius: 18px;
                word-wrap: break-word;
            }

            .celeste-message.celeste .celeste-message-bubble {
                background: linear-gradient(135deg, #2d1b4e 0%, #1a0f2e 100%);
                color: #fdf3f8;
                border-bottom-left-radius: 5px;
                border: 1px solid rgba(217, 79, 144, 0.2);
            }

            .celeste-message.user .celeste-message-bubble {
                background: linear-gradient(135deg, #d94f90 0%, #b61b70 100%);
                color: white;
                border-bottom-right-radius: 5px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .celeste-chat-input {
                padding: 15px;
                background: linear-gradient(145deg, #0a0a0a 0%, #1a0f2e 100%);
                border-top: 1px solid rgba(217, 79, 144, 0.2);
                display: flex;
                gap: 10px;
            }

            .celeste-input-field {
                flex: 1;
                padding: 10px 15px;
                border: 1px solid rgba(217, 79, 144, 0.3);
                border-radius: 25px;
                outline: none;
                font-size: 14px;
                background: rgba(45, 27, 78, 0.5);
                color: white;
                backdrop-filter: blur(10px);
            }

            .celeste-input-field:focus {
                border-color: #d94f90;
                background: rgba(217, 79, 144, 0.2);
            }

            .celeste-input-field::placeholder {
                color: rgba(255, 255, 255, 0.5);
            }

            .celeste-send-btn {
                background: linear-gradient(135deg, #d94f90 0%, #b61b70 100%);
                color: white;
                border: none;
                border-radius: 25px;
                padding: 10px 20px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .celeste-send-btn:hover {
                transform: scale(1.05);
            }

            .celeste-typing {
                display: flex;
                align-items: center;
                gap: 5px;
                color: rgba(255, 255, 255, 0.7);
                font-style: italic;
            }

            .celeste-typing-dots {
                display: flex;
                gap: 3px;
            }

            .celeste-typing-dot {
                width: 6px;
                height: 6px;
                background: #d94f90;
                border-radius: 50%;
                animation: celeste-typing 1.4s infinite ease-in-out;
            }

            .celeste-typing-dot:nth-child(1) { animation-delay: -0.32s; }
            .celeste-typing-dot:nth-child(2) { animation-delay: -0.16s; }

            @keyframes celeste-typing {
                0%, 80%, 100% { transform: scale(0); }
                40% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Toggle chat window
     */
    toggleChat() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.chatWindow.classList.add('open');
            this.chatButton.style.display = 'none';
            this.showWelcomeMessage();
        } else {
            this.chatWindow.classList.remove('open');
            this.chatButton.style.display = 'flex';
        }
    }

    /**
     * Close chat window
     */
    closeChat() {
        this.isOpen = false;
        this.chatWindow.classList.remove('open');
        this.chatButton.style.display = 'flex';
    }

    /**
     * Show welcome message
     */
    showWelcomeMessage() {
        if (this.conversationHistory.length === 0) {
            const welcomeMessage = this.getWelcomeMessage();
            this.addMessage('celeste', welcomeMessage);
        }
    }

    /**
     * Get user-friendly welcome message
     */
    getWelcomeMessage() {
        const pageType = this.currentContext?.page || 'unknown';
        const welcomeMessages = {
            'home': "Hello there! I'm Celeste, your helpful assistant for this portfolio! I can help you explore the art, learn about whykusanagi, and discover all the amazing projects here. What would you like to know?",
            'art': "Hi! I'm Celeste, here to help you explore the art gallery! I can discuss artistic styles, techniques, and help you discover pieces that interest you. What would you like to know?",
            'celeste': "Hello! I'm Celeste AI, your chaotic Onee-san assistant. Ask me anything about who I am, my personality, or what makes me unique. What's on your mind?",
            'references': "Hello! I'm here to explain character designs and references. I can discuss anatomy, color theory, and design inspiration. What would you like to know?",
            'doujin': "Hello! I'm Celeste, guiding you through manga projects. I can summarize stories, discuss characters, and provide information on where to read. What interests you?",
            'links': "Hello! I'm here to help you find and connect with whykusanagi on social media! I know all the platforms where whykusanagi can be found. What platform are you looking for?",
            'tools': "Hello! I'm ready to help you understand and use available tools. I can explain how various utilities work. What do you need?",
            'privacy': "Hello! I'm here to clarify privacy policies and legal information. I can explain data practices and terms of service. What do you need to know?",
            'default': "Hello! I'm Celeste, your helpful assistant! How can I help you today?"
        };
        return welcomeMessages[pageType] || welcomeMessages.default;
    }

    /**
     * Add message to chat
     */
    addMessage(sender, text) {
        const messageContainer = this.chatWindow.querySelector('.celeste-chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `celeste-message ${sender}`;
        const bubble = document.createElement('div');
        bubble.className = 'celeste-message-bubble';
        bubble.textContent = text;
        messageDiv.appendChild(bubble);
        messageContainer.appendChild(messageDiv);
        messageContainer.scrollTop = messageContainer.scrollHeight;

        // Store in conversation history
        this.conversationHistory.push({ sender, text, timestamp: new Date() });
    }

    /**
     * Show typing indicator
     */
    showTyping() {
        const messageContainer = this.chatWindow.querySelector('.celeste-chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'celeste-message celeste';

        // Safe DOM construction — no innerHTML
        const bubble = document.createElement('div');
        bubble.className = 'celeste-message-bubble';
        const typing = document.createElement('div');
        typing.className = 'celeste-typing';
        typing.appendChild(document.createTextNode('Celeste is typing'));
        const dots = document.createElement('div');
        dots.className = 'celeste-typing-dots';
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'celeste-typing-dot';
            dots.appendChild(dot);
        }
        typing.appendChild(dots);
        bubble.appendChild(typing);
        typingDiv.appendChild(bubble);
        messageContainer.appendChild(typingDiv);
        messageContainer.scrollTop = messageContainer.scrollHeight;
        return typingDiv;
    }

    /**
     * Remove typing indicator
     */
    removeTyping(typingDiv) {
        if (typingDiv && typingDiv.parentNode) {
            typingDiv.parentNode.removeChild(typingDiv);
        }
    }

    /**
     * Send message
     */
    async sendMessage() {
        const inputField = this.chatWindow.querySelector('.celeste-input-field');
        const message = inputField.value.trim();

        if (!message) return;

        // Add user message
        this.addMessage('user', message);
        inputField.value = '';

        // Show typing indicator
        const typingDiv = this.showTyping();

        try {
            // Send to Celeste AI
            const response = await this.sendToCeleste(message);
            this.removeTyping(typingDiv);
            this.addMessage('celeste', response);
        } catch (error) {
            this.removeTyping(typingDiv);
            this.addMessage('celeste', 'Sorry, I encountered an error. Please try again.');
            console.error('❌ Error sending message to Celeste:', error);
        }
    }

    /**
     * Send message to Celeste AI with timeout and error handling
     * Uses secure backend proxy instead of direct API calls
     *
     * SECURITY: Browser never sees the API credential. Backend handles authentication.
     */
    async sendToCeleste(message) {
        // Build system prompt with capability context
        const systemPrompt = this.buildEnhancedSystemPrompt();

        // Get recent history for context
        const recentHistory = this.conversationHistory.slice(-5);

        // Create abort controller for timeout (45 second timeout)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);

        try {
            // Call backend proxy endpoint (configurable via this.proxyUrl)
            // Backend proxy handles authentication with CELESTE_AGENT_KEY
            // Browser never needs to know the credential
            const proxyEndpoint = `${this.proxyUrl}/api/chat`;
            const response = await fetch(proxyEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                    // ✅ NO Authorization header needed - backend is authenticated
                },
                body: JSON.stringify({
                    message: message,
                    system_prompt: systemPrompt,
                    history: recentHistory
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                console.error(`❌ API Error: HTTP ${response.status}`);

                if (response.status === 401) {
                    return 'Authentication error - invalid API key. Check server configuration.';
                } else if (response.status === 503) {
                    return 'The service is currently unavailable. Please try again in a moment.';
                } else {
                    return `API error (${response.status}). Please try again.`;
                }
            }

            const data = await response.json();

            // Handle error responses from backend
            if (data.error) {
                console.error('❌ Backend error:', data.error);
                return `Service error: ${data.error}`;
            }

            // Handle successful response from Celeste API
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                console.error('❌ Invalid API response structure:', data);
                return 'I received an empty response. Could you rephrase your question?';
            }

            return data.choices[0].message.content;

        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                console.error('⏱️ Request timeout after 45 seconds');
                return 'Your request took too long to process. This might be a complex question - try rephrasing it more simply.';
            } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                console.error('❌ Network error:', error);
                return 'Network connection error. Please check your internet and try again.';
            } else {
                console.error('❌ Error communicating with Celeste:', error);
                return 'An unexpected error occurred. Please try again.';
            }
        }
    }

    /**
     * Build enhanced system prompt with capability context
     */
    buildEnhancedSystemPrompt() {
        const pageType = this.currentContext?.page || 'unknown';

        // Use celeste_essence.json from celesteCLI if available
        if (this.celesteEssence) {
            let prompt = this.celesteEssence.description || this.celesteEssence.character || '';

            // Add page context
            prompt += `\n\nCurrent page context: ${pageType}`;

            // Add routing notice if enabled
            if (this.celesteEssence.routing?.enabled && this.routingRules) {
                prompt += '\n\nNote: NIKKE game queries should be handled with game-specific data. Detect game-related questions and respond with available game information.';
            }

            return prompt;
        }

        // Fallback to default prompt
        const basePrompt = this.getDefaultPrompt();
        if (this.capabilities) {
            const capSummary = this.buildCapabilitySummary();
            return `${basePrompt}\n\n[Available Capabilities]\n${capSummary}`;
        }

        return basePrompt;
    }

    /**
     * Detect user intent from message using routing rules
     */
    detectIntent(message) {
        if (!this.routingRules) return 'general';

        const lowerMessage = message.toLowerCase();
        const nikkeKeywords = this.routingRules.nikke_detection?.keywords || [];
        const nikkePatterns = this.routingRules.nikke_detection?.patterns || [];

        // Check keywords
        for (const keyword of nikkeKeywords) {
            if (lowerMessage.includes(keyword.toLowerCase())) {
                return 'nikke';
            }
        }

        // Check regex patterns
        for (const pattern of nikkePatterns) {
            try {
                const regex = new RegExp(pattern, 'i');
                if (regex.test(message)) {
                    return 'nikke';
                }
            } catch (e) {
                console.warn('Invalid regex pattern:', pattern);
            }
        }

        return 'general';
    }

    /**
     * Build a concise summary of capabilities for the prompt
     */
    buildCapabilitySummary() {
        if (!this.capabilities || !this.capabilities.core_capabilities) {
            return 'No capabilities loaded.';
        }

        const caps = this.capabilities.core_capabilities;
        const summary = Object.keys(caps).slice(0, 4).map(key => {
            const cap = caps[key];
            return `- ${cap.description}`;
        }).join('\n');

        return summary;
    }

    /**
     * Get environment-aware asset URL
     * Uses AssetConfig if available, otherwise returns original URL
     */
    getAssetUrl(url) {
        if (window.AssetConfig && typeof window.AssetConfig.convertUrl === 'function') {
            return window.AssetConfig.convertUrl(url);
        }
        return url;
    }

    /**
     * Generate a unique session ID
     */
    generateSessionId() {
        return 'celeste_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Detect proxy URL from current page context
     * Production: uses same domain (Cloudflare Worker handles it)
     * Local dev: uses port 5001 (Docker mapping)
     */
    detectProxyUrl() {
        const hostname = window.location.hostname;
        
        // Production: use same domain (Cloudflare Worker handles it)
        if (hostname.includes('whykusanagi.xyz')) {
            return window.location.origin; // https://whykusanagi.xyz
        }
        
        // Local dev: use port 5001 (Docker maps container:5000 -> host:5001)
        const currentPort = window.location.port;
        if (currentPort === '8000' || currentPort === '') {
            return 'http://localhost:5001';
        }
        
        // Default fallback
        return 'http://localhost:5000';
    }
}

// Initialize Celeste Agent when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Don't initialize on privacy page
    if (window.location.pathname.includes('privacy')) {
        return;
    }

    // Destroy previous instance if it exists (SPA re-init safety)
    if (window.CelesteAgent && typeof window.CelesteAgent.destroy === 'function') {
        window.CelesteAgent.destroy();
    }

    const celesteAgent = new CelesteAgent();
    celesteAgent.initialize();

    // Make it globally available
    window.CelesteAgent = celesteAgent;
});

// Update context on page navigation (don't re-create UI, just refresh context)
window.addEventListener('popstate', () => {
    if (window.CelesteAgent) {
        window.CelesteAgent.updateContext();
    }
});
