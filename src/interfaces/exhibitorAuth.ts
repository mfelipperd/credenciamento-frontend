export interface ExhibitorAccount {
  id: string;
  email: string;
  exhibitorId: string;
  exhibitorName: string;
}

export interface ExhibitorAuthResponse {
  access_token: string;
  exhibitorAccount: ExhibitorAccount;
}

export interface ExhibitorFirstAccessForm {
  email: string;
  code: string;
  password: string;
}

export interface ExhibitorLoginForm {
  email: string;
  password: string;
}
