export type Operator = '<' | '>' | '<=' | '>=' | '=';

export interface ColorRule {
  operator: Operator;
  value: number;
  color: string;
}
