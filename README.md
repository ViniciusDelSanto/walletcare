# WalletCare - Gerenciador de Exames Médicos

WalletCare é um aplicativo móvel desenvolvido em React Native com Expo para gerenciar e organizar exames médicos de forma prática e segura.

## 📱 Funcionalidades

### ✅ Funcionalidades Implementadas

- **Configuração Inicial Obrigatória**
  - Setup de perfil no primeiro uso
  - Cadastro de informações básicas (nome obrigatório)
  - Upload de foto de perfil opcional
  - Validações de formulário completas

- **Gerenciamento de Exames**
  - Adicionar novos exames via câmera, galeria ou entrada manual
  - Filtros por tipo: Laboratoriais e de Imagem
  - Busca por nome, médico ou clínica
  - Visualizar lista completa de exames
  - Ver detalhes completos de cada exame
  - Editar informações dos exames (sem duplicação)
  - Excluir exames com confirmação

- **Captura e Armazenamento de Imagens**
  - Fotografar exames usando a câmera do dispositivo
  - Importar imagens da galeria
  - Armazenamento otimizado em base64 no SQLite
  - Visualização em tela cheia das imagens
  - Thumbnails nos cards de exames

- **Perfil do Usuário Personalizado**
  - Exibição do primeiro nome na tela inicial
  - Foto de perfil na tela principal
  - Cadastro e edição de informações pessoais
  - Estatísticas de exames cadastrados
  - Navegação rápida para perfil

