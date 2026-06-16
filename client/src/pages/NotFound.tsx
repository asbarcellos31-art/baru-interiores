import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-6xl font-light text-[#c9a96e]" style={{ fontFamily: "Cormorant Garamond, serif" }}>404</h1>
        <p className="text-lg text-muted-foreground mt-2 mb-4">Página não encontrada</p>
        <Link href="/">
          <button className="px-4 py-2 bg-[#c9a96e] text-white rounded-lg text-sm hover:bg-[#b8954f] transition-colors">
            Voltar ao Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}
