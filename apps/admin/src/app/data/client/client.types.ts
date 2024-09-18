import { Exact } from '@mosaic/common';

export type UserStatus = {
  username: string;
  isLoggedIn: boolean;
  loginTime: string;
};

export type UserStatusInput = Omit<UserStatus, 'isLoggedIn'>;

export type SetAsLoggedInVariable = Exact<{ input: UserStatusInput }>;

export type UserStatusQuery = {
  userStatus: {
    __typename: 'UserStatus';
  } & UserStatus;
};