- **Interface Otimizada**
  - Design responsivo e intuitivo
  - Navegação fluida entre telas
  - Feedback visual para todas as ações
  - Ícones padronizados em azul (#0099cc)
  - Separação clara entre tipos de exames

- **Armazenamento Local Seguro**
  - Banco de dados SQLite integrado
  - Persistência completa dos dados
  - Backup automático local
  - Funcionalidade de reset para desenvolvimento

## 🛠️ Tecnologias Utilizadas

- **React Native** - Framework principal
- **Expo SDK 53** - Plataforma de desenvolvimento
- **SQLite** - Banco de dados local
- **React Navigation 6** - Navegação entre telas
- **Expo Image Picker** - Captura de imagens
- **Expo File System** - Manipulação de arquivos
- **@expo/vector-icons** - Biblioteca de ícones

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- Expo CLI instalado globalmente
- Dispositivo móvel com Expo Go ou emulador configurado

## 🚀 Instalação e Execução

1. **Clone o repositório**
   \`\`\`bash
   git clone <url-do-repositorio>
   cd walletcare2
   \`\`\`

2. **Instale as dependências**
   \`\`\`bash
   npm install
   \`\`\`

3. **Execute o projeto**
   \`\`\`bash
   npm start
   # ou
   expo start
   \`\`\`

4. **Abra no dispositivo**
   - Escaneie o QR code com o Expo Go (Android/iOS)
   - Ou execute em emulador com \`npm run android\` ou \`npm run ios\`

## 📁 Estrutura do Projeto

\`\`\`
walletcare2/
├── assets/                    # Imagens e ícones
│   ├── icon.png              # Ícone principal
│   ├── logo.png              # Logo do app
│   └── ...                   # Outros assets
├── components/               # Componentes reutilizáveis
│   ├── Alert.js             # Sistema de alertas
│   ├── BottomNavBar.js      # Barra de navegação inferior
│   ├── ImageViewer.js       # Visualizador de imagens
│   └── LoadingSpinner.js    # Indicador de carregamento
├── database/                # Configuração do banco de dados
│   └── database.js          # Operações SQLite e funções de reset
├── screens/                 # Telas da aplicação
│   ├── HomeScreen.js        # Tela inicial com perfil personalizado
│   ├── ProfileSetupScreen.js # Setup inicial obrigatório
│   ├── ExamsListScreen.js   # Lista de exames com filtros
│   ├── ImportExamScreen.js  # Importação de exames
│   ├── SelectExamScreen.js  # Formulário de exame
│   ├── ExamDetailsScreen.js # Detalhes do exame
│   ├── ProfileScreen.js     # Perfil do usuário
│   └── LoadingScreen.js     # Tela de carregamento
├── utils/                   # Utilitários
│   ├── imageUtils.js        # Manipulação de imagens
│   ├── validation.js        # Validações
│   └── constants.js         # Constantes da aplicação
├── App.js                   # Componente principal com lógica de inicialização
├── app.json                 # Configurações do Expo
├── package.json             # Dependências do projeto
└── README.md               # Este arquivo
\`\`\`

## 🎯 Como Usar

### Primeiro Uso

1. **Configuração Inicial**: Na primeira abertura, você será direcionado para configurar seu perfil
2. **Dados Obrigatórios**: Preencha pelo menos o nome (outros campos são opcionais)
3. **Foto de Perfil**: Adicione uma foto usando câmera ou galeria (opcional)
4. **Finalizar**: Toque em "Criar Perfil" para começar a usar

### Adicionando um Exame

1. Na tela inicial, toque em "Adicionar Exame" ou use o botão "+" na lista
2. Escolha como adicionar:
   - **Fotografar**: Use a câmera para capturar o documento
   - **Galeria**: Selecione uma imagem existente
   - **Manual**: Digite as informações sem imagem
3. Preencha os dados do exame (nome obrigatório, outros opcionais)
4. Selecione o tipo: Laboratorial ou Imagem
5. Confirme para salvar

### Visualizando e Filtrando Exames

1. Acesse "Exames" na tela inicial ou navegação inferior
2. Use os filtros por tipo:
   - **Todos**: Mostra todos os exames
   - **Lab**: Apenas exames laboratoriais
   - **Imagem**: Apenas exames de imagem
3. Use a barra de busca para encontrar exames específicos
4. Toque em um exame para ver detalhes completos
5. Toque na imagem para visualização em tela cheia

### Gerenciando Perfil

1. Acesse "Perfil" na navegação inferior
2. Toque na foto para alterar imagem do perfil
3. Toque em "Editar Perfil" para atualizar informações
4. Visualize estatísticas dos seus exames na tela inicial

## 🔒 Segurança e Privacidade

- **Armazenamento Local**: Todos os dados ficam no dispositivo
- **Sem Conexão**: Funciona completamente offline
- **Criptografia**: Imagens armazenadas em base64 otimizado
- **Backup**: Dados persistem entre sessões
- **Privacidade**: Nenhum dado é enviado para servidores externos

## 📱 Permissões Necessárias

### iOS
- **Câmera**: Para fotografar exames
- **Galeria**: Para importar imagens existentes

### Android
- **CAMERA**: Para capturar fotos
- **READ_EXTERNAL_STORAGE**: Para acessar galeria
- **WRITE_EXTERNAL_STORAGE**: Para salvar arquivos temporários

## 🐛 Solução de Problemas

### Erro de Permissão de Câmera/Galeria
- Verifique se as permissões foram concedidas nas configurações do dispositivo
- Reinicie o aplicativo após conceder permissões
- No iOS, pode ser necessário reinstalar o Expo Go

### Banco de Dados não Inicializa
- Limpe o cache do Expo: \`expo start --clear\`
- Reinstale as dependências: \`rm -rf node_modules && npm install\`
- Verifique se está usando Expo SDK 53 compatível

### Imagens não Carregam
- Verifique se há espaço suficiente no dispositivo
- Tente usar imagens menores (< 5MB)
- Reinicie o app se as imagens não aparecerem

### Filtros não Funcionam
- Verifique se os exames têm o tipo correto definido
- Limpe a busca antes de aplicar filtros
- Recarregue a lista puxando para baixo

### App Não Abre Após Atualização
- Execute \`expo start --clear\` para limpar cache
- Verifique compatibilidade das dependências
- Reinstale o Expo Go se necessário

## 🔧 Desenvolvimento

### Comandos Úteis

\`\`\`bash
# Iniciar com cache limpo
expo start --clear

# Executar em plataformas específicas
expo start --android
expo start --ios

# Verificar dependências
npm audit

# Atualizar Expo SDK
expo upgrade
\`\`\`

### Reset do Database (Para Desenvolvimento)

\`\`\`javascript
// No console do Expo
import { resetDatabase } from './database/database'
await resetDatabase()
\`\`\`

### Estrutura de Dados

\`\`\`sql
-- Tabela de exames
exams (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  doctor TEXT,
  date TEXT NOT NULL,
  clinic TEXT,
  type TEXT DEFAULT 'laboratorial',
  image_data TEXT,
  created_at DATETIME,
  updated_at DATETIME
)

-- Tabela de perfil
user_profile (
  id INTEGER PRIMARY KEY,
  name TEXT,
  email TEXT,
  age INTEGER,
  phone TEXT,
  profile_image TEXT,
  created_at DATETIME,
  updated_at DATETIME
)
\`\`\`

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (\`git checkout -b feature/AmazingFeature\`)
3. Commit suas mudanças (\`git commit -m 'Add some AmazingFeature'\`)
4. Push para a branch (\`git push origin feature/AmazingFeature\`)
5. Abra um Pull Request

### Diretrizes de Contribuição
- Siga os padrões de código existentes
- Adicione testes para novas funcionalidades
- Atualize a documentação quando necessário
- Use commits semânticos

### Tecnologias e Bibliotecas
- React Native Team
- Expo Team
- React Navigation
- SQLite
- Ionicons

## 📊 Estatísticas do Projeto

- **Linguagem Principal**: JavaScript/TypeScript
- **Plataformas**: iOS, Android
- **Tamanho do App**: ~15MB
- **Versão Mínima**: iOS 11+, Android 6+
- **Offline**: 100% funcional

---

**WalletCare v1.0.0** - Seu companheiro digital para organização médica

*Mantenha seus exames organizados, acessíveis e seguros.*
