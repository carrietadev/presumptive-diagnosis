import { useState, useEffect, useRef } from 'react';

export const useVoiceInput = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState('');  // Nuevo: para debug
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onTranscriptRef = useRef<((text: string) => void) | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      console.log('✅ SpeechRecognition soportado');  // Log para debug
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'es-ES';

      recognition.onresult = (event) => {
        console.log('🎤 Resultado recibido:', event.results[0][0].transcript);  // Log
        const transcript = event.results[0][0].transcript;
        if (onTranscriptRef.current) {
          onTranscriptRef.current(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('❌ Error en reconocimiento:', event.error);  // Log detallado
        setError(`Error: ${event.error}`);  // Ej. 'not-allowed' si deniegas permiso
        setIsListening(false);
      };

      recognition.onend = () => {
        console.log('🔚 Reconocimiento terminado');
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn('❌ SpeechRecognition no soportado en este navegador');
      setError('No soportado en este navegador. Usa Chrome.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = (onTranscript: (text: string) => void) => {
    if (!isSupported || !recognitionRef.current) {
      setError('No soportado o no inicializado');
      return;
    }

    onTranscriptRef.current = onTranscript;

    try {
      console.log('🚀 Iniciando reconocimiento...');
      recognitionRef.current.start();
      setIsListening(true);
      setError('');  // Limpia errores previos
    } catch (err) {
      console.error('Error al iniciar:', err);
      setError('Error al acceder al micrófono');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return {
    isListening,
    isSupported,
    error,  // Nuevo: para mostrar en UI
    startListening,
    stopListening,
  };
};