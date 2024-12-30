"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

interface SpecialObject {
  lc: number;
  type: string;
  id: string[];
  kwargs: { [key: string]: JsonValue };
}

interface StateVisualizerProps {
  state: { [key: string]: JsonValue };
}

const isSpecialObject = (value: any): value is SpecialObject => {
  return (
    value &&
    typeof value === "object" &&
    "lc" in value &&
    "type" in value &&
    "id" in value &&
    "kwargs" in value
  );
};

const MessageView: React.FC<{ message: any }> = ({ message }) => {
  return (
    <div className="bg-gray-100 dark:bg-gray-800/50 p-3 rounded-lg mb-2 border border-gray-200 dark:border-zinc-700">
      <div className="font-semibold text-gray-900 dark:text-zinc-100">{message.kwargs.type}</div>
      <div className="text-sm text-gray-700 dark:text-zinc-300 mt-1">{message.kwargs.content}</div>
      {message.kwargs.id && (
        <div className="text-xs text-gray-500 dark:text-zinc-400 mt-2 font-mono">
          ID: {message.kwargs.id}
        </div>
      )}
    </div>
  );
};

const MessageListView: React.FC<{ messages: any[] }> = ({ messages }) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="space-y-3">
      {messages.map((message, index) => (
        <MessageView key={index} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

const JsonView: React.FC<{ data: JsonValue; level?: number }> = ({ data, level = 0 }) => {
  const [isExpanded, setIsExpanded] = React.useState(level < 2);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  if (typeof data !== "object" || data === null) {
    return (
      <span
        className="text-blue-600 dark:text-blue-400 break-words"
        style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
      >
        {JSON.stringify(data)}
      </span>
    );
  }

  if (Array.isArray(data)) {
    if (data.length > 0 && isSpecialObject(data[0]) && data[0].id[2] === "messages") {
      return <MessageListView messages={data} />;
    }
    return (
      <div>
        <div onClick={toggleExpand} className="cursor-pointer inline-flex items-center">
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <span className="ml-1">Array[{data.length}]</span>
        </div>
        {isExpanded && (
          <div className="pl-4 border-l border-gray-300">
            {data.map((item, index) => (
              <div key={index} className="py-1">
                <JsonView data={item} level={level + 1} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (isSpecialObject(data)) {
    if (data.id[2] === "messages") {
      return <MessageView message={data} />;
    }
    return (
      <div>
        <div onClick={toggleExpand} className="cursor-pointer inline-flex items-center">
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <Badge variant="outline" className="ml-1">
            {data.id.join(".")}
          </Badge>
        </div>
        {isExpanded && (
          <div className="pl-4 border-l border-gray-300">
            {Object.entries(data.kwargs).map(([key, value]) => (
              <div key={key} className="py-1">
                <span className="text-gray-500">{key}: </span>
                <JsonView data={value} level={level + 1} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div onClick={toggleExpand} className="cursor-pointer inline-flex items-center">
        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        <span className="ml-1">Object</span>
      </div>
      {isExpanded && (
        <div className="pl-4 border-l border-gray-200 dark:border-zinc-700">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="py-1">
              <span className="text-gray-500 dark:text-zinc-400">{key}: </span>
              <JsonView data={value} level={level + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const useStateComparison = (state: { [key: string]: JsonValue }) => {
  const prevStateRef = useRef<{ [key: string]: JsonValue }>({});
  const changedFields = useRef<Set<string>>(new Set());

  useEffect(() => {
    changedFields.current.clear();
    Object.keys({ ...state, ...prevStateRef.current }).forEach((key) => {
      if (JSON.stringify(state[key]) !== JSON.stringify(prevStateRef.current[key])) {
        changedFields.current.add(key);
      }
    });
    prevStateRef.current = state;
  }, [state]);

  return changedFields.current;
};

const highlightAnimation = {
  initial: { backgroundColor: "transparent" },
  animate: { backgroundColor: ["#93c5fd33", "#93c5fd66", "transparent"] },
};

const StateCard: React.FC<{ title: string; data: JsonValue; highlight?: boolean }> = ({
  title,
  data,
  highlight,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <motion.div
      initial="initial"
      animate={highlight ? "animate" : "initial"}
      variants={highlightAnimation}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="rounded-lg"
    >
      <Card className="w-full mb-2">
        <CardHeader className="py-3 cursor-pointer" onClick={toggleExpand}>
          <CardTitle className="text-sm font-medium flex items-center">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 mr-2" />
            ) : (
              <ChevronRight className="h-4 w-4 mr-2" />
            )}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "w-full rounded-md overflow-auto border p-4 transition-all duration-300",
              isExpanded ? "max-h-[700px]" : "max-h-[200px]"
            )}
          >
            <JsonView data={data} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const StateVisualizer: React.FC<StateVisualizerProps> = ({ state }) => {
  const [selectedFields, setSelectedFields] = React.useState<string[]>(() => {
    const cachedFields = localStorage.getItem("selectedFields");
    return cachedFields ? JSON.parse(cachedFields) : Object.keys(state);
  });

  const changedFields = useStateComparison(state);

  useEffect(() => {
    localStorage.setItem("selectedFields", JSON.stringify(selectedFields));
  }, [selectedFields]);

  const handleToggle = (value: string) => {
    setSelectedFields((prev) => {
      if (prev.includes(value)) {
        const newSelection = prev.filter((field) => field !== value);
        return newSelection.length === 0 ? Object.keys(state) : newSelection;
      }
      return [...prev, value];
    });
  };

  const toggleAll = () => {
    if (selectedFields.length === Object.keys(state).length) {
      setSelectedFields([Object.keys(state)[0]]);
    } else {
      setSelectedFields(Object.keys(state));
    }
  };

  return (
    <div className="w-full max-w-[1400px] pb-8">
      {Object.keys(state).length === 0 ? (
        <Card>
          <CardContent className="text-center text-gray-500 dark:text-zinc-400 p-4">
            Loading state...
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-2">
          {/* Left side - Toggle Panel */}
          <Card className="w-[220px] p-3 sticky top-4 h-fit">
            <div className="space-y-1">
              <div className="flex items-center justify-between py-1.5 border-b border-gray-200 dark:border-zinc-700">
                <span className="text-sm font-medium dark:text-zinc-100">Show All Fields</span>
                <Switch
                  checked={selectedFields.length === Object.keys(state).length}
                  onCheckedChange={toggleAll}
                />
              </div>
              {Object.keys(state).map((key) => (
                <motion.div
                  key={key}
                  initial="initial"
                  animate={changedFields.has(key) ? "animate" : "initial"}
                  variants={highlightAnimation}
                  className="rounded-lg"
                >
                  <div
                    className={cn(
                      "flex items-center justify-between py-1.5 px-2 rounded-md",
                      selectedFields.includes(key) && "bg-gray-100 dark:bg-zinc-800"
                    )}
                  >
                    <span className="text-xs truncate mr-2 dark:text-zinc-300">{key}</span>
                    <Switch
                      checked={selectedFields.includes(key)}
                      onCheckedChange={() => handleToggle(key)}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Right side - Content */}
          <div className="flex-1 space-y-2 pb-8">
            {Object.entries(state)
              .filter(([key]) => selectedFields.includes(key))
              .map(([key, value]) => (
                <StateCard key={key} title={key} data={value} highlight={changedFields.has(key)} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
