"use client";

import { useEffect, useState } from "react";
import Editor from "react-monaco-editor";
import { Button } from "./ui/button";

export default function MonacoEditor() {
  const handleSubmit = async () => {};

  return (
    <div className="w-full border">
      <form action="#" onSubmit={handleSubmit} >
        <div className="">
          <Editor
            height="70vh"
            defaultValue='Deno.serve(req => new Response("Hello!"));'
          />
        </div>
        <div className="flex justify-between pt-2">
          <div className="flex items-center space-x-5"></div>
          <div className="flex-shrink-0">
            <Button type="submit">Submit</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
