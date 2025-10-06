import { useState, useRef } from 'react';

export const useDeepgramTranscription = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(!!navigator.mediaDevices?.getUserMedia);
  const [error, setError] = useState('');  // Nuevo: para debug
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const onTranscriptRef = useRef<((text: string) => void) | null>(null);

  // Backend URL – ¡CAMBIALA por tu ngrok actual o localhost:5000!
  const BACKEND_URL = 'https://chloritic-margarette-unhorizontal.ngrok-free.dev/transcribe';  // O 'http://localhost:5000/transcribe'

  const startRecording = async () => {
    if (!isSupported) {
      setError('Micrófono no soportado');
      return;
    }

    try {
      console.log('🎤 Iniciando grabación...');  // Log
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,  // Mejora calidad
          noiseSuppression: true 
        } 
      });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });  // Cambié a webm para compatibilidad
      audioChunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log('📹 Blob creado, tamaño:', audioBlob.size);  // Log para verificar grabación
        
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result?.toString().split(',')[1];
          if (base64Audio) {
            console.log('📤 Enviando a backend...');  // Log
            try {
              const resp = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audio_base64: base64Audio }),
              });
              if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
              const data = await resp.json();
              console.log('✅ Respuesta del backend:', data);  // Log
              if (data.status === 'ok' && onTranscriptRef.current) {
                onTranscriptRef.current(data.transcripcion);
              } else {
                setError('Error en transcripción: ' + (data.message || 'Desconocido'));
              }
            } catch (fetchErr) {
              console.error('❌ Error en fetch:', fetchErr);
              setError('Error conectando al backend: ' + fetchErr.message);
            }
          } else {
            setError('No se pudo convertir el audio');
          }
        };
        reader.readAsDataURL(audioBlob);
        
        // Detén el stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current = recorder;
      recorder.start(1000);  // Graba en chunks de 1s para mejor rendimiento
      setIsRecording(true);
      setError('');  // Limpia errores
    } catch (err) {
      console.error('❌ Error al acceder al micrófono:', err);
      setError('Permiso denegado o error de micrófono');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      console.log('⏹️ Deteniendo grabación...');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribe = (onTranscript: (text: string) => void) => {
    onTranscriptRef.current = onTranscript;
    startRecording();
  };

  return {
    isSupported,
    isRecording,
    error,  // Nuevo: para mostrar en UI
    transcribe,
    stopRecording,
  };
};