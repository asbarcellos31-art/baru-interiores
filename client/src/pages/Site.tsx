import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Menu, X, ArrowRight, MessageCircle, Instagram, ChevronDown, Star, MapPin, Phone, Mail } from "lucide-react";

const SERVICOS = [
  {
    titulo: "Projeto de Interiores",
    descricao: "Do conceito à entrega, transformamos cada ambiente em uma extensão da sua personalidade. Projeto completo com plantas, 3D, memorial e acompanhamento.",
    icone: "🏠",
  },
  {
    titulo: "Projeto Arquitetônico",
    descricao: "Reformas e construções com visão estética e funcional. Aprovação de projetos, compatibilização estrutural e gestão completa da obra.",
    icone: "📐",
  },
  {
    titulo: "Consultoria de Interiores",
    descricao: "Para quem precisa de direção. Em uma sessão estratégica definimos paleta, estilo, layout e lista de compras para você executar no seu ritmo.",
    icone: "✨",
  },
  {
    titulo: "Acompanhamento de Obra",
    descricao: "Presença constante na obra para garantir que tudo seja executado exatamente como projetado. Qualidade e fidelidade ao projeto.",
    icone: "🔨",
  },
  {
    titulo: "Decoração e Staging",
    descricao: "Ambientes prontos para fotografar, vender ou morar. Seleção de mobiliário, objetos, iluminação e têxteis com curadoria personalizada.",
    icone: "🌿",
  },
  {
    titulo: "Móveis Planejados",
    descricao: "Desenvolvimento e acompanhamento de projetos de marcenaria. Do briefing ao acabamento, com fornecedores selecionados e controle de qualidade.",
    icone: "🪵",
  },
];

const PROCESSO = [
  { num: "01", titulo: "Briefing", descricao: "Entendemos sua vida, seu estilo, seus sonhos e seu orçamento." },
  { num: "02", titulo: "Conceito", descricao: "Criamos o estudo preliminar com referências, paleta e layout." },
  { num: "03", titulo: "Projeto", descricao: "Desenvolvemos o projeto completo: plantas, 3D, especificações." },
  { num: "04", titulo: "Execução", descricao: "Acompanhamos obra e compras para garantir a perfeição." },
  { num: "05", titulo: "Entrega", descricao: "Seu espaço transformado, pronto para ser vivido." },
];

const DEPOIMENTOS = [
  {
    nome: "Fernanda Oliveira",
    cargo: "Apartamento 180m² — São Paulo",
    texto: "A BARU transformou completamente nosso apartamento. O cuidado com cada detalhe, a atenção ao que realmente queríamos e o resultado final superaram todas as expectativas. Vale cada centavo.",
    estrelas: 5,
  },
  {
    nome: "Ricardo & Marina Santos",
    cargo: "Casa em condomínio — Alphaville",
    texto: "Do briefing à entrega, tudo impecável. A equipe entendeu nossa essência sem que precisássemos explicar muito. O projeto ficou atemporal, sofisticado e muito funcional para o nosso dia a dia.",
    estrelas: 5,
  },
  {
    nome: "Beatriz Almeida",
    cargo: "Consultório médico — Itaim Bibi",
    texto: "Contratei para o meu consultório e o resultado foi incrível. Ambiente que transmite exatamente a credibilidade e acolhimento que meus pacientes precisam sentir. Recomendo demais.",
    estrelas: 5,
  },
];

