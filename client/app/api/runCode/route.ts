import { NextResponse } from 'next/server';
import axios from 'axios';

function getFileExtension(language: string): string {
  const extensionMap: { [key: string]: string } = {
    python: "py",
    javascript: "js",
    java: "java",
    cpp: "cpp"
  };
  return extensionMap[language] || "txt";
}

export async function POST(request: Request) {
  const body = await request.json();

  const url = "https://onecompiler-apis.p.rapidapi.com/api/v1/run";

  const payload = {
    language: body.language,
    stdin: "",
    files: [
      {
        name: `Runner.${getFileExtension(body.language)}`,
        content: body.code
      }
    ]
  };

  const headers = {
    'Content-Type': 'application/json',
    'x-rapidapi-host': 'onecompiler-apis.p.rapidapi.com',
    'x-rapidapi-key': process.env.RAPIDAPI_KEY
  };

  try {
    const response = await axios.post(url, payload, { headers });
    console.log(response)
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error running code:', error);
    return NextResponse.json({ error: 'Failed to run code' }, { status: 500 });
  }
}
