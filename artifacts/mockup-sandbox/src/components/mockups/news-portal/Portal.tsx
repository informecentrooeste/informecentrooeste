import React, { useState } from 'react';
import { 
  Play, 
  Search, 
  Tv, 
  Instagram, 
  Facebook, 
  Youtube, 
  MessageCircle, 
  ChevronRight, 
  MapPin, 
  Cloud, 
  Sun,
  Menu,
  X,
  Smartphone
} from 'lucide-react';

const PrimaryColor = '#474085';

export function Portal() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-['Barlow']">
      {/* Top Ad Banner */}
      <div className="w-full bg-gray-200 h-20 flex items-center justify-center text-gray-500 font-bold text-sm">
        BANNER PROPAGANDA
      </div>

      {/* Header */}
      <header className="bg-[#474085] text-white sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Tv className="h-8 w-8 text-white" />
            <span className="font-bold text-xl tracking-wider uppercase">Informe TV</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 font-semibold text-sm">
            <a href="#" className="hover:text-gray-300 transition-colors">GERAL</a>
            <a href="#" className="hover:text-gray-300 transition-colors">FORMIGA</a>
            <a href="#" className="hover:text-gray-300 transition-colors">REGIONAL</a>
            <a href="#" className="hover:text-gray-300 transition-colors">ESTADUAL</a>
            <a href="#" className="hover:text-gray-300 transition-colors">BRASIL</a>
            <a href="#" className="hover:text-gray-300 transition-colors">POLÍTICA</a>
            <a href="#" className="hover:text-gray-300 transition-colors">CÓRREGO FUNDO</a>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            <button className="hidden sm:block hover:bg-white/10 p-2 rounded-full transition-colors">
              <Search className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <a href="https://www.instagram.com/informecentrooeste" className="hover:text-gray-300 transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="https://www.facebook.com/share/14TiuW9h73u" className="hover:text-gray-300 transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="https://youtube.com/@informecentrooeste" className="hover:text-gray-300 transition-colors"><Youtube className="h-5 w-5" /></a>
            </div>
            
            <button 
              className="lg:hidden p-2 hover:bg-white/10 rounded"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#474085] text-white border-t border-white/10">
          <nav className="flex flex-col px-4 py-2 font-semibold">
            <a href="#" className="py-3 border-b border-white/10">GERAL</a>
            <a href="#" className="py-3 border-b border-white/10">FORMIGA</a>
            <a href="#" className="py-3 border-b border-white/10">REGIONAL</a>
            <a href="#" className="py-3 border-b border-white/10">ESTADUAL</a>
            <a href="#" className="py-3 border-b border-white/10">BRASIL</a>
            <a href="#" className="py-3 border-b border-white/10">POLÍTICA</a>
            <a href="#" className="py-3">CÓRREGO FUNDO</a>
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-6 flex flex-col lg:flex-row gap-8">
        
        {/* LEFT COLUMN (70%) */}
        <div className="w-full lg:w-[70%] flex flex-col gap-8">
          
          {/* 1. LIVE TV PLAYER */}
          <section>
            <div className="flex items-center mb-4">
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-sm mr-2 flex items-center gap-1 animate-pulse">
                <span className="w-2 h-2 bg-white rounded-full"></span> AO VIVO
              </span>
              <h2 className="text-2xl font-bold border-l-4 border-[#474085] pl-3 text-[#474085]">TV INFORME</h2>
            </div>
            <div className="relative w-full aspect-video bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden flex flex-col items-center justify-center group cursor-pointer shadow-lg">
              <Play className="h-20 w-20 text-white/80 group-hover:text-white group-hover:scale-110 transition-all duration-300 drop-shadow-lg" />
              <p className="text-white mt-4 font-bold text-lg">TV AO VIVO - INFORME TV</p>
              {/* Note: iframe would go here but replacing with placeholder for mockup */}
              {/* <iframe src="https://player.logicahost.com.br/player.php?player=2050" className="absolute inset-0 w-full h-full border-0" allowFullScreen></iframe> */}
            </div>
          </section>

          {/* 2. BANNER PROPAGANDA */}
          <div className="w-full bg-gray-200 h-[90px] flex items-center justify-center text-gray-500 font-bold text-sm rounded">
            BANNER PROPAGANDA
          </div>

          {/* 3. DESTAQUES */}
          <section>
            <h2 className="text-2xl font-bold border-l-4 border-red-600 pl-3 mb-6 text-[#474085] uppercase">Destaques</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1 */}
              <div className="group cursor-pointer flex flex-col h-full">
                <div className="w-full aspect-video bg-gradient-to-br from-slate-600 to-slate-800 rounded-t-lg overflow-hidden relative">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                  <span className="absolute top-2 left-2 bg-[#474085] text-white text-xs font-bold px-2 py-1 rounded">GERAL</span>
                </div>
                <div className="bg-white p-4 rounded-b-lg shadow-sm border border-gray-100 flex-grow flex flex-col">
                  <h3 className="font-bold text-lg mb-2 group-hover:text-[#474085] transition-colors line-clamp-2">Prefeitura de Formiga anuncia novo projeto habitacional</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3 flex-grow">O novo projeto visa beneficiar mais de 500 famílias com moradia popular nos próximos dois anos...</p>
                  <span className="text-xs text-gray-400 font-semibold uppercase">Há 2 horas</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="group cursor-pointer flex flex-col h-full">
                <div className="w-full aspect-video bg-gradient-to-br from-indigo-600 to-blue-800 rounded-t-lg overflow-hidden relative">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                  <span className="absolute top-2 left-2 bg-[#474085] text-white text-xs font-bold px-2 py-1 rounded">CÓRREGO FUNDO</span>
                </div>
                <div className="bg-white p-4 rounded-b-lg shadow-sm border border-gray-100 flex-grow flex flex-col">
                  <h3 className="font-bold text-lg mb-2 group-hover:text-[#474085] transition-colors line-clamp-2">Córrego Fundo realiza festa municipal neste final de semana</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3 flex-grow">O evento tradicional contará com shows de artistas locais e barracas de comidas típicas.</p>
                  <span className="text-xs text-gray-400 font-semibold uppercase">Há 4 horas</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="group cursor-pointer flex flex-col h-full">
                <div className="w-full aspect-video bg-gradient-to-br from-emerald-600 to-teal-800 rounded-t-lg overflow-hidden relative">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                  <span className="absolute top-2 left-2 bg-[#474085] text-white text-xs font-bold px-2 py-1 rounded">CULTURA</span>
                </div>
                <div className="bg-white p-4 rounded-b-lg shadow-sm border border-gray-100 flex-grow flex flex-col">
                  <h3 className="font-bold text-lg mb-2 group-hover:text-[#474085] transition-colors line-clamp-2">Eventos culturais movimentam o Centro-Oeste no feriadão</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3 flex-grow">Uma série de exposições e peças teatrais estão programadas para as principais cidades.</p>
                  <span className="text-xs text-gray-400 font-semibold uppercase">Ontem</span>
                </div>
              </div>

              {/* Card 4 */}
              <div className="group cursor-pointer flex flex-col h-full">
                <div className="w-full aspect-video bg-gradient-to-br from-amber-600 to-orange-800 rounded-t-lg overflow-hidden relative">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                  <span className="absolute top-2 left-2 bg-[#474085] text-white text-xs font-bold px-2 py-1 rounded">INFRAESTRUTURA</span>
                </div>
                <div className="bg-white p-4 rounded-b-lg shadow-sm border border-gray-100 flex-grow flex flex-col">
                  <h3 className="font-bold text-lg mb-2 group-hover:text-[#474085] transition-colors line-clamp-2">Nova rodovia conectará cidades da região Centro-Oeste</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3 flex-grow">Obras começam no próximo mês e devem reduzir o tempo de viagem em até 40%.</p>
                  <span className="text-xs text-gray-400 font-semibold uppercase">Ontem</span>
                </div>
              </div>
            </div>
          </section>

          {/* 4. BANNER PROPAGANDA */}
          <div className="w-full bg-gray-200 h-[90px] flex items-center justify-center text-gray-500 font-bold text-sm rounded">
            BANNER PROPAGANDA
          </div>

          {/* 5. TWO-COLUMN NEWS GRID (FORMIGA | REGIONAL) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* FORMIGA */}
            <section>
              <div className="flex items-center justify-between border-b-2 border-gray-200 mb-4 pb-2">
                <h2 className="text-2xl font-bold border-l-4 border-[#474085] pl-3 text-[#474085] uppercase">Formiga</h2>
              </div>
              <span className="inline-block bg-red-600 text-white text-xs font-bold px-2 py-1 mb-4 rounded-sm uppercase">Última notícia</span>
              
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex gap-4 group cursor-pointer border-b border-gray-100 pb-4 last:border-0">
                    <div className="w-1/3 aspect-video bg-gradient-to-br from-slate-500 to-slate-700 rounded overflow-hidden flex-shrink-0"></div>
                    <div className="w-2/3 flex flex-col justify-center">
                      <h3 className="font-bold text-md leading-tight group-hover:text-[#474085] transition-colors line-clamp-2">
                        {item === 1 ? "Câmara aprova novo projeto de lei para a educação infantil municipal" : 
                         item === 2 ? "Campanha de vacinação atinge meta em Formiga neste sábado" : 
                         "Comércio local se prepara para as vendas de fim de ano com otimismo"}
                      </h3>
                      <span className="text-xs text-gray-400 mt-2 font-semibold uppercase">Há {item * 3} horas</span>
                    </div>
                  </div>
                ))}
              </div>
              <a href="#" className="inline-flex items-center text-[#474085] font-bold text-sm mt-4 hover:underline">
                VER MAIS NOTÍCIAS <ChevronRight className="h-4 w-4" />
              </a>
            </section>

            {/* REGIONAL */}
            <section>
              <div className="flex items-center justify-between border-b-2 border-gray-200 mb-4 pb-2">
                <h2 className="text-2xl font-bold border-l-4 border-[#474085] pl-3 text-[#474085] uppercase">Regional</h2>
              </div>
              <span className="inline-block bg-red-600 text-white text-xs font-bold px-2 py-1 mb-4 rounded-sm uppercase">Última notícia</span>
              
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex gap-4 group cursor-pointer border-b border-gray-100 pb-4 last:border-0">
                    <div className="w-1/3 aspect-video bg-gradient-to-br from-blue-500 to-indigo-700 rounded overflow-hidden flex-shrink-0"></div>
                    <div className="w-2/3 flex flex-col justify-center">
                      <h3 className="font-bold text-md leading-tight group-hover:text-[#474085] transition-colors line-clamp-2">
                        {item === 1 ? "Cidades do Centro-Oeste registram queda no desemprego no trimestre" : 
                         item === 2 ? "Festival gastronômico regional atrai turistas e movimenta economia" : 
                         "Nova frente fria deve trazer chuvas intensas para toda a região amanhã"}
                      </h3>
                      <span className="text-xs text-gray-400 mt-2 font-semibold uppercase">Há {item * 2 + 1} horas</span>
                    </div>
                  </div>
                ))}
              </div>
              <a href="#" className="inline-flex items-center text-[#474085] font-bold text-sm mt-4 hover:underline">
                VER MAIS NOTÍCIAS <ChevronRight className="h-4 w-4" />
              </a>
            </section>

          </div>

          {/* 6. ARTICULISTAS SECTION */}
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold border-l-4 border-[#474085] pl-3 mb-6 text-[#474085] uppercase">Articulistas</h2>
            
            <div className="flex flex-wrap sm:flex-nowrap gap-4 justify-between overflow-x-auto pb-2 scrollbar-hide">
              {['João Silva', 'Maria Clara', 'Pedro Santos', 'Ana Beatriz', 'Carlos Eduardo', 'Luciana Costa'].map((name, i) => (
                <div key={i} className="flex flex-col items-center gap-3 cursor-pointer group min-w-[100px]">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br p-1 transition-transform group-hover:scale-105 ${
                    i % 3 === 0 ? 'from-purple-500 to-indigo-500' : 
                    i % 3 === 1 ? 'from-blue-500 to-cyan-500' : 
                    'from-emerald-500 to-teal-500'
                  }`}>
                    <div className="w-full h-full bg-gray-200 rounded-full border-2 border-white overflow-hidden">
                      {/* Placeholder for avatar photo */}
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500 text-xl font-bold">
                        {name.charAt(0)}
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-center group-hover:text-[#474085] transition-colors line-clamp-2">{name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 7. TWO-COLUMN NEWS GRID (ESTADUAL | BRASIL) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* ESTADUAL */}
            <section>
              <div className="flex items-center justify-between border-b-2 border-gray-200 mb-4 pb-2">
                <h2 className="text-2xl font-bold border-l-4 border-[#474085] pl-3 text-[#474085] uppercase">Estadual</h2>
              </div>
              
              <div className="flex flex-col gap-4 mt-6">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex gap-4 group cursor-pointer border-b border-gray-100 pb-4 last:border-0">
                    <div className="w-1/3 aspect-video bg-gradient-to-br from-green-600 to-emerald-800 rounded overflow-hidden flex-shrink-0"></div>
                    <div className="w-2/3 flex flex-col justify-center">
                      <h3 className="font-bold text-md leading-tight group-hover:text-[#474085] transition-colors line-clamp-2">
                        {item === 1 ? "Governador anuncia pacote de obras de infraestrutura para o interior de MG" : 
                         item === 2 ? "Secretaria de Saúde alerta para aumento de casos de dengue no estado" : 
                         "Assembleia Legislativa vota orçamento estadual para o próximo ano"}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
              <a href="#" className="inline-flex items-center text-[#474085] font-bold text-sm mt-4 hover:underline">
                VER MAIS NOTÍCIAS <ChevronRight className="h-4 w-4" />
              </a>
            </section>

            {/* BRASIL */}
            <section>
              <div className="flex items-center justify-between border-b-2 border-gray-200 mb-4 pb-2">
                <h2 className="text-2xl font-bold border-l-4 border-[#474085] pl-3 text-[#474085] uppercase">Brasil</h2>
              </div>
              
              <div className="flex flex-col gap-4 mt-6">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex gap-4 group cursor-pointer border-b border-gray-100 pb-4 last:border-0">
                    <div className="w-1/3 aspect-video bg-gradient-to-br from-yellow-500 to-amber-700 rounded overflow-hidden flex-shrink-0"></div>
                    <div className="w-2/3 flex flex-col justify-center">
                      <h3 className="font-bold text-md leading-tight group-hover:text-[#474085] transition-colors line-clamp-2">
                        {item === 1 ? "Ministério da Economia projeta crescimento do PIB acima do esperado" : 
                         item === 2 ? "Novo programa social entrará em vigor a partir do próximo semestre" : 
                         "STF decide sobre constitucionalidade de leis ambientais polêmicas"}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
              <a href="#" className="inline-flex items-center text-[#474085] font-bold text-sm mt-4 hover:underline">
                VER MAIS NOTÍCIAS <ChevronRight className="h-4 w-4" />
              </a>
            </section>

          </div>

          {/* 8. BANNER PROPAGANDA */}
          <div className="w-full bg-gray-200 h-[90px] flex items-center justify-center text-gray-500 font-bold text-sm rounded">
            BANNER PROPAGANDA
          </div>

          {/* 9. POLÍTICA SECTION */}
          <section>
            <h2 className="text-2xl font-bold border-l-4 border-[#474085] pl-3 mb-6 text-[#474085] uppercase">Política</h2>
            
            <div className="flex flex-col md:flex-row gap-6">
              {/* 3 cards in a row */}
              <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="group cursor-pointer flex flex-col h-full">
                    <div className="w-full aspect-video bg-gradient-to-br from-slate-700 to-gray-900 rounded-t-lg overflow-hidden relative"></div>
                    <div className="bg-white p-3 rounded-b-lg shadow-sm border border-gray-100 flex-grow">
                      <h3 className="font-bold text-sm mb-2 group-hover:text-[#474085] transition-colors line-clamp-3">
                        {item === 1 ? "Câmara dos Deputados aprova texto base da reforma tributária" : 
                         item === 2 ? "Prefeito convoca coletiva para anunciar mudanças no secretariado municipal" : 
                         "Eleições suplementares são marcadas para cidade da região metropolitana"}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* 1 tall card on right */}
              <div className="md:w-1/3 group cursor-pointer">
                <div className="w-full h-48 md:h-full bg-gradient-to-br from-indigo-800 to-purple-900 rounded-lg overflow-hidden relative flex flex-col justify-end p-4">
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                  <div className="relative z-10">
                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-sm uppercase mb-2 inline-block">Exclusivo</span>
                    <h3 className="font-bold text-white text-lg leading-tight drop-shadow-md">
                      Entrevista exclusiva com o governador sobre os novos investimentos para a região Centro-Oeste
                    </h3>
                  </div>
                </div>
              </div>
            </div>
            
            <a href="#" className="inline-flex items-center text-[#474085] font-bold text-sm mt-4 hover:underline">
              VER MAIS NOTÍCIAS <ChevronRight className="h-4 w-4" />
            </a>
          </section>

          {/* 10. GERAL SECTION */}
          <section>
            <h2 className="text-2xl font-bold border-l-4 border-[#474085] pl-3 mb-6 text-[#474085] uppercase">Geral</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="group cursor-pointer flex flex-col h-full">
                  <div className="w-full aspect-video bg-gradient-to-br from-blue-400 to-cyan-600 rounded-t-lg overflow-hidden"></div>
                  <div className="bg-white p-4 rounded-b-lg shadow-sm border border-gray-100 flex-grow">
                    <h3 className="font-bold text-base mb-2 group-hover:text-[#474085] transition-colors line-clamp-3">
                      {item === 1 ? "Estudo aponta melhora na qualidade do ar na região após novas medidas" : 
                       item === 2 ? "Campanha do agasalho arrecada mais de 2 toneladas de roupas" : 
                       "Acidente na BR-354 deixa trânsito lento no sentido a Belo Horizonte"}
                    </h3>
                    <span className="text-xs text-gray-400 font-semibold uppercase">Há {item * 5} horas</span>
                  </div>
                </div>
              ))}
            </div>
            
            <a href="#" className="inline-flex items-center text-[#474085] font-bold text-sm mt-4 hover:underline">
              VER MAIS NOTÍCIAS <ChevronRight className="h-4 w-4" />
            </a>
          </section>

          {/* 11. BANNER PROPAGANDA */}
          <div className="w-full bg-gray-200 h-[90px] flex items-center justify-center text-gray-500 font-bold text-sm rounded">
            BANNER PROPAGANDA
          </div>

          {/* 12. VÍDEOS DO INSTAGRAM */}
          <section className="bg-gradient-to-br from-purple-900 to-[#474085] p-6 rounded-lg text-white mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6 uppercase">
              <Instagram className="h-6 w-6" /> Vídeos do Instagram
            </h2>
            
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="snap-start shrink-0 w-32 sm:w-40 aspect-[9/16] bg-black rounded-lg overflow-hidden relative group cursor-pointer border border-white/20">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  
                  {/* Play icon centered */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="h-10 w-10 text-white/70 group-hover:text-white group-hover:scale-110 transition-all drop-shadow-md" fill="currentColor" />
                  </div>
                  
                  {/* Title at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-xs font-semibold line-clamp-2 text-white drop-shadow-md">
                      {item === 1 ? "Resumo das notícias da manhã" : 
                       item === 2 ? "Cobertura do evento na praça" : 
                       item === 3 ? "Entrevista com o prefeito" : 
                       item === 4 ? "Previsão do tempo atualizada" : 
                       item === 5 ? "Bastidores da nossa redação" : 
                       "Dica cultural para o final de semana"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>


        {/* RIGHT SIDEBAR (30%) */}
        <aside className="w-full lg:w-[30%] flex flex-col gap-8 lg:sticky lg:top-24 h-fit">
          
          {/* 1. TV AO VIVO BADGE */}
          <div className="bg-red-600 text-white rounded-lg p-4 flex items-center justify-between shadow-md cursor-pointer hover:bg-red-700 transition-colors">
            <div className="flex items-center gap-2">
              <Tv className="h-6 w-6" />
              <span className="font-bold text-lg uppercase tracking-wider">TV AO VIVO</span>
            </div>
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
          </div>

          {/* 2. PROPAGANDA BANNER VERTICAL */}
          <div className="w-full bg-gray-200 h-[250px] flex flex-col items-center justify-center text-gray-500 font-bold text-sm rounded">
            <span>BANNER PROPAGANDA</span>
            <span className="text-xs font-normal mt-1">(300x250)</span>
          </div>

          {/* 3. PROGRAMAS */}
          <section className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold border-l-4 border-[#474085] pl-3 mb-5 text-[#474085] uppercase">Programas</h2>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="w-20 h-14 bg-gradient-to-r from-blue-600 to-indigo-700 rounded flex items-center justify-center text-white text-xs font-bold shadow-inner flex-shrink-0">CAPA</div>
                <h3 className="font-bold text-sm group-hover:text-[#474085] transition-colors">INFORME NOTÍCIAS</h3>
              </div>
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="w-20 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 rounded flex items-center justify-center text-white text-xs font-bold shadow-inner flex-shrink-0">CAPA</div>
                <h3 className="font-bold text-sm group-hover:text-[#474085] transition-colors">INFORME SAÚDE</h3>
              </div>
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="w-20 h-14 bg-gradient-to-r from-amber-500 to-orange-600 rounded flex items-center justify-center text-white text-xs font-bold shadow-inner flex-shrink-0">CAPA</div>
                <h3 className="font-bold text-sm group-hover:text-[#474085] transition-colors">MICROFONIA</h3>
              </div>
            </div>
            
            <a href="#" className="inline-flex items-center text-[#474085] font-bold text-xs mt-4 hover:underline">
              VER MAIS PROGRAMAS <ChevronRight className="h-3 w-3" />
            </a>
          </section>

          {/* 4. PROPAGANDA BANNER */}
          <div className="w-full bg-gray-200 h-[100px] flex items-center justify-center text-gray-500 font-bold text-sm rounded">
            BANNER
          </div>

          {/* 5. ÚLTIMAS NOTÍCIAS */}
          <section className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold border-l-4 border-[#474085] pl-3 mb-5 text-[#474085] uppercase">Últimas Notícias</h2>
            
            <div className="flex flex-col gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex gap-3 group cursor-pointer border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-600 rounded flex-shrink-0"></div>
                  <div>
                    <h3 className="font-bold text-sm leading-tight group-hover:text-[#474085] transition-colors line-clamp-2">
                      {item === 1 ? "Acidente deixa pista interditada na rodovia MG-050" : 
                       item === 2 ? "Prefeitura abre inscrições para concurso público" : 
                       item === 3 ? "Time da cidade vence campeonato regional de futsal" : 
                       "Novo posto de saúde será inaugurado nesta sexta-feira"}
                    </h3>
                    <span className="text-xs text-gray-400 mt-1 block">Há {item * 15} min</span>
                  </div>
                </div>
              ))}
            </div>
            
            <a href="#" className="inline-flex items-center text-[#474085] font-bold text-xs mt-4 hover:underline">
              VER TODAS <ChevronRight className="h-3 w-3" />
            </a>
          </section>

          {/* 6. PREVISÃO DO TEMPO */}
          <section className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-5 rounded-lg shadow-md">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <Cloud className="h-4 w-4" /> Previsão do Tempo
            </h2>
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-1 font-semibold text-blue-100 mb-1">
                  <MapPin className="h-4 w-4" /> Formiga, MG
                </div>
                <div className="text-4xl font-bold">28°C</div>
                <div className="text-sm text-blue-100 mt-1">Ensolarado com nuvens</div>
              </div>
              <Sun className="h-16 w-16 text-yellow-300 drop-shadow-lg" />
            </div>
            
            <div className="grid grid-cols-3 gap-2 border-t border-blue-400/30 pt-4">
              <div className="text-center">
                <span className="text-xs text-blue-100 block mb-1">Amanhã</span>
                <Cloud className="h-5 w-5 mx-auto mb-1 text-white" />
                <span className="font-bold text-sm">26° <span className="text-blue-200 text-xs font-normal">19°</span></span>
              </div>
              <div className="text-center">
                <span className="text-xs text-blue-100 block mb-1">Sexta</span>
                <Sun className="h-5 w-5 mx-auto mb-1 text-yellow-300" />
                <span className="font-bold text-sm">30° <span className="text-blue-200 text-xs font-normal">21°</span></span>
              </div>
              <div className="text-center">
                <span className="text-xs text-blue-100 block mb-1">Sábado</span>
                <Sun className="h-5 w-5 mx-auto mb-1 text-yellow-300" />
                <span className="font-bold text-sm">32° <span className="text-blue-200 text-xs font-normal">22°</span></span>
              </div>
            </div>
          </section>

          {/* 7. MAIS LIDAS */}
          <section className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold border-l-4 border-red-600 pl-3 mb-5 text-[#474085] uppercase">Mais Lidas</h2>
            
            <div className="flex flex-col gap-4">
              {[1, 2, 3, 4, 5].map((item, index) => (
                <div key={item} className="flex gap-3 group cursor-pointer border-b border-gray-100 pb-3 last:border-0 last:pb-0 relative">
                  <div className="absolute -left-2 -top-2 text-4xl font-black text-gray-100 z-0">{index + 1}</div>
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded flex-shrink-0 z-10 relative mt-1"></div>
                  <div className="z-10 relative">
                    <h3 className="font-bold italic text-sm leading-tight group-hover:text-[#474085] transition-colors line-clamp-3">
                      {item === 1 ? "Resultados das eleições municipais surpreendem especialistas" : 
                       item === 2 ? "Festa de peão de Formiga confirma grandes atrações para este ano" : 
                       item === 3 ? "Polícia desarticula quadrilha na região metropolitana" : 
                       item === 4 ? "Previsão aponta frente fria rigorosa para o próximo final de semana" :
                       "Abertas as vagas para cursos gratuitos no SENAI local"}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 8. APOIADOR CALL TO ACTION */}
          <div className="w-full bg-gradient-to-b from-[#474085] to-purple-900 rounded-lg p-6 text-center text-white shadow-lg cursor-pointer transform transition hover:-translate-y-1">
            <h3 className="font-bold text-2xl mb-2 italic">SEJA UM APOIADOR</h3>
            <p className="font-semibold text-purple-200 mb-4">DO INFORME CENTRO-OESTE</p>
            <button className="bg-yellow-400 text-purple-900 font-bold py-2 px-6 rounded-full hover:bg-yellow-300 transition-colors uppercase text-sm w-full shadow-md">
              Saiba como
            </button>
          </div>

          {/* 9. WHATSAPP SECTION */}
          <section className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-500 rounded-full text-white mb-4 shadow-md">
              <MessageCircle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Participe dos nossos grupos!</h2>
            
            <div className="flex flex-col gap-3">
              <a href="https://chat.whatsapp.com/EhLqmbJ7UndF7IKgYUFjCh" target="_blank" rel="noreferrer" className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded transition-colors flex items-center justify-center gap-2">
                <MessageCircle className="h-5 w-5" /> GRUPO VIP FORMIGA
              </a>
              <a href="https://chat.whatsapp.com/IqL5s8VYgxW7Vxql1WTAo3" target="_blank" rel="noreferrer" className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded transition-colors flex items-center justify-center gap-2">
                <MessageCircle className="h-5 w-5" /> GRUPO VIP CÓRREGO FUNDO
              </a>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500 font-semibold block mb-1">Contato Redação:</span>
              <a href="https://wa.me/5537998249936" className="text-lg font-bold text-green-600 hover:underline flex items-center justify-center gap-1">
                (37) 99824-9936
              </a>
            </div>
          </section>

          {/* 10. PROPAGANDA BANNER VERTICAL */}
          <div className="w-full bg-gray-200 h-[250px] flex flex-col items-center justify-center text-gray-500 font-bold text-sm rounded">
            <span>BANNER PROPAGANDA</span>
            <span className="text-xs font-normal mt-1">(300x250)</span>
          </div>

          {/* 11. NAVEGAR */}
          <section className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold border-l-4 border-[#474085] pl-3 mb-5 text-[#474085] uppercase">Navegar</h2>
            <ul className="grid grid-cols-2 gap-y-2 text-sm font-semibold text-gray-600">
              <li><a href="#" className="hover:text-[#474085] transition-colors flex items-center gap-1"><ChevronRight className="h-3 w-3" /> Geral</a></li>
              <li><a href="#" className="hover:text-[#474085] transition-colors flex items-center gap-1"><ChevronRight className="h-3 w-3" /> Formiga</a></li>
              <li><a href="#" className="hover:text-[#474085] transition-colors flex items-center gap-1"><ChevronRight className="h-3 w-3" /> Regional</a></li>
              <li><a href="#" className="hover:text-[#474085] transition-colors flex items-center gap-1"><ChevronRight className="h-3 w-3" /> Estadual</a></li>
              <li><a href="#" className="hover:text-[#474085] transition-colors flex items-center gap-1"><ChevronRight className="h-3 w-3" /> Brasil</a></li>
              <li><a href="#" className="hover:text-[#474085] transition-colors flex items-center gap-1"><ChevronRight className="h-3 w-3" /> Política</a></li>
              <li><a href="#" className="hover:text-[#474085] transition-colors flex items-center gap-1"><ChevronRight className="h-3 w-3" /> Vídeos Curtos</a></li>
              <li><a href="#" className="hover:text-[#474085] transition-colors flex items-center gap-1"><ChevronRight className="h-3 w-3" /> Colunistas</a></li>
            </ul>
          </section>

          {/* 12. NOSSAS PLAYLISTS */}
          <section className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold border-l-4 border-red-600 pl-3 mb-5 flex items-center gap-2 text-[#474085] uppercase">
              <Youtube className="h-6 w-6 text-red-600" /> Playlists
            </h2>
            
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex gap-3 group cursor-pointer">
                  <div className="w-24 aspect-video bg-gradient-to-br from-gray-700 to-gray-900 rounded relative flex items-center justify-center flex-shrink-0">
                    <Play className="h-6 w-6 text-white/80 group-hover:text-white" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="font-bold text-sm group-hover:text-red-600 transition-colors">
                      {item === 1 ? "Entrevistas Completas" : item === 2 ? "Coberturas Especiais" : "Melhores Momentos TV"}
                    </h3>
                    <span className="text-xs text-gray-500 mt-1">Youtube</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </aside>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#474085] text-white mt-12 pt-12 pb-6 border-t-[6px] border-red-600">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-10 lg:gap-0">
            
            {/* Left: Logo & Tagline */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="flex items-center gap-2 mb-4">
                <Tv className="h-10 w-10 text-white" />
                <span className="font-bold text-2xl tracking-wider uppercase">Informe TV</span>
              </div>
              <p className="text-indigo-200 max-w-xs text-sm">
                Tenha a Informe TV na palma da sua mão. Informação com credibilidade e agilidade para todo o Centro-Oeste.
              </p>
            </div>

            {/* Center: App Downloads */}
            <div className="flex flex-col items-center">
              <h4 className="font-bold text-lg mb-4 uppercase tracking-wider">Baixe nosso App</h4>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="https://play.google.com/store/apps/details?id=com.logicahost.informetv" target="_blank" rel="noreferrer" className="bg-black hover:bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 flex items-center gap-3 transition-colors">
                  <Play className="h-6 w-6 text-white" />
                  <div className="text-left">
                    <div className="text-[10px] leading-tight text-gray-300">DISPONÍVEL NO</div>
                    <div className="font-semibold text-sm leading-tight">Google Play</div>
                  </div>
                </a>
                <a href="https://apps.apple.com/br/app/informe-tv/id6746223815" target="_blank" rel="noreferrer" className="bg-black hover:bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 flex items-center gap-3 transition-colors">
                  <Smartphone className="h-6 w-6 text-white" />
                  <div className="text-left">
                    <div className="text-[10px] leading-tight text-gray-300">Baixar na</div>
                    <div className="font-semibold text-sm leading-tight">App Store</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Right: Social & Contact */}
            <div className="flex flex-col items-center lg:items-end text-center lg:text-right">
              <h4 className="font-bold text-lg mb-4 uppercase tracking-wider">Redes Sociais</h4>
              <div className="flex items-center gap-4 mb-6">
                <a href="https://www.instagram.com/informecentrooeste" className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors"><Instagram className="h-5 w-5" /></a>
                <a href="https://www.facebook.com/share/14TiuW9h73u" className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors"><Facebook className="h-5 w-5" /></a>
                <a href="https://youtube.com/@informecentrooeste" className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors"><Youtube className="h-5 w-5" /></a>
              </div>
              
              <h4 className="font-bold text-lg mb-4 uppercase tracking-wider mt-2">Entre em Contato</h4>
              <div className="flex flex-col gap-2 w-full max-w-[250px]">
                <a href="https://wa.me/5537998249936" className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2">
                  <MessageCircle className="h-4 w-4" /> (37) 99824-9936
                </a>
                <a href="https://chat.whatsapp.com/EhLqmbJ7UndF7IKgYUFjCh" className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-4 rounded transition-colors text-center">
                  GRUPO VIP FORMIGA
                </a>
                <a href="https://chat.whatsapp.com/IqL5s8VYgxW7Vxql1WTAo3" className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-4 rounded transition-colors text-center">
                  GRUPO VIP CÓRREGO FUNDO
                </a>
              </div>
            </div>
            
          </div>
          
          <div className="border-t border-indigo-900/50 mt-10 pt-6 text-center text-indigo-200 text-xs">
            <p>&copy; {new Date().getFullYear()} Informe Centro-Oeste / Informe TV. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
