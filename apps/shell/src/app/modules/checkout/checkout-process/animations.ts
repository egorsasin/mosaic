import {
  animate,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const FADE_UP_ANIMATION = trigger(`fadeUpAnimation`, [
  transition(':leave', [
    animate(
      '200ms ease-in',
      style({ opacity: 0, transform: 'translateY(-100%)' })
    ),
  ]),
]);

export const FADE_IN_OUT_ANIMATION = trigger(`fadeInOutAnimation`, [
  transition(':leave', [
    query(':self', [animate('200ms ease-in', style({ opacity: 0 }))], {}),
  ]),
  transition(':enter', [
    query(':self', [
      style({ opacity: 0 }),
      animate('200ms ease-in', style({ opacity: 1 })),
    ]),
  ]),
]);

// export const FADE_IN_OUT_ANIMATION = trigger(`fadeInOutAnimation`, [
//   transition(':leave', [animate('200ms ease-in', style({ opacity: 0 }))]),
//   transition(':enter', [
//     style({ opacity: 0 }),
//     animate('200ms ease-in', style({ opacity: 1 })),
//   ]),
// ]);
