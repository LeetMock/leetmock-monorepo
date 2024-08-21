import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  const body = await request.json();

  const url = "https://onecompiler-apis.p.rapidapi.com/api/v1/run";

  const payload = {
    language: "python",
    stdin: "Peter",
    files: [
      {
        name: "Runner.py",
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
