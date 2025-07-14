export const WEEKDAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];


const displayDayNames = {
  "segunda-feira": "Segunda-Feira",
  "terca-feira": "Terça-Feira",
  "quarta-feira": "Quarta-Feira",
  "quinta-feira": "Quinta-Feira",
  "sexta-feira": "Sexta-Feira",
  "sabado": "Sábado",
  "domingo": "Domingo",
};


export const formatLegacyDayName = (day) => {
    return displayDayNames[day] || day;
}