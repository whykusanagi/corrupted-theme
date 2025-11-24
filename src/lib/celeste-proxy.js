/**
 * Celeste API Proxy - Shared logic for local dev and Cloudflare Workers
 * Handles secure proxying of Celeste API requests
 */

/**
 * Build messages array from request data
 */
function buildMessages(requestData) {
  const messages = [];
  const { message, system_prompt, history } = requestData;

  // Add system prompt if provided
  if (system_prompt) {
    messages.push({
      role: 'system',
      content: system_prompt
    });
  }

  // Add conversation history
  if (Array.isArray(history)) {
    for (const histMsg of history) {
      if (histMsg.sender === 'user') {
        messages.push({
          role: 'user',
          content: histMsg.text || ''
        });
      } else if (histMsg.sender === 'celeste') {
        messages.push({
          role: 'assistant',
          content: histMsg.text || ''
        });
      }
    }
  }

  // Add current message
  if (message) {
    messages.push({
      role: 'user',
      content: message.trim()
    });
  }

  return messages;
}

/**
 * Handle proxy request - works in both Node.js and Cloudflare Workers
 */
export async function handleProxyRequest(request, env) {
  try {
    // Validate required environment variables
    const agentKey = env.CELESTE_AGENT_KEY || env.CELESTE_API_KEY;
    const agentId = env.CELESTE_AGENT_ID;
    const agentBaseUrl = env.CELESTE_AGENT_BASE_URL;

    if (!agentKey || !agentId || !agentBaseUrl) {
      return new Response(
        JSON.stringify({ error: 'Proxy configuration missing' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    // Only allow POST
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // Parse request body
    let requestData;
    try {
      requestData = await request.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // Validate message
    if (!requestData.message || !requestData.message.trim()) {
      return new Response(
        JSON.stringify({ error: 'Message required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // Build messages array
    const messages = buildMessages(requestData);

    // Call Celeste API
    const celesteUrl = `${agentBaseUrl}/api/v1/chat/completions`;
    const celesteResponse = await fetch(celesteUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${agentKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 400,
        temperature: 0.7,
        stream: false
      })
    });

    // Handle Celeste API errors
    if (celesteResponse.status === 401) {
      return new Response(
        JSON.stringify({ error: 'Authentication failed - invalid API key' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    if (celesteResponse.status === 503) {
      return new Response(
        JSON.stringify({ error: 'Celeste service is currently unavailable' }),
        {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    if (!celesteResponse.ok) {
      return new Response(
        JSON.stringify({ error: `API error: ${celesteResponse.status}` }),
        {
          status: celesteResponse.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // Return successful response
    const celesteData = await celesteResponse.json();
    return new Response(JSON.stringify(celesteData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}