const GALERIA = [
  { src: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80", alt: "Sala contemporânea" },
  { src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80", alt: "Cozinha integrada" },
  { src: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&q=80", alt: "Quarto master" },
  { src: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80", alt: "Área de estar" },
  { src: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=600&q=80", alt: "Banheiro spa" },
  { src: "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=600&q=80", alt: "Home office" },
];

export default function Site() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handle);
    return () => window.removeEventListener("scroll", handle);
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#faf7f3] font-sans">
      {/* WhatsApp Float */}
      <a
        href="https://wa.me/5511999999999?text=Olá! Vim pelo site da BARU Interiores e gostaria de saber mais."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
        style={{ background: "#25D366" }}
      >
        <MessageCircle className="w-7 h-7 text-white fill-white" />
      </a>

      {/* NAVBAR */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? "bg-[#1c1410]/95 backdrop-blur shadow-lg" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-2xl font-light tracking-[0.4em] text-[#c9a96e]" style={{ fontFamily: "Cormorant Garamond, serif" }}>BARU</span>
            <span className="text-xs tracking-[0.25em] text-white/40 uppercase ml-2 hidden sm:inline">Interiores</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {["sobre", "servicos", "portfolio", "processo", "contato"].map(id => (
              <button key={id} onClick={() => scrollTo(id)} className="text-sm text-white/70 hover:text-[#c9a96e] transition-colors capitalize tracking-wider">
                {id === "servicos" ? "Serviços" : id === "portfolio" ? "Portfólio" : id === "processo" ? "Processo" : id === "contato" ? "Contato" : "Sobre"}
              </button>
            ))}
            <a
              href="https://wa.me/5511999999999?text=Olá! Gostaria de um orçamento."
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 rounded-full text-sm font-medium tracking-wider transition-all hover:opacity-90"
              style={{ background: "#c9a96e", color: "white" }}
            >
              Orçamento Grátis
            </a>
          </nav>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#1c1410] px-6 py-4 flex flex-col gap-4">
            {["sobre", "servicos", "portfolio", "processo", "contato"].map(id => (
              <button key={id} onClick={() => scrollTo(id)} className="text-left text-white/70 py-1 capitalize tracking-wider">
                {id === "servicos" ? "Serviços" : id === "portfolio" ? "Portfólio" : id === "processo" ? "Processo" : id === "contato" ? "Contato" : "Sobre"}
              </button>
            ))}
            <a
              href="https://wa.me/5511999999999?text=Olá! Gostaria de um orçamento."
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-5 rounded-full text-sm text-center font-medium"
              style={{ background: "#c9a96e", color: "white" }}
            >
              Orçamento Grátis
            </a>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: "linear-gradient(135deg, #1c1410 0%, #2a1e14 50%, #3a2a1a 100%)" }}>
        {/* Background texture */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=50')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1c1410]/40 via-[#1c1410]/60 to-[#1c1410]" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <p className="text-xs tracking-[0.4em] text-[#c9a96e] uppercase mb-6">Arquitetura · Design de Interiores</p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-white leading-none mb-6" style={{ fontFamily: "Cormorant Garamond, serif" }}>
            Espaços que
            <br />
            <em className="text-[#c9a96e] not-italic">contam histórias</em>
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Transformamos ambientes em experiências únicas. Do briefing à entrega, criamos projetos que refletem quem você é e como você vive.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/5511999999999?text=Olá! Gostaria de conhecer melhor os serviços da BARU."
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-full text-base font-medium tracking-wider transition-all hover:opacity-90 hover:scale-105"
              style={{ background: "#c9a96e", color: "white" }}
            >
              Quero meu projeto
            </a>
            <button
              onClick={() => scrollTo("portfolio")}
              className="px-8 py-4 rounded-full text-base font-medium tracking-wider border border-white/30 text-white hover:border-[#c9a96e] hover:text-[#c9a96e] transition-all"
            >
              Ver portfólio
            </button>
          </div>

          <div className="flex items-center justify-center gap-8 mt-16 text-white/40 text-sm">
            <div className="text-center">
              <p className="text-3xl font-light text-[#c9a96e]" style={{ fontFamily: "Cormorant Garamond, serif" }}>120+</p>
              <p className="text-xs tracking-wider uppercase mt-1">Projetos entregues</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-3xl font-light text-[#c9a96e]" style={{ fontFamily: "Cormorant Garamond, serif" }}>8</p>
              <p className="text-xs tracking-wider uppercase mt-1">Anos de experiência</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-3xl font-light text-[#c9a96e]" style={{ fontFamily: "Cormorant Garamond, serif" }}>100%</p>
              <p className="text-xs tracking-wider uppercase mt-1">Clientes satisfeitos</p>
            </div>
          </div>
        </div>

        <button onClick={() => scrollTo("sobre")} className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 animate-bounce">
          <ChevronDown className="w-6 h-6" />
        </button>
      </section>

      {/* SOBRE */}
      <section id="sobre" className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs tracking-[0.4em] text-[#c9a96e] uppercase mb-4">Sobre a BARU</p>
            <h2 className="text-4xl md:text-5xl font-light text-[#1c1410] leading-tight mb-6" style={{ fontFamily: "Cormorant Garamond, serif" }}>
              Mais do que decorar.<br />
              <em className="text-[#c9a96e] not-italic">Transformar.</em>
            </h2>
            <div className="space-y-4 text-[#5a4a3a]/80 leading-relaxed">
              <p>
                A BARU nasceu da crença de que cada espaço tem o poder de mudar a vida de quem o habita. Somos um escritório de arquitetura e design de interiores com olhar cuidadoso, estética refinada e profundo respeito pela história de cada cliente.
              </p>
              <p>
                Nossos projetos vão além do belo — são funcionais, personalizados e pensados para durar. Trabalhamos com dedicação total em cada detalhe, desde a escolha dos materiais até a última peça de decoração.
              </p>
              <p>
                Se você sonha com um espaço que pareça <strong className="text-[#1c1410]">exatamente você</strong>, estamos prontos para criar juntos.
              </p>
            </div>
            <a
              href="https://wa.me/5511999999999?text=Olá! Gostaria de conhecer mais sobre a BARU."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-8 text-[#c9a96e] font-medium hover:gap-4 transition-all"
            >
              Vamos conversar <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&q=80" alt="Projeto BARU" className="rounded-2xl h-64 w-full object-cover" />
            <img src="https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=400&q=80" alt="Projeto BARU" className="rounded-2xl h-64 w-full object-cover mt-8" />
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section id="servicos" className="py-24 px-6" style={{ background: "#1c1410" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.4em] text-[#c9a96e] uppercase mb-4">O que fazemos</p>
            <h2 className="text-4xl md:text-5xl font-light text-white" style={{ fontFamily: "Cormorant Garamond, serif" }}>
              Nossos Serviços
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICOS.map(s => (
              <div key={s.titulo} className="p-6 rounded-2xl border border-white/10 hover:border-[#c9a96e]/40 transition-all group hover:bg-white/5">
                <span className="text-3xl mb-4 block">{s.icone}</span>
                <h3 className="text-lg font-medium text-white mb-3 group-hover:text-[#c9a96e] transition-colors">{s.titulo}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{s.descricao}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <a
              href="https://wa.me/5511999999999?text=Olá! Gostaria de um orçamento para meu projeto."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-medium tracking-wider transition-all hover:opacity-90"
              style={{ background: "#c9a96e", color: "white" }}
            >
              <MessageCircle className="w-4 h-4" />
              Solicitar orçamento grátis
            </a>
          </div>
        </div>
      </section>

      {/* PORTFÓLIO */}
      <section id="portfolio" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.4em] text-[#c9a96e] uppercase mb-4">Nosso trabalho</p>
            <h2 className="text-4xl md:text-5xl font-light text-[#1c1410]" style={{ fontFamily: "Cormorant Garamond, serif" }}>
              Portfólio
            </h2>
            <p className="text-[#5a4a3a]/70 mt-4 max-w-xl mx-auto">Cada projeto é único. Cada entrega, uma história transformada em espaço.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {GALERIA.map((img, i) => (
              <div key={i} className={`relative overflow-hidden rounded-2xl group ${i === 0 ? "col-span-2 lg:col-span-1 row-span-1 lg:row-span-2" : ""}`}>
                <img
                  src={img.src}
                  alt={img.alt}
                  className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${i === 0 ? "h-80 lg:h-full" : "h-52"}`}
                />
                <div className="absolute inset-0 bg-[#1c1410]/0 group-hover:bg-[#1c1410]/40 transition-all flex items-end">
                  <p className="text-white text-sm font-medium px-4 py-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">{img.alt}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <a href="https://www.instagram.com/baru.interiores/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[#c9a96e] font-medium hover:gap-4 transition-all">
              <Instagram className="w-4 h-4" /> Ver mais no Instagram <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* PROCESSO */}
      <section id="processo" className="py-24 px-6 bg-[#f5f0eb]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.4em] text-[#c9a96e] uppercase mb-4">Como trabalhamos</p>
            <h2 className="text-4xl md:text-5xl font-light text-[#1c1410]" style={{ fontFamily: "Cormorant Garamond, serif" }}>
              Do sonho à entrega
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {PROCESSO.map((p, i) => (
              <div key={p.num} className="text-center relative">
                <div className="w-12 h-12 rounded-full bg-[#c9a96e] text-white flex items-center justify-center mx-auto mb-4 text-sm font-semibold">
                  {p.num}
                </div>
                {i < PROCESSO.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[calc(50%+24px)] right-[calc(-50%+24px)] h-px bg-[#c9a96e]/30" />
                )}
                <h3 className="font-semibold text-[#1c1410] mb-2">{p.titulo}</h3>
                <p className="text-sm text-[#5a4a3a]/70 leading-relaxed">{p.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="py-24 px-6" style={{ background: "#1c1410" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.4em] text-[#c9a96e] uppercase mb-4">O que dizem</p>
            <h2 className="text-4xl md:text-5xl font-light text-white" style={{ fontFamily: "Cormorant Garamond, serif" }}>
              Clientes que confiam
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DEPOIMENTOS.map(d => (
              <div key={d.nome} className="p-6 rounded-2xl border border-white/10 flex flex-col gap-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: d.estrelas }).map((_, i) => <Star key={i} className="w-4 h-4 fill-[#c9a96e] text-[#c9a96e]" />)}
                </div>
                <p className="text-white/70 text-sm leading-relaxed italic">"{d.texto}"</p>
                <div className="mt-auto">
                  <p className="font-medium text-white">{d.nome}</p>
                  <p className="text-xs text-[#c9a96e] mt-0.5">{d.cargo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center" style={{ background: "linear-gradient(135deg, #c9a96e 0%, #b8954f 100%)" }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-light text-white mb-6" style={{ fontFamily: "Cormorant Garamond, serif" }}>
            Seu espaço ideal começa com uma conversa
          </h2>
          <p className="text-white/80 text-lg mb-10 leading-relaxed">
            Fale com a gente agora. Sem compromisso. Sem burocracia. Só duas pessoas conversando sobre o seu projeto.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/5511999999999?text=Olá BARU! Quero agendar uma conversa sobre meu projeto."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-medium bg-white text-[#c9a96e] hover:bg-white/90 transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              Falar pelo WhatsApp
            </a>
            <a
              href="https://www.instagram.com/baru.interiores/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-medium border-2 border-white text-white hover:bg-white/10 transition-all"
            >
              <Instagram className="w-5 h-5" />
              Ver no Instagram
            </a>
          </div>
        </div>
      </section>

      {/* CONTATO */}
      <section id="contato" className="py-20 px-6 bg-[#faf7f3]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-xs tracking-[0.4em] text-[#c9a96e] uppercase mb-4">Entre em contato</p>
            <h2 className="text-4xl font-light text-[#1c1410] mb-6" style={{ fontFamily: "Cormorant Garamond, serif" }}>Fale com a BARU</h2>
            <div className="space-y-4">
              <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-[#c9a96e]/10 flex items-center justify-center group-hover:bg-[#c9a96e]/20 transition-colors">
                  <Phone className="w-4 h-4 text-[#c9a96e]" />
                </div>
                <div>
                  <p className="text-xs text-[#5a4a3a]/60 uppercase tracking-wider">WhatsApp</p>
                  <p className="font-medium text-[#1c1410]">(11) 99999-9999</p>
                </div>
              </a>
              <a href="mailto:contato@baruinteriores.com.br" className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-[#c9a96e]/10 flex items-center justify-center group-hover:bg-[#c9a96e]/20 transition-colors">
                  <Mail className="w-4 h-4 text-[#c9a96e]" />
                </div>
                <div>
                  <p className="text-xs text-[#5a4a3a]/60 uppercase tracking-wider">E-mail</p>
                  <p className="font-medium text-[#1c1410]">contato@baruinteriores.com.br</p>
                </div>
              </a>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#c9a96e]/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-[#c9a96e]" />
                </div>
                <div>
                  <p className="text-xs text-[#5a4a3a]/60 uppercase tracking-wider">Atendemos</p>
                  <p className="font-medium text-[#1c1410]">São Paulo e Grande SP</p>
                </div>
              </div>
              <a href="https://www.instagram.com/baru.interiores/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-[#c9a96e]/10 flex items-center justify-center group-hover:bg-[#c9a96e]/20 transition-colors">
                  <Instagram className="w-4 h-4 text-[#c9a96e]" />
                </div>
                <div>
                  <p className="text-xs text-[#5a4a3a]/60 uppercase tracking-wider">Instagram</p>
                  <p className="font-medium text-[#1c1410]">@baru.interiores</p>
                </div>
              </a>
            </div>
          </div>

          {/* Form de contato simples */}
          <form
            onSubmit={e => { e.preventDefault(); window.open("https://wa.me/5511999999999?text=Olá BARU! Me chamo " + (e.currentTarget as any).nome.value + " e gostaria de um orçamento para: " + (e.currentTarget as any).projeto.value, "_blank"); }}
            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
          >
            <h3 className="text-xl font-medium text-[#1c1410] mb-6" style={{ fontFamily: "Cormorant Garamond, serif" }}>Orçamento gratuito</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-[#5a4a3a]/60 block mb-1">Seu nome</label>
                <input name="nome" type="text" required placeholder="Maria Silva" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#c9a96e] transition-colors" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-[#5a4a3a]/60 block mb-1">Telefone / WhatsApp</label>
                <input name="tel" type="tel" placeholder="(11) 99999-9999" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#c9a96e] transition-colors" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-[#5a4a3a]/60 block mb-1">Tipo de projeto</label>
                <select name="projeto" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#c9a96e] transition-colors bg-white">
                  <option value="Projeto completo de interiores">Projeto completo de interiores</option>
                  <option value="Consultoria de interiores">Consultoria</option>
                  <option value="Projeto arquitetônico">Projeto arquitetônico</option>
                  <option value="Decoração e staging">Decoração e staging</option>
                  <option value="Acompanhamento de obra">Acompanhamento de obra</option>
                  <option value="Móveis planejados">Móveis planejados</option>
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-[#5a4a3a]/60 block mb-1">Mensagem (opcional)</label>
                <textarea name="msg" rows={3} placeholder="Conte um pouco sobre seu projeto..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#c9a96e] transition-colors resize-none" />
              </div>
              <button type="submit" className="w-full py-3 rounded-xl font-medium text-sm tracking-wider transition-all hover:opacity-90" style={{ background: "#c9a96e", color: "white" }}>
                Enviar pelo WhatsApp
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#1c1410" }} className="py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xl font-light tracking-[0.4em] text-[#c9a96e]" style={{ fontFamily: "Cormorant Garamond, serif" }}>BARU</span>
            <span className="text-xs text-white/30 ml-2 tracking-wider">Interiores</span>
          </div>
          <p className="text-xs text-white/30 text-center">© {new Date().getFullYear()} BARU Interiores. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <a href="https://www.instagram.com/baru.interiores/" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-[#c9a96e] transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-[#c9a96e] transition-colors">
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
