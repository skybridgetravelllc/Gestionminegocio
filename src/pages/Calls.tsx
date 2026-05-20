import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, PhoneMissed, PhoneIncoming, User, Mic, MicOff } from 'lucide-react';
import { supabase, Employee, Call } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import SimplePeer from 'simple-peer';

export function Calls() {
  const { employee } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeCalls, setActiveCalls] = useState<Call[]>([]);
  const [currentCall, setCurrentCall] = useState<Call | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [callHistory, setCallHistory] = useState<Call[]>([]);

  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    loadEmployees();
    loadCallHistory();
    subscribeToCallSignals();
  }, []);

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .neq('id', employee?.id);

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadCallHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .or(`caller_id.eq.${employee?.id},receiver_id.eq.${employee?.id}`)
        .order('started_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setCallHistory(data || []);
    } catch (error) {
      console.error('Error loading call history:', error);
    }
  };

  const subscribeToCallSignals = () => {
    if (!employee) return;

    const channel = supabase
      .channel('call_signals')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'call_signals',
          filter: `receiver_id=eq.${employee.id}`,
        },
        (payload) => {
          handleIncomingSignal(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const initiateCall = async (receiverId: string) => {
    if (!employee) return;

    try {
      setIsCalling(true);

      const { data: callData, error } = await supabase
        .from('calls')
        .insert({
          caller_id: employee.id,
          receiver_id: receiverId,
          status: 'ringing',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      setCurrentCall(callData);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const peer = new SimplePeer({
        initiator: true,
        stream,
        trickle: false,
      });

      peer.on('signal', async (signal) => {
        await supabase.from('call_signals').insert({
          call_id: callData.id,
          sender_id: employee.id,
          receiver_id: receiverId,
          signal: JSON.stringify(signal),
        });
      });

      peer.on('stream', (remoteStream) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
        }
      });

      peerRef.current = peer;
    } catch (error) {
      console.error('Error initiating call:', error);
      setIsCalling(false);
    }
  };

  const handleIncomingSignal = async (signalData: any) => {
    if (signalData.type === 'offer') {
      setIsRinging(true);
      setIncomingCall(signalData);
    }
  };

  const answerCall = async () => {
    if (!incomingCall || !employee) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const peer = new SimplePeer({
        initiator: false,
        stream,
        trickle: false,
      });

      peer.on('signal', async (signal) => {
        await supabase.from('call_signals').insert({
          call_id: incomingCall.call_id,
          sender_id: employee.id,
          receiver_id: incomingCall.sender_id,
          signal: JSON.stringify(signal),
        });
      });

      peer.on('stream', (remoteStream) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
        }
      });

      peer.signal(JSON.parse(incomingCall.signal));
      peerRef.current = peer;

      await supabase
        .from('calls')
        .update({ status: 'active' })
        .eq('id', incomingCall.call_id);

      setIsRinging(false);
      setCurrentCall(incomingCall);
    } catch (error) {
      console.error('Error answering call:', error);
    }
  };

  const endCall = async () => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    if (currentCall) {
      await supabase
        .from('calls')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString(),
        })
        .eq('id', currentCall.id);
    }

    setCurrentCall(null);
    setIsCalling(false);
    setIsRinging(false);
    setIncomingCall(null);
  };

  const toggleMute = () => {
    if (peerRef.current && localAudioRef.current) {
      const stream = localAudioRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Llamadas</h1>
        <p className="text-gray-600 mt-1">
          Sistema de llamadas VoIP internas
        </p>
      </div>

      <audio ref={localAudioRef} autoPlay muted />
      <audio ref={remoteAudioRef} autoPlay />

      {currentCall && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {currentCall.status === 'ringing' ? 'Llamando...' : 'En llamada'}
          </h2>
          <p className="text-gray-600 mb-6">
            {currentCall.receiver_id || 'Desconocido'}
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={toggleMute}
              variant="secondary"
              className="w-14 h-14 rounded-full"
            >
              {isMuted ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </Button>
            <Button
              onClick={endCall}
              variant="danger"
              className="w-14 h-14 rounded-full"
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
          </div>
        </div>
      )}

      {isRinging && incomingCall && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center animate-pulse">
          <PhoneIncoming className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Llamada entrante
          </h2>
          <p className="text-gray-600 mb-6">{incomingCall.sender_id}</p>
          <div className="flex items-center justify-center space-x-4">
            <Button onClick={answerCall} className="px-8 bg-green-600 hover:bg-green-700">
              <Phone className="w-5 h-5 mr-2" />
              Contestar
            </Button>
            <Button onClick={endCall} variant="danger" className="px-8">
              <PhoneOff className="w-5 h-5 mr-2" />
              Rechazar
            </Button>
          </div>
        </div>
      )}

      {!currentCall && !isRinging && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Empleados Disponibles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map((emp) => (
                <div
                  key={emp.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      {emp.avatar_url ? (
                        <img
                          src={emp.avatar_url}
                          alt={emp.full_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {emp.full_name}
                      </p>
                      <p className="text-xs text-gray-600 capitalize">
                        {emp.role?.replace('_', ' ')}
                      </p>
                    </div>
                    {emp.status && (
                      <span
                        className={`w-3 h-3 rounded-full ${
                          emp.status === 'available'
                            ? 'bg-green-500'
                            : emp.status === 'busy'
                              ? 'bg-red-500'
                              : 'bg-gray-400'
                        }`}
                      />
                    )}
                  </div>
                  <Button
                    onClick={() => initiateCall(emp.id)}
                    size="sm"
                    className="w-full"
                    disabled={isCalling}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Llamar
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Historial de Llamadas
            </h2>
            <div className="space-y-2">
              {callHistory.map((call) => (
                <div
                  key={call.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {call.status === 'ended' ? (
                      <Phone className="w-5 h-5 text-gray-600" />
                    ) : call.status === 'missed' ? (
                      <PhoneMissed className="w-5 h-5 text-red-600" />
                    ) : (
                      <PhoneIncoming className="w-5 h-5 text-green-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {call.caller_id === employee?.id
                          ? call.receiver_id
                          : call.caller_id}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(call.started_at).toLocaleString('es-ES')}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 capitalize">
                    {call.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
