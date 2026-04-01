export type Status = 'Pago' | 'Pendente' | 'Atrasado';

export interface Inadimplente {
  id: string;
  nome: string;
  documento: string;
  valor: number;
  dataVencimento: string;
  status: Status;
}
