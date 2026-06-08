// Definição dos grupos e times do torneio
export const definicaoGrupos = {
  A: ['México 🇲🇽', 'África do Sul 🇿🇦', 'Coreia do Sul 🇰🇷', 'República Tcheca 🇨🇿'],
  B: ['Canadá 🇨🇦', 'Suíça 🇨🇭', 'Catar 🇶🇦', 'Bósnia e Herzegovina 🇧🇦'],
  C: ['Brasil 🇧🇷', 'Marrocos 🇲🇦', 'Escócia 🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'Haiti 🇭🇹'],
  D: ['Estados Unidos 🇺🇸', 'Paraguai 🇵🇾', 'Austrália 🇦🇺', 'Turquia 🇹🇷'],
  E: ['Alemanha 🇩🇪', 'Equador 🇪🇨', 'Costa do Marfim 🇨🇮', 'Curaçau 🇨🇼'],
  F: ['Holanda 🇳🇱', 'Japão 🇯🇵', 'Tunísia 🇹🇳', 'Suécia 🇸🇪'],
  G: ['Bélgica 🇧🇪', 'Irã 🇮🇷', 'Egito 🇪🇬', 'Nova Zelândia 🇳🇿'],
  H: ['Espanha 🇪🇸', 'Uruguai 🇺🇾', 'Arábia Saudita 🇸🇦', 'Cabo Verde 🇨🇻'],
  I: ['França 🇫🇷', 'Senegal 🇸🇳', 'Noruega 🇳🇴', 'Iraque 🇮🇶'],
  J: ['Argentina 🇦🇷', 'Áustria 🇦🇹', 'Argélia 🇩🇿', 'Jordânia 🇯🇴'],
  K: ['Portugal 🇵🇹', 'Colômbia 🇨🇴', 'Uzbequistão 🇺🇿', 'RD do Congo 🇨🇩'],
  L: ['Inglaterra 🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Croácia 🇭🇷', 'Panamá 🇵🇦', 'Gana 🇬🇭'],
};

export const LETRAS_GRUPOS = Object.keys(definicaoGrupos);

// Estado inicial vazio dos grupos
export const escolhasIniciais = () =>
  Object.fromEntries(LETRAS_GRUPOS.map((l) => [l, []]));
