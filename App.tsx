
import React, { useState, useMemo } from 'react';

type Tab = 'login' | 'logout' | 'netwatch';

const generateLoginScript = (apiKey: string, sender: string, receiver: string, routerName: string): string => `
# Script MikroTik untuk Event On-Up PPPoE (User Login)
# Dihasilkan oleh Generator Script Notifikasi

# --- MULAI SCRIPT ---
{
    :log info "User PPPoE $user login, menjalankan script notifikasi WhatsApp...";
    
    # Dapatkan tanggal dan waktu saat ini
    :local date [/system clock get date];
    :local time [/system clock get time];

    # Dapatkan total user PPPoE yang aktif
    :local totalActive [/ppp active print count-only];

    # --- Variabel Konfigurasi Pengguna ---
    :local apiKey "${apiKey}";
    :local senderNumber "${sender}";
    :local receiverNumber "${receiver}";
    :local routerName "${routerName}";
    # --- Akhir Variabel Konfigurasi Pengguna ---

    # Susun payload pesan
    :local message "✅ *PPPoE LOGIN*%0A%0A";
    :set message ($message . "Router: *" . $routerName . "*%0A");
    :set message ($message . "Tanggal: " . $date . "%0A");
    :set message ($message . "Jam: " . $time . "%0A");
    :set message ($message . "User: " . $user . "%0A");
    :set message ($message . "IP Klien: " . $"remote-address" . "%0A");
    :set message ($message . "Caller ID: " . $"caller-id" . "%0A");
    :set message ($message . "Uptime: 00:00:00%0A");
    :set message ($message . "Total Aktif: " . $totalActive . " Klien%0A");
    :set message ($message . "Layanan: " . $service . "%0A");
    :set message ($message . "Alasan Terputus: " . $cause . "%0A");
    :set message ($message . "Logout Terakhir: " . $"last-logged-out");

    # Susun URL API
    :local url "https://wa.vpnjombang.my.id/send-message";
    :set url ($url . "?api_key=" . $apiKey);
    :set url ($url . "&sender=" . $senderNumber);
    :set url ($url . "&number=" . $receiverNumber);
    :set url ($url . "&message=" . [:url-encode $message]);

    # Kirim request
    /tool fetch url=$url keep-result=no;
    :log info "Notifikasi WhatsApp terkirim untuk user $user.";
}
# --- AKHIR SCRIPT ---
`.trim();

const generateLogoutScript = (apiKey: string, sender: string, receiver: string, routerName: string): string => `
# Script MikroTik untuk Event On-Down PPPoE (User Logout)
# Dihasilkan oleh Generator Script Notifikasi

# --- MULAI SCRIPT ---
{
    :log info "User PPPoE $user logout, menjalankan script notifikasi WhatsApp...";

    # Dapatkan tanggal dan waktu saat ini
    :local date [/system clock get date];
    :local time [/system clock get time];

    # Dapatkan total user PPPoE yang aktif (user sudah logout, jadi hitungan saat ini akurat)
    :local totalActive [/ppp active print count-only];

    # --- Variabel Konfigurasi Pengguna ---
    :local apiKey "${apiKey}";
    :local senderNumber "${sender}";
    :local receiverNumber "${receiver}";
    :local routerName "${routerName}";
    # --- Akhir Variabel Konfigurasi Pengguna ---

    # Susun payload pesan
    :local message "❌ *PPPoE LOGOUT*%0A%0A";
    :set message ($message . "Router: *" . $routerName . "*%0A");
    :set message ($message . "Tanggal: " . $date . "%0A");
    :set message ($message . "Jam: " . $time . "%0A");
    :set message ($message . "User: " . $user . "%0A");
    :set message ($message . "Alasan Terputus: " . $cause . "%0A");
    :set message ($message . "Logout Terakhir: " . $date . " " . $time . "%0A");
    :set message ($message . "Caller ID Terakhir: " . $"caller-id" . "%0A");
    :set message ($message . "Total Aktif: " . $totalActive . " Klien");

    # Susun URL API
    :local url "https://wa.vpnjombang.my.id/send-message";
    :set url ($url . "?api_key=" . $apiKey);
    :set url ($url . "&sender=" . $senderNumber);
    :set url ($url . "&number=" . $receiverNumber);
    :set url ($url . "&message=" . [:url-encode $message]);

    # Kirim request
    /tool fetch url=$url keep-result=no;
    :log info "Notifikasi WhatsApp terkirim untuk user $user.";
}
# --- AKHIR SCRIPT ---
`.trim();

