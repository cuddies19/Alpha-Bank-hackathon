import { mockResponse } from '@/shared/api';
import * as server from '@/mocks/server';

export const sessionApi = {
  personas: () => mockResponse(() => server.listPersonas()),
  login: (login: string, password: string) => mockResponse(() => server.login(login, password)),
};
