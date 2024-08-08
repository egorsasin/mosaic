import { animate, style, transition, trigger } from '@angular/animations';

const TRANSITION = '{{duration}}ms ease-in-out';

export const MOS_SLIDE_IN_TOP = trigger('mosSlideInTop', [
  transition(
    ':enter',
    [
      style({
        transform: 'translate3d(0,{{start}},0)',
        pointerEvents: 'none',
        opacity: 0,
      }),
      animate(
        TRANSITION,
        style({ opacity: 1, transform: 'translate3d(0,{{end}},0)' })
      ),
    ],
    { params: { end: 0, start: '-100%', duration: 300 } }
  ),
  transition(
    ':leave',
    [
      style({ transform: 'translate3d(0,{{end}},0)' }),
      animate(
        TRANSITION,
        style({ opacity: 0, transform: 'translate3d(0,{{start}},0)' })
      ),
    ],
    { params: { end: 0, start: '-100%', duration: 300 } }
  ),
]);
