# LLM Provider Compatibility Matrix

CelesteCLI uses OpenAI's function calling feature to power its skills system. This document explains which LLM providers support skills and which ones require alternative setups.

## Quick Reference

| Provider | Function Calling Support | Status | Notes |
|----------|-------------------------|---------|-------|
| **OpenAI** | ✅ Native | Fully Supported | All models with function calling (gpt-4o, gpt-4o-mini, etc.) |
| **Grok (xAI)** | ✅ OpenAI-Compatible | Fully Supported | Uses OpenAI-compatible API |
| **DigitalOcean** | ⚠️ Cloud Functions Only | Limited | Requires cloud-hosted functions with route attachment |
| **ElevenLabs** | ❓ Unknown | Needs Testing | Not yet tested |
| **Venice.ai** | ❓ Unknown | Needs Testing | Not yet tested |
| **Local Models** | ⚠️ Varies | Depends on Implementation | Some tools support function calling (Ollama with compatible models) |

---

## How Skills Work

CelesteCLI's skills system relies on **OpenAI function calling** (also known as tool calling). Here's how it works:

1. **User asks a question**: "What's the weather in NYC?"
2. **Skills are sent to LLM**: The list of available skills is sent as "tools" in the API request
3. **LLM decides to call a skill**: The LLM recognizes it needs the `get_weather` function
4. **LLM returns a tool call**: Instead of text, it returns structured data: `{"name": "get_weather", "arguments": {"location": "NYC"}}`
5. **Celeste executes the skill**: The skill handler fetches weather data
6. **Result sent back to LLM**: The weather data is sent back to the LLM
7. **LLM generates natural response**: "It's 45°F and cloudy in New York City..."

**This requires the LLM to support structured function calling.** Not all providers support this feature.

---

## Supported Providers

### ✅ OpenAI (Fully Supported)

**API Endpoint**: `https://api.openai.com/v1`
**Function Calling**: Native support
**Models**: gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-3.5-turbo (with function calling)

**Setup**:
```bash
celeste config --set-key YOUR_OPENAI_KEY
celeste config --set-url https://api.openai.com/v1
celeste config --set-model gpt-4o-mini
celeste chat
```

**Why it works**: OpenAI invented function calling and has the most robust implementation.

---

### ✅ Grok (xAI) (Fully Supported)

**API Endpoint**: `https://api.x.ai/v1`
**Function Calling**: OpenAI-compatible API
**Models**: grok-4-1-fast (recommended for tool calling), grok-beta

**Setup**:
```bash
celeste config --set-key YOUR_GROK_KEY
celeste config --set-url https://api.x.ai/v1
celeste config --set-model grok-4-1-fast
celeste chat
```

**Why it works**: Grok uses OpenAI-compatible API, including function calling support. The `grok-4-1-fast` model is specifically trained for agentic tool calling and excels at function calling tasks.

**Testing**: Run provider tests to verify:
```bash
GROK_API_KEY=your-key go test ./cmd/Celeste/llm -run TestGrok_FunctionCalling -v
```

---

### ⚠️ DigitalOcean (Limited Support)

**API Endpoint**: `https://api.digitalocean.com/v2/ai`
**Function Calling**: Requires cloud-hosted functions
**Models**: Various (llama-3, mistral, etc.)

**Limitation**: DigitalOcean AI Agent **does not support local function execution**. Instead:

1. You must deploy each skill as a **cloud function** (DigitalOcean Functions, AWS Lambda, etc.)
2. Attach function URLs to your agent via the DigitalOcean API
3. The agent calls these URLs directly (not your local machine)

**Why skills won't work**:
- CelesteCLI executes skills locally (unit converter, QR code generator, etc.)
- DigitalOcean expects HTTP endpoints in the cloud
- No way to bridge local execution with DigitalOcean's architecture

**Workarounds**:
1. **Use a different provider**: OpenAI, Grok, or other OpenAI-compatible providers
2. **Deploy skills as cloud functions**: Rewrite each skill as an HTTP endpoint and deploy to the cloud
3. **Manual invocation**: Don't use AI-driven skills; call skills manually via command line flags (not implemented in v3.0)

**Documentation**: https://docs.digitalocean.com/products/ai/getting-started/ai-agents/

---

### ❓ ElevenLabs (Needs Testing)

**API Endpoint**: `https://api.elevenlabs.io/v1`
**Function Calling**: Unknown
**Models**: Various (conversational AI models)

**Status**: Not yet tested. ElevenLabs focuses on voice AI, so function calling support is unclear.

**To test**:
```bash
ELEVENLABS_API_KEY=your-key go test ./cmd/Celeste/llm -run TestElevenLabs_FunctionCalling -v
```

If you test this, please contribute findings!

---

### ❓ Venice.ai (Needs Testing)

**API Endpoint**: `https://api.venice.ai/api/v1`
**Function Calling**: Unknown (possibly OpenAI-compatible)
**Models**: venice-uncensored, various uncensored models

**Status**: Not yet tested. Venice.ai may or may not support OpenAI-style function calling.

**To test**:
```bash
VENICE_API_KEY=your-key go test ./cmd/Celeste/llm -run TestVeniceAI_FunctionCalling -v
```

