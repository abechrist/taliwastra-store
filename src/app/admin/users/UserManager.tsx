'use client';

import { useState } from 'react';
import Icon from '@/components/Icon';
import { createAdminUserAction, changePasswordAction, deleteAdminUserAction } from '../actions/users';

type AdminItem = {
  id: string;
  username: string;
  role: string;
  created_at: string | Date;
};

export default function UserManager({ admins }: { admins: AdminItem[] }) {
  const [activeTab, setActiveTab] = useState<'users' | 'change_password'>('users');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form registration
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState('admin');

  // Form change password
  const [changeUsername, setChangeUsername] = useState(admins[0]?.username || 'admin');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('username', regUsername);
    formData.append('password', regPassword);
    formData.append('confirm_password', regConfirmPassword);
    formData.append('role', regRole);

    const res = await createAdminUserAction(formData);
    setIsSubmitting(false);

    if (res?.error) {
      setMessage({ type: 'error', text: res.error });
    } else {
      setMessage({ type: 'success', text: 'Admin baru berhasil didaftarkan!' });
      setRegUsername('');
      setRegPassword('');
      setRegConfirmPassword('');
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('username', changeUsername);
    formData.append('old_password', oldPassword);
    formData.append('new_password', newPassword);
    formData.append('confirm_new_password', confirmNewPassword);

    const res = await changePasswordAction(formData);
    setIsSubmitting(false);

    if (res?.error) {
      setMessage({ type: 'error', text: res.error });
    } else {
      setMessage({ type: 'success', text: 'Password berhasil diubah!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    }
  };

  const handleDeleteAdmin = async (id: string, username: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus akun admin "${username}"?`)) return;
    setIsSubmitting(true);
    const res = await deleteAdminUserAction(id);
    setIsSubmitting(false);
    if (res?.error) {
      setMessage({ type: 'error', text: res.error });
    } else {
      setMessage({ type: 'success', text: `Admin "${username}" telah dihapus.` });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl md:text-3xl text-on-surface">Pengaturan & Manajemen Admin</h1>
        <p className="font-body text-sm text-on-surface-variant mt-1">Kelola akun administrator toko dan ubah kata sandi</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant gap-4">
        <button
          onClick={() => {
            setActiveTab('users');
            setMessage(null);
          }}
          className={`pb-3 font-label text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Icon name="manage_accounts" className="text-lg" />
          Daftar & Registrasi Admin
        </button>
        <button
          onClick={() => {
            setActiveTab('change_password');
            setMessage(null);
          }}
          className={`pb-3 font-label text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'change_password' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Icon name="lock" className="text-lg" />
          Ubah Password Admin
        </button>
      </div>

      {/* Alert Message */}
      {message && (
        <div className={`p-4 rounded-xl text-sm font-body flex items-center gap-3 ${
          message.type === 'success' ? 'bg-success/10 text-success border border-success/30' : 'bg-error/10 text-error border border-error/30'
        }`}>
          <Icon name={message.type === 'success' ? 'check_circle' : 'error'} className="text-lg shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Tab 1: Admin Registration & List */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-7 space-y-6">
            <div className="card p-6 space-y-4">
              <h2 className="font-display text-lg text-on-surface border-b border-soft-clay/30 pb-3">Daftarkan Admin Baru</h2>
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1">
                    Username Baru <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="Contoh: admin_toko"
                    className="input"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1">
                      Password <span className="text-error">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1">
                      Konfirmasi Password <span className="text-error">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Ulangi password"
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1">
                    Role Admin
                  </label>
                  <select value={regRole} onChange={(e) => setRegRole(e.target.value)} className="input">
                    <option value="admin">Admin Utama</option>
                    <option value="staff">Staff Operasional</option>
                  </select>
                </div>

                <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full py-3">
                  <Icon name="person_add" className="text-sm" />
                  {isSubmitting ? 'Mendaftarkan...' : 'Daftarkan Admin Baru'}
                </button>
              </form>
            </div>
          </div>

          <div className="md:col-span-5 space-y-6">
            <div className="card p-6 space-y-4">
              <h2 className="font-display text-lg text-on-surface border-b border-soft-clay/30 pb-3">Daftar Admin Aktif</h2>
              <div className="space-y-3">
                {admins.map((adm) => (
                  <div key={adm.id} className="linen-card p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold font-display uppercase">
                        {adm.username.slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-body text-sm font-semibold text-on-surface">{adm.username}</h4>
                        <span className="badge badge-secondary text-[10px]">{adm.role}</span>
                      </div>
                    </div>
                    {admins.length > 1 && (
                      <button
                        onClick={() => handleDeleteAdmin(adm.id, adm.username)}
                        className="text-error hover:bg-error/10 p-2 rounded-lg transition-colors"
                        title="Hapus Admin"
                      >
                        <Icon name="delete" className="text-lg" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Change Password */}
      {activeTab === 'change_password' && (
        <div className="max-w-xl mx-auto">
          <div className="card p-6 md:p-8 space-y-6">
            <h2 className="font-display text-lg text-on-surface border-b border-soft-clay/30 pb-3">Ubah Password Admin</h2>
            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1">
                  Pilih Akun Admin <span className="text-error">*</span>
                </label>
                <select value={changeUsername} onChange={(e) => setChangeUsername(e.target.value)} className="input">
                  {admins.map((a) => (
                    <option key={a.id} value={a.username}>{a.username} ({a.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1">
                  Password Saat Ini <span className="text-error">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Masukkan password lama"
                  className="input"
                />
              </div>

              <div>
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1">
                  Password Baru <span className="text-error">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="input"
                />
              </div>

              <div>
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1">
                  Konfirmasi Password Baru <span className="text-error">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="input"
                />
              </div>

              <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full py-3">
                <Icon name="key" className="text-sm" />
                {isSubmitting ? 'Memproses...' : 'Ubah Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
