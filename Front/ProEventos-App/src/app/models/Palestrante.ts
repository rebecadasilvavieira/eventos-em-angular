import { Evento } from './Evento';
import { RedeSocial } from './RedeSocial';
import { UserUpdate } from '@app/models/identity/UserUpdate';

export interface Palestrante {
  id: number;
  miniCurriculo: string;
  user: UserUpdate;



  redesSociais: RedeSocial[];
  palestrantesEventos: Evento[];
}

export interface Palestrante {
  id: number ;
  nome: string ;
  miniCurriculo: string ;
  imagemURL: string ;
  telefone: string ;
  email: string ;
  redesSociais: RedeSocial[];
  palestrantesEventos: Evento[];
}
