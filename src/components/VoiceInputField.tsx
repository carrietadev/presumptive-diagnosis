import { Mic, MicOff } from 'lucide-react';
import { useDeepgramTranscription } from '../hooks/useDeepgramTrasncription';


interface VoiceInputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}

export const VoiceInputField = ({ label, value, onChange, placeholder, multiline = false }: VoiceInputFieldProps) => {
  const { isRecording, isSupported, transcribe, stopRecording } = useDeepgramTranscription();

  const handleVoiceClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      transcribe((transcript) => {
        onChange(value ? `${value} ${transcript}` : transcript);
      });
    }
  };

  const InputComponent = multiline ? 'textarea' : 'input';

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <InputComponent
          type={multiline ? undefined : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            multiline ? 'min-h-[100px] resize-y' : ''
          }`}
          rows={multiline ? 4 : undefined}
        />
        <button
          type="button"
          onClick={handleVoiceClick}
          disabled={!isSupported}
          className={`absolute right-3 top-3 p-2.5 rounded-full transition-all shadow-md ${
            !isSupported
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isRecording
              ? 'bg-red-500 text-white animate-pulse hover:bg-red-600'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          title={
            !isSupported
              ? 'Grabación de audio no disponible en este navegador'
              : isRecording
              ? 'Detener grabación'
              : 'Iniciar grabación por voz'
          }
        >
          {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
      </div>
    </div>
  );
};