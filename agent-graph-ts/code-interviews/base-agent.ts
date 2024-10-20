import { AIMessage } from "@langchain/core/messages";
import { Annotation, END, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import * as hub from "langchain/hub";
import { createModel } from "../llms";

const AgentStateAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  coding_question: Annotation<string>,
  editor_content: Annotation<string>,
});

type AgentState = typeof AgentStateAnnotation.State;

const chatbot = async (state: AgentState) => {
  const prompt = await hub.pull("leetmock-v1");
  const model = createModel("gpt-4o")
    .bind({ stop: ["SILENT"] })
    .withConfig({ tags: ["chatbot"] });

  const chain = prompt.pipe(model);

  const response = await chain.invoke({
    coding_question: state.coding_question,
    editor_content: state.editor_content,
    messages: state.messages,
  });

  const message = response.content.length === 0 ? new AIMessage("SILENT") : response;

  return {
    messages: [message],
  };
};

const graphBuilder = new StateGraph(AgentStateAnnotation)
  .addNode("chatbot", chatbot)
  .addEdge(START, "chatbot")
  .addEdge("chatbot", END);

export const graph = graphBuilder.compile();
