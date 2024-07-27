import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function InboundBlock() {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Cadastro Incompleto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>
          Para completar seu cadastro e poder inscrever seu filho no Clube de
          Aventureiros, faltam alguns passos importantes:
        </p>

        <ol className="list-inside list-decimal space-y-2">
          <li>
            Adicionar pelo menos um responsável (pai, mãe ou guardião) que
            poderá preencher os formulários necessários.
          </li>
          <li>
            De preferência, adicionar os dois pais ou guardiões responsáveis
            pela criança.
          </li>
          <li>
            Adicionar a(s) criança(s) que participará(ão) do Clube de
            Aventureiros.
          </li>
        </ol>

        <p>
          Complete esses passos para finalizar o cadastro e garantir a
          participação de seu filho no clube.
        </p>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <Button onClick={() => console.log('Adicionar pais/responsáveis')}>
            Adicionar Pais/Responsáveis
          </Button>
          <Button onClick={() => console.log('Adicionar crianças')}>
            Adicionar Crianças
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