const generateNetwatchUpScript = (apiKey: string, sender: string, receiver: string, routerName: string, netwatchUser: string): string => `
# Script MikroTik untuk Event On-Up Netwatch
# Dihasilkan oleh Generator Script Notifikasi

# --- MULAI SCRIPT ---
{
    :log info ("Netwatch: Host " . [/tool netwatch get $host host] . " UP, menjalankan script notifikasi...");
    
    :local date [/system clock get date];
    :local time [/system clock get time];

    # --- Variabel Konfigurasi Pengguna ---
    :local apiKey "${apiKey}";
    :local senderNumber "${sender}";
    :local receiverNumber "${receiver}";
    :local routerName "${routerName}";
    :local userName "${netwatchUser}";
    # --- Akhir Variabel Konfigurasi Pengguna ---

    :local message "✅ *USER STATIK ONLINE*%0A%0A";
    :set message ($message . "Router: *" . $routerName . "*%0A");
    :set message ($message . "User: *" . $userName . "*%0A");
    :set message ($message . "Alamat IP: " . [/tool netwatch get $host host] . "%0A");
    :set message ($message . "Tanggal: " . $date . "%0A");
    :set message ($message . "Jam: " . $time);

    :local url "https://wa.vpnjombang.my.id/send-message";
    :set url ($url . "?api_key=" . $apiKey);
    :set url ($url . "&sender=" . $senderNumber);
    :set url ($url . "&number=" . $receiverNumber);
    :set url ($url . "&message=" . [:url-encode $message]);

    /tool fetch url=$url keep-result=no;
    :log info ("Notifikasi WhatsApp terkirim untuk " . $userName);
}
# --- AKHIR SCRIPT ---
`.trim();

const generateNetwatchDownScript = (apiKey: string, sender: string, receiver: string, routerName: string, netwatchUser: string): string => `
# Script MikroTik untuk Event On-Down Netwatch
# Dihasilkan oleh Generator Script Notifikasi

# --- MULAI SCRIPT ---
{
    :log info ("Netwatch: Host " . [/tool netwatch get $host host] . " DOWN, menjalankan script notifikasi...");
    
    :local date [/system clock get date];
    :local time [/system clock get time];

    # --- Variabel Konfigurasi Pengguna ---
    :local apiKey "${apiKey}";
    :local senderNumber "${sender}";
    :local receiverNumber "${receiver}";
    :local routerName "${routerName}";
    :local userName "${netwatchUser}";
    # --- Akhir Variabel Konfigurasi Pengguna ---

    :local message "❌ *USER STATIK OFFLINE*%0A%0A";
    :set message ($message . "Router: *" . $routerName . "*%0A");
    :set message ($message . "User: *" . $userName . "*%0A");
    :set message ($message . "Alamat IP: " . [/tool netwatch get $host host] . "%0A");
    :set message ($message . "Tanggal: " . $date . "%0A");
    :set message ($message . "Jam: " . $time);

    :local url "https://wa.vpnjombang.my.id/send-message";
    :set url ($url . "?api_key=" . $apiKey);
    :set url ($url . "&sender=" . $senderNumber);
    :set url ($url . "&number=" . $receiverNumber);
    :set url ($url . "&message=" . [:url-encode $message]);

    /tool fetch url=$url keep-result=no;
    :log info ("Notifikasi WhatsApp terkirim untuk " . $userName);
}
# --- AKHIR SCRIPT ---
`.trim();

const loginPreviewTemplate = `✅ *PPPoE LOGIN*

Router: *{routerName}*
Tanggal: {date}
Jam: {time}
User: pppoe-user-01
IP Klien: 10.0.0.123
Caller ID: 00:11:22:33:44:55
Uptime: 00:00:00
Total Aktif: 105 Klien
Layanan: pppoe-profile
Alasan Terputus: user-request
Logout Terakhir: {date} {time}`;

