# WalletCare

Aplicativo mobile para gerenciamento pessoal de exames médicos. Permite ao usuário armazenar, organizar e consultar exames laboratoriais e de imagem diretamente no dispositivo, com suporte a fotografias dos documentos e armazenamento local criptografado-livre via SQLite.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Stack Tecnológica](#stack-tecnológica)
- [Arquitetura](#arquitetura)
- [Banco de Dados](#banco-de-dados)
- [Fluxo de Navegação](#fluxo-de-navegação)
- [Telas e Funcionalidades](#telas-e-funcionalidades)
- [Componentes Reutilizáveis](#componentes-reutilizáveis)
- [Utilitários](#utilitários)
- [Permissões do Dispositivo](#permissões-do-dispositivo)
- [Instalação e Execução](#instalação-e-execução)
- [Funcionalidades em Desenvolvimento](#funcionalidades-em-desenvolvimento)

---

## Visão Geral

O WalletCare é um app React Native construído com Expo que funciona como uma "carteira digital de saúde". Todos os dados são armazenados localmente no dispositivo usando SQLite — não há comunicação com servidores externos, nem autenticação em nuvem. O usuário cria um perfil na primeira abertura, e a partir daí pode cadastrar, visualizar, editar, excluir e compartilhar seus exames médicos.

---

## Stack Tecnológica

| Categoria | Tecnologia | Versão |
|---|---|---|
| Framework mobile | React Native | 0.81.4 |
| Plataforma de build | Expo SDK | 54 |
| Linguagem | JavaScript (ES Modules) | — |
| UI runtime | React | 19.1.0 |
| Navegação | React Navigation (Native Stack) | v7 |
| Banco de dados | expo-sqlite | ~16.0 |
| Câmera / Galeria | expo-image-picker | ~17.0 |
| Sistema de arquivos | expo-file-system | ~19.0 |
| Ícones | @expo/vector-icons (Ionicons, MaterialIcons, FontAwesome5) | ^15.0 |
| Build / Deploy | EAS (Expo Application Services) | — |
| Web support | react-native-web | ^0.21 |

---

## Arquitetura

O projeto segue uma estrutura flat sem gerenciamento de estado global (sem Redux, Zustand ou Context API). O estado é gerenciado localmente em cada tela via `useState`/`useEffect`. A comunicação com o banco de dados é feita diretamente através de funções exportadas do módulo `database/database.js`.

```
walletcare/
├── App.js                    # Raiz da aplicação: inicialização do DB e navegação
├── index.js                  # Entry point do Expo
├── app.json                  # Configurações do app (nome, ícones, splash)
├── eas.json                  # Configurações de build EAS
├── babel.config.js           # Configuração do Babel
│
├── screens/                  # Telas da aplicação
│   ├── LoadingScreen.js      # Tela de splash/carregamento inicial
│   ├── ProfileSetupScreen.js # Onboarding: criação de perfil (primeira abertura)
│   ├── HomeScreen.js         # Dashboard principal
│   ├── ExamsListScreen.js    # Listagem e busca de exames
│   ├── ImportExamScreen.js   # Seleção do método de importação
│   ├── SelectExamScreen.js   # Formulário de cadastro/edição de exame
│   ├── ExamDetailsScreen.js  # Visualização detalhada de um exame
│   └── ProfileScreen.js      # Perfil do usuário e configurações
│
├── components/               # Componentes reutilizáveis
│   ├── BottomNavBar.js       # Barra de navegação inferior fixa
│   ├── ImageViewer.js        # Visualizador de imagem com modal fullscreen
│   ├── LoadingSpinner.js     # Indicador de carregamento
│   └── Alert.js              # Wrappers para alertas nativos
│
├── database/
│   └── database.js           # Toda a camada de acesso ao SQLite
│
├── utils/
│   ├── imageUtils.js         # Captura, seleção e conversão de imagens
│   ├── validation.js         # Validadores de email, telefone e data
│   └── constants.js          # Constantes de tipos de exame, cores e tamanhos
│
└── assets/                   # Ícones e imagens estáticas do app
```

---

## Banco de Dados

O banco SQLite é inicializado em `database/database.js` usando `expo-sqlite`. O arquivo de banco criado no dispositivo é `walletcare.db`. A inicialização ocorre em `App.js` antes de qualquer tela ser exibida.

### Tabelas

#### `exams`

Armazena os exames médicos do usuário.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | INTEGER PK AUTOINCREMENT | Identificador único |
| `name` | TEXT NOT NULL | Nome do exame (ex: "Hemograma Completo") |
| `doctor` | TEXT | Nome do médico responsável |
| `date` | TEXT NOT NULL | Data do exame (formato ISO: AAAA-MM-DD) |
| `clinic` | TEXT | Nome da clínica ou hospital |
| `type` | TEXT DEFAULT 'laboratorial' | Tipo: `laboratorial` ou `imagem` |
| `description` | TEXT | Observações livres sobre o exame |
| `image_data` | TEXT | Imagem do documento em Base64 |
| `created_at` | DATETIME | Data de criação do registro |
| `updated_at` | DATETIME | Data da última atualização |

#### `exam_results`

Tabela de resultados paramétricos por exame (estrutura criada mas não utilizada nas telas atuais — reservada para evolução futura).

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | INTEGER PK AUTOINCREMENT | Identificador único |
| `exam_id` | INTEGER | FK para `exams.id` (ON DELETE CASCADE) |
| `parameter_name` | TEXT NOT NULL | Nome do parâmetro (ex: "Hemoglobina") |
| `value` | TEXT | Valor medido |
| `reference_range` | TEXT | Faixa de referência normal |
| `unit` | TEXT | Unidade de medida |
| `status` | TEXT DEFAULT 'normal' | Status: `normal`, `alto`, `baixo` |

#### `user_profile`

Armazena o perfil único do usuário (sistema de upsert — sempre há no máximo um registro).

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | INTEGER PK AUTOINCREMENT | Identificador único |
| `name` | TEXT | Nome completo |
| `email` | TEXT | Endereço de e-mail |
| `age` | INTEGER | Idade em anos |
| `phone` | TEXT | Número de telefone |
| `profile_image` | TEXT | Foto de perfil em Base64 |
| `created_at` | DATETIME | Data de criação |
| `updated_at` | DATETIME | Data da última atualização |

### Migrations

O sistema possui suporte básico a migrações. Na inicialização, é verificado via `PRAGMA table_info(exams)` se a coluna `description` existe na tabela `exams`. Caso não exista (instalações antigas), o `ALTER TABLE` é executado automaticamente para adicioná-la.

### Funções exportadas do módulo `database.js`

| Função | Descrição |
|---|---|
| `initDatabase()` | Cria as tabelas se não existirem e executa migrations |
| `resetDatabase()` | Drop de todas as tabelas e recriação (usado para debug) |
| `clearAllData()` | Deleta todos os registros sem dropar as tabelas |
| `insertExam(examData)` | Insere um novo exame; retorna o `lastInsertRowId` |
| `getAllExams()` | Retorna todos os exames ordenados por `date DESC` |
| `getExamById(id)` | Retorna um único exame pelo ID |
| `updateExam(id, examData)` | Atualiza os dados de um exame existente |
| `deleteExam(id)` | Remove um exame pelo ID |
| `getUserProfile()` | Retorna o perfil do usuário (primeiro registro) |
| `insertOrUpdateUserProfile(profileData)` | Upsert do perfil: atualiza se existir, insere se não |

---

## Fluxo de Navegação

O app usa `@react-navigation/native-stack`. O `NavigationContainer` é configurado em `App.js`, e a rota inicial depende de se o usuário já possui um perfil cadastrado.

```
Abertura do app
    │
    ▼
LoadingScreen (aguarda initDatabase + getUserProfile)
    │
    ├── perfil não existe ──► ProfileSetupScreen
    │                               │
    │                               └── (após salvar) ──► Home
    │
    └── perfil existe ──────► HomeScreen
                                    │
                        ┌───────────┼────────────────┐
                        ▼           ▼                ▼
                  ExamsList      ImportExam        Profile
                        │           │
                        │           ▼
                        │       SelectExam (criação)
                        │           │
                        └───────────┤
                                    ▼
                              ExamDetails
                                    │
                                    └── SelectExam (edição)
```

A `BottomNavBar` está presente em todas as telas após o onboarding, oferecendo acesso direto a `Profile`, `Home` e `ExamsList`.

---

## Telas e Funcionalidades

### `LoadingScreen`

Exibida durante a inicialização. Aguarda a conclusão de `initDatabase()` e `getUserProfile()`, com um delay mínimo de 2 segundos para exibição do splash. Não possui interação do usuário.

---

### `ProfileSetupScreen`

Tela de onboarding exibida apenas na primeira abertura, quando nenhum perfil é encontrado no banco.

**Funcionalidades:**
- Formulário com campos: nome (obrigatório), e-mail, idade e telefone
- Adição de foto de perfil via câmera ou galeria
- Remoção da foto selecionada antes de salvar
- Validação inline: formato de e-mail via regex, idade entre 1 e 120 anos
- Após salvar, redireciona para `HomeScreen` via `navigation.replace` (sem opção de voltar para o setup)
- A imagem de perfil é convertida para Base64 antes de ser persistida no banco

---

### `HomeScreen`

Dashboard principal do app.

**Funcionalidades:**
- Exibe saudação com o primeiro nome do usuário
- Exibe a foto de perfil (ou ícone padrão) com link para `ProfileScreen`
- Contador total de exames cadastrados
- Menu em grid 2×2 com atalhos para: Exames Laboratoriais, Exames de Imagem, Adicionar Novo Exame e Perfil
- Seção de "Ações Rápidas" com botões para Fotografar Exame e Ver Todos os Exames
- Recarrega os dados automaticamente ao receber foco (listener em `navigation.addListener("focus")`)

---

### `ExamsListScreen`

Lista todos os exames com suporte a filtros e busca.

**Funcionalidades:**
- Filtro por tipo: Todos / Laboratorial / Imagem (com contadores individuais)
- Campo de busca em tempo real por nome do exame, nome do médico ou nome da clínica
- Pull-to-refresh via `RefreshControl`
- Cada card exibe: ícone do tipo, nome, data formatada em pt-BR, tipo, thumbnail da imagem (se houver), médico e clínica
- Exclusão de exame diretamente da lista com confirmação via `Alert`
- Botão flutuante (FAB) para adicionar novo exame
- Estado vazio com mensagens contextuais diferenciadas (sem exames / sem resultados para busca)
- Recebe `examType` como parâmetro de rota para pré-filtrar a lista ao navegar da `HomeScreen`
- As imagens são convertidas de Base64 para URI temporária no `expo-file-system` para renderização

---

### `ImportExamScreen`

Tela intermediária para seleção do método de importação do exame.

**Funcionalidades:**
- Três opções de entrada:
  - **Fotografar Exame**: abre a câmera nativa via `expo-image-picker`
  - **Importar da Galeria**: abre o seletor de mídia do dispositivo
  - **Entrada Manual**: navega diretamente para o formulário sem imagem
- Tratamento de permissões negadas com instruções para o usuário acessar as configurações do dispositivo
- Dicas de boas práticas para captura de documentos (iluminação, estabilidade, enquadramento)
- Após captura/seleção, navega para `SelectExamScreen` passando `imageUri` e `imageType`

---

### `SelectExamScreen`

Formulário de cadastro e edição de exames. Funciona nos dois modos (criação e edição) controlado pelo parâmetro `editMode`.

**Funcionalidades:**
- Pré-visualização da imagem capturada/selecionada (quando há imagem)
- Campos do formulário: nome (obrigatório), médico, data (obrigatório, formato AAAA-MM-DD), clínica, tipo de exame e descrição livre
- Seleção de tipo com botões toggle: Laboratorial / Imagem
- Campo de descrição multilinha (textarea)
- Validação: nome obrigatório, data obrigatória e no formato correto via regex
- Em modo criação: converte a imagem para Base64 via `expo-file-system` e insere no banco
- Em modo edição: carrega os dados existentes do banco e realiza update
- `KeyboardAvoidingView` para prevenir sobreposição do teclado nos campos inferiores
- Limpeza de erro inline ao editar o campo com erro

---

### `ExamDetailsScreen`

Visualização completa de um exame específico.

**Funcionalidades:**
- Exibe tipo do exame com ícone e cor diferenciados (azul para laboratorial, laranja para imagem)
- Informações: data formatada, médico responsável, clínica/hospital, data de criação do registro
- Exibição da descrição quando preenchida
- Visualização da imagem do documento via componente `ImageViewer` (toque expande para fullscreen)
- Compartilhamento nativo via `Share.share()` com texto formatado contendo nome, data, médico, clínica e descrição
- Exclusão do exame com confirmação, redirecionando para `ExamsList` após
- Botão de edição que navega para `SelectExamScreen` em modo edição

---

### `ProfileScreen`

Tela de perfil e configurações do usuário.

**Funcionalidades:**
- Exibe foto de perfil, nome e e-mail
- Alteração de foto via câmera ou galeria (Alert com opções)
- Edição de todos os dados do perfil via Modal nativo com `presentationStyle="pageSheet"`
- Contador de exames cadastrados (atualiza ao receber foco)
- Menu de opções com ícones:
  - Meus Exames (navega para `ExamsList`)
  - Adicionar Exame (navega para `ImportExam`)
  - Configurações (em desenvolvimento)
  - Backup dos Dados (em desenvolvimento)
  - Ajuda e Suporte (em desenvolvimento)
  - Sobre o App (exibe versão 1.0.0)

---

## Componentes Reutilizáveis

### `BottomNavBar`

Barra de navegação fixa na parte inferior. Usa `useRoute()` para detectar a rota ativa e alterar o ícone entre a versão outline (inativo) e solid (ativo). Três destinos: Profile, Home e ExamsList.

### `ImageViewer`

Componente para exibição de imagem com suporte a visualização em fullscreen. Ao tocar na imagem, abre um `Modal` com fundo escuro semitransparente exibindo a imagem em tamanho completo (`width` da tela × 80% da altura). Possui botão de fechar no canto superior direito.

### `LoadingSpinner`

Indicador de carregamento centralizado na tela com mensagem personalizável. Usado durante operações assíncronas em todas as telas.

### `Alert`

Wrappers sobre o `Alert` nativo do React Native. Exporta quatro funções:

| Função | Descrição |
|---|---|
| `showAlert(title, message, buttons)` | Alerta genérico |
| `showConfirmAlert(title, message, onConfirm, onCancel)` | Alerta com Cancelar / Confirmar |
| `showErrorAlert(message)` | Alerta de erro com título fixo "Erro" |
| `showSuccessAlert(message)` | Alerta de sucesso com título fixo "Sucesso" |

---

## Utilitários

### `imageUtils.js`

Gerencia todo o ciclo de vida de imagens no app.

| Função | Descrição |
|---|---|
| `requestPermissions()` | Solicita permissões de câmera e galeria; retorna `{ camera, media }` |
| `captureImage()` | Abre a câmera com crop 4:3 e qualidade 0.8; retorna o asset ou `null` |
| `pickImage()` | Abre a galeria com as mesmas configurações; retorna o asset ou `null` |
| `imageToBase64(uri)` | Lê um arquivo de imagem via `expo-file-system` e retorna a string Base64 |
| `base64ToUri(base64Data, filename)` | Escreve um Base64 em arquivo temporário no `documentDirectory` e retorna a URI |

O armazenamento em Base64 diretamente no SQLite é a estratégia adotada para manter toda a persistência em um único arquivo de banco, simplificando backup e portabilidade.

### `validation.js`

Funções puras de validação e formatação.

| Função | Descrição |
|---|---|
| `validateEmail(email)` | Regex: `^[^\s@]+@[^\s@]+\.[^\s@]+$` |
| `validatePhone(phone)` | Regex para formato `(XX) XXXXX-XXXX` |
| `validateDate(dateString)` | Valida formato `AAAA-MM-DD` e instância de `Date` válida |
| `formatPhone(phone)` | Formata string numérica para `(XX) XXXX-XXXX` ou `(XX) XXXXX-XXXX` |
| `formatDate(dateString)` | Converte ISO para `toLocaleDateString("pt-BR")` |

### `constants.js`

Define constantes globais usadas no app.

```javascript
EXAM_TYPES = { LABORATORIAL, IMAGEM, OUTROS }
EXAM_TYPE_LABELS = { ... }  // Labels legíveis por tipo

COLORS = {
  PRIMARY: "#0099cc",    // Azul principal
  SECONDARY: "#00cc66",  // Verde
  WARNING: "#ff9900",    // Laranja
  DANGER: "#ff4444",     // Vermelho
  ...
}

SIZES = {
  PADDING: 20,
  FONT_SIZE_SMALL: 14,
  FONT_SIZE_MEDIUM: 16,
  FONT_SIZE_LARGE: 18,
  FONT_SIZE_XLARGE: 24,
  ...
}
```

---

## Permissões do Dispositivo

O app solicita as seguintes permissões em tempo de execução (não em `app.json`):

| Permissão | Quando | Biblioteca |
|---|---|---|
| Câmera | Ao tentar fotografar um exame ou foto de perfil | `expo-image-picker` |
| Biblioteca de mídia (leitura) | Ao importar imagem da galeria | `expo-image-picker` |

Caso a permissão seja negada, o app exibe um `Alert` informativo orientando o usuário a acessar as configurações do dispositivo.

---

## Instalação e Execução

### Pré-requisitos

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Para dispositivo físico: Expo Go (iOS/Android) ou build nativo via EAS

### Passos

```bash
# Instalar dependências
npm install

# Iniciar em modo desenvolvimento
npm start

# Rodar no Android
npm run android

# Rodar no iOS
npm run ios

# Limpar cache e reiniciar
npm run clear
```

### Build de produção (EAS)

```bash
# Build para Android
eas build --platform android

# Build para iOS
eas build --platform ios
```

---

## Funcionalidades em Desenvolvimento

As seguintes funcionalidades estão previstas mas ainda não implementadas (retornam alerta informativo ao serem acessadas):

- **Configurações**: notificações e preferências do app
- **Backup dos Dados**: exportação local dos dados para segurança
- **Ajuda e Suporte**: FAQ e canal de contato
- **Tabela `exam_results`**: a estrutura do banco já existe para registros paramétricos de exames laboratoriais (valores, unidades e faixas de referência), mas não há interface para cadastro ou visualização desses dados ainda