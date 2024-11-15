import { openai } from "../../openai/client";
import { OPEN_AI_MODEL } from "../../consts";
import type { ActionType } from "./types";
import { whoIsChillpill } from "@/lib/openai/instructions";

export interface TaskGeneration {
  taskId: string;
  task: string;
  taskReasoning: string;
  action: ActionType;
}

export async function generateTask(
  llpPlan: string,
  llpPlanReasoning: string
): Promise<TaskGeneration> {
  const availableActions: ActionType[] = ["send_email", "send_slack_message"];

  const response = await openai.chat.completions.create({
    model: OPEN_AI_MODEL,
    messages: [
      {
        role: "system",
        content: `${whoIsChillpill}, analyzing your low-level plan to determine the next specific task to perform.
          Available actions: ${availableActions.join(", ")}`,
      },
      {
        role: "user",
        content: `Based on the low-level plan: ${llpPlan}\nAnd reasoning: ${llpPlanReasoning}\n\nDetermine the next specific task to perform.`,
      },
    ],
    functions: [
      {
        name: "provideTaskDetails",
        description: "Provide structured task details",
        parameters: {
          type: "object",
          properties: {
            taskId: {
              type: "string",
              description: "UUID for the task",
            },
            task: {
              type: "string",
              description: "Specific task to perform",
            },
            taskReasoning: {
              type: "string",
              description: "Reasoning for choosing this task",
            },
            action: {
              type: "string",
              enum: availableActions,
              description: "The type of action to perform",
            },
          },
          required: ["taskId", "task", "taskReasoning", "action"],
        },
      },
    ],
    function_call: { name: "provideTaskDetails" },
  });

  const functionCall = response.choices[0].message.function_call;
  if (!functionCall?.arguments) {
    throw new Error("Failed to generate task");
  }

  return JSON.parse(functionCall.arguments);
}