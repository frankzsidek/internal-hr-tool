import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PROMPT = `Create a birthday card image celebrating Ben's 30th birthday. The image must NOT contain any person.
Visual elements to include:

A Honda CBR 650 motorcycle as a central element
Coding-related imagery (e.g., a laptop displaying code, floating code snippets, syntax on screen, or a stylized terminal window)
A "CEO" nameplate, badge, or desk sign visible in the scene
A festive birthday card aesthetic (subtle confetti, balloons, or warm lighting)

Text on the card:

Headline: "Happy 30th Birthday, Ben!"
Personal message: "Three decades in, and you're already riding fast, coding faster, and running the show. Wishing you a year as bold as your bike, as sharp as your code, and as unstoppable as you are. Cheers to 30, Ben!"
A humorous tag at the bottom: "It's a birthday card — but I heard older people like to get these."

Style: Clean, modern, vibrant, slightly playful. Landscape orientation. No human figures or faces anywhere in the image.`;

const CARD_TEXT = `🎂 *Happy 30th Birthday, Ben!*

Three decades in, and you're already riding fast, coding faster, and running the show. Wishing you a year as bold as your bike, as sharp as your code, and as unstoppable as you are. Cheers to 30, Ben!

_It's a birthday card — but I heard older people like to get these._ 🏍️`;

export async function POST(req: NextRequest) {
  // Validate request is coming from same origin (CSRF protection)
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (origin && host && !origin.includes(host.split(':')[0])) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
  }

  try {
    // 1. Generate image with Gemini
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: PROMPT,
      config: { responseModalities: ['TEXT', 'IMAGE'] },
    });

    let imageBase64: string | null = null;
    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.mimeType?.startsWith('image/')) {
        imageBase64 = part.inlineData.data ?? null;
        break;
      }
    }

    if (!imageBase64) {
      return NextResponse.json({ error: 'Gemini did not return an image' }, { status: 502 });
    }

    // 2. Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(
      `data:image/png;base64,${imageBase64}`,
      {
        folder: 'hr-birthday-cards',
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      }
    );

    return NextResponse.json({
      imageUrl: uploadResult.secure_url,
      text: CARD_TEXT,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[birthday-card]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