Venice.ai is already used for NSFW skill and image generation, but those use direct API calls, not function calling.

---

### ⚠️ Local Models (Varies)

**Tools**: Ollama, LM Studio, text-generation-webui
**Function Calling**: Depends on model and tool

**Ollama** (with compatible models):
- Some models support function calling (e.g., llama3.1 with tool use)
- Configure like OpenAI:
  ```bash
  celeste config --set-key ollama
  celeste config --set-url http://localhost:11434/v1
  celeste config --set-model llama3.1
  ```
- Test if it works: `go test ./cmd/Celeste/llm -run TestOpenAI_FunctionCalling -v`

**LM Studio**:
- Supports OpenAI-compatible API
- Function calling support depends on loaded model
- Configure similarly to Ollama

**Why it might not work**:
- Many local models don't support structured function calling
- They may hallucinate function calls (produce fake JSON that doesn't work)
- Smaller models struggle with complex tool schemas

---

## Testing Provider Compatibility

To verify if your provider supports skills:

### 1. Run Provider Tests

```bash
# Test OpenAI
OPENAI_API_KEY=your-key go test ./cmd/Celeste/llm -run TestOpenAI_FunctionCalling -v

# Test Grok
GROK_API_KEY=your-key go test ./cmd/Celeste/llm -run TestGrok_FunctionCalling -v

# Test Venice.ai
VENICE_API_KEY=your-key go test ./cmd/Celeste/llm -run TestVeniceAI_FunctionCalling -v
```

### 2. Manual Test

Try using a skill in chat:

```bash
celeste chat
> What's the weather in 10001?
```

**Expected behavior (works)**:
```
👁️ Thinking...
[Celeste calls get_weather skill]
It's 45°F and cloudy in New York City (10001)...
```

**Problem behavior (doesn't work)**:
```
👁️ Thinking...
I don't have access to real-time weather data.
```

If the LLM says it "doesn't have access" or "can't retrieve real-time data", the provider likely doesn't support function calling.

---

## What If My Provider Doesn't Support Skills?

If your LLM provider doesn't support function calling, you have several options:

### Option 1: Switch to a Compatible Provider

Use OpenAI or Grok, which fully support skills:
```bash
celeste config --init openai
celeste config --set-key YOUR_OPENAI_KEY
celeste -config openai chat
```

### Option 2: Use Skills Separately

While CelesteCLI v3.0 doesn't have direct skill invocation flags, you could:
- Use skills via the chat interface with compatible providers only
- Request manual skill invocation flags (contribute to the project!)

### Option 3: Deploy Cloud Functions (Advanced)

For DigitalOcean or similar platforms:
1. Deploy each skill as a cloud function (AWS Lambda, DigitalOcean Functions, Cloudflare Workers)
2. Create HTTP endpoints for each skill
3. Attach these endpoints to your AI agent via provider API
4. Agent calls cloud functions directly

This is complex and requires infrastructure setup.

---

## Contributing

If you test a provider not listed here, please contribute your findings:

1. Run the provider test (see cmd/Celeste/llm/providers_test.go)
2. Document the results (works, doesn't work, partial support)
3. Create a pull request updating this file
4. Include setup instructions and any gotchas

**Providers to test**:
- Anthropic Claude (via API)
- Google Gemini
- Cohere
- Hugging Face Inference API
- Replicate
- Together.ai
- Perplexity AI
- Mistral AI

---

## Technical Details

### OpenAI Function Calling Format

CelesteCLI sends skills in this format:

```json
{
  "model": "gpt-4o-mini",
  "messages": [...],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "Get current weather for a location",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "City name or zip code"
            }
          },
          "required": ["location"]
        }
      }
    }
  ]
}
```

The LLM responds with:

```json
{
  "choices": [{
    "message": {
      "role": "assistant",
      "tool_calls": [{
        "id": "call_abc123",
        "type": "function",
        "function": {
          "name": "get_weather",
          "arguments": "{\"location\": \"NYC\"}"
        }
      }]
    }
  }]
}
```

### Compatibility Checklist

For a provider to support skills, it must:

1. ✅ Accept `tools` array in chat completion requests
2. ✅ Return `tool_calls` in response messages (not just text)
3. ✅ Parse function parameters correctly (JSON schema validation)
4. ✅ Allow sending tool results back to the LLM
5. ✅ Continue the conversation after tool execution

If any of these fail, skills won't work properly.

---

## FAQ

**Q: Can I use skills without function calling?**
A: No, CelesteCLI v3.0 requires function calling. Skills are AI-driven, not manually invoked.

**Q: Will you add support for providers without function calling?**
A: This would require a different architecture (prompt-based skill invocation, which is less reliable). Open an issue to discuss!

**Q: My provider says it supports function calling but skills don't work**
A: Run the provider tests to diagnose. The provider might have partial support or different JSON format requirements.

**Q: Can I use multiple providers (one for chat, one for skills)?**
A: Not currently. Skills are deeply integrated with the chat flow. You'd need custom code to route requests.

**Q: Does streaming work with function calling?**
A: Yes! CelesteCLI uses streaming for all responses, including function calls. The LLM streams the function call data, then streams the final response after skill execution.

---

**Last Updated**: December 3, 2025
**CelesteCLI Version**: 3.0.0
