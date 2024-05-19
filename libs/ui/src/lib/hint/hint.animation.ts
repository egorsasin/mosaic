import { animate, style, transition, trigger } from '@angular/animations';

const DURATION = { params: { duration: 300 } };
const TRANSITION = `{{duration}}ms ease-in-out`;

export const hintAnimation = trigger(`hintAnimation`, [
  transition(
    `:enter`,
    [style({ opacity: 0 }), animate(TRANSITION, style({ opacity: 1 }))],
    DURATION
  ),
  transition(
    `:leave`,
    [style({ opacity: 1 }), animate(TRANSITION, style({ opacity: 0 }))],
    DURATION
  ),
]);
