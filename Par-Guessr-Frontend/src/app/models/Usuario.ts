export interface Usuario {
  id: number;
  nome: string;
  email: string;
  fotoUrl: string | null;
}

export interface UsuarioAutenticado extends Usuario {
  nick: string;
  password: string;
  photo: string;
}
 
export interface AuthResponse {
  token: string;
  usuario: Usuario;
}
 
export interface CadastroRequest {
  nome: string;
  email: string;
  senha: string;
}
 
export interface LoginRequest {
  email: string;
  senha: string;
}
 