const logoutPreviewTemplate = `❌ *PPPoE LOGOUT*

Router: *{routerName}*
Tanggal: {date}
Jam: {time}
User: pppoe-user-01
Alasan Terputus: peer-request
Logout Terakhir: {date} {time}
Caller ID Terakhir: 00:11:22:33:44:55
Total Aktif: 104 Klien`;

const netwatchUpPreviewTemplate = `✅ *USER STATIK ONLINE*

Router: *{routerName}*
User: *{netwatchUser}*
Alamat IP: {netwatchIp}
Tanggal: {date}
Jam: {time}`;

const netwatchDownPreviewTemplate = `❌ *USER STATIK OFFLINE*

Router: *{routerName}*
User: *{netwatchUser}*
Alamat IP: {netwatchIp}
Tanggal: {date}
Jam: {time}`;

const formatPppoePreview = (template: string, routerName: string): string => {
    const now = new Date();
    const date = `jan/${now.getDate()}/${now.getFullYear()}`;
    const time = now.toLocaleTimeString('en-GB');
    return template
        .replace(/{routerName}/g, routerName || 'MyRouter')
        .replace(/{date}/g, date)
        .replace(/{time}/g, time);
};

const formatNetwatchPreview = (template: string, routerName: string, netwatchUser: string, netwatchIp: string): string => {
    const now = new Date();
    const date = `jan/${now.getDate()}/${now.getFullYear()}`;
    const time = now.toLocaleTimeString('en-GB');
    return template
        .replace(/{routerName}/g, routerName || 'MyRouter')
        .replace(/{netwatchUser}/g, netwatchUser || 'UserStatik')
        .replace(/{netwatchIp}/g, netwatchIp || '192.168.1.100')
        .replace(/{date}/g, date)
        .replace(/{time}/g, time);
};

interface InputFieldProps {
    label: string;
    id: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    type?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, id, value, onChange, placeholder, type = 'text' }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-400 mb-2">
            {label}
        </label>
        <input
            type={type}
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
        />
    </div>
);

interface ScriptDisplayProps {
    script: string;
    title: string;
}

const ScriptDisplay: React.FC<ScriptDisplayProps> = ({ script, title }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(script).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <div className="bg-gray-800/50 rounded-xl shadow-lg relative h-full flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <h3 className="font-semibold text-lg text-white">{title}</h3>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                    {isCopied ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    )}
                    {isCopied ? 'Tersalin!' : 'Salin'}
                </button>
            </div>
            <pre className="p-4 text-sm whitespace-pre-wrap overflow-auto flex-grow text-cyan-300 font-mono">
                <code>{script}</code>
            </pre>
        </div>
    );
};


interface MessagePreviewProps {
    message: string;
    type: 'login' | 'logout';
}

const MessagePreview: React.FC<MessagePreviewProps> = ({ message, type }) => {
    return (
        <div className="bg-gray-800/50 rounded-xl shadow-lg h-full flex flex-col">
             <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <h3 className="font-semibold text-lg text-white">Pratinjau Pesan</h3>
             </div>
             <div className="p-4 flex-grow bg-cover bg-center" style={{backgroundImage: "url('https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')"}}>
                <div className={`max-w-xs ${type === 'login' ? 'ml-auto' : 'mr-auto'} p-3 rounded-lg shadow-md whitespace-pre-wrap text-sm text-left ${type === 'login' ? 'bg-[#075e54] text-white rounded-tr-none' : 'bg-[#202c33] text-white rounded-tl-none'}`}>
                    {message}
                </div>
            </div>
        </div>
    );
};

const PppoeInstructions = () => (
    <>
        <h2 className="text-2xl font-bold text-white mb-4 border-b border-gray-700 pb-4">Cara Penggunaan (PPPoE)</h2>
        <ol className="list-decimal list-inside space-y-3 text-gray-300">
            <li>Isi semua kolom konfigurasi di atas.</li>
            <li>Pilih tab "Saat Login" atau "Saat Logout".</li>
            <li>Klik tombol "Salin" untuk menyalin skrip yang dihasilkan.</li>
            <li>Di router MikroTik Anda (menggunakan WinBox atau WebFig):</li>
            <li className="ml-4">Buka <code className="bg-gray-900 px-1 rounded">PPP</code> &rarr; <code className="bg-gray-900 px-1 rounded">Profiles</code>.</li>
            <li className="ml-4">Buka profil yang digunakan oleh user PPPoE Anda.</li>
            <li className="ml-4">Buka tab <code className="bg-gray-900 px-1 rounded">Scripts</code>.</li>
            <li className="ml-4">Tempel skrip "Saat Login" ke kolom <code className="bg-gray-900 px-1 rounded">On Up</code>.</li>
            <li className="ml-4">Tempel skrip "Saat Logout" ke kolom <code className="bg-gray-900 px-1 rounded">On Down</code>.</li>
            <li>Klik "Apply" dan "OK". Notifikasi sekarang akan dikirim!</li>
        </ol>
    </>
);

