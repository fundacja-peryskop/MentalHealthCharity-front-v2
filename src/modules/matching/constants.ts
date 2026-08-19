export const MIN_AVAILABILITY_CAPACITY = 0;
export const MAX_AVAILABILITY_CAPACITY = 10;
export const DEFAULT_AVAILABILITY_CAPACITY = 1;
export const AVAILABILITY_CAPACITY_OPTIONS = Array.from(
    { length: MAX_AVAILABILITY_CAPACITY - MIN_AVAILABILITY_CAPACITY + 1 },
    (_, index) => String(index + MIN_AVAILABILITY_CAPACITY)
);

export const AVAILABILITY_QUESTION = "Ile osób w kryzysie na ten moment chcesz przyjąć?";

export const AVAILABILITY_WEEKLY_TIME_HINT =
    "Na jedną osobę w kryzysie przypada co najmniej 1 godzina tygodniowo. Uwzględnij to przy podawaniu swojej dyspozycyjności.";

export const FIRST_TIME_AVAILABILITY_MESSAGE =
    "Dziękujemy za określenie Twojej dyspozycyjności. Informację o nowym zgłoszeniu wraz z zaproszeniem na czat otrzymasz mailowo.";

export const FIRST_TIME_ZERO_AVAILABILITY_MESSAGE =
    "Twoja dyspozycyjność została ustawiona na 0. Nie będziesz otrzymywać nowych automatycznych przydziałów. Ustawienie nie wpływa na obecnie prowadzone rozmowy.";

export const LOW_AVAILABILITY_WARNING =
    "UWAGA! Liczba obecnych sparowań jest wyższa niż deklarowana dyspozycyjność. Jeśli jesteś zmuszony zrezygnować z któregoś z obecnie prowadzonych czatów, koniecznie zrób te dwie czynności:\n- ZGŁOŚ sytuację do Koordynatora\n- WYJAŚNIJ zaistniałą sytuację osobie w kryzysie bo czeka ją zmiana wolontariusza";
