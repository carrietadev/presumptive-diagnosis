import { useState } from 'react';
import { VoiceInputField } from './VoiceInputField';
import { supabase, DiagnosticRecord } from '../lib/supabase';
import { Save, FileText, Stethoscope, Loader2 } from 'lucide-react';

const PREDICT_API_URL = "https://chloritic-margarette-unhorizontal.ngrok-free.dev/predict";

export const DiagnosticForm = () => {
  const [formData, setFormData] = useState<Omit<DiagnosticRecord, 'id' | 'created_at'> & { sexo?: string }>({
    patient_name: '',
    age: '',
    chief_complaint: '',
    visual_acuity_od: '',
    visual_acuity_os: '',
    refraction_od: '',
    refraction_os: '',
    intraocular_pressure_od: '',
    intraocular_pressure_os: '',
    anterior_segment_od: '',
    anterior_segment_os: '',
    posterior_segment_od: '',
    posterior_segment_os: '',
    diagnosis: '',
    observations: '',
    sexo: '', // Puedes agregar campo sexo si lo necesitas para la API
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal diagnóstico
  const [showModal, setShowModal] = useState(false);
  const [diagnostico, setDiagnostico] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState<string | null>(null);

  const handleChange = (field: keyof typeof formData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const { sexo, ...insertData } = formData; // no guardamos sexo en la tabla
      const { error } = await supabase
        .from('diagnostic_records')
        .insert([insertData]);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Diagnóstico guardado exitosamente' });
      // NO borramos los campos
    } catch (error) {
      console.error('Error saving diagnostic:', error);
      setMessage({ type: 'error', text: 'Error al guardar el diagnóstico' });
    } finally {
      setIsSaving(false);
    }
  };

  // Construye el motivo incluyendo agudeza visual y chief complaint
  const buildMotivo = () => {
    let motivo = formData.chief_complaint || '';
    motivo +=
      (formData.visual_acuity_od || formData.visual_acuity_os)
        ? `\nAgudeza Visual OD: ${formData.visual_acuity_od || 'N/A'}, OS: ${formData.visual_acuity_os || 'N/A'}`
        : '';
    return motivo.trim();
  };

  const handleGenerateDiagnostico = async () => {
    setIsGenerating(true);
    setDiagnostico(null);
    setPrompt(null);
    setShowModal(true);

    const payload = {
      sexo: formData.sexo || "N/A",
      edad: formData.age || "N/A",
      sintomas: buildMotivo() || "N/A",
    };

    try {
      const resp = await fetch(PREDICT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();
      setPrompt(data.prompt);
      setDiagnostico(data.diagnostico);
    } catch (error) {
      setDiagnostico(`Error: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-500 p-3 rounded-lg">
              <FileText className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Diagnóstico Presuntivo</h1>
              <p className="text-gray-600">Optometría / Oftalmología</p>
            </div>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-blue-500">
                  Datos del Paciente
                </h2>
                <VoiceInputField
                  label="Nombre del Paciente"
                  value={formData.patient_name}
                  onChange={handleChange('patient_name')}
                  placeholder="Nombre completo"
                />
                <VoiceInputField
                  label="Sexo"
                  value={formData.sexo || ''}
                  onChange={handleChange('sexo')}
                  placeholder="masculino / femenino"
                />
                <VoiceInputField
                  label="Edad"
                  value={formData.age}
                  onChange={handleChange('age')}
                  placeholder="Edad del paciente"
                />
                <VoiceInputField
                  label="Motivo de Consulta"
                  value={formData.chief_complaint}
                  onChange={handleChange('chief_complaint')}
                  placeholder="Síntomas o razón principal de la consulta"
                  multiline
                />
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-blue-500">
                  Agudeza Visual
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <VoiceInputField
                    label="OD (Ojo Derecho)"
                    value={formData.visual_acuity_od}
                    onChange={handleChange('visual_acuity_od')}
                    placeholder="Ej: 20/20"
                  />
                  <VoiceInputField
                    label="OS (Ojo Izquierdo)"
                    value={formData.visual_acuity_os}
                    onChange={handleChange('visual_acuity_os')}
                    placeholder="Ej: 20/25"
                  />
                </div>
              </section>

              {/* ... resto igual ... */}

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-blue-500">
                  Refracción
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <VoiceInputField
                    label="OD (Ojo Derecho)"
                    value={formData.refraction_od}
                    onChange={handleChange('refraction_od')}
                    placeholder="Ej: -2.00 -0.50 x 180"
                  />
                  <VoiceInputField
                    label="OS (Ojo Izquierdo)"
                    value={formData.refraction_os}
                    onChange={handleChange('refraction_os')}
                    placeholder="Ej: -1.75 -0.25 x 90"
                  />
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-blue-500">
                  Presión Intraocular
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <VoiceInputField
                    label="OD (Ojo Derecho)"
                    value={formData.intraocular_pressure_od}
                    onChange={handleChange('intraocular_pressure_od')}
                    placeholder="Ej: 15 mmHg"
                  />
                  <VoiceInputField
                    label="OS (Ojo Izquierdo)"
                    value={formData.intraocular_pressure_os}
                    onChange={handleChange('intraocular_pressure_os')}
                    placeholder="Ej: 16 mmHg"
                  />
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-blue-500">
                  Segmento Anterior
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <VoiceInputField
                    label="OD (Ojo Derecho)"
                    value={formData.anterior_segment_od}
                    onChange={handleChange('anterior_segment_od')}
                    placeholder="Hallazgos del segmento anterior"
                    multiline
                  />
                  <VoiceInputField
                    label="OS (Ojo Izquierdo)"
                    value={formData.anterior_segment_os}
                    onChange={handleChange('anterior_segment_os')}
                    placeholder="Hallazgos del segmento anterior"
                    multiline
                  />
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-blue-500">
                  Segmento Posterior
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <VoiceInputField
                    label="OD (Ojo Derecho)"
                    value={formData.posterior_segment_od}
                    onChange={handleChange('posterior_segment_od')}
                    placeholder="Hallazgos del segmento posterior"
                    multiline
                  />
                  <VoiceInputField
                    label="OS (Ojo Izquierdo)"
                    value={formData.posterior_segment_os}
                    onChange={handleChange('posterior_segment_os')}
                    placeholder="Hallazgos del segmento posterior"
                    multiline
                  />
                </div>
              </section>

              <div className="flex flex-col md:flex-row gap-4 justify-end pt-6">
                <button
                  type="button"
                  onClick={handleGenerateDiagnostico}
                  disabled={isGenerating || !formData.age || !formData.chief_complaint}
                  className="flex items-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  <Stethoscope size={20} />
                  {isGenerating ? 'Generando...' : 'Generar diagnóstico'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Modal para el diagnóstico generado */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative animate-fade-in">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setShowModal(false)}
            >
              &times;
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-teal-500 p-3 rounded-lg">
                <Stethoscope className="text-white" size={28} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Diagnóstico generado</h2>
            </div>
            {isGenerating ? (
              <div className="flex flex-col items-center py-10">
                <Loader2 className="animate-spin text-teal-600 mb-3" size={32} />
                <span className="text-gray-700">Generando diagnóstico...</span>
              </div>
            ) : (
              <div>
                <p className="mb-2 text-gray-600 font-semibold">Diagnóstico:</p>
                <div className="bg-blue-50 border border-blue-200 rounded p-4 text-lg text-blue-800 whitespace-pre-line">
                  {diagnostico}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};