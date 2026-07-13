import "./globals.css";

export const metadata = {
  title: "Automata Toolkit",
  description:
    "Aplikasi web Teori Bahasa dan Otomata: FSA, Regular Expression, PDA/CFG, Hierarki Chomsky & CNF",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
