import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "common": {
        "login": "Login",
        "logout": "Logout",
        "submit": "Submit",
        "cancel": "Cancel",
        "loading": "Loading...",
        "authenticating": "Authenticating...",
        "login_securely": "Login Securely",
        "error": "Error",
        "success": "Success",
        "email": "Email Address",
        "password": "Password",
        "email_placeholder": "Enter your email",
        "password_placeholder": "Enter your password",
        "remember_me": "Remember me",
        "forgot_password": "Forgot password?",
        "secure_login": "Secure Login",
        "access_system": "Access Bonsai Connect System",
        "welcome": "Welcome",
        "official_platform": "PPBI National Platform",
        "association_name": "Indonesian Bonsai Society",
        "rights_reserved": "All rights reserved",
        "secure_access": "Secure Access to",
        "bonsai_registry": "Bonsai Registry",
        "system": "System",
        "platform_desc": "Official platform for registration, national competitions, and Bonsai Passport digital identity based on PPBI.",
        "system_status": "System Status",
        "operational": "Operational",
        "branch_depok": "PPBI Depok Branch"
      },
      "nav": {
        "home": "Home",
        "gallery": "Gallery",
        "gallery_desc": "National collection of registered bonsai",
        "events": "Events",
        "live_arena": "Live Arena",
        "passport": "Bonsai Passport",
        "passport_desc": "Digital identity for every bonsai",
        "verify": "Verify Certificate",
        "verify_desc": "Check authenticity of digital certificates",
        "dashboard": "Participant Portal",
        "dashboard_desc": "Check your status & scores",
        "admin_panel": "Admin Panel",
        "users": "Users & Roles",
        "judging": "Judging",
        "scoring": "Scoring",
        "overview": "Dashboard",
        "settings": "Settings",
        "ranking": "Ranking",
        "bonsai_trees": "Bonsai Trees",
        "participants": "Participants"
      },
      "nav_groups": {
        "core": "CORE",
        "competition": "COMPETITION",
        "registry": "REGISTRY",
        "system": "SYSTEM"
      },
      "judge": {
        "workspace": "Judge Workspace",
        "anonymous_mode": "Anonymous mode active. Participant identities are hidden from judges.",
        "active_session": "Active Judging Session"
      },
      "home": {
        "hero_title": "National Bonsai Registry & Competition Platform",
        "hero_desc": "Integrated system for bonsai registration, national competitions, and PPBI-based Bonsai Passport digital identity. Transparent, verified, and real-time.",
        "btn_register": "Register Competition",
        "btn_live": "Live Arena",
        "btn_verify": "Verify Certificate",
        "stat_bonsai": "Bonsai Registered",
        "stat_events": "National Events",
        "stat_certs": "Verified Certificates",
        "stat_provinces": "Provinces",
        "process_title": "Our Digital Ecosystem",
        "process_step_1": "Register Bonsai",
        "process_step_1_desc": "Upload data, photos, and your bonsai species to the national registry system.",
        "process_step_2": "Join Competition",
        "process_step_2_desc": "Choose available national or regional events and register your bonsai.",
        "process_step_3": "Judging Evaluation",
        "process_step_3_desc": "Bonsai are judged by certified judges digitally and transparently.",
        "process_step_4": "Bonsai Passport",
        "process_step_4_desc": "Get a permanent digital ID and official verified certificate."
      },
      "footer": {
        "description": "Official digital platform of the Indonesian Bonsai Society (PPBI) Depok Branch for registration, competitions, and national bonsai identity.",
        "supported_by": "Supported by",
        "central_ppbi": "Central PPBI",
        "city_depok": "Depok City",
        "copyright": "Indonesian Bonsai Society — Depok Branch. All rights reserved.",
        "platform_title": "Platform",
        "competition_title": "Competition"
      },
      "roles": {
        "super_admin": "Super Admin",
        "super_admin_desc": "Manage system, users, & platform config",
        "admin": "Admin",
        "admin_desc": "Manage events, registrations & participants",
        "judge": "Judge",
        "judge_desc": "Perform scoring and evaluation"
      },
      "trust": {
        "secure_auth": "Secure Authentication",
        "official_platform": "Official PPBI Platform",
        "national_system": "National Scale System"
      }
    }
  },
  id: {
    translation: {
      "common": {
        "login": "Masuk",
        "logout": "Keluar",
        "submit": "Kirim",
        "cancel": "Batal",
        "loading": "Memuat...",
        "authenticating": "Autentikasi...",
        "login_securely": "Masuk dengan Aman",
        "error": "Kesalahan",
        "success": "Berhasil",
        "email": "Alamat Email",
        "password": "Kata Sandi",
        "email_placeholder": "Masukkan email Anda",
        "password_placeholder": "Masukkan kata sandi Anda",
        "remember_me": "Ingat saya",
        "forgot_password": "Lupa kata sandi?",
        "secure_login": "Login Aman",
        "access_system": "Akses Sistem Bonsai Connect",
        "welcome": "Selamat Datang",
        "official_platform": "Platform Nasional PPBI",
        "association_name": "Persatuan Penggemar Bonsai Indonesia",
        "rights_reserved": "Hak cipta dilindungi",
        "secure_access": "Akses Aman ke",
        "bonsai_registry": "Registri Bonsai",
        "system": "Nasional",
        "platform_desc": "Platform resmi untuk registrasi, kompetisi nasional, dan identitas digital Bonsai Passport berbasis PPBI.",
        "system_status": "Status Sistem",
        "operational": "Operasional",
        "branch_depok": "PPBI Cabang Kota Depok"
      },
      "nav": {
        "home": "Beranda",
        "gallery": "Galeri",
        "gallery_desc": "Koleksi bonsai terdaftar secara nasional",
        "events": "Kompetisi",
        "live_arena": "Live Arena",
        "passport": "Bonsai Passport",
        "passport_desc": "Identitas digital setiap bonsai",
        "verify": "Verifikasi Sertifikat",
        "verify_desc": "Cek keaslian sertifikat digital",
        "dashboard": "Portal Peserta",
        "dashboard_desc": "Cek status & skor Anda",
        "admin_panel": "Panel Admin",
        "users": "User & Role",
        "judging": "Penjurian",
        "scoring": "Penilaian",
        "overview": "Dashboard",
        "settings": "Pengaturan",
        "ranking": "Ranking",
        "bonsai_trees": "Daftar Bonsai",
        "participants": "Daftar Peserta"
      },
      "nav_groups": {
        "core": "UTAMA",
        "competition": "KOMPETISI",
        "registry": "REGISTRI",
        "system": "SISTEM"
      },
      "judge": {
        "workspace": "Workspace Juri",
        "anonymous_mode": "Mode anonim aktif. Identitas peserta disembunyikan dari juri.",
        "active_session": "Sesi Penilaian Aktif"
      },
      "home": {
        "hero_title": "Platform Registri & Kompetisi Bonsai Nasional",
        "hero_desc": "Sistem terintegrasi untuk registrasi bonsai, kompetisi nasional, dan identitas digital Bonsai Passport berbasis PPBI. Transparan, terverifikasi, dan real-time.",
        "btn_register": "Daftar Kompetisi",
        "btn_live": "Live Arena",
        "btn_verify": "Verifikasi Sertifikat",
        "stat_bonsai": "Bonsai Terdaftar",
        "stat_events": "Event Nasional",
        "stat_certs": "Sertifikat Terverifikasi",
        "stat_provinces": "Provinsi",
        "process_title": "Ekosistem Digital Kami",
        "process_step_1": "Daftar Bonsai",
        "process_step_1_desc": "Upload data, foto, and spesies bonsai Anda ke sistem registry nasional.",
        "process_step_2": "Ikuti Kompetisi",
        "process_step_2_desc": "Pilih event nasional atau regional yang tersedia dan daftarkan bonsai.",
        "process_step_3": "Penilaian Berjuri",
        "process_step_3_desc": "Bonsai dinilai oleh juri bersertifikat secara digital dan transparan.",
        "process_step_4": "Bonsai Passport",
        "process_step_4_desc": "Dapatkan ID digital permanen dan sertifikat resmi terverifikasi."
      },
      "footer": {
        "description": "Platform digital resmi Perhimpunan Penggemar Bonsai Indonesia Cabang Kota Depok untuk registrasi, kompetisi, dan identitas bonsai nasional.",
        "supported_by": "Didukung oleh",
        "central_ppbi": "PPBI Pusat",
        "city_depok": "Kota Depok",
        "copyright": "Perhimpunan Penggemar Bonsai Indonesia — Cabang Kota Depok. Hak cipta dilindungi.",
        "platform_title": "Platform",
        "competition_title": "Kompetisi"
      },
      "roles": {
        "super_admin": "Super Admin",
        "super_admin_desc": "Kelola sistem, pengguna, & konfigurasi platform",
        "admin": "Admin",
        "admin_desc": "Kelola event, registrasi & peserta",
        "judge": "Juri",
        "judge_desc": "Lakukan penilaian dan evaluasi"
      },
      "trust": {
        "secure_auth": "Autentikasi Aman",
        "official_platform": "Platform Resmi PPBI",
        "national_system": "Sistem Skala Nasional"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'id',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
