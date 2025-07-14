export const WEEKDAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// Mapeamento para garantir a exibição correta dos nomes
const displayDayNames = {
  "segunda-feira": "Segunda-Feira",
  "terca-feira": "Terça-Feira",
  "quarta-feira": "Quarta-Feira",
  "quinta-feira": "Quinta-Feira",
  "sexta-feira": "Sexta-Feira",
  "sabado": "Sábado",
  "domingo": "Domingo",
};

// A função antiga de formatação ainda pode ser útil ou pode ser removida.
// A nova formatação de data será feita com date-fns.
export const formatLegacyDayName = (day) => {
    return displayDayNames[day] || day;
}