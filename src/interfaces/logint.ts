export interface ILoginFormPost {
  email: string;
  password: string;
}

export interface ILoginFormResponse extends ILoginFormPost {
  auth: string;
}
