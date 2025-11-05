import { createClient } from "@/lib/supabase/server";
import { NextResponse, NextRequest } from "next/server";
import { decryptAPIKey } from "@/lib/encryption";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { toolId } = body;

    if (!toolId) {
      return NextResponse.json(
        { error: "Tool ID is required" },
        { status: 400 },
      );
    }

    // Get user's tool configuration with provider details
    const { data: userTool, error: toolError } = await supabase
      .from("user_ai_tools")
      .select(
        `
        *,
        ai_providers (
          provider_key,
          name,
          category
        )
      `,
      )
      .eq("id", toolId)
      .eq("user_id", user.id)
      .single();

    if (toolError || !userTool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    }

    try {
      const provider = userTool.ai_providers as any;
      let testResult = { success: false, message: "", details: "" };

      // Local tools don't need API key testing
      if (!userTool.api_key_encrypted) {
        if (provider.provider_key === "lmstudio") {
          testResult = await testLMStudio();
        } else {
          testResult = {
            success: true,
            message: "Local tool configured successfully",
            details: "No API key required",
          };
        }
      } else {
        // Decrypt API key for testing
        const apiKey = decryptAPIKey(userTool.api_key_encrypted);

        // Test connection based on provider
        switch (provider.provider_key) {
          case "openai":
          case "dalle":
            testResult = await testOpenAI(apiKey);
            break;
          case "anthropic":
            testResult = await testAnthropic(apiKey);
            break;
          case "google":
            testResult = await testGoogle(apiKey);
            break;
          case "elevenlabs":
            testResult = await testElevenLabs(apiKey);
            break;
          case "stability":
            testResult = await testStability(apiKey);
            break;
          case "whisper":
            testResult = await testOpenAI(apiKey); // Uses same key as OpenAI
            break;
          default:
            testResult = {
              success: false,
              message: `Testing not yet implemented for ${provider.name}`,
              details: "Provider test will be added soon",
            };
        }
      }

      // Update test status in database
      await supabase
        .from("user_ai_tools")
        .update({
          test_status: testResult.success ? "success" : "failed",
          last_tested_at: new Date().toISOString(),
        })
        .eq("id", toolId);

      return NextResponse.json({
        success: testResult.success,
        message: testResult.message,
        details: testResult.details,
      });
    } catch (testError: any) {
      // Update as failed
      await supabase
        .from("user_ai_tools")
        .update({
          test_status: "failed",
          last_tested_at: new Date().toISOString(),
        })
        .eq("id", toolId);

      return NextResponse.json({
        success: false,
        message: "Connection test failed",
        details: testError.message,
      });
    }
  } catch (error: any) {
    console.error("AI tools test error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Test functions for each provider

async function testOpenAI(apiKey: string) {
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (response.ok) {
      const data = await response.json();
      const modelCount = data.data?.length || 0;
      return {
        success: true,
        message: "OpenAI API key is valid!",
        details: `Connected successfully. ${modelCount} models available.`,
      };
    } else {
      const error = await response.json();
      return {
        success: false,
        message: error.error?.message || "Invalid API key",
        details: "Please check your API key and try again",
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: "Connection failed",
      details: error.message,
    };
  }
}

async function testAnthropic(apiKey: string) {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 10,
        messages: [{ role: "user", content: "Hi" }],
      }),
    });

    if (response.ok) {
      return {
        success: true,
        message: "Claude API key is valid!",
        details: "Connected successfully to Anthropic API",
      };
    } else {
      const error = await response.json();
      return {
        success: false,
        message: error.error?.message || "Invalid API key",
        details: "Please check your API key and try again",
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: "Connection failed",
      details: error.message,
    };
  }
}

async function testGoogle(apiKey: string) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`,
    );

    if (response.ok) {
      const data = await response.json();
      const modelCount = data.models?.length || 0;
      return {
        success: true,
        message: "Google API key is valid!",
        details: `Connected successfully. ${modelCount} Gemini models available.`,
      };
    } else {
      return {
        success: false,
        message: "Invalid API key",
        details: "Please check your Google AI Studio API key",
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: "Connection failed",
      details: error.message,
    };
  }
}

async function testElevenLabs(apiKey: string) {
  try {
    const response = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": apiKey },
    });

    if (response.ok) {
      const data = await response.json();
      const voiceCount = data.voices?.length || 0;
      return {
        success: true,
        message: "ElevenLabs API key is valid!",
        details: `Connected successfully. ${voiceCount} voices available.`,
      };
    } else {
      return {
        success: false,
        message: "Invalid API key",
        details: "Please check your ElevenLabs API key",
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: "Connection failed",
      details: error.message,
    };
  }
}

async function testStability(apiKey: string) {
  try {
    const response = await fetch("https://api.stability.ai/v1/user/account", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: "Stability AI API key is valid!",
        details: `Connected successfully. Email: ${data.email}`,
      };
    } else {
      return {
        success: false,
        message: "Invalid API key",
        details: "Please check your Stability AI API key",
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: "Connection failed",
      details: error.message,
    };
  }
}

async function testLMStudio() {
  const endpoint = process.env.API_GATEWAY_URL
    ? `${process.env.API_GATEWAY_URL}/models`
    : "http://10.10.10.105:1234/v1/models";

  try {
    const response = await fetch(endpoint, {
      headers: process.env.API_GATEWAY_URL
        ? {
            "ngrok-skip-browser-warning": "true",
          }
        : {},
    });

    if (response.ok) {
      const data = await response.json();
      const modelCount = data.data?.length || 0;
      return {
        success: true,
        message: "LM Studio is running!",
        details: `Connected successfully. ${modelCount} local models available.`,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: "LM Studio is not reachable",
      details: "Make sure LM Studio is running and accessible",
    };
  }

  return {
    success: false,
    message: "LM Studio connection failed",
    details: "Check if the service is running",
  };
}
