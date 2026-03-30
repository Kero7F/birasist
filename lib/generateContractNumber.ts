export function generateContractNumber(bayiKodu: number): string {

  const random4 = () => Math.floor(1000 + Math.random() * 9000).toString();

  return `${bayiKodu}-${random4()}-${random4()}-${random4()}`;

}

