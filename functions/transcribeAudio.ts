import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.73.1';

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { audioUrl } = await req.json();

    if (!audioUrl) {
      return Response.json({ error: 'No audio URL provided' }, { status: 400 });
    }

    // Télécharger le fichier audio
    const audioResponse = await fetch(audioUrl);
    const audioBlob = await audioResponse.blob();
    
    // Convertir en File pour OpenAI
    const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'fr',
    });

    return Response.json({
      text: transcription.text
    });

  } catch (error) {
    console.error('Error transcribing audio:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});