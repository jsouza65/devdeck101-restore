import { NextRequest, NextResponse } from "next/server";

interface NextRequestWithImage extends NextRequest {
  imageUrl: string
}

export async function POST(req: NextRequestWithImage, res: NextResponse) {
  console.log('POST received');

  const { imageUrl } = await req.json();

  return NextResponse.json({ message: 'Teste' }, { status: 200 });
}