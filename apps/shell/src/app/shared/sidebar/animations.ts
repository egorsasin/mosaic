import {
  animate,
  style,
  transition,
  trigger,
  query,
} from '@angular/animations';

export const sidebarAnimations = [
  trigger('fadeDown', [
    transition('void => *', [
      query('.modal-container', [
        style({ opacity: 0, transform: 'translate(0, -25%)' }),
        animate('1s ease-in-out'),
      ]),
    ]),
    transition('* => void', [
      query('.modal-container', [
        animate(
          '1s ease-in-out',
          style({ opacity: 0, transform: 'translate(0, -25%)' })
        ),
      ]),
    ]),
  ]),
  trigger('fade', [
    transition(':enter', [
      query('.modal-container', [
        style({ opacity: 0 }),
        animate('1s ease-in-out'),
      ]),
    ]),
    transition(':leave', [
      query('.modal-container', [
        animate('1s ease-in-out', style({ opacity: 0 })),
      ]),
    ]),
  ]),
];
