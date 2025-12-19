import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { UserPlus, Copy, Check, Mail, Send, User, Camera, Upload, Image as ImageIcon, Link as LinkIcon, Edit2, Save, X } from 'lucide-react';
import { clsx } from 'clsx';
import { AvatarSelector } from '../components/common/AvatarSelector';

export const Settings: React.FC = () => {
  const { getCurrentWorkspace, user, createInvite, updateProfile, updateMemberProfile } = useFinanceStore();
  const workspace = getCurrentWorkspace();
  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || '');
  const [profileStatus, setProfileStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Member Editing State
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState({ name: '', avatar: '' });

  const inviteLink = `${window.location.origin}/join/${workspace?.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setInviteStatus('sending');
    try {
      await createInvite(inviteEmail, inviteRole);
      setInviteStatus('sent');
      setInviteEmail('');
      setTimeout(() => setInviteStatus('idle'), 3000);
    } catch (error) {
      setInviteStatus('error');
      setTimeout(() => setInviteStatus('idle'), 3000);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileStatus('saving');
    await updateProfile(profileName, profileAvatar);
    setProfileStatus('saved');
    setTimeout(() => setProfileStatus('idle'), 2000);
  };

  const startEditingMember = (member: any) => {
    setEditingMemberId(member.userId);
    setMemberForm({ name: member.name || '', avatar: member.avatar || '' });
  };

  const saveMember = async () => {
    if (!editingMemberId) return;
    await updateMemberProfile(editingMemberId, memberForm.name, memberForm.avatar);
    setEditingMemberId(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Configurações</h1>
        <p className="mt-1 text-muted-foreground">
          Gerencie seu perfil e as configurações do workspace <strong>{workspace?.name}</strong>.
        </p>
      </div>

      {/* User Profile Section */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-border bg-muted/30">
          <h3 className="text-lg font-semibold text-foreground">Seu Perfil</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Atualize suas informações pessoais.
          </p>
        </div>
        <div className="p-4 sm:p-6">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground">Nome Completo</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Foto de Perfil</label>
              <AvatarSelector 
                currentAvatar={profileAvatar} 
                onAvatarChange={setProfileAvatar} 
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={profileStatus === 'saving'}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
              >
                {profileStatus === 'saving' ? 'Salvando...' : profileStatus === 'saved' ? 'Salvo!' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Workspace Members Section */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-border bg-muted/30">
          <h3 className="text-lg font-semibold text-foreground">Membros do Workspace</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie os membros e personalize como eles aparecem neste workspace.
          </p>
        </div>
        <div>
          <ul role="list" className="divide-y divide-border">
            {workspace?.members.map((member) => (
              <li key={member.userId} className="px-6 py-4">
                {editingMemberId === member.userId ? (
                  <div className="space-y-4 bg-muted/50 p-4 rounded-lg border border-border">
                    <div>
                      <label className="block text-sm font-medium text-foreground">Nome de Exibição (Neste Workspace)</label>
                      <input
                        type="text"
                        value={memberForm.name}
                        onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                        className="mt-1 block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Avatar (Neste Workspace)</label>
                      <AvatarSelector 
                        currentAvatar={memberForm.avatar} 
                        onAvatarChange={(url) => setMemberForm({ ...memberForm, avatar: url })} 
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingMemberId(null)}
                        className="inline-flex items-center px-3 py-2 border border-input shadow-sm text-sm leading-4 font-medium rounded-md text-foreground bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </button>
                      <button
                        onClick={saveMember}
                        className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 mr-2">
                      <div className="flex-shrink-0">
                        {member.avatar ? (
                          <img className="h-10 w-10 rounded-full object-cover ring-2 ring-border" src={member.avatar} alt="" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold ring-2 ring-border">
                            {member.name?.charAt(0) || 'U'}
                          </div>
                        )}
                      </div>
                      <div className="ml-4 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{member.name}</div>
                        <div className="text-sm text-muted-foreground truncate">{member.role === 'admin' ? 'Administrador' : 'Membro'}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => startEditingMember(member)}
                      className="text-primary hover:text-primary/80 flex items-center text-sm font-medium transition-colors flex-shrink-0"
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Editar
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Invite Section */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-border bg-muted/30">
          <h3 className="text-lg font-semibold text-foreground">Convidar Membros</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Convide pessoas para colaborar neste workspace.
          </p>
        </div>
        <div className="px-6 py-6">
          <form onSubmit={handleSendInvite} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground">Link de Convite</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-input bg-muted text-muted-foreground sm:text-sm"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center px-4 py-2 border border-l-0 border-input rounded-r-md bg-muted text-foreground hover:bg-accent focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-2 text-sm text-muted-foreground">OU</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                    placeholder="colega@exemplo.com"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="role" className="block text-sm font-medium text-foreground">
                  Função
                </label>
                <div className="mt-1">
                  <select
                    id="role"
                    name="role"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                    className="block w-full rounded-md border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                  >
                    <option value="member">Membro</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={inviteStatus === 'sending'}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
              >
                {inviteStatus === 'sending' ? 'Enviando...' : inviteStatus === 'sent' ? 'Enviado!' : inviteStatus === 'error' ? 'Erro' : 'Enviar Convite'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
