export const initialData = {
  "segunda-feira": [
    { id: 'task-1', content: 'L. Portuguesa' },
    { id: 'task-2', content: 'C. Específicos' },
  ],
  "terca-feira": [
    { id: 'task-3', content: 'Matemática' },
    { id: 'task-4', content: 'C. Específicos' },
  ],
  "quarta-feira": [
    { id: 'task-5', content: 'Direito Adm.' },
    { id: 'task-6', content: 'C. Específicos' },
  ],
  "quinta-feira": [
    { id: 'task-7', content: 'Direito Const.' },
    { id: 'task-8', content: 'C. Específicos' },
  ],
  "sexta-feira": [
    { id: 'task-9', content: 'Direito Penal' },
    { id: 'task-10', content: 'C. Específicos' },
  ],
  "sabado": [
    { id: 'task-11', content: 'Exercícios' },
    { id: 'task-12', content: 'Revisão Semanal' },
  ],
  "domingo": [
    { id: 'task-13', content: 'Revisão Geral' },
    { id: 'task-14', content: 'Simulado' },
  ],
};

export const daysOfWeek = [
  "segunda-feira",
  "terca-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sabado",
  "domingo",
];

export const formatDayName = (day) => {
    return day.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
}