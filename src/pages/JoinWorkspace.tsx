import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFinanceStore } from '../store/useFinanceStore';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, XCircle } from 'lucide-react';

export const JoinWorkspace: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { joinWorkspace } = useFinanceStore();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!session) {
      // Redirect to login if not authenticated
      navigate(`/login?returnUrl=/join/${workspaceId}`);
      return;
    }

    if (workspaceId) {
      joinWorkspace(workspaceId)
        .then((success) => {
          setStatus(success ? 'success' : 'error');
          if (success) {
            setTimeout(() => navigate('/dashboard'), 2000);
          }
        });
    }
  }, [workspaceId, session, joinWorkspace, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          {status === 'loading' && (
            <p className="text-gray-500">Entrando no workspace...</p>
          )}
          {status === 'success' && (
            <div className="flex flex-col items-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Sucesso!</h3>
              <p className="text-sm text-gray-500 mt-2">Você agora é membro deste workspace.</p>
            </div>
          )}
          {status === 'error' && (
            <div className="flex flex-col items-center">
              <XCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Erro</h3>
              <p className="text-sm text-gray-500 mt-2">Não foi possível entrar no workspace.</p>
              <button 
                onClick={() => navigate('/dashboard')}
                className="mt-4 text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Voltar ao Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