const NetwatchInstructions = () => (
    <>
        <h2 className="text-2xl font-bold text-white mb-4 border-b border-gray-700 pb-4">Cara Penggunaan (Netwatch)</h2>
        <ol className="list-decimal list-inside space-y-3 text-gray-300">
            <li>Isi kolom konfigurasi utama dan konfigurasi Netwatch.</li>
            <li>Salin skrip "On Up" dan "On Down".</li>
            <li>Di router MikroTik Anda (menggunakan WinBox atau WebFig):</li>
            <li className="ml-4">Buka <code className="bg-gray-900 px-1 rounded">Tools</code> &rarr; <code className="bg-gray-900 px-1 rounded">Netwatch</code>.</li>
            <li className="ml-4">Klik tombol "+" untuk menambahkan host baru untuk dipantau.</li>
            <li className="ml-4">Di kolom <code className="bg-gray-900 px-1 rounded">Host</code>, masukkan alamat IP yang ingin Anda pantau (contoh: 192.168.88.10).</li>
            <li className="ml-4">Buka tab <code className="bg-gray-900 px-1 rounded">Up</code> dan tempel skrip "On Up".</li>
            <li className="ml-4">Buka tab <code className="bg-gray-900 px-1 rounded">Down</code> dan tempel skrip "On Down".</li>
            <li>Klik "Apply" dan "OK". Notifikasi akan dikirim saat status host berubah!</li>
        </ol>
    </>
);


