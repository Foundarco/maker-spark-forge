import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/hq/ai-gateway.server";

export const Route = createFileRoute("/api/hq/assistant")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, module } = (await request.json()) as {
          messages?: UIMessage[];
          module?: string;
        };
        if (!Array.isArray(messages)) {
          return new Response("messages required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        const systemPrompt = `You are the Clovr HQ assistant — an AI copilot embedded inside an internal operations platform used by staff at Clovr Lab, a 3D printer company.

You help with any operations question: engineering, manufacturing, sales, customer service, HR, finance, marketing, R&D, and general company operations.

The user is currently on module: ${module ?? "unknown"}.

Be concise, direct, and practical. Use markdown. When you don't know something specific about the company's data (real customer records, real orders, etc.), say so — the HQ platform's real data integrations are still being built.`;

        const result = streamText({
          model,
          system: systemPrompt,
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});
