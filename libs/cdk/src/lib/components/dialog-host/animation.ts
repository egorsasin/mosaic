import {
  animateChild,
  query,
  style,
  transition,
  trigger,
} from '@angular/animations';
/**
 * Add to enable child :leave animation (fixes https://github.com/angular/angular/issues/15753)
 */
export const MOS_PARENT_ANIMATION = trigger('mosHost', [
  transition(':enter', [
    style({ overflow: 'clip' }),
    query(':scope > *', [animateChild()], { optional: true }),
  ]),
  transition(':leave', [
    query(':scope > *', [animateChild()], { optional: true }),
  ]),
]);

// trigger(`mosParentAnimation`, [
//   transition('* => void', [
//     style({ overflow: `hidden` }),
//     query(':scope > *', [animateChild()], { optional: true }),
//   ]),
// ]);
