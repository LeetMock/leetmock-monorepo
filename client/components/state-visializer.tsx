"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn, isDefined } from "@/lib/utils";
import React from "react";

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
    <div className="bg-gray-100 dark:bg-gray-800/50 p-3 rounded-lg mb-2 border border-gray-200 dark:border-gray-700">
      <div className="font-semibold text-gray-900 dark:text-gray-100">{message.kwargs.type}</div>
      <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">{message.kwargs.content}</div>
      {message.kwargs.id && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-mono">
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
  if (typeof data !== "object" || data === null) {
    return <span className="text-blue-600 dark:text-blue-400">{JSON.stringify(data)}</span>;
  }

  if (Array.isArray(data)) {
    if (data.length > 0 && isSpecialObject(data[0]) && data[0].id[2] === "messages") {
      return <MessageListView messages={data} />;
    }
    return (
      <div className="pl-4 border-l border-gray-300 max-w-[50rem]">
        {data.map((item, index) => (
          <div key={index} className="py-1">
            <JsonView data={item} level={level + 1} />
          </div>
        ))}
      </div>
    );
  }

  if (isSpecialObject(data)) {
    if (data.id[2] === "messages") {
      return <MessageView message={data} />;
    }
    return (
      <div className="pl-4 border-l border-gray-300 max-w-[50rem]">
        <Badge variant="outline" className="mb-2">
          {data.id.join(".")}
        </Badge>
        {Object.entries(data.kwargs).map(([key, value]) => (
          <div key={key} className="py-1">
            <span className="text-gray-500">{key}: </span>
            <JsonView data={value} level={level + 1} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="pl-4 border-l border-gray-200 dark:border-gray-700">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="py-1">
          <span className="text-gray-500 dark:text-gray-400">{key}: </span>
          <JsonView data={value} level={level + 1} />
        </div>
      ))}
    </div>
  );
};

const NullValueCard: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-[50px]">
      <div className="text-lg font-mono text-gray-400 dark:text-gray-500 px-3 py-1.5 rounded-md inline-block italic">
        null
      </div>
    </div>
  );
};

const PrimitiveValueCard: React.FC<{ value: string | number | boolean | null }> = ({ value }) => {
  if (value === null) {
    return <NullValueCard />;
  }

  const getValueDisplay = () => {
    if (typeof value === "boolean") {
      return (
        <div
          className={cn(
            "text-lg font-mono px-3 py-1.5 rounded-md inline-block",
            value
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
          )}
        >
          {value.toString()}
        </div>
      );
    }

    if (typeof value === "number") {
      return (
        <div className="text-lg font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-md inline-block">
          {value}
        </div>
      );
    }

    return (
      <div className="text-lg font-mono bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-md inline-block">
        "{value}"
      </div>
    );
  };

  return <div className="flex items-center justify-center h-[100px]">{getValueDisplay()}</div>;
};

const StateCard: React.FC<{ title: string; data: JsonValue }> = ({ title, data }) => {
  const isSimpleContent = React.useMemo(() => {
    if (typeof data !== "object" || data === null) return true;
    if (Array.isArray(data) && data.length <= 3) return true;
    if (typeof data === "object" && Object.keys(data).length <= 3) return true;
    return false;
  }, [data]);

  const contentHeight = isSimpleContent ? "h-[50px]" : "h-[700px]";

  if (
    typeof data === "string" ||
    typeof data === "number" ||
    typeof data === "boolean" ||
    !isDefined(data)
  ) {
    return (
      <Card className="w-full mb-2">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <PrimitiveValueCard value={data} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full mb-2">
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("w-full rounded-md border p-3 max-h-[500px] overflow-y-auto")}>
          <JsonView data={data} />
        </div>
      </CardContent>
    </Card>
  );
};

export const StateVisualizer: React.FC<StateVisualizerProps> = ({ state }) => {
  const [selectedFields, setSelectedFields] = React.useState<string[]>(Object.keys(state));

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
          <CardContent className="text-center text-gray-500 p-4">Loading state...</CardContent>
        </Card>
      ) : (
        <div className="flex gap-2">
          {/* Left side - Toggle Panel */}
          <Card className="w-[220px] p-3 sticky top-4 h-fit">
            <div className="space-y-1">
              <div className="flex items-center justify-between py-1.5 border-b">
                <span className="text-sm font-medium">Show All Fields</span>
                <Switch
                  checked={selectedFields.length === Object.keys(state).length}
                  onCheckedChange={toggleAll}
                />
              </div>
              {Object.keys(state).map((key) => (
                <div
                  key={key}
                  className={cn(
                    "flex items-center justify-between py-1.5 px-2 rounded-md",
                    selectedFields.includes(key) && "bg-gray-100 dark:bg-gray-800"
                  )}
                >
                  <span className="text-xs truncate mr-2">{key}</span>
                  <Switch
                    checked={selectedFields.includes(key)}
                    onCheckedChange={() => handleToggle(key)}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Right side - Content */}
          <div className="flex-1 space-y-2 pb-8">
            {Object.entries(state)
              .filter(([key]) => selectedFields.includes(key))
              .map(([key, value]) => (
                <StateCard key={key} title={key} data={value} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
