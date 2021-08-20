export type CachedSessionUser = {
  id: number;
};

export type CachedSession = {
  id: number;
  expires: Date;
  activeCartId?: number;
  user?: CachedSessionUser;
};
