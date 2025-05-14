export const isSuccessfulRequest = (status: number = 404): boolean => {
  return status >= 200 && status < 300;
};
