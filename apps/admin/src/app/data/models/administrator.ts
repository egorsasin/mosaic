export type User = {
  __typename?: 'User';
  id: string;
  identifier: string;
  lastLogin?: Date | null;
};

export type GetActiveAdministratorQuery = {
  activeAdministrator?: {
    __typename?: 'Administrator';
    id: string;
    emailAddress: string;
    user: User;
  } | null;
};
