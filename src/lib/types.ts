export type JWTPayload = {
  exp: number;
  sub: string;
};

export type QueryProps = {
  id: string;
  query: string;
};
