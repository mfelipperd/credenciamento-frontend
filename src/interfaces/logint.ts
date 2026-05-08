export interface ILoginFormPost {
  email: string;
  password: string;
  remember?: boolean;
}

export interface ILoginFormResponse extends ILoginFormPost {
  auth: string;
}
