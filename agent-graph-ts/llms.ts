import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";

type ModelName = "gpt-4o" | "gpt-4o-mini" | "claude-35";

export const createModel = (modelName: ModelName) => {
  if (modelName === "gpt-4o") {
    return new ChatOpenAI({ model: "gpt-4o" });
  } else if (modelName === "gpt-4o-mini") {
    return new ChatOpenAI({ model: "gpt-4o-mini" });
  } else if (modelName === "claude-35") {
    return new ChatAnthropic({ model: "claude-3-5-sonnet-20240620" });
  }

  throw new Error(`Model ${modelName} not found`);
};