const App: React.FC = () => {
    const [apiKey, setApiKey] = useState('');
    const [sender, setSender] = useState('');
    const [receiver, setReceiver] = useState('');
    const [routerName, setRouterName] = useState('MyRouter');
    const [netwatchIp, setNetwatchIp] = useState('');
    const [netwatchUser, setNetwatchUser] = useState('');
    const [activeTab, setActiveTab] = useState<Tab>('login');

    const loginScript = useMemo(() => generateLoginScript(apiKey, sender, receiver, routerName), [apiKey, sender, receiver, routerName]);
    const logoutScript = useMemo(() => generateLogoutScript(apiKey, sender, receiver, routerName), [apiKey, sender, receiver, routerName]);
    const netwatchUpScript = useMemo(() => generateNetwatchUpScript(apiKey, sender, receiver, routerName, netwatchUser), [apiKey, sender, receiver, routerName, netwatchUser]);
    const netwatchDownScript = useMemo(() => generateNetwatchDownScript(apiKey, sender, receiver, routerName, netwatchUser), [apiKey, sender, receiver, routerName, netwatchUser]);

    const loginPreview = useMemo(() => formatPppoePreview(loginPreviewTemplate, routerName), [routerName]);
    const logoutPreview = useMemo(() => formatPppoePreview(logoutPreviewTemplate, routerName), [routerName]);
    const netwatchUpPreview = useMemo(() => formatNetwatchPreview(netwatchUpPreviewTemplate, routerName, netwatchUser, netwatchIp), [routerName, netwatchUser, netwatchIp]);
    const netwatchDownPreview = useMemo(() => formatNetwatchPreview(netwatchDownPreviewTemplate, routerName, netwatchUser, netwatchIp), [routerName, netwatchUser, netwatchIp]);
    
    const isFormIncomplete = !apiKey || !sender || !receiver || !routerName;
    const isNetwatchFormIncomplete = !netwatchIp || !netwatchUser;

    return (
        <div className="min-h-screen bg-gray-900 font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-10">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">Generator Notifikasi WhatsApp MikroTik</h1>
                    <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">Hasilkan skrip untuk notifikasi PPPoE dan Netwatch melalui WhatsApp.</p>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Kolom Kiri: Konfigurasi & Instruksi */}
                    <div className="space-y-8">
                        <div className="bg-gray-800/50 rounded-xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-4">Konfigurasi Utama</h2>
                            <div className="space-y-4">
                                <InputField label="API Key WhatsApp" id="apiKey" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Masukkan API key Anda" />
                                <InputField label="Nomor Pengirim" id="sender" value={sender} onChange={e => setSender(e.target.value)} placeholder="Contoh: 628xxxx" />
                                <InputField label="Nomor Penerima" id="receiver" value={receiver} onChange={e => setReceiver(e.target.value)} placeholder="Contoh: 628xxxx atau ID grup" />
                                <InputField label="Nama Router / Identifier" id="routerName" value={routerName} onChange={e => setRouterName(e.target.value)} placeholder="Contoh: Router-Kantor" />
                            </div>
                        </div>

                        {activeTab === 'netwatch' && (
                           <div className="bg-gray-800/50 rounded-xl shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-4">Konfigurasi Netwatch</h2>
                                <div className="space-y-4">
                                    <InputField label="IP User untuk Dipantau" id="netwatchIp" value={netwatchIp} onChange={e => setNetwatchIp(e.target.value)} placeholder="Contoh: 192.168.88.10" />
                                    <InputField label="Identifier User" id="netwatchUser" value={netwatchUser} onChange={e => setNetwatchUser(e.target.value)} placeholder="Contoh: PC-JohnDoe" />
                                </div>
                            </div>
                        )}

                        <div className="bg-gray-800/50 rounded-xl shadow-lg p-6">
                           {activeTab === 'netwatch' ? <NetwatchInstructions/> : <PppoeInstructions />}
                        </div>
                    </div>

                    {/* Kolom Kanan: Skrip & Pratinjau */}
                    <div className="flex flex-col gap-8">
                         <div className="flex-shrink-0">
                            <div className="border-b border-gray-700">
                                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                                    <button onClick={() => setActiveTab('login')} className={`${activeTab === 'login' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors`}>
                                        Saat Login
                                    </button>
                                    <button onClick={() => setActiveTab('logout')} className={`${activeTab === 'logout' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors`}>
                                        Saat Logout
                                    </button>
                                    <button onClick={() => setActiveTab('netwatch')} className={`${activeTab === 'netwatch' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors`}>
                                        Netwatch / Statik
                                    </button>
                                </nav>
                            </div>
                        </div>
                        
                        {isFormIncomplete ? (
                           <div className="flex-grow flex items-center justify-center bg-gray-800/50 rounded-xl p-8 text-center">
                                <div className="max-w-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <h3 className="mt-2 text-lg font-medium text-white">Lengkapi Konfigurasi Utama</h3>
                                    <p className="mt-1 text-sm text-gray-400">Silakan isi semua kolom di sebelah kiri untuk menghasilkan skrip dan melihat pratinjau.</p>
                                </div>
                           </div>
                        ) : (
                            <div className="flex flex-col gap-8 flex-grow">
                                {activeTab === 'login' && (
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 flex-grow">
                                        <ScriptDisplay script={loginScript} title="Skrip Saat Login" />
                                        <MessagePreview message={loginPreview} type="login" />
                                    </div>
                                )}
                                {activeTab === 'logout' && (
                                     <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 flex-grow">
                                        <ScriptDisplay script={logoutScript} title="Skrip Saat Logout" />
                                        <MessagePreview message={logoutPreview} type="logout" />
                                    </div>
                                )}
                                {activeTab === 'netwatch' && (
                                    isNetwatchFormIncomplete ? (
                                        <div className="flex-grow flex items-center justify-center bg-gray-800/50 rounded-xl p-8 text-center">
                                          <div className="max-w-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            <h3 className="mt-2 text-lg font-medium text-white">Lengkapi Konfigurasi Netwatch</h3>
                                            <p className="mt-1 text-sm text-gray-400">Silakan masukkan IP dan Identifier User.</p>
                                          </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 flex-grow">
                                            <ScriptDisplay script={netwatchUpScript} title="Skrip On Up" />
                                            <MessagePreview message={netwatchUpPreview} type="login" />
                                            <ScriptDisplay script={netwatchDownScript} title="Skrip On Down" />
                                            <MessagePreview message={netwatchDownPreview} type="logout" />
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;
