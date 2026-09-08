# ProEventos

Aplicação full-stack para gerenciamento de eventos, desenvolvida com **ASP.NET Core Web API**, **Entity Framework Core** e **Angular**. O projeto permite cadastrar e consultar eventos, lotes, palestrantes e redes sociais, além de oferecer autenticação de usuários com JWT.

> Este repositório acompanha o curso [Seja Full-Stack com .NET Web API e Angular + EF Core](https://www.udemy.com/).

## Visão geral

O ProEventos é composto por duas aplicações:

- **Backend:** API REST desenvolvida em ASP.NET Core 5, organizada em camadas de API, aplicação, domínio e persistência.
- **Frontend:** aplicação Angular 11 responsável pela interface de gerenciamento e consumo da API.
- **Banco de dados:** SQLite, configurado por padrão para desenvolvimento.
- **Documentação da API:** Swagger, disponível quando a API é iniciada no ambiente de desenvolvimento.

## Funcionalidades

- Cadastro, edição, consulta e exclusão de eventos.
- Pesquisa e paginação de eventos.
- Cadastro e gerenciamento de lotes por evento.
- Cadastro e gerenciamento de palestrantes.
- Associação de palestrantes a eventos.
- Cadastro de redes sociais de eventos e palestrantes.
- Cadastro, login e atualização de perfil de usuários.
- Autenticação e autorização com tokens JWT.
- Upload de imagens para eventos e perfis de usuários.
- Interface responsiva baseada em Bootstrap e Bootswatch.
- Notificações visuais e indicadores de carregamento no frontend.

## Tecnologias utilizadas

### Backend

- C#
- .NET 5
- ASP.NET Core Web API
- Entity Framework Core 5
- SQLite
- ASP.NET Core Identity
- JWT Bearer Authentication
- AutoMapper
- Swagger / Swashbuckle

### Frontend

- Angular 11
- TypeScript 4
- RxJS
- Bootstrap 4
- Bootswatch
- ngx-bootstrap
- Font Awesome
- ngx-toastr
- ngx-spinner
- ngx-currency

## Estrutura do projeto

```text
.
├── Back/
│   ├── src/
│   │   ├── ProEventos.API/          # Controllers, configuração e ponto de entrada da API
│   │   ├── ProEventos.Application/  # Serviços, DTOs, mapeamentos e regras de aplicação
│   │   ├── ProEventos.Domain/       # Entidades, enums e classes de domínio
│   │   ├── ProEventos.Persistence/  # DbContext, persistências e migrations
│   │   └── ProEventos.sln           # Solução .NET
│   └── tests/
│       └── ProEventos.Associacao.Checks/
└── Front/
    └── ProEventos-App/              # Aplicação Angular
```

## Pré-requisitos

Antes de executar o projeto, instale:

- [.NET 5 SDK](https://dotnet.microsoft.com/download/dotnet/5.0)
- [Node.js](https://nodejs.org/) compatível com o Angular CLI 11
- npm
- Git

Como o projeto utiliza versões antigas do .NET e do Angular, versões mais recentes dos SDKs podem exigir ajustes de compatibilidade. Para conferir as versões instaladas:

```bash
dotnet --version
node --version
npm --version
```

## Como executar

### 1. Clone o repositório

```bash
git clone https://github.com/rebecadasilvavieira/eventos-em-angular.git
cd eventos-em-angular
```

### 2. Restaure as dependências e aplique as migrations

Em um terminal, a partir de `Back/src`, execute:

```bash
cd Back/src
dotnet restore
dotnet ef database update --project ProEventos.Persistence --startup-project ProEventos.API
```

Depois, inicie a API:

```bash
dotnet run --project ProEventos.API
```

Por padrão, a API ficará disponível em:

- HTTPS: `https://localhost:5001`
- HTTP: `http://localhost:5000`
- Swagger: `https://localhost:5001/swagger`

A conexão padrão utiliza o arquivo SQLite `proEventos.db`. A string de conexão e a chave JWT de desenvolvimento estão configuradas em `Back/src/ProEventos.API/appsettings.Development.json`.

### 3. Inicie o frontend

Em outro terminal:

```bash
cd Front/ProEventos-App
npm install
npm start
```

A aplicação Angular ficará disponível em:

```text
http://localhost:4200
```

O frontend utiliza, por padrão, a API em `https://localhost:5001/`. Essa URL pode ser alterada nos arquivos de ambiente:

- `Front/ProEventos-App/src/environments/environment.ts`
- `Front/ProEventos-App/src/environments/environment.prod.ts`

Caso o navegador apresente um alerta de certificado HTTPS local, acesse a URL da API ou do Swagger uma vez e aceite o certificado de desenvolvimento. Se preferir executar somente por HTTP, ajuste a URL em `src/environments/environment.ts`.

## Banco de dados e migrations

O backend usa Entity Framework Core com SQLite. Para aplicar as migrations, execute os comandos a partir de `Back/src`:

```bash
dotnet ef database update --project ProEventos.Persistence --startup-project ProEventos.API
```

Se o comando `dotnet ef` não estiver disponível, instale a ferramenta correspondente ao SDK utilizado:

```bash
dotnet tool install --global dotnet-ef --version 5.*
```

A string de conexão pode ser alterada em:

```text
Back/src/ProEventos.API/appsettings.Development.json
```

## Comandos úteis do frontend

Execute os comandos dentro de `Front/ProEventos-App`:

```bash
# Iniciar o servidor de desenvolvimento
npm start

# Gerar uma build de produção
npm run build

# Executar os testes unitários
npm test

# Executar o lint
npm run lint

# Executar os testes end-to-end
npm run e2e
```

Também é possível utilizar diretamente o Angular CLI:

```bash
npx ng generate component nome-do-componente
```

## Principais endpoints

A API está organizada nos seguintes recursos:

| Recurso | Rota base |
| --- | --- |
| Conta e autenticação | `/api/account` |
| Eventos | `/api/eventos` |
| Lotes | `/api/lotes` |
| Palestrantes | `/api/palestrantes` |
| Palestrantes de um evento | `/api/eventos/{eventoId}/palestrantes` |
| Redes sociais | `/api/redessociais` |

A especificação completa, os parâmetros e os modelos estão disponíveis no Swagger em `/swagger` durante a execução do backend.

## Configuração de segurança

No ambiente de desenvolvimento, a API permite requisições de qualquer origem e o arquivo de configuração contém uma chave JWT para uso local. Em ambientes reais:

- não mantenha chaves, senhas ou tokens no controle de versão;
- utilize variáveis de ambiente ou um gerenciador de segredos;
- altere a chave JWT antes de publicar a aplicação;
- configure HTTPS e as políticas de CORS adequadamente;
- utilize credenciais de banco de dados apropriadas para produção.

## Observação sobre imagens

As imagens são gravadas na pasta `Back/src/ProEventos.API/Resources` e disponibilizadas pela API no caminho `/Resources`. Como sistemas Linux diferenciam letras maiúsculas e minúsculas, mantenha a capitalização dos diretórios consistente entre o backend e o frontend ao executar fora do Windows.

## Testes e verificações

O frontend possui testes unitários e testes end-to-end configurados com Jasmine, Karma e Protractor. Os comandos devem ser executados dentro de `Front/ProEventos-App`:

```bash
npm test
npm run e2e
```

O backend contém o projeto executável `ProEventos.Associacao.Checks`, em `Back/tests`, com verificações das associações entre eventos e palestrantes. Ele não é um projeto de testes `dotnet test`; execute-o a partir da raiz do repositório com:

```bash
dotnet run --project Back/tests/ProEventos.Associacao.Checks
```

Ao final, o programa informa as verificações aprovadas e utiliza um banco SQLite apenas em memória.

## Contribuição

1. Faça um fork do projeto.
2. Crie uma branch para sua alteração:

   ```bash
   git checkout -b minha-melhoria
   ```

3. Faça as alterações e adicione testes quando necessário.
4. Verifique o build e os testes.
5. Abra um pull request descrevendo o que foi alterado.

## Licença

Este projeto não possui uma licença definida no repositório. Consulte a autora antes de reutilizar ou distribuir o código em outros projetos.

## Autoria

Desenvolvido por [Rebeca da Silva Vieira](https://github.com/rebecadasilvavieira).

---

Se este projeto foi útil para você, considere deixar uma estrela no repositório.
