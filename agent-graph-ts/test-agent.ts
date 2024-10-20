import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

const SubgraphStateAnnotation = Annotation.Root({
  foo: Annotation<string>, // note that this key is shared with the parent graph state
  bar: Annotation<string>,
});

type SubgraphState = typeof SubgraphStateAnnotation.State;

const subgraphNode1 = async (state: SubgraphState) => {
  return { bar: "bar" + state.bar };
};

const subgraphNode2 = async (state: SubgraphState) => {
  // note that this node is using a state key ('bar') that is only available in the subgraph
  // and is sending update on the shared state key ('foo')
  return { foo: state.foo + state.bar };
};

const subgraphBuilder = new StateGraph(SubgraphStateAnnotation)
  .addNode("subgraphNode1", subgraphNode1)
  .addNode("subgraphNode2", subgraphNode2)
  .addEdge(START, "subgraphNode1")
  .addEdge("subgraphNode1", "subgraphNode2");

const subgraph = subgraphBuilder.compile();

// Define parent graph
const ParentStateAnnotation = Annotation.Root({
  foo: Annotation<string>,
});

type ParentState = typeof ParentStateAnnotation.State;

const node1 = async (state: ParentState): Promise<Partial<ParentState>> => {
  return {
    foo: "hi! " + state.foo,
  };
};

const builder = new StateGraph(ParentStateAnnotation)
  .addNode("node1", node1)
  .addNode("node2", subgraph)
  .addEdge(START, "node1")
  .addEdge("node1", "node2")
  .addEdge("node2", END);

export const graph = builder.compile();